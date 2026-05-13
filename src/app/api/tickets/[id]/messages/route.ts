import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { TicketStatus } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeAttachments, serializeTicket, ticketInclude } from "@/lib/tickets";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as Record<string, unknown>;
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const attachments = normalizeAttachments(body.attachments);

  if (!message && attachments.length === 0) {
    return NextResponse.json({ success: false, error: "Message is required" }, { status: 400 });
  }

  const existing = await prisma.ticket.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true, status: true },
  });

  if (!existing) {
    return NextResponse.json({ success: false, error: "Ticket not found" }, { status: 404 });
  }

  if (existing.status === TicketStatus.CLOSED) {
    return NextResponse.json(
      { success: false, error: "Closed tickets cannot receive replies" },
      { status: 400 }
    );
  }

  const ticket = await prisma.$transaction(async (tx) => {
    const createdMessage = await tx.ticketMessage.create({
      data: {
        ticketId: id,
        senderId: session.user.id,
        body: message || "پیوست ارسال شد.",
      },
    });

    if (attachments.length > 0) {
      await tx.ticketAttachment.createMany({
        data: attachments.map((attachment) => ({
          ...attachment,
          ticketId: id,
          messageId: createdMessage.id,
        })),
      });
    }

    await tx.ticket.update({
      where: { id },
      data: {
        status: TicketStatus.PENDING_ADMIN,
        lastMessageAt: new Date(),
        closedAt: null,
        resolvedAt: null,
      },
    });

    return tx.ticket.findUniqueOrThrow({ where: { id }, include: ticketInclude });
  });

  return NextResponse.json({ success: true, data: serializeTicket(ticket) });
}
