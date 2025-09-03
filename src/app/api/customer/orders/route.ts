import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

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
