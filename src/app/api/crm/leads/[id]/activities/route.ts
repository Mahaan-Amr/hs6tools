import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ActivityType } from "@prisma/client";

// GET /api/crm/leads/[id]/activities - Get lead activities
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

    const activities = await prisma.leadActivity.findMany({
      where: { leadId: id },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({
      success: true,
      data: activities
    });

  } catch (error) {
    console.error("Error fetching lead activities:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch lead activities" },
      { status: 500 }
    );
  }
}

// POST /api/crm/leads/[id]/activities - Create lead activity
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
      description,
      outcome,
      nextAction,
      scheduledAt,
      completedAt
    } = body;

    // Validate required fields
    if (!type || !subject || !description) {
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

    // Create activity
    const activity = await prisma.leadActivity.create({
      data: {
        leadId: id,
        type: type as ActivityType,
        subject,
        description,
        outcome,
        nextAction,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        completedAt: completedAt ? new Date(completedAt) : null
      }
    });

    // Update lead's lastContact if activity is completed
    if (completedAt) {
      await prisma.lead.update({
        where: { id },
        data: { lastContact: new Date(completedAt) }
      });
    }

    return NextResponse.json({
      success: true,
      data: activity
    });

  } catch (error) {
    console.error("Error creating lead activity:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create lead activity" },
      { status: 500 }
    );
  }
}
