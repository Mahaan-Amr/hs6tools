import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { PaginatedResponse } from "@/types/admin";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

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
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.order.count({ where })
    ]);

    // Transform data to match AdminOrder interface
    const transformedOrders = orders.map(order => ({
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
    }));

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
