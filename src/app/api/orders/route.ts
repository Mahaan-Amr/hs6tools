import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { PaginatedResponse } from "@/types/admin";
import { requireAuth } from "@/lib/authz";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(["ADMIN", "SUPER_ADMIN"]);
    if (!authResult.ok) return authResult.response;

    const { searchParams } = new URL(request.url);
    
    // Parse pagination parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const paymentStatus = searchParams.get("paymentStatus") || "";
    const dateRange = searchParams.get("dateRange") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.OrderWhereInput = {};
    
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { customerEmail: { contains: search, mode: "insensitive" } },
        { customerPhone: { contains: search, mode: "insensitive" } },
        { user: { 
          OR: [
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } }
          ]
        } }
      ];
    }

    if (status) {
      where.status = status as Prisma.OrderWhereInput["status"];
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus as Prisma.OrderWhereInput["paymentStatus"];
    }

    if (dateRange) {
      const [startDate, endDate] = dateRange.split(",");
      if (startDate && endDate) {
        where.createdAt = {
          gte: new Date(startDate),
          lte: new Date(endDate)
        };
      }
    }

    // Build order by
    const orderBy: Prisma.OrderOrderByWithRelationInput = {};
    if (sortBy === "orderNumber") {
      orderBy.orderNumber = sortOrder === "asc" ? "asc" : "desc";
    } else if (sortBy === "totalAmount") {
      orderBy.totalAmount = sortOrder === "asc" ? "asc" : "desc";
    } else if (sortBy === "status") {
      orderBy.status = sortOrder === "asc" ? "asc" : "desc";
    } else if (sortBy === "paymentStatus") {
      orderBy.paymentStatus = sortOrder === "asc" ? "asc" : "desc";
    } else {
      orderBy.createdAt = sortOrder === "asc" ? "asc" : "desc";
    }

    // Fetch orders with relations
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
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
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.order.count({ where })
    ]);

    // Transform data to match AdminOrder interface
    // For small limits (like dashboard), return simplified data without heavy nested objects
    const isSimplifiedResponse = limit <= 10;
    
    const transformedOrders = orders.map(order => {
      // Helper function to safely convert Prisma Decimal to number
      const toNumber = (value: unknown): number => {
        if (value === null || value === undefined) return 0;
        if (typeof value === 'number') return value;
        if (typeof value === 'object' && 'toNumber' in value && typeof (value as { toNumber: () => number }).toNumber === 'function') {
          return (value as { toNumber: () => number }).toNumber();
        }
        return Number(value) || 0;
      };
      
      const baseOrder = {
        id: order.id,
        orderNumber: order.orderNumber,
        userId: order.userId,
        status: order.status,
        totalAmount: toNumber(order.totalAmount),
        subtotal: toNumber(order.subtotal),
        taxAmount: toNumber(order.taxAmount),
        shippingAmount: toNumber(order.shippingAmount),
        discountAmount: toNumber(order.discountAmount),
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        customerNote: order.customerNote,
        shippingAddressId: order.shippingAddressId,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        paymentId: order.paymentId,
        paymentDate: order.paymentDate?.toISOString() || null,
        shippingMethod: order.shippingMethod,
        trackingNumber: order.trackingNumber,
        shippedAt: order.shippedAt?.toISOString() || null,
        deliveredAt: order.deliveredAt?.toISOString() || null,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        // Include user info for customer name
        customer: order.user ? {
          name: `${order.user.firstName} ${order.user.lastName}`,
          email: order.user.email
        } : undefined
        // Exclude _count for simplified responses to avoid any potential serialization issues
      };
      
      // Helper function for orderItems conversion
      const convertOrderItem = (item: typeof order.orderItems[0]) => {
        const toNumber = (value: unknown): number => {
          if (value === null || value === undefined) return 0;
          if (typeof value === 'number') return value;
          if (typeof value === 'object' && 'toNumber' in value && typeof (value as { toNumber: () => number }).toNumber === 'function') {
            return (value as { toNumber: () => number }).toNumber();
          }
          return Number(value) || 0;
        };
        
        return {
          id: item.id,
          orderId: item.orderId,
          productId: item.productId,
          variantId: item.variantId,
          sku: item.sku,
          name: item.name,
          description: item.description,
          image: item.image,
          unitPrice: toNumber(item.unitPrice),
          totalPrice: toNumber(item.totalPrice),
          quantity: item.quantity,
          attributes: item.attributes,
          createdAt: item.createdAt.toISOString(),
          product: item.product ? {
            id: item.product.id,
            name: item.product.name,
            slug: item.product.slug
          } : null,
          variant: item.variant ? {
            id: item.variant.id,
            name: item.variant.name,
            sku: item.variant.sku
          } : null
        };
      };
      
      // For simplified response (dashboard), exclude heavy nested data
      if (isSimplifiedResponse) {
        return baseOrder;
      }
      
      // For full response (orders page), include all nested data
      return {
        ...baseOrder,
        _count: order._count, // Include _count only for full responses
        user: order.user,
        shippingAddress: order.shippingAddress,
        orderItems: order.orderItems.map(convertOrderItem)
      };
    });

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    const response: PaginatedResponse<typeof transformedOrders[0]> = {
      data: transformedOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev
      }
    };

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
