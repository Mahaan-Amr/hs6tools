import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/crm/customers/[id]/interactions - Get customer interactions
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
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const interactions = await prisma.customerInteraction.findMany({
      where: { customerId: id },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset
    });

    const totalCount = await prisma.customerInteraction.count({
      where: { customerId: id }
    });

    return NextResponse.json({
      success: true,
      data: {
        interactions,
        totalCount,
        hasMore: offset + limit < totalCount
      }
    });

  } catch (error) {
    console.error("Error fetching customer interactions:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/crm/customers/[id]/interactions - Create new customer interaction
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

    // Validate required fields
    if (!body.type || !body.content) {
      return NextResponse.json(
        { success: false, error: "Type and content are required" },
        { status: 400 }
      );
    }

    // Create interaction
    const interaction = await prisma.customerInteraction.create({
      data: {
        customerId: id,
        type: body.type,
        subject: body.subject,
        content: body.content,
        outcome: body.outcome,
        nextAction: body.nextAction
      }
    });

    // Update customer's last interaction date
    await prisma.user.update({
      where: { id },
      data: {
        lastInteraction: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: interaction
    });

  } catch (error) {
    console.error("Error creating customer interaction:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
