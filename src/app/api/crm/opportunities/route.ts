import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OpportunityStage } from "@prisma/client";

// GET /api/crm/opportunities - List opportunities with filtering and pagination
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
    const stage = searchParams.get("stage") as OpportunityStage | null;
    const assignedTo = searchParams.get("assignedTo") || "";
    const customerId = searchParams.get("customerId") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
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

    if (stage) {
      where.stage = stage;
    }

    if (assignedTo) {
      where.assignedTo = assignedTo;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    // Get opportunities with pagination
    const [opportunities, totalCount] = await Promise.all([
      prisma.opportunity.findMany({
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
          activities: {
            orderBy: { createdAt: "desc" },
            take: 1
          },
          quotes: {
            orderBy: { createdAt: "desc" },
            take: 1
          }
        }
      }),
      prisma.opportunity.count({ where })
    ]);

    // Calculate opportunity metrics
    const metrics = await prisma.opportunity.groupBy({
      by: ["stage"],
      _count: { stage: true },
      _sum: { value: true }
    });

    const stageCounts = metrics.reduce((acc, metric) => {
      acc[metric.stage] = {
        count: metric._count.stage,
        value: Number(metric._sum.value || 0)
      };
      return acc;
    }, {} as Record<string, { count: number; value: number }>);

    // Calculate total pipeline value
    const totalPipelineValue = metrics.reduce((sum, metric) => {
      return sum + Number(metric._sum.value || 0);
    }, 0);

    // Calculate weighted pipeline value (value * probability)
    const weightedPipelineValue = opportunities.reduce((sum, opp) => {
      return sum + (Number(opp.value) * (opp.probability / 100));
    }, 0);

    return NextResponse.json({
      success: true,
      data: {
        opportunities,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit)
        },
        metrics: {
          total: totalCount,
          totalPipelineValue,
          weightedPipelineValue,
          stageCounts
        }
      }
    });

  } catch (error) {
    console.error("Error fetching opportunities:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch opportunities" },
      { status: 500 }
    );
  }
}

// POST /api/crm/opportunities - Create new opportunity
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
      title,
      description,
      value,
      stage = "PROSPECTING",
      probability = 0,
      expectedClose,
      assignedTo
    } = body;

    // Validate required fields
    if (!customerId || !title || !value) {
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

    // Create opportunity
    const opportunity = await prisma.opportunity.create({
      data: {
        customerId,
        title,
        description,
        value: parseFloat(value),
        stage: stage as OpportunityStage,
        probability: parseInt(probability),
        expectedClose: expectedClose ? new Date(expectedClose) : null,
        assignedTo
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
        activities: true,
        quotes: true
      }
    });

    return NextResponse.json({
      success: true,
      data: opportunity
    });

  } catch (error) {
    console.error("Error creating opportunity:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create opportunity" },
      { status: 500 }
    );
  }
}
