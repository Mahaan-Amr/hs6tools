import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { QuoteStatus } from "@prisma/client";

// GET /api/crm/quotes/[id] - Get quote details
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

    const quote = await prisma.quote.findUnique({
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
        opportunity: {
          select: {
            id: true,
            title: true,
            stage: true,
            value: true,
            probability: true
          }
        }
      }
    });

    if (!quote) {
      return NextResponse.json(
        { success: false, error: "Quote not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: quote
    });

  } catch (error) {
    console.error("Error fetching quote:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch quote" },
      { status: 500 }
    );
  }
}

// PUT /api/crm/quotes/[id] - Update quote
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

    // Check if quote exists
    const existingQuote = await prisma.quote.findUnique({
      where: { id }
    });

    if (!existingQuote) {
      return NextResponse.json(
        { success: false, error: "Quote not found" },
        { status: 404 }
      );
    }

    // Update quote
    const quote = await prisma.quote.update({
      where: { id },
      data: {
        ...(body.items && { items: body.items }),
        ...(body.subtotal !== undefined && { subtotal: parseFloat(body.subtotal) }),
        ...(body.tax !== undefined && { tax: parseFloat(body.tax) }),
        ...(body.total !== undefined && { total: parseFloat(body.total) }),
        ...(body.validUntil && { validUntil: new Date(body.validUntil) }),
        ...(body.status && { status: body.status as QuoteStatus })
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
        opportunity: {
          select: {
            id: true,
            title: true,
            stage: true,
            value: true,
            probability: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: quote
    });

  } catch (error) {
    console.error("Error updating quote:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update quote" },
      { status: 500 }
    );
  }
}

// DELETE /api/crm/quotes/[id] - Delete quote
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

    // Check if quote exists
    const existingQuote = await prisma.quote.findUnique({
      where: { id }
    });

    if (!existingQuote) {
      return NextResponse.json(
        { success: false, error: "Quote not found" },
        { status: 404 }
      );
    }

    // Delete quote
    await prisma.quote.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: "Quote deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting quote:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete quote" },
      { status: 500 }
    );
  }
}
