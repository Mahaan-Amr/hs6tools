import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { InteractionType } from "@prisma/client";

// GET /api/crm/leads/[id]/interactions - Get lead interactions
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

    const interactions = await prisma.leadInteraction.findMany({
      where: { leadId: id },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({
      success: true,
      data: interactions
    });

  } catch (error) {
    console.error("Error fetching lead interactions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch lead interactions" },
      { status: 500 }
    );
  }
}

// POST /api/crm/leads/[id]/interactions - Create lead interaction
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
      subject,
      content,
      outcome,
      nextAction
    } = body;

    // Validate required fields
    if (!type || !content) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if lead exists
    const lead = await prisma.lead.findUnique({
      where: { id }
    });

    if (!lead) {
      return NextResponse.json(
        { success: false, error: "Lead not found" },
        { status: 404 }
      );
    }

    // Create interaction
    const interaction = await prisma.leadInteraction.create({
      data: {
        leadId: id,
        type: type as InteractionType,
        subject,
        content,
        outcome,
        nextAction
      }
    });

    // Update lead's lastContact
    await prisma.lead.update({
      where: { id },
      data: { lastContact: new Date() }
    });

    return NextResponse.json({
      success: true,
      data: interaction
    });

  } catch (error) {
    console.error("Error creating lead interaction:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create lead interaction" },
      { status: 500 }
    );
  }
}
