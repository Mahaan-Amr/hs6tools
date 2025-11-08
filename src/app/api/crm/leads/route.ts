import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LeadSource, LeadStatus, CompanySize } from "@prisma/client";

// GET /api/crm/leads - List leads with filtering and pagination
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
    const status = searchParams.get("status") as LeadStatus | null;
    const source = searchParams.get("source") as LeadSource | null;
    const assignedTo = searchParams.get("assignedTo") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } }
      ];
    }

    if (status) {
      where.status = status;
    }

    if (source) {
      where.source = source;
    }

    if (assignedTo) {
      where.assignedTo = assignedTo;
    }

    // Get leads with pagination
    const [leads, totalCount] = await Promise.all([
      prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          activities: {
            orderBy: { createdAt: "desc" },
            take: 1
          },
          interactions: {
            orderBy: { createdAt: "desc" },
            take: 1
          }
        }
      }),
      prisma.lead.count({ where })
    ]);

    // Calculate lead metrics
    const metrics = await prisma.lead.groupBy({
      by: ["status"],
      _count: { status: true }
    });

    const statusCounts = metrics.reduce((acc, metric) => {
      acc[metric.status] = metric._count.status;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      success: true,
      data: {
        leads,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit)
        },
        metrics: {
          total: totalCount,
          new: statusCounts.NEW || 0,
          contacted: statusCounts.CONTACTED || 0,
          qualified: statusCounts.QUALIFIED || 0,
          converted: statusCounts.CONVERTED || 0,
          lost: statusCounts.LOST || 0
        }
      }
    });

  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}

// POST /api/crm/leads - Create new lead
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
      firstName,
      lastName,
      email,
      phone,
      company,
      position,
      industry,
      companySize,
      source,
      status = "NEW",
      assignedTo,
      notes,
      tags = [],
      expectedValue,
      expectedClose,
      nextFollowUp
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !source) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if lead with same email already exists
    const existingLead = await prisma.lead.findFirst({
      where: { email }
    });

    if (existingLead) {
      return NextResponse.json(
        { success: false, error: "Lead with this email already exists" },
        { status: 400 }
      );
    }

    // Calculate initial lead score based on provided information
    let score = 0;
    if (company) score += 10;
    if (phone) score += 10;
    if (position) score += 5;
    if (industry) score += 5;
    if (companySize) score += 5;
    if (expectedValue) score += 15;

    // Create lead
    const lead = await prisma.lead.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        company,
        position,
        industry,
        companySize: companySize as CompanySize,
        source: source as LeadSource,
        status: status as LeadStatus,
        assignedTo,
        notes,
        tags,
        expectedValue: expectedValue ? parseFloat(expectedValue) : null,
        expectedClose: expectedClose ? new Date(expectedClose) : null,
        nextFollowUp: nextFollowUp ? new Date(nextFollowUp) : null,
        score
      },
      include: {
        activities: true,
        interactions: true
      }
    });

    return NextResponse.json({
      success: true,
      data: lead
    });

  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create lead" },
      { status: 500 }
    );
  }
}
