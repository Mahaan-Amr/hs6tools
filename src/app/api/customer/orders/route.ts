import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
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
    console.log('🛒 API: Order data received:', JSON.stringify(body, null, 2));
    
    const {
      items,
      shippingAddress,
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

    // Detailed validation logging
    console.log('🛒 API: Validating order data:', {
      itemsCount: items?.length,
      hasShippingAddress: !!shippingAddress,
      shippingMethod,
      paymentMethod,
      subtotal,
      shippingAmount,
      taxAmount,
      discountAmount,
      totalAmount,
      customerEmail: session.user.email,
      customerPhone: shippingAddress?.phone
    });

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Order items are required" },
        { status: 400 }
      );
    }

    if (!shippingAddress) {
      return NextResponse.json(
        { success: false, error: "Shipping address is required" },
        { status: 400 }
      );
    }

    if (!shippingMethod || !paymentMethod) {
      return NextResponse.json(
        { success: false, error: "Shipping method and payment method are required" },
        { status: 400 }
      );
    }

    // Normalize enum values to uppercase (Prisma enums are case-sensitive)
    const normalizedShippingMethod = shippingMethod.toUpperCase();
    const normalizedPaymentMethod = paymentMethod.toUpperCase();

    // Validate enum values
    const validPaymentMethods = ['ZARINPAL', 'BANK_TRANSFER', 'CASH_ON_DELIVERY'];
    const validShippingMethods = ['POST', 'TIPAX', 'EXPRESS'];
    
    if (!validPaymentMethods.includes(normalizedPaymentMethod)) {
      console.error('❌ API: Invalid payment method:', paymentMethod, 'Normalized:', normalizedPaymentMethod);
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid payment method: ${paymentMethod}. Must be one of: ${validPaymentMethods.join(', ')}` 
        },
        { status: 400 }
      );
    }
    
    if (!validShippingMethods.includes(normalizedShippingMethod)) {
      console.error('❌ API: Invalid shipping method:', shippingMethod, 'Normalized:', normalizedShippingMethod);
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid shipping method: ${shippingMethod}. Must be one of: ${validShippingMethods.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Generate order number
    const orderNumber = `HS6-${Date.now().toString().slice(-6)}`;
    console.log('🛒 API: Generated order number:', orderNumber);
    console.log('🛒 API: Normalized methods:', {
      originalShippingMethod: shippingMethod,
      normalizedShippingMethod,
      originalPaymentMethod: paymentMethod,
      normalizedPaymentMethod
    });

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

    // Verify user exists in database before creating addresses
    console.log('🔍 API: Verifying user exists in database:', session.user.id);
    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, isActive: true }
    });

    if (!userExists) {
      console.error('❌ API: User not found in database with ID:', session.user.id);
      return NextResponse.json(
        { 
          success: false, 
          error: "User account not found. Please log out and log in again." 
        },
        { status: 404 }
      );
    }

    if (!userExists.isActive) {
      console.error('❌ API: User account is inactive:', session.user.id);
      return NextResponse.json(
        { 
          success: false, 
          error: "Your account has been deactivated. Please contact support." 
        },
        { status: 403 }
      );
    }

    console.log('✅ API: User verified, proceeding with order creation');

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

      // Validate and convert Decimal values
      const subtotalDecimal = new Decimal(subtotal || 0);
      const taxAmountDecimal = new Decimal(taxAmount || 0);
      const shippingAmountDecimal = new Decimal(shippingAmount || 0);
      const discountAmountDecimal = new Decimal(discountAmount || 0);
      const totalAmountDecimal = new Decimal(totalAmount || 0);

      // Validate customer email (required field)
      if (!session.user.email) {
        throw new Error("User email is required but not found in session");
      }

      console.log('🛒 API: Creating order with Decimal values:', {
        subtotal: subtotalDecimal.toString(),
        taxAmount: taxAmountDecimal.toString(),
        shippingAmount: shippingAmountDecimal.toString(),
        discountAmount: discountAmountDecimal.toString(),
        totalAmount: totalAmountDecimal.toString(),
        customerEmail: session.user.email,
        customerPhone: shippingAddress.phone
      });

      // Create order (using normalized enum values)
      // Note: billingAddressId has been removed from schema, using type assertion
      const orderData = {
          orderNumber,
          userId: session.user.id,
          status: "PENDING",
          paymentStatus: "PENDING",
          paymentMethod: normalizedPaymentMethod as "ZARINPAL" | "BANK_TRANSFER" | "CASH_ON_DELIVERY",
          shippingMethod: normalizedShippingMethod as "POST" | "TIPAX" | "EXPRESS",
          subtotal: subtotalDecimal,
          taxAmount: taxAmountDecimal,
          shippingAmount: shippingAmountDecimal,
          discountAmount: discountAmountDecimal,
          totalAmount: totalAmountDecimal,
          couponId: couponId || null,
          couponCode: couponCode || null,
          customerNote: customerNote || null,
          shippingAddressId: shippingAddr.id,
          customerEmail: session.user.email,
          customerPhone: shippingAddress.phone || null
      };

      const newOrder = await tx.order.create({
        data: orderData as Prisma.OrderUncheckedCreateInput // Type assertion - billingAddressId has been removed from schema
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
        console.log('🛒 API: Processing order item:', {
          productId: item.productId,
          sku: item.sku,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        });

        // Validate item data
        if (!item.sku || !item.name || !item.price || !item.quantity) {
          throw new Error(`Invalid item data: ${JSON.stringify(item)}`);
        }

        // Validate and convert item prices to Decimal
        const unitPrice = new Decimal(item.price || 0);
        const itemQuantity = parseInt(String(item.quantity || 1));
        const totalPrice = unitPrice.mul(itemQuantity);

        console.log('🛒 API: Creating order item with Decimal values:', {
          sku: item.sku,
          name: item.name,
          unitPrice: unitPrice.toString(),
          quantity: itemQuantity,
          totalPrice: totalPrice.toString()
        });

        // Create order item
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId || null,
            variantId: item.variantId || null,
            sku: item.sku,
            name: item.name,
            description: item.description || null,
            image: item.image || null,
            unitPrice: unitPrice,
            totalPrice: totalPrice,
            quantity: itemQuantity,
            attributes: item.attributes || {}
          }
        });

        // Update product stock
        if (item.productId) {
          // Check if product exists
          const product = await tx.product.findUnique({
            where: { id: item.productId },
            select: { id: true, stockQuantity: true }
          });

          if (!product) {
            console.warn(`⚠️ API: Product not found: ${item.productId}`);
            // Continue without updating stock if product doesn't exist
          } else {
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
      }

      return newOrder;
    });

    if (!order) {
      throw new Error("Failed to create order in transaction");
    }

    console.log('🛒 API: Order created successfully:', order.id);

    // Send order confirmation SMS (non-blocking) with product details
    const customerPhone = order.customerPhone;
    if (customerPhone) {
      // Fetch order items for SMS
      const orderItems = await prisma.orderItem.findMany({
        where: { orderId: order.id },
        select: { name: true, quantity: true }
      });
      
      const user = await prisma.user.findUnique({
        where: { id: order.userId },
        select: { firstName: true, lastName: true, phone: true }
      });
      const customerName = user ? `${user.firstName} ${user.lastName}` : 'کاربر گرامی';
      
      // Prepare product list for SMS
      const products = orderItems.map(item => 
        item.quantity > 1 ? `${item.name} (${item.quantity} عدد)` : item.name
      );
      const totalAmount = Number(order.totalAmount);
      
      console.log('📱 [Order Creation] Sending order confirmation SMS:', {
        orderNumber: order.orderNumber,
        phone: customerPhone,
        customerName,
        productsCount: products.length,
        totalAmount,
      });
      
      sendSMSSafe(
        {
          receptor: customerPhone,
          message: SMSTemplates.ORDER_CONFIRMED(order.orderNumber, customerName, products, totalAmount),
        },
        `Order created: ${order.orderNumber}`
      );
    } else {
      console.warn('⚠️ [Order Creation] No phone number found for SMS:', {
        orderNumber: order.orderNumber,
        userId: order.userId,
        customerPhone: order.customerPhone,
      });
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
    console.error("❌ API: Error creating order:", error);
    console.error("❌ API: Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    // Handle Prisma foreign key constraint violations
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        console.error('❌ API: Foreign key constraint violation:', error.meta);
        return NextResponse.json(
          { 
            success: false, 
            error: "User account not found. Please log out and log in again." 
          },
          { status: 404 }
        );
      }
      
      if (error.code === 'P2002') {
        console.error('❌ API: Unique constraint violation:', error.meta);
        return NextResponse.json(
          { 
            success: false, 
            error: "Order number already exists. Please try again." 
          },
          { status: 409 }
        );
      }
    }
    
    // Handle other Prisma errors
    if (error instanceof Prisma.PrismaClientValidationError) {
      console.error('❌ API: Prisma validation error:', error.message);
      console.error('❌ API: Validation error details:', {
        message: error.message,
        // Log the full error for debugging
        error: JSON.stringify(error, Object.getOwnPropertyNames(error))
      });
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid data provided. Please check your order details.",
          details: process.env.NODE_ENV === "development" ? error.message : undefined
        },
        { status: 400 }
      );
    }
    
    // Return more detailed error message for debugging
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Failed to create order";
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: process.env.NODE_ENV === "development" 
          ? (error instanceof Error ? error.stack : undefined)
          : undefined
      },
      { status: 500 }
    );
  }
}