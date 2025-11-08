import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { QuoteStatus } from "@prisma/client";

// POST /api/crm/quotes/[id]/send - Send quote to customer
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
    const { email, message } = body;

    // Check if quote exists
    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            company: true
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

    // Check if quote is in draft status
    if (quote.status !== "DRAFT") {
      return NextResponse.json(
        { success: false, error: "Only draft quotes can be sent" },
        { status: 400 }
      );
    }

    // Update quote status to SENT
    const updatedQuote = await prisma.quote.update({
      where: { id },
      data: { status: "SENT" as QuoteStatus },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            company: true
          }
        }
      }
    });

    // TODO: Implement actual email sending logic here
    // For now, we'll just log the email details
    console.log("Quote sent:", {
      quoteId: id,
      quoteNumber: quote.quoteNumber,
      customerEmail: email || quote.customer.email,
      customerName: `${quote.customer.firstName} ${quote.customer.lastName}`,
      message: message || "Your quote is ready for review"
    });

    return NextResponse.json({
      success: true,
      data: updatedQuote,
      message: "Quote sent successfully"
    });

  } catch (error) {
    console.error("Error sending quote:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send quote" },
      { status: 500 }
    );
  }
}
