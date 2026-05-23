import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { sendLowStockAlert } from "@/lib/sms";

class OrderCreationError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
    this.name = "OrderCreationError";
  }
}

type ValidatedOrderItem = {
  productId: string;
  variantId: string | null;
  sku: string;
  name: string;
  description: string | null;
  image: string | null;
  unitPrice: Decimal;
  quantity: number;
  totalPrice: Decimal;
  attributes: Prisma.InputJsonValue;
  productName: string;
};

type LowStockAlert = {
  productName: string;
  stockQuantity: number;
  lowStockThreshold: number;
};

type CreatedOrderResult = {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: Decimal;
  userId: string;
  customerPhone: string | null;
  lowStockAlerts: LowStockAlert[];
};

function calculateCouponDiscount(coupon: {
  discountType: string;
  discountValue: Decimal;
  maximumDiscount: Decimal | null;
}, subtotal: Decimal): Decimal {
  let discount = coupon.discountType === "PERCENTAGE"
    ? subtotal.mul(coupon.discountValue).div(100)
    : coupon.discountValue;

  if (coupon.maximumDiscount && discount.gt(coupon.maximumDiscount)) {
    discount = coupon.maximumDiscount;
  }

  if (discount.gt(subtotal)) {
    return subtotal;
  }

  return discount;
}

function isShippingMethodConfigId(shippingMethod: unknown): shippingMethod is string {
  return typeof shippingMethod === "string" && shippingMethod.length > 20 && /^[a-z]/.test(shippingMethod);
}

function toPositiveInteger(value: unknown): number | null {
  const quantity = Number(value);
  return Number.isInteger(quantity) && quantity > 0 ? quantity : null;
}

function normalizeAttributes(value: unknown): Prisma.InputJsonValue {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Prisma.InputJsonValue;
  }

  return {};
}

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

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      items,
      shippingAddress,
      shippingMethod,
      paymentMethod,
      customerNote,
      shippingAmount,
      couponCode,
    } = body;

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

    const normalizedPaymentMethod = String(paymentMethod).toUpperCase();
    const validPaymentMethods = ["ZARINPAL", "BANK_TRANSFER", "CASH_ON_DELIVERY"];

    if (!validPaymentMethods.includes(normalizedPaymentMethod)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid payment method: ${paymentMethod}. Must be one of: ${validPaymentMethods.join(", ")}`,
        },
        { status: 400 }
      );
    }

    let shippingMethodId: string | null = null;
    let normalizedShippingMethod: "POST" | "TIPAX" | "EXPRESS" = "POST";
    let serverShippingAmount = new Decimal(0);

    if (isShippingMethodConfigId(shippingMethod)) {
      const shippingMethodConfig = await prisma.shippingMethodConfig.findUnique({
        where: { id: shippingMethod },
        select: { id: true, name: true, price: true, isActive: true },
      });

      if (!shippingMethodConfig) {
        return NextResponse.json(
          { success: false, error: `Shipping method not found: ${shippingMethod}` },
          { status: 400 }
        );
      }

      if (!shippingMethodConfig.isActive) {
        return NextResponse.json(
          { success: false, error: `Shipping method "${shippingMethodConfig.name}" is not available` },
          { status: 400 }
        );
      }

      shippingMethodId = shippingMethodConfig.id;
      serverShippingAmount = new Decimal(shippingMethodConfig.price);
    } else {
      const validShippingMethods = ["POST", "TIPAX", "EXPRESS"];
      const normalized = String(shippingMethod).toUpperCase();

      if (!validShippingMethods.includes(normalized)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid shipping method: ${shippingMethod}. Must be one of: ${validShippingMethods.join(", ")} or a valid shipping method ID`,
          },
          { status: 400 }
        );
      }

      normalizedShippingMethod = normalized as "POST" | "TIPAX" | "EXPRESS";
      serverShippingAmount = new Decimal(Number(shippingAmount || 0));
      if (serverShippingAmount.isNegative()) {
        return NextResponse.json(
          { success: false, error: "Shipping amount cannot be negative" },
          { status: 400 }
        );
      }
    }

    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, isActive: true },
    });

    if (!userExists) {
      return NextResponse.json(
        { success: false, error: "User account not found. Please log out and log in again." },
        { status: 404 }
      );
    }

    if (!userExists.isActive) {
      return NextResponse.json(
        { success: false, error: "Your account has been deactivated. Please contact support." },
        { status: 403 }
      );
    }

    if (!session.user.email) {
      return NextResponse.json(
        { success: false, error: "User email is required but not found in session" },
        { status: 400 }
      );
    }

    const orderNumber = `HS6-${Date.now().toString().slice(-6)}`;
    const order = await prisma.$transaction(async (tx): Promise<CreatedOrderResult> => {
      const validatedItems: ValidatedOrderItem[] = [];

      for (const item of items) {
        if (!item?.productId) {
          throw new OrderCreationError("Each order item must include a productId");
        }

        const quantity = toPositiveInteger(item.quantity);
        if (!quantity) {
          throw new OrderCreationError("Each order item must include a positive integer quantity");
        }

        const product = await tx.product.findFirst({
          where: {
            id: item.productId,
            isActive: true,
            deletedAt: null,
          },
          include: {
            images: {
              where: { isPrimary: true },
              select: { url: true },
              take: 1,
            },
            variants: item.variantId
              ? {
                  where: { id: item.variantId },
                  take: 1,
                }
              : false,
          },
        });

        if (!product) {
          throw new OrderCreationError("Product is not available");
        }

        const variant = item.variantId ? product.variants[0] : null;
        if (item.variantId && !variant) {
          throw new OrderCreationError("Selected product variant is not available");
        }

        const stockQuantity = variant ? variant.stockQuantity : product.stockQuantity;
        const isInStock = variant ? variant.isInStock : product.isInStock;
        if (!product.allowBackorders && (!isInStock || stockQuantity < quantity)) {
          throw new OrderCreationError(`Insufficient stock for ${variant?.name || product.name}`);
        }

        const unitPrice = new Decimal(variant?.price ?? product.price);
        const name = variant ? `${product.name} - ${variant.name}` : product.name;
        const sku = variant?.sku || product.sku;
        const attributes = variant?.attributes
          ? (variant.attributes as Prisma.InputJsonValue)
          : normalizeAttributes(item.attributes);

        validatedItems.push({
          productId: product.id,
          variantId: variant?.id || null,
          sku,
          name,
          description: product.shortDescription || product.description || null,
          image: item.image || product.images[0]?.url || null,
          unitPrice,
          quantity,
          totalPrice: unitPrice.mul(quantity),
          attributes,
          productName: product.name,
        });
      }

      const subtotalDecimal = validatedItems.reduce(
        (sum, item) => sum.plus(item.totalPrice),
        new Decimal(0)
      );

      let coupon: Awaited<ReturnType<typeof tx.coupon.findUnique>> = null;
      let couponId: string | null = null;
      const normalizedCouponCode = typeof couponCode === "string" && couponCode.trim()
        ? couponCode.trim().toUpperCase()
        : null;

      if (normalizedCouponCode) {
        coupon = await tx.coupon.findUnique({
          where: { code: normalizedCouponCode },
        });

        if (!coupon) {
          throw new OrderCreationError("کد تخفیف معتبر نیست");
        }

        const now = new Date();
        if (
          !coupon.isActive ||
          now < coupon.validFrom ||
          now > coupon.validUntil ||
          (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) ||
          (coupon.minimumAmount && subtotalDecimal.lt(coupon.minimumAmount))
        ) {
          throw new OrderCreationError("کد تخفیف معتبر نیست یا منقضی شده است");
        }

        if (coupon.applicableTo === "CATEGORIES" && coupon.categoryIds.length > 0) {
          const productCategories = await tx.product.findMany({
            where: { id: { in: validatedItems.map((item) => item.productId) } },
            select: { categoryId: true },
          });
          const categoryIds = productCategories.map((product) => product.categoryId);
          const hasApplicableCategory = coupon.categoryIds.some((categoryId) =>
            categoryIds.includes(categoryId)
          );

          if (!hasApplicableCategory) {
            throw new OrderCreationError("این کد تخفیف برای محصولات انتخابی شما اعمال نمی‌شود");
          }
        }

        if (coupon.applicableTo === "PRODUCTS" && coupon.productIds.length > 0) {
          const productIds = new Set(validatedItems.map((item) => item.productId));
          const hasApplicableProduct = coupon.productIds.some((productId) =>
            productIds.has(productId)
          );

          if (!hasApplicableProduct) {
            throw new OrderCreationError("این کد تخفیف برای محصولات انتخابی شما اعمال نمی‌شود");
          }
        }

        const userOrderCount = await tx.order.count({
          where: {
            userId: session.user.id,
            couponId: coupon.id,
          },
        });

        if (userOrderCount >= coupon.userUsageLimit) {
          throw new OrderCreationError("شما قبلاً از این کد تخفیف استفاده کرده‌اید");
        }

        couponId = coupon.id;
      }

      const discountAmountDecimal = coupon
        ? calculateCouponDiscount(coupon, subtotalDecimal)
        : new Decimal(0);
      const taxAmountDecimal = new Decimal(Math.round(subtotalDecimal.toNumber() * 0.09));
      const totalAmountDecimal = subtotalDecimal
        .plus(serverShippingAmount)
        .plus(taxAmountDecimal)
        .minus(discountAmountDecimal);

      let shippingAddr;
      if (shippingAddress.addressId) {
        shippingAddr = await tx.address.findFirst({
          where: {
            id: shippingAddress.addressId,
            userId: session.user.id,
          },
        });

        if (!shippingAddr) {
          throw new OrderCreationError("Selected address not found or does not belong to user");
        }
      } else {
        shippingAddr = await tx.address.create({
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
            isDefault: false,
          },
        });
      }

      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 30);

      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: session.user.id,
          status: "PENDING",
          paymentStatus: "PENDING",
          paymentMethod: normalizedPaymentMethod as "ZARINPAL" | "BANK_TRANSFER" | "CASH_ON_DELIVERY",
          shippingMethod: normalizedShippingMethod,
          shippingMethodId,
          subtotal: subtotalDecimal,
          taxAmount: taxAmountDecimal,
          shippingAmount: serverShippingAmount,
          discountAmount: discountAmountDecimal,
          totalAmount: totalAmountDecimal,
          couponId,
          couponCode: normalizedCouponCode,
          customerNote: customerNote || null,
          shippingAddressId: shippingAddr.id,
          customerEmail: session.user.email,
          customerPhone: shippingAddress.phone || null,
          expiresAt,
        } as Prisma.OrderUncheckedCreateInput,
      });

      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: { usageCount: { increment: 1 } },
        });
      }

      const lowStockAlerts: LowStockAlert[] = [];

      for (const item of validatedItems) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            variantId: item.variantId,
            sku: item.sku,
            name: item.name,
            description: item.description,
            image: item.image,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            quantity: item.quantity,
            attributes: item.attributes,
          },
        });

        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: {
            allowBackorders: true,
            lowStockThreshold: true,
          },
        });

        if (item.variantId) {
          const variantUpdate = await tx.productVariant.updateMany({
            where: {
              id: item.variantId,
              ...(product?.allowBackorders ? {} : { stockQuantity: { gte: item.quantity } }),
            },
            data: {
              stockQuantity: { decrement: item.quantity },
            },
          });

          if (variantUpdate.count !== 1) {
            throw new OrderCreationError(`Insufficient stock for ${item.name}`);
          }

          const updatedVariant = await tx.productVariant.findUnique({
            where: { id: item.variantId },
            select: { stockQuantity: true },
          });

          if (updatedVariant) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { isInStock: updatedVariant.stockQuantity > 0 },
            });
          }

          continue;
        }

        const productUpdate = await tx.product.updateMany({
          where: {
            id: item.productId,
            ...(product?.allowBackorders ? {} : { stockQuantity: { gte: item.quantity } }),
          },
          data: {
            stockQuantity: { decrement: item.quantity },
          },
        });

        if (productUpdate.count !== 1) {
          throw new OrderCreationError(`Insufficient stock for ${item.name}`);
        }

        const updatedProduct = await tx.product.findUnique({
          where: { id: item.productId },
          select: {
            name: true,
            stockQuantity: true,
            lowStockThreshold: true,
          },
        });

        if (updatedProduct) {
          await tx.product.update({
            where: { id: item.productId },
            data: { isInStock: updatedProduct.stockQuantity > 0 },
          });

          if (updatedProduct.stockQuantity <= updatedProduct.lowStockThreshold) {
            lowStockAlerts.push({
              productName: updatedProduct.name,
              stockQuantity: updatedProduct.stockQuantity,
              lowStockThreshold: updatedProduct.lowStockThreshold,
            });
          }
        }
      }

      return {
        id: newOrder.id,
        orderNumber: newOrder.orderNumber,
        status: newOrder.status,
        totalAmount: newOrder.totalAmount,
        userId: newOrder.userId,
        customerPhone: newOrder.customerPhone,
        lowStockAlerts,
      };
    });

    console.log('🛒 API: Order created successfully:', order.id);

    if (order.lowStockAlerts.length > 0) {
      prisma.user.findMany({
        where: {
          role: { in: ["ADMIN", "SUPER_ADMIN"] },
          phone: { not: null },
          isActive: true,
        },
        select: { phone: true },
      }).then((admins) => {
        const adminPhones = admins
          .map((admin) => admin.phone)
          .filter((phone): phone is string => phone !== null);

        if (adminPhones.length > 0) {
          order.lowStockAlerts.forEach((alert) => {
            sendLowStockAlert(
              alert.productName,
              alert.stockQuantity,
              alert.lowStockThreshold,
              adminPhones
            );
          });
        }
      }).catch((err) => {
        console.error('[SMS] Error fetching admin phones for low stock alert:', err);
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        totalAmount: Number(order.totalAmount),
        message: "Order created successfully",
      },
    }, { status: 201 });

  } catch (error) {
    console.error("❌ API: Error creating order:", error);
    console.error("❌ API: Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (error instanceof OrderCreationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.status }
      );
    }

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

    if (error instanceof Prisma.PrismaClientValidationError) {
      console.error('❌ API: Prisma validation error:', error.message);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid data provided. Please check your order details.",
          details: process.env.NODE_ENV === "development" ? error.message : undefined,
        },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error
      ? error.message
      : "Failed to create order";

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: process.env.NODE_ENV === "development"
          ? (error instanceof Error ? error.stack : undefined)
          : undefined,
      },
      { status: 500 }
    );
  }
}
