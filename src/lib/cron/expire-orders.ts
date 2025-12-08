/**
 * Order Expiry Cron Job
 * 
 * This module handles automatic expiration of unpaid orders and stock restoration.
 * Should be run periodically (e.g., every 5 minutes) to check for expired orders.
 */

import { prisma } from "@/lib/prisma";
import { restoreOrderStock } from "@/lib/inventory";
import { sendSMSSafe, SMSTemplates } from "@/lib/sms";

/**
 * Expire old pending orders and restore their stock
 * 
 * This function:
 * 1. Finds all orders that have expired (expiresAt < now)
 * 2. Are still in PENDING payment status
 * 3. Restores stock for each expired order
 * 4. Updates order status to CANCELLED and payment status to FAILED
 * 
 * @returns Promise with summary of expired orders
 */
export async function expirePendingOrders(): Promise<{
  success: boolean;
  expiredCount: number;
  errors: Array<{ orderId: string; error: string }>;
}> {
  const startTime = Date.now();
  console.log('🕐 [Cron] Starting order expiry check...');

  const errors: Array<{ orderId: string; error: string }> = [];
  let expiredCount = 0;

  try {
    // Find all expired orders
    const expiredOrders = await prisma.order.findMany({
      where: {
        paymentStatus: "PENDING",
        expiresAt: {
          lt: new Date() // Less than current time = expired
        },
        // Only expire orders that haven't been shipped
        shippedAt: null
      },
      select: {
        id: true,
        orderNumber: true,
        userId: true,
        totalAmount: true,
        customerPhone: true,
        createdAt: true,
        expiresAt: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            phone: true
          }
        },
        orderItems: {
          select: {
            productId: true,
            variantId: true,
            quantity: true,
            name: true
          }
        }
      },
      // Limit to prevent overwhelming the system
      take: 100
    });

    if (expiredOrders.length === 0) {
      console.log('✅ [Cron] No expired orders found');
      return {
        success: true,
        expiredCount: 0,
        errors: []
      };
    }

    console.log(`⏰ [Cron] Found ${expiredOrders.length} expired orders to process`);

    // Process each expired order
    for (const order of expiredOrders) {
      try {
        const orderAge = Date.now() - order.createdAt.getTime();
        const orderAgeMinutes = Math.floor(orderAge / 1000 / 60);

        console.log(`⏰ [Cron] Expiring order ${order.orderNumber}:`, {
          orderId: order.id,
          createdAt: order.createdAt.toISOString(),
          expiresAt: order.expiresAt?.toISOString(),
          ageMinutes: orderAgeMinutes,
          itemCount: order.orderItems.length
        });

        // Restore stock and update order in a transaction
        await prisma.$transaction(async (tx) => {
          // Restore stock for all order items
          await restoreOrderStock(order.id, tx);

          // Restore coupon usage if coupon was used
          const orderWithCoupon = await tx.order.findUnique({
            where: { id: order.id },
            select: { couponId: true, couponCode: true }
          });

          if (orderWithCoupon?.couponId) {
            console.log(`🎟️ [Cron] Restoring coupon usage for expired order: ${orderWithCoupon.couponCode}`);
            await tx.coupon.update({
              where: { id: orderWithCoupon.couponId },
              data: {
                usageCount: {
                  decrement: 1
                }
              }
            });
          }

          // Update order status
          await tx.order.update({
            where: { id: order.id },
            data: {
              status: "CANCELLED",
              paymentStatus: "FAILED"
            }
          });
        });

        expiredCount++;
        console.log(`✅ [Cron] Order ${order.orderNumber} expired and stock restored`);

        // Send SMS notification to customer (non-blocking)
        const customerPhone = order.user?.phone || order.customerPhone;
        if (customerPhone) {
          const customerName = order.user?.firstName && order.user?.lastName
            ? `${order.user.firstName} ${order.user.lastName}`
            : 'کاربر گرامی';

          sendSMSSafe(
            {
              receptor: customerPhone,
              message: SMSTemplates.ORDER_EXPIRED(order.orderNumber, customerName)
            },
            `Order expired: ${order.orderNumber}`
          ).catch(err => {
            console.error(`❌ [Cron] SMS error for order ${order.orderNumber} (non-blocking):`, err);
          });
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ [Cron] Error expiring order ${order.orderNumber}:`, error);
        errors.push({
          orderId: order.id,
          error: errorMessage
        });
      }
    }

    const duration = Date.now() - startTime;
    console.log(`✅ [Cron] Order expiry completed in ${duration}ms:`, {
      expiredCount,
      errorCount: errors.length,
      duration
    });

    return {
      success: true,
      expiredCount,
      errors
    };

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ [Cron] Fatal error in order expiry job (${duration}ms):`, error);
    return {
      success: false,
      expiredCount,
      errors: [{
        orderId: 'N/A',
        error: error instanceof Error ? error.message : 'Unknown fatal error'
      }]
    };
  }
}

/**
 * Get statistics about pending orders and their expiry status
 * 
 * Useful for monitoring and debugging
 */
export async function getOrderExpiryStats(): Promise<{
  totalPending: number;
  expiredNotProcessed: number;
  expiringSoon: number; // Expiring in next 5 minutes
  averageTimeToExpiry: number; // In minutes
}> {
  const now = new Date();
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

  const [totalPending, expiredNotProcessed, expiringSoon] = await Promise.all([
    // Total pending orders
    prisma.order.count({
      where: {
        paymentStatus: "PENDING",
        shippedAt: null
      }
    }),

    // Expired but not yet processed
    prisma.order.count({
      where: {
        paymentStatus: "PENDING",
        expiresAt: {
          lt: now
        },
        shippedAt: null
      }
    }),

    // Expiring in next 5 minutes
    prisma.order.count({
      where: {
        paymentStatus: "PENDING",
        expiresAt: {
          gte: now,
          lte: fiveMinutesFromNow
        },
        shippedAt: null
      }
    })
  ]);

  // Calculate average time to expiry for pending orders
  const pendingOrders = await prisma.order.findMany({
    where: {
      paymentStatus: "PENDING",
      expiresAt: {
        gte: now
      },
      shippedAt: null
    },
    select: {
      expiresAt: true
    }
  });

  let averageTimeToExpiry = 0;
  if (pendingOrders.length > 0) {
    const totalMinutes = pendingOrders.reduce((sum, order) => {
      if (order.expiresAt) {
        const minutesToExpiry = (order.expiresAt.getTime() - now.getTime()) / 1000 / 60;
        return sum + minutesToExpiry;
      }
      return sum;
    }, 0);
    averageTimeToExpiry = Math.floor(totalMinutes / pendingOrders.length);
  }

  return {
    totalPending,
    expiredNotProcessed,
    expiringSoon,
    averageTimeToExpiry
  };
}

