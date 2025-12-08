import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { restoreOrderStock } from "@/lib/inventory";
import { sendSMSSafe, SMSTemplates } from "@/lib/sms";

/**
 * POST /api/admin/orders/[id]/refund
 * 
 * Admin endpoint to refund an order
 * 
 * This endpoint:
 * 1. Validates admin authentication
 * 2. Checks if order can be refunded
 * 3. Restores product stock
 * 4. Restores coupon usage
 * 5. Updates order status to REFUNDED
 * 6. Sends SMS notification to customer
 * 
 * Request body:
 * {
 *   reason?: string,
 *   refundAmount?: number, // Optional, defaults to full order amount
 *   notifyCustomer?: boolean // Default: true
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;
    
    // Check if user is authenticated and is admin
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user is admin or super admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { 
      reason, 
      refundAmount, 
      notifyCustomer = true 
    } = body;

    console.log(`💰 [Refund] Admin ${session.user.id} initiating refund for order ${id}:`, {
      reason,
      refundAmount,
      notifyCustomer
    });

    // Get order with all details
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          select: {
            productId: true,
            variantId: true,
            quantity: true,
            name: true,
            unitPrice: true
          }
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        coupon: {
          select: {
            id: true,
            code: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Validate refund eligibility
    if (order.paymentStatus !== "PAID") {
      return NextResponse.json(
        { 
          success: false, 
          error: "Only paid orders can be refunded",
          details: {
            currentStatus: order.paymentStatus,
            orderNumber: order.orderNumber
          }
        },
        { status: 400 }
      );
    }

    if (order.status === "REFUNDED") {
      return NextResponse.json(
        { 
          success: false, 
          error: "Order is already refunded",
          details: {
            orderNumber: order.orderNumber
          }
        },
        { status: 400 }
      );
    }

    // Calculate refund amount (default to full order amount)
    const finalRefundAmount = refundAmount || Number(order.totalAmount);

    // Perform refund in transaction
    const refundedOrder = await prisma.$transaction(async (tx) => {
      // Restore stock for all order items
      console.log(`📦 [Refund] Restoring stock for order ${order.orderNumber}`);
      await restoreOrderStock(order.id, tx);

      // Restore coupon usage if coupon was used
      if (order.couponId) {
        console.log(`🎟️ [Refund] Restoring coupon usage for: ${order.coupon?.code}`);
        await tx.coupon.update({
          where: { id: order.couponId },
          data: {
            usageCount: {
              decrement: 1
            }
          }
        });
      }

      // Update order status
      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          status: "REFUNDED",
          paymentStatus: finalRefundAmount >= Number(order.totalAmount) 
            ? "REFUNDED" 
            : "PARTIALLY_REFUNDED",
          updatedAt: new Date()
        },
        include: {
          orderItems: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true
            }
          }
        }
      });

      return updatedOrder;
    });

    const duration = Date.now() - startTime;

    console.log(`✅ [Refund] Order ${order.orderNumber} refunded successfully in ${duration}ms:`, {
      orderId: order.id,
      orderNumber: order.orderNumber,
      refundAmount: finalRefundAmount,
      itemsRestored: order.orderItems.length,
      couponRestored: !!order.couponId
    });

    // Send SMS notification to customer (non-blocking)
    if (notifyCustomer) {
      const customerPhone = refundedOrder.user.phone || order.customerPhone;
      if (customerPhone) {
        const customerName = refundedOrder.user.firstName && refundedOrder.user.lastName
          ? `${refundedOrder.user.firstName} ${refundedOrder.user.lastName}`
          : 'کاربر گرامی';

        const smsMessage = SMSTemplates.ORDER_REFUNDED(
          order.orderNumber,
          customerName,
          finalRefundAmount,
          order.paymentId || undefined
        );

        console.log(`📱 [Refund] Sending refund notification SMS to customer`);
        sendSMSSafe(
          {
            receptor: customerPhone,
            message: smsMessage
          },
          `Refund notification: ${order.orderNumber}`
        ).catch(err => {
          console.error(`❌ [Refund] SMS sending error (non-blocking):`, err);
        });
      } else {
        console.warn(`⚠️ [Refund] No phone number found for customer notification`);
      }
    }

    // Return success response
    return NextResponse.json({
      success: true,
      data: {
        orderId: refundedOrder.id,
        orderNumber: refundedOrder.orderNumber,
        status: refundedOrder.status,
        paymentStatus: refundedOrder.paymentStatus,
        refundAmount: finalRefundAmount,
        itemsRestored: order.orderItems.length,
        couponRestored: !!order.couponId,
        customerNotified: notifyCustomer && !!(refundedOrder.user.phone || order.customerPhone)
      },
      message: `Order ${order.orderNumber} refunded successfully`
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ [Refund] Error processing refund (${duration}ms):`, error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to process refund",
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

