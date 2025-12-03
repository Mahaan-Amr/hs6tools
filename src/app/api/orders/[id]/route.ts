import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { UpdateOrderData } from "@/types/admin";
import { sendSMSSafe, SMSTemplates } from "@/lib/sms";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Fetch order with relations
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        billingAddress: true,
        shippingAddress: true,
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true
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
        _count: {
          select: {
            orderItems: true
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

    // Transform data to match AdminOrder interface
    const transformedOrder = {
      id: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      status: order.status,
      totalAmount: Number(order.totalAmount),
      subtotal: Number(order.subtotal),
      taxAmount: Number(order.taxAmount),
      shippingAmount: Number(order.shippingAmount),
      discountAmount: Number(order.discountAmount),
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      customerNote: order.customerNote,
      billingAddressId: order.billingAddressId,
      shippingAddressId: order.shippingAddressId,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      paymentId: order.paymentId,
      paymentDate: order.paymentDate?.toISOString(),
      shippingMethod: order.shippingMethod,
      trackingNumber: order.trackingNumber,
      shippedAt: order.shippedAt?.toISOString(),
      deliveredAt: order.deliveredAt?.toISOString(),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      user: order.user,
      billingAddress: order.billingAddress,
      shippingAddress: order.shippingAddress,
      orderItems: order.orderItems.map(item => ({
        id: item.id,
        orderId: item.orderId,
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
        createdAt: item.createdAt.toISOString(),
        product: item.product,
        variant: item.variant
      })),
      _count: order._count
    };

    return NextResponse.json({
      success: true,
      data: transformedOrder
    });

  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body: UpdateOrderData = await request.json();

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id }
    });

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: Prisma.OrderUpdateInput = {};
    
    if (body.status !== undefined) {
      updateData.status = body.status;
    }
    
    if (body.paymentStatus !== undefined) {
      updateData.paymentStatus = body.paymentStatus;
    }
    
    if (body.trackingNumber !== undefined) {
      updateData.trackingNumber = body.trackingNumber;
    }
    
    if (body.shippedAt !== undefined) {
      updateData.shippedAt = body.shippedAt ? new Date(body.shippedAt) : null;
    }
    
    if (body.deliveredAt !== undefined) {
      updateData.deliveredAt = body.deliveredAt ? new Date(body.deliveredAt) : null;
    }

    // Track status changes for SMS notifications
    const previousStatus = existingOrder.status;

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        billingAddress: true,
        shippingAddress: true,
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true
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
        _count: {
          select: {
            orderItems: true
          }
        }
      }
    });

    // Send SMS notifications based on status changes (non-blocking)
    if (updatedOrder.customerPhone && body.status && body.status !== previousStatus) {
      const customerName = updatedOrder.user 
        ? `${updatedOrder.user.firstName} ${updatedOrder.user.lastName}` 
        : 'کاربر گرامی';

      // Order confirmed
      if (body.status === 'CONFIRMED' && previousStatus !== 'CONFIRMED') {
        sendSMSSafe(
          {
            receptor: updatedOrder.customerPhone,
            message: SMSTemplates.ORDER_CONFIRMED(updatedOrder.orderNumber, customerName),
          },
          `Order confirmed: ${updatedOrder.orderNumber}`
        );
      }

      // Order shipped
      if (body.status === 'SHIPPED' && previousStatus !== 'SHIPPED') {
        const trackingNumber = updatedOrder.trackingNumber || body.trackingNumber;
        sendSMSSafe(
          {
            receptor: updatedOrder.customerPhone,
            message: SMSTemplates.ORDER_SHIPPED(updatedOrder.orderNumber, trackingNumber),
          },
          `Order shipped: ${updatedOrder.orderNumber}`
        );
      }

      // Order delivered
      if (body.status === 'DELIVERED' && previousStatus !== 'DELIVERED') {
        sendSMSSafe(
          {
            receptor: updatedOrder.customerPhone,
            message: SMSTemplates.ORDER_DELIVERED(updatedOrder.orderNumber),
          },
          `Order delivered: ${updatedOrder.orderNumber}`
        );
      }
    }

    // Transform data to match AdminOrder interface
    const transformedOrder = {
      id: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      userId: updatedOrder.userId,
      status: updatedOrder.status,
      totalAmount: Number(updatedOrder.totalAmount),
      subtotal: Number(updatedOrder.subtotal),
      taxAmount: Number(updatedOrder.taxAmount),
      shippingAmount: Number(updatedOrder.shippingAmount),
      discountAmount: Number(updatedOrder.discountAmount),
      customerEmail: updatedOrder.customerEmail,
      customerPhone: updatedOrder.customerPhone,
      customerNote: updatedOrder.customerNote,
      billingAddressId: updatedOrder.billingAddressId,
      shippingAddressId: updatedOrder.shippingAddressId,
      paymentMethod: updatedOrder.paymentMethod,
      paymentStatus: updatedOrder.paymentStatus,
      paymentId: updatedOrder.paymentId,
      paymentDate: updatedOrder.paymentDate?.toISOString(),
      shippingMethod: updatedOrder.shippingMethod,
      trackingNumber: updatedOrder.trackingNumber,
      shippedAt: updatedOrder.shippedAt?.toISOString(),
      deliveredAt: updatedOrder.deliveredAt?.toISOString(),
      createdAt: updatedOrder.createdAt.toISOString(),
      updatedAt: updatedOrder.updatedAt.toISOString(),
      user: updatedOrder.user,
      billingAddress: updatedOrder.billingAddress,
      shippingAddress: updatedOrder.shippingAddress,
      orderItems: updatedOrder.orderItems.map(item => ({
        id: item.id,
        orderId: item.orderId,
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
        createdAt: item.createdAt.toISOString(),
        product: item.product,
        variant: item.variant
      })),
      _count: updatedOrder._count
    };

    return NextResponse.json({
      success: true,
      data: transformedOrder,
      message: "Order updated successfully"
    });

  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
