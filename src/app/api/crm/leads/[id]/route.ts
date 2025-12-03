import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LeadSource, LeadStatus, CompanySize } from "@prisma/client";

// GET /api/crm/leads/[id] - Get lead details
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

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        interactions: {
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!lead) {
      return NextResponse.json(
        { success: false, error: "Lead not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: lead
    });

  } catch (error) {
    console.error("Error fetching lead:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch lead" },
      { status: 500 }
    );
  }
}

// PUT /api/crm/leads/[id] - Update lead
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

    // Check if lead exists
    const existingLead = await prisma.lead.findUnique({
      where: { id }
    });

    if (!existingLead) {
      return NextResponse.json(
        { success: false, error: "Lead not found" },
        { status: 404 }
      );
    }

    // Update lead
    const lead = await prisma.lead.update({
      where: { id },
      data: {
        ...(body.firstName && { firstName: body.firstName }),
        ...(body.lastName && { lastName: body.lastName }),
        ...(body.email && { email: body.email }),
        ...(body.phone !== undefined && { phone: body.phone }),
        ...(body.company !== undefined && { company: body.company }),
        ...(body.position !== undefined && { position: body.position }),
        ...(body.industry !== undefined && { industry: body.industry }),
        ...(body.companySize && { companySize: body.companySize as CompanySize }),
        ...(body.source && { source: body.source as LeadSource }),
        ...(body.status && { status: body.status as LeadStatus }),
        ...(body.assignedTo !== undefined && { assignedTo: body.assignedTo }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.tags && { tags: body.tags }),
        ...(body.nextFollowUp && { nextFollowUp: new Date(body.nextFollowUp) }),
        ...(body.lastContact && { lastContact: new Date(body.lastContact) })
      },
      include: {
        interactions: {
          orderBy: { createdAt: "desc" }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: lead
    });

  } catch (error) {
    console.error("Error updating lead:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update lead" },
      { status: 500 }
    );
  }
}

// DELETE /api/crm/leads/[id] - Delete lead
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

    // Check if lead exists
    const existingLead = await prisma.lead.findUnique({
      where: { id }
    });

    if (!existingLead) {
      return NextResponse.json(
        { success: false, error: "Lead not found" },
        { status: 404 }
      );
    }

    // Delete lead (interactions will be deleted due to cascade)
    await prisma.lead.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: "Lead deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting lead:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete lead" },
      { status: 500 }
    );
  }
}
