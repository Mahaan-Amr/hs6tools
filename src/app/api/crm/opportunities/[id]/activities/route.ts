import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/crm/opportunities/[id]/activities - Get opportunity activities
export async function GET(
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

    const activities = await prisma.opportunityActivity.findMany({
      where: { opportunityId: id },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({
      success: true,
      data: activities
    });

  } catch (error) {
    console.error("Error fetching opportunity activities:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch opportunity activities" },
      { status: 500 }
    );
  }
}

// POST /api/crm/opportunities/[id]/activities - Create opportunity activity
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
    const {
      type,
      description,
      outcome,
      nextAction,
      scheduledAt,
      completedAt
    } = body;

    // Validate required fields
    if (!type || !description) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if opportunity exists
    const opportunity = await prisma.opportunity.findUnique({
      where: { id }
    });

    if (!opportunity) {
      return NextResponse.json(
        { success: false, error: "Opportunity not found" },
        { status: 404 }
      );
    }

    // Create activity
    const activity = await prisma.opportunityActivity.create({
      data: {
        opportunityId: id,
        type,
        description,
        outcome,
        nextAction,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        completedAt: completedAt ? new Date(completedAt) : null
      }
    });

    return NextResponse.json({
      success: true,
      data: activity
    });

  } catch (error) {
    console.error("Error creating opportunity activity:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create opportunity activity" },
      { status: 500 }
    );
  }
}
