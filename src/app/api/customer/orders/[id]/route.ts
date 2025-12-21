import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { restoreStockAndUpdateOrder } from "@/lib/inventory";
import { sendSMSSafe, SMSTemplates } from "@/lib/sms";

// GET /api/customer/orders/[id] - Get specific order details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;
    
    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if id is an orderNumber (starts with "HS6-") or order ID (UUID)
    const isOrderNumber = id.startsWith("HS6-");
    
    // Build where clause based on whether it's an orderNumber or order ID
    const whereClause = isOrderNumber
      ? { orderNumber: id, userId: session.user.id }
      : { id: id, userId: session.user.id };

    // Fetch order with all relations
    const order = await prisma.order.findFirst({
      where: whereClause,
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: {
                  where: { isPrimary: true },
                  select: { url: true, alt: true }
                }
              }
            },
            variant: {
              select: {
                id: true,
                name: true,
                sku: true
              }
            }
          }
        },
        shippingAddress: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
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

    // Transform order data
    const transformedOrder = {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      shippingMethod: order.shippingMethod,
      totalAmount: Number(order.totalAmount),
      subtotal: Number(order.subtotal),
      taxAmount: Number(order.taxAmount),
      shippingAmount: Number(order.shippingAmount),
      discountAmount: Number(order.discountAmount),
      customerNote: order.customerNote,
      trackingNumber: order.trackingNumber,
      shippedAt: order.shippedAt?.toISOString() || null,
      deliveredAt: order.deliveredAt?.toISOString() || null,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      customer: {
        firstName: order.user.firstName,
        lastName: order.user.lastName,
        email: order.user.email,
        phone: order.user.phone
      },
      shippingAddress: order.shippingAddress,
      items: order.orderItems.map(item => ({
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        sku: item.sku,
        name: item.name,
        description: item.description,
        image: item.image,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
        quantity: item.quantity,
        attributes: item.attributes,
        product: item.product,
        variant: item.variant
      }))
    };

    return NextResponse.json({
      success: true,
      data: transformedOrder
    });

  } catch (error) {
    console.error("Error fetching order details:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/customer/orders/[id] - Cancel an order
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;
    
    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if id is an orderNumber (starts with "HS6-") or order ID (UUID)
    const isOrderNumber = id.startsWith("HS6-");
    
    // Build where clause based on whether it's an orderNumber or order ID
    const whereClause = isOrderNumber
      ? { orderNumber: id, userId: session.user.id }
      : { id: id, userId: session.user.id };

    // Get order to check if it can be cancelled
    const order = await prisma.order.findFirst({
      where: whereClause,
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Check if order can be cancelled
    // Orders cannot be cancelled if:
    // 1. Already paid
    // 2. Already cancelled
    // 3. Already delivered
    // 4. Already refunded
    if (order.paymentStatus === "PAID") {
      return NextResponse.json(
        { success: false, error: "Cannot cancel a paid order" },
        { status: 400 }
      );
    }

    if (order.status === "CANCELLED") {
      return NextResponse.json(
        { success: false, error: "Order is already cancelled" },
        { status: 400 }
      );
    }

    if (order.status === "DELIVERED") {
      return NextResponse.json(
        { success: false, error: "Cannot cancel a delivered order" },
        { status: 400 }
      );
    }

    if (order.status === "REFUNDED") {
      return NextResponse.json(
        { success: false, error: "Cannot cancel a refunded order" },
        { status: 400 }
      );
    }

    // If order is shipped, we might still allow cancellation but with a warning
    // For now, we'll allow cancellation of shipped orders (admin can handle refunds)
    // You can change this logic based on your business rules

    // ✅ FIX #1: Restore stock and update order status atomically
    try {
      await restoreStockAndUpdateOrder(
        order.id,
        order.paymentStatus, // Keep payment status as is
        "CANCELLED",
        "Cancelled by customer"
      );
      console.log(`✅ Order cancelled and stock restored: ${order.orderNumber}`);
    } catch (error) {
      console.error(`❌ Error restoring stock during cancellation for ${order.orderNumber}:`, error);
      // If stock restoration fails, still allow cancellation but log the error
      // Admin can manually adjust inventory if needed
    }

    // Fetch updated order with all relations for response
    const updatedOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        orderItems: true,
        shippingAddress: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, error: "Order not found after cancellation" },
        { status: 500 }
      );
    }

    // Send SMS notification to customer (non-blocking)
    const customerPhone = updatedOrder.user.phone || order.customerPhone;
    if (customerPhone) {
      const customerName = updatedOrder.user.firstName && updatedOrder.user.lastName
        ? `${updatedOrder.user.firstName} ${updatedOrder.user.lastName}`
        : 'کاربر گرامی';

      sendSMSSafe(
        {
          receptor: customerPhone,
          message: SMSTemplates.ORDER_CANCELLED(order.orderNumber, customerName)
        },
        `Order cancelled: ${order.orderNumber}`
      );
    }

    // Transform order data (same as GET)
    const transformedOrder = {
      id: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      status: updatedOrder.status,
      paymentStatus: updatedOrder.paymentStatus,
      paymentMethod: updatedOrder.paymentMethod,
      shippingMethod: updatedOrder.shippingMethod,
      totalAmount: Number(updatedOrder.totalAmount),
      subtotal: Number(updatedOrder.subtotal),
      taxAmount: Number(updatedOrder.taxAmount),
      shippingAmount: Number(updatedOrder.shippingAmount),
      discountAmount: Number(updatedOrder.discountAmount),
      customerNote: updatedOrder.customerNote,
      trackingNumber: updatedOrder.trackingNumber,
      shippedAt: updatedOrder.shippedAt?.toISOString() || null,
      deliveredAt: updatedOrder.deliveredAt?.toISOString() || null,
      createdAt: updatedOrder.createdAt.toISOString(),
      updatedAt: updatedOrder.updatedAt.toISOString(),
      customer: {
        firstName: updatedOrder.user.firstName,
        lastName: updatedOrder.user.lastName,
        email: updatedOrder.user.email,
        phone: updatedOrder.user.phone,
      },
      shippingAddress: updatedOrder.shippingAddress,
      items: updatedOrder.orderItems.map(item => ({
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        sku: item.sku,
        name: item.name,
        description: item.description,
        image: item.image,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
        quantity: item.quantity,
        attributes: item.attributes,
      })),
    };

    console.log(`✅ Order ${updatedOrder.orderNumber} cancelled by user ${session.user.id}`);

    return NextResponse.json({
      success: true,
      data: transformedOrder,
      message: "Order cancelled successfully",
    });

  } catch (error) {
    console.error("Error cancelling order:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/customer/orders/[id] - Delete an order (only if not paid and not shipped)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;
    
    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if id is an orderNumber (starts with "HS6-") or order ID (UUID)
    const isOrderNumber = id.startsWith("HS6-");
    
    // Build where clause based on whether it's an orderNumber or order ID
    const whereClause = isOrderNumber
      ? { orderNumber: id, userId: session.user.id }
      : { id: id, userId: session.user.id };

    // Get order to check if it can be deleted
    const order = await prisma.order.findFirst({
      where: whereClause,
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Orders can only be deleted if:
    // 1. Not paid (paymentStatus is PENDING or FAILED)
    // 2. Not shipped (status is PENDING, CONFIRMED, or CANCELLED, and no shippedAt date)
    const canDelete = 
      (order.paymentStatus === "PENDING" || order.paymentStatus === "FAILED") &&
      (order.status === "PENDING" || order.status === "CONFIRMED" || order.status === "CANCELLED") &&
      !order.shippedAt;

    if (!canDelete) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Order cannot be deleted. Only unpaid and unshipped orders can be deleted." 
        },
        { status: 400 }
      );
    }

    // Delete order (this will cascade delete orderItems due to Prisma relations)
    await prisma.order.delete({
      where: { id: order.id },
    });

    console.log(`✅ Order ${order.orderNumber} deleted by user ${session.user.id}`);

    return NextResponse.json({
      success: true,
      message: "Order deleted successfully",
    });

  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
