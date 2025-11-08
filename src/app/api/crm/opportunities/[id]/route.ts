import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OpportunityStage } from "@prisma/client";

// GET /api/crm/opportunities/[id] - Get opportunity details
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

    const opportunity = await prisma.opportunity.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            company: true,
            phone: true,
            customerTier: true,
            healthScore: true
          }
        },
        activities: {
          orderBy: { createdAt: "desc" }
        },
        quotes: {
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!opportunity) {
      return NextResponse.json(
        { success: false, error: "Opportunity not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: opportunity
    });

  } catch (error) {
    console.error("Error fetching opportunity:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch opportunity" },
      { status: 500 }
    );
  }
}

// PUT /api/crm/opportunities/[id] - Update opportunity
export async function PUT(
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

    // Check if opportunity exists
    const existingOpportunity = await prisma.opportunity.findUnique({
      where: { id }
    });

    if (!existingOpportunity) {
      return NextResponse.json(
        { success: false, error: "Opportunity not found" },
        { status: 404 }
      );
    }

    // Update opportunity
    const opportunity = await prisma.opportunity.update({
      where: { id },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.value !== undefined && { value: parseFloat(body.value) }),
        ...(body.stage && { stage: body.stage as OpportunityStage }),
        ...(body.probability !== undefined && { probability: parseInt(body.probability) }),
        ...(body.expectedClose && { expectedClose: new Date(body.expectedClose) }),
        ...(body.assignedTo !== undefined && { assignedTo: body.assignedTo })
      },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            company: true,
            phone: true,
            customerTier: true,
            healthScore: true
          }
        },
        activities: {
          orderBy: { createdAt: "desc" }
        },
        quotes: {
          orderBy: { createdAt: "desc" }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: opportunity
    });

  } catch (error) {
    console.error("Error updating opportunity:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update opportunity" },
      { status: 500 }
    );
  }
}

// DELETE /api/crm/opportunities/[id] - Delete opportunity
export async function DELETE(
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

    // Check if opportunity exists
    const existingOpportunity = await prisma.opportunity.findUnique({
      where: { id }
    });

    if (!existingOpportunity) {
      return NextResponse.json(
        { success: false, error: "Opportunity not found" },
        { status: 404 }
      );
    }

    // Delete opportunity (activities and quotes will be deleted due to cascade)
    await prisma.opportunity.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: "Opportunity deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting opportunity:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete opportunity" },
      { status: 500 }
    );
  }
}
