import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { QuoteStatus } from "@prisma/client";

// POST /api/crm/quotes/[id]/convert - Convert quote to order
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { shippingAddress, billingAddress, shippingMethod, paymentMethod } = body;

    // Check if quote exists
    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            company: true
          }
        },
        opportunity: true
      }
    });

    if (!quote) {
      return NextResponse.json(
        { success: false, error: "Quote not found" },
        { status: 404 }
      );
    }

    // Check if quote is accepted
    if (quote.status !== "ACCEPTED") {
      return NextResponse.json(
        { success: false, error: "Only accepted quotes can be converted to orders" },
        { status: 400 }
      );
    }

    // Generate unique order number
    const orderCount = await prisma.order.count();
    const orderNumber = `ORD-${new Date().getFullYear()}-${String(orderCount + 1).padStart(6, '0')}`;

    // Create order from quote
    const order = await prisma.$transaction(async (tx) => {
      // Create shipping address
      const shippingAddr = await tx.address.create({
        data: {
          userId: quote.customerId,
          type: "SHIPPING",
          title: "آدرس ارسال",
          firstName: shippingAddress.firstName,
          lastName: shippingAddress.lastName,
          company: shippingAddress.company,
          addressLine1: shippingAddress.addressLine1,
          addressLine2: shippingAddress.addressLine2,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postalCode: shippingAddress.postalCode,
          country: shippingAddress.country,
          phone: shippingAddress.phone,
          isDefault: false
        }
      });

      // Create billing address
      const billingAddr = await tx.address.create({
        data: {
          userId: quote.customerId,
          type: "BILLING",
          title: "آدرس صورتحساب",
          firstName: billingAddress.firstName,
          lastName: billingAddress.lastName,
          company: billingAddress.company,
          addressLine1: billingAddress.addressLine1,
          addressLine2: billingAddress.addressLine2,
          city: billingAddress.city,
          state: billingAddress.state,
          postalCode: billingAddress.postalCode,
          country: billingAddress.country,
          phone: billingAddress.phone,
          isDefault: false
        }
      });

      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId: quote.customerId,
          orderNumber,
          status: "PENDING",
          subtotal: quote.subtotal,
          taxAmount: quote.tax,
          shippingAmount: 0, // Will be calculated based on shipping method
          discountAmount: 0,
          totalAmount: quote.total,
          customerEmail: quote.customer.email,
          customerPhone: "",
          shippingAddressId: shippingAddr.id,
          billingAddressId: billingAddr.id,
          shippingMethod: shippingMethod || "STANDARD",
          paymentMethod: paymentMethod || "CASH_ON_DELIVERY",
          paymentStatus: "PENDING"
        }
      });

      // Create order items from quote items
      const quoteItems = Array.isArray(quote.items) ? quote.items : [];
      for (const item of quoteItems) {
        if (item && typeof item === 'object' && 'productId' in item) {
          const quoteItem = item as {
            productId: string;
            productName: string;
            productSku: string;
            quantity: number;
            price: number;
          };
          
          await tx.orderItem.create({
            data: {
              orderId: newOrder.id,
              productId: quoteItem.productId,
              sku: quoteItem.productSku,
              name: quoteItem.productName,
              unitPrice: quoteItem.price,
              totalPrice: quoteItem.quantity * quoteItem.price,
              quantity: quoteItem.quantity
            }
          });

          // Update product stock
          await tx.product.update({
            where: { id: quoteItem.productId },
            data: {
              stockQuantity: {
                decrement: quoteItem.quantity
              }
            }
          });
        }
      }

      // Update quote status to indicate conversion
      await tx.quote.update({
        where: { id },
        data: { status: "ACCEPTED" as QuoteStatus } // Keep as ACCEPTED but add conversion tracking
      });

      return newOrder;
    });

    return NextResponse.json({
      success: true,
      data: {
        order,
        orderNumber,
        message: "Quote converted to order successfully"
      }
    });

  } catch (error) {
    console.error("Error converting quote to order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to convert quote to order" },
      { status: 500 }
    );
  }
}
