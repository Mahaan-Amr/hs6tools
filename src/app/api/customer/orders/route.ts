import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { sendSMSSafe, SMSTemplates, sendLowStockAlert } from "@/lib/sms";

// GET /api/customer/orders - Get customer order history with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API: /api/customer/orders - Starting request');
    
    const session = await getServerSession(authOptions);
    console.log('🔍 API: Session:', session ? 'exists' : 'null', 'User ID:', session?.user?.id);
    
    // Check if user is authenticated
    if (!session?.user?.id) {
      console.log('❌ API: No session or user ID');
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    console.log('🔍 API: Search params:', Object.fromEntries(searchParams.entries()));
    
    // Parse pagination parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status") || "";
    const dateRange = searchParams.get("dateRange") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    console.log('🔍 API: Parsed params - Page:', page, 'Limit:', limit, 'Status:', status, 'DateRange:', dateRange, 'SortBy:', sortBy, 'SortOrder:', sortOrder);

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.OrderWhereInput = {
      userId: session.user.id
    };
    
    if (status) {
      where.status = status as Prisma.OrderWhereInput["status"];
    }

    if (dateRange) {
      // Handle numeric day values (7, 30, 90, 365)
      const days = parseInt(dateRange);
      if (!isNaN(days)) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - days);
        
        where.createdAt = {
          gte: startDate,
          lte: endDate
        };
        console.log('🔍 API: Date range filter - Days:', days, 'Start:', startDate, 'End:', endDate);
      }
    }

    console.log('🔍 API: Final where clause:', JSON.stringify(where, null, 2));

    // Build order by
    const orderBy: Prisma.OrderOrderByWithRelationInput = {};
    if (sortBy === "orderNumber") {
      orderBy.orderNumber = sortOrder === "asc" ? "asc" : "desc";
    } else if (sortBy === "totalAmount") {
      orderBy.totalAmount = sortOrder === "asc" ? "asc" : "desc";
    } else if (sortBy === "status") {
      orderBy.status = sortOrder === "asc" ? "asc" : "desc";
    } else {
      orderBy.createdAt = sortOrder === "asc" ? "asc" : "desc";
    }

    // Fetch orders with relations
    console.log('🔍 API: Executing database query...');
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
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
          billingAddress: true,
          shippingAddress: true
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.order.count({ where })
    ]);

    console.log('🔍 API: Database query completed - Orders found:', orders.length, 'Total count:', total);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    // Transform order data
    const transformedOrders = orders.map(order => ({
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
      billingAddress: order.billingAddress,
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
    }));

    const response = {
      success: true,
      data: {
        orders: transformedOrders,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext,
          hasPrev
        }
      }
    };

    console.log('🔍 API: Sending response:', response);
    return NextResponse.json(response);

  } catch (error) {
    console.error("Error fetching customer orders:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/customer/orders - Create new order
export async function POST(request: NextRequest) {
  try {
    console.log('🛒 API: /api/customer/orders POST - Creating new order');
    
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session?.user?.id) {
      console.log('❌ API: No session or user ID');
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('🛒 API: Order data received:', body);
    
    const {
      items,
      shippingAddress,
      billingAddress,
      shippingMethod,
      paymentMethod,
      customerNote,
      subtotal,
      shippingAmount,
      taxAmount,
      discountAmount,
      totalAmount,
      couponCode
    } = body;

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Order items are required" },
        { status: 400 }
      );
    }

    if (!shippingAddress || !billingAddress) {
      return NextResponse.json(
        { success: false, error: "Shipping and billing addresses are required" },
        { status: 400 }
      );
    }

    if (!shippingMethod || !paymentMethod) {
      return NextResponse.json(
        { success: false, error: "Shipping method and payment method are required" },
        { status: 400 }
      );
    }

    // Generate order number
    const orderNumber = `HS6-${Date.now().toString().slice(-6)}`;
    console.log('🛒 API: Generated order number:', orderNumber);

    // Validate and get coupon if coupon code is provided
    let coupon = null;
    let couponId = null;
    if (couponCode) {
      coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });

      if (coupon) {
        // Re-validate coupon at order creation time
        const now = new Date();
        if (
          !coupon.isActive ||
          now < coupon.validFrom ||
          now > coupon.validUntil ||
          (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) ||
          (coupon.minimumAmount && subtotal < Number(coupon.minimumAmount))
        ) {
          return NextResponse.json(
            { success: false, error: "کد تخفیف معتبر نیست یا منقضی شده است" },
            { status: 400 }
          );
        }

        // Check user usage limit
        const userOrderCount = await prisma.order.count({
          where: {
            userId: session.user.id,
            couponId: coupon.id,
          },
        });

        if (userOrderCount >= coupon.userUsageLimit) {
          return NextResponse.json(
            { success: false, error: "شما قبلاً از این کد تخفیف استفاده کرده‌اید" },
            { status: 400 }
          );
        }

        couponId = coupon.id;
      }
    }

    // Create order in transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create shipping address
      const shippingAddr = await tx.address.create({
        data: {
          userId: session.user.id,
          type: "SHIPPING",
          title: "آدرس ارسال",
          firstName: shippingAddress.firstName,
          lastName: shippingAddress.lastName,
          addressLine1: shippingAddress.address,
          city: shippingAddress.city,
          state: shippingAddress.province,
          postalCode: shippingAddress.postalCode,
          country: "Iran",
          phone: shippingAddress.phone,
          isDefault: false
        }
      });

      // Create billing address
      const billingAddr = await tx.address.create({
        data: {
          userId: session.user.id,
          type: "BILLING",
          title: "آدرس صورتحساب",
          firstName: billingAddress.firstName,
          lastName: billingAddress.lastName,
          addressLine1: billingAddress.address,
          city: billingAddress.city,
          state: billingAddress.province,
          postalCode: billingAddress.postalCode,
          country: "Iran",
          phone: billingAddress.phone,
          isDefault: false
        }
      });

      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: session.user.id,
          status: "PENDING",
          paymentStatus: "PENDING",
          paymentMethod,
          shippingMethod,
          subtotal: subtotal || 0,
          taxAmount: taxAmount || 0,
          shippingAmount: shippingAmount || 0,
          discountAmount: discountAmount || 0,
          totalAmount: totalAmount || 0,
          couponId: couponId || null,
          couponCode: couponCode || null,
          customerNote: customerNote || null,
          billingAddressId: billingAddr.id,
          shippingAddressId: shippingAddr.id,
          customerEmail: session.user.email || "",
          customerPhone: shippingAddress.phone
        }
      });

      // Increment coupon usage count if coupon was used
      if (couponId && coupon) {
        await tx.coupon.update({
          where: { id: couponId },
          data: {
            usageCount: {
              increment: 1
            }
          }
        });
      }

      // Create order items and update product stock
      for (const item of items) {
        // Create order item
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            variantId: item.variantId || null,
            sku: item.sku,
            name: item.name,
            description: item.description || null,
            image: item.image || null,
            unitPrice: item.price,
            totalPrice: item.price * item.quantity,
            quantity: item.quantity,
            attributes: item.attributes || {}
          }
        });

        // Update product stock
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: {
                decrement: item.quantity
              }
            }
          });

          // Check if stock is now low and update isInStock
          const updatedProduct = await tx.product.findUnique({
            where: { id: item.productId },
            select: { 
              stockQuantity: true, 
              lowStockThreshold: true,
              name: true
            }
          });

          if (updatedProduct && updatedProduct.stockQuantity <= updatedProduct.lowStockThreshold) {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                isInStock: updatedProduct.stockQuantity > 0
              }
            });

            // Send low stock alert to admins (after transaction, non-blocking)
            // We'll do this after the transaction completes
            if (updatedProduct.stockQuantity <= updatedProduct.lowStockThreshold) {
              // Get admin phone numbers (after transaction)
              prisma.user.findMany({
                where: {
                  role: { in: ['ADMIN', 'SUPER_ADMIN'] },
                  phone: { not: null },
                  isActive: true
                },
                select: { phone: true }
              }).then(admins => {
                const adminPhones = admins
                  .map(admin => admin.phone)
                  .filter((phone): phone is string => phone !== null);
                
                if (adminPhones.length > 0) {
                  sendLowStockAlert(
                    updatedProduct.name,
                    updatedProduct.stockQuantity,
                    updatedProduct.lowStockThreshold,
                    adminPhones
                  );
                }
              }).catch(err => {
                console.error('[SMS] Error fetching admin phones for low stock alert:', err);
              });
            }
          }
        }
      }

      return newOrder;
    });

    console.log('🛒 API: Order created successfully:', order.id);

    // Send order confirmation SMS (non-blocking)
    if (order.customerPhone) {
      const user = await prisma.user.findUnique({
        where: { id: order.userId },
        select: { firstName: true, lastName: true }
      });
      const customerName = user ? `${user.firstName} ${user.lastName}` : 'کاربر گرامی';
      
      sendSMSSafe(
        {
          receptor: order.customerPhone,
          message: SMSTemplates.ORDER_CONFIRMED(order.orderNumber, customerName),
        },
        `Order created: ${order.orderNumber}`
      );
    }

    // Return order with basic info
    return NextResponse.json({
      success: true,
      data: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        totalAmount: order.totalAmount,
        message: "Order created successfully"
      }
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create order" },
      { status: 500 }
    );
  }
}