import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { QuoteStatus } from "@prisma/client";

// GET /api/crm/quotes - List quotes with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") as QuoteStatus | null;
    const customerId = searchParams.get("customerId") || "";
    const opportunityId = searchParams.get("opportunityId") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};
    
    if (search) {
      where.OR = [
        { quoteNumber: { contains: search, mode: "insensitive" } },
        { customer: { 
          OR: [
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { company: { contains: search, mode: "insensitive" } }
          ]
        }}
      ];
    }

    if (status) {
      where.status = status;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (opportunityId) {
      where.opportunityId = opportunityId;
    }

    // Get quotes with pagination
    const [quotes, totalCount] = await Promise.all([
      prisma.quote.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              company: true,
              phone: true
            }
          },
          opportunity: {
            select: {
              id: true,
              title: true,
              stage: true,
              value: true
            }
          }
        }
      }),
      prisma.quote.count({ where })
    ]);

    // Calculate quote metrics
    const metrics = await prisma.quote.groupBy({
      by: ["status"],
      _count: { status: true },
      _sum: { total: true }
    });

    const statusCounts = metrics.reduce((acc, metric) => {
      acc[metric.status] = {
        count: metric._count.status,
        value: Number(metric._sum.total || 0)
      };
      return acc;
    }, {} as Record<string, { count: number; value: number }>);

    // Calculate total quote value
    const totalQuoteValue = metrics.reduce((sum, metric) => {
      return sum + Number(metric._sum.total || 0);
    }, 0);

    // Calculate conversion metrics
    const totalQuotes = await prisma.quote.count();
    const acceptedQuotes = await prisma.quote.count({ where: { status: "ACCEPTED" } });
    const conversionRate = totalQuotes > 0 ? (acceptedQuotes / totalQuotes) * 100 : 0;

    return NextResponse.json({
      success: true,
      data: {
        quotes,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit)
        },
        metrics: {
          total: totalCount,
          totalQuoteValue,
          conversionRate,
          statusCounts
        }
      }
    });

  } catch (error) {
    console.error("Error fetching quotes:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch quotes" },
      { status: 500 }
    );
  }
}

// POST /api/crm/quotes - Create new quote
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      customerId,
      opportunityId,
      items,
      subtotal,
      tax,
      total,
      validUntil,
      status = "DRAFT"
    } = body;

    // Validate required fields
    if (!customerId || !items || !subtotal || !total || !validUntil) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if customer exists
    const customer = await prisma.user.findUnique({
      where: { id: customerId }
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, error: "Customer not found" },
        { status: 404 }
      );
    }

    // Generate unique quote number
    const quoteCount = await prisma.quote.count();
    const quoteNumber = `Q-${new Date().getFullYear()}-${String(quoteCount + 1).padStart(6, '0')}`;

    // Create quote
    const quote = await prisma.quote.create({
      data: {
        customerId,
        opportunityId: opportunityId || null,
        quoteNumber,
        items: items,
        subtotal: parseFloat(subtotal),
        tax: parseFloat(tax || 0),
        total: parseFloat(total),
        validUntil: new Date(validUntil),
        status: status as QuoteStatus
      },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            company: true,
            phone: true
          }
        },
        opportunity: {
          select: {
            id: true,
            title: true,
            stage: true,
            value: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: quote
    });

  } catch (error) {
    console.error("Error creating quote:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create quote" },
      { status: 500 }
    );
  }
}
