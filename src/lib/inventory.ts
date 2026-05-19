/**
 * Inventory Management Utilities
 * 
 * This module provides functions for managing product inventory,
 * particularly for restoring stock when orders are cancelled or payments fail.
 */

import { prisma } from "@/lib/prisma";
import { PrismaClient } from "@prisma/client";

/**
 * Restore stock for all items in an order
 * 
 * This function increments the stock quantity for all products in an order
 * and updates the isInStock flag if needed.
 * 
 * @param orderId - The order ID to restore stock for
 * @param tx - Optional Prisma transaction client (for use within transactions)
 * @returns Promise<void>
 */
export async function restoreOrderStock(
  orderId: string,
  tx?: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">
): Promise<void> {
  const client = tx || prisma;
  
  console.log(`📦 [Inventory] Restoring stock for order: ${orderId}`);
  
  try {
    // Get all order items
    const orderItems = await client.orderItem.findMany({
      where: { orderId },
      select: {
        id: true,
        productId: true,
        variantId: true,
        quantity: true,
        name: true,
        sku: true
      }
    });

    if (orderItems.length === 0) {
      console.log(`⚠️ [Inventory] No order items found for order: ${orderId}`);
      return;
    }

    console.log(`📦 [Inventory] Found ${orderItems.length} items to restore`);

    // Restore stock for each item
    for (const item of orderItems) {
      if (item.variantId) {
        // Variant order items also keep productId, so restore variants first.
        const variant = await client.productVariant.findUnique({
          where: { id: item.variantId },
          select: {
            id: true,
            name: true,
            stockQuantity: true
          }
        });

        if (!variant) {
          console.warn(`[Inventory] Variant not found: ${item.variantId} (${item.name})`);
          continue;
        }

        const oldStock = variant.stockQuantity;
        const newStock = oldStock + item.quantity;

        await client.productVariant.update({
          where: { id: item.variantId },
          data: {
            stockQuantity: {
              increment: item.quantity
            },
            isInStock: true
          }
        });

        console.log(`[Inventory] Restored variant stock for "${variant.name}" (SKU: ${item.sku}):`, {
          variantId: item.variantId,
          quantityRestored: item.quantity,
          oldStock,
          newStock
        });
      } else if (item.productId) {
        const product = await client.product.findUnique({
          where: { id: item.productId },
          select: { 
            id: true, 
            name: true,
            stockQuantity: true,
            lowStockThreshold: true
          }
        });

        if (!product) {
          console.warn(`[Inventory] Product not found: ${item.productId} (${item.name})`);
          continue;
        }

        const oldStock = product.stockQuantity;
        const newStock = oldStock + item.quantity;

        await client.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              increment: item.quantity
            },
            isInStock: true
          }
        });

        console.log(`[Inventory] Restored stock for "${product.name}" (SKU: ${item.sku}):`, {
          productId: item.productId,
          quantityRestored: item.quantity,
          oldStock,
          newStock,
          wasLowStock: oldStock <= product.lowStockThreshold,
          nowLowStock: newStock <= product.lowStockThreshold
        });
      } else {
        console.warn(`[Inventory] Order item has no productId or variantId:`, {
          itemId: item.id,
          sku: item.sku,
          name: item.name
        });
      }
    }

    console.log(`✅ [Inventory] Stock restoration completed for order: ${orderId}`);
  } catch (error) {
    console.error(`❌ [Inventory] Error restoring stock for order ${orderId}:`, error);
    throw error; // Re-throw to allow caller to handle
  }
}

/**
 * Restore stock and update order status atomically
 * 
 * This function restores stock and updates the order status in a single transaction.
 * Use this when cancelling orders or marking payments as failed.
 * 
 * @param orderId - The order ID
 * @param newPaymentStatus - New payment status (e.g., "FAILED")
 * @param newOrderStatus - Optional new order status (e.g., "CANCELLED")
 * @param reason - Optional reason for the change (for logging)
 * @returns Promise<void>
 */
export async function restoreStockAndUpdateOrder(
  orderId: string,
  newPaymentStatus: "FAILED" | "PENDING" | "PAID" | "REFUNDED" | "PARTIALLY_REFUNDED",
  newOrderStatus?: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED",
  reason?: string
): Promise<void> {
  console.log(`🔄 [Inventory] Restoring stock and updating order: ${orderId}`, {
    newPaymentStatus,
    newOrderStatus,
    reason
  });

  try {
    await prisma.$transaction(async (tx) => {
      // First, get the order to check if it has a coupon
      const order = await tx.order.findUnique({
        where: { id: orderId },
        select: {
          couponId: true,
          couponCode: true
        }
      });

      // Restore the stock
      await restoreOrderStock(orderId, tx);

      // Restore coupon usage if coupon was used
      if (order?.couponId) {
        console.log(`🎟️ [Inventory] Restoring coupon usage for coupon: ${order.couponCode}`);
        await tx.coupon.update({
          where: { id: order.couponId },
          data: {
            usageCount: {
              decrement: 1
            }
          }
        });
        console.log(`✅ [Inventory] Coupon usage restored for: ${order.couponCode}`);
      }

      // Then, update the order
      const updateData: {
        paymentStatus: typeof newPaymentStatus;
        status?: typeof newOrderStatus;
      } = {
        paymentStatus: newPaymentStatus
      };

      if (newOrderStatus) {
        updateData.status = newOrderStatus;
      }

      await tx.order.update({
        where: { id: orderId },
        data: updateData
      });

      console.log(`✅ [Inventory] Order updated successfully: ${orderId}`, updateData);
    });

    console.log(`✅ [Inventory] Stock restoration and order update completed for: ${orderId}`);
  } catch (error) {
    console.error(`❌ [Inventory] Error in restoreStockAndUpdateOrder for ${orderId}:`, error);
    throw error;
  }
}

/**
 * Check if an order's stock can be restored
 * 
 * Only restore stock if:
 * - Order payment status is PENDING or FAILED (not PAID)
 * - Order has not been shipped yet
 * 
 * @param orderId - The order ID to check
 * @returns Promise<boolean>
 */
export async function canRestoreStock(orderId: string): Promise<boolean> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        paymentStatus: true,
        status: true,
        shippedAt: true
      }
    });

    if (!order) {
      console.warn(`⚠️ [Inventory] Order not found: ${orderId}`);
      return false;
    }

    // Can restore if payment not completed and not shipped
    const canRestore = 
      (order.paymentStatus === "PENDING" || order.paymentStatus === "FAILED") &&
      !order.shippedAt;

    console.log(`🔍 [Inventory] Can restore stock for order ${orderId}:`, {
      canRestore,
      paymentStatus: order.paymentStatus,
      orderStatus: order.status,
      shipped: !!order.shippedAt
    });

    return canRestore;
  } catch (error) {
    console.error(`❌ [Inventory] Error checking if can restore stock for ${orderId}:`, error);
    return false;
  }
}

/**
 * Get stock restoration summary for an order
 * 
 * Returns a summary of what stock will be restored without actually restoring it.
 * Useful for previewing the restoration or logging.
 * 
 * @param orderId - The order ID
 * @returns Promise with restoration summary
 */
export async function getStockRestorationSummary(orderId: string): Promise<{
  orderId: string;
  itemCount: number;
  items: Array<{
    productId?: string;
    variantId?: string;
    name: string;
    sku: string;
    quantityToRestore: number;
  }>;
}> {
  const orderItems = await prisma.orderItem.findMany({
    where: { orderId },
    select: {
      productId: true,
      variantId: true,
      name: true,
      sku: true,
      quantity: true
    }
  });

  return {
    orderId,
    itemCount: orderItems.length,
    items: orderItems.map(item => ({
      productId: item.productId || undefined,
      variantId: item.variantId || undefined,
      name: item.name,
      sku: item.sku,
      quantityToRestore: item.quantity
    }))
  };
}
