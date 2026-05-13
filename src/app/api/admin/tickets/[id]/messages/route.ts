import { NextRequest, NextResponse } from "next/server";
import { TicketStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/authz";
import { normalizeAttachments, serializeTicket, ticketInclude } from "@/lib/tickets";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(["ADMIN", "SUPER_ADMIN"]);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const body = (await request.json()) as Record<string, unknown>;
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const isInternal = body.isInternal === true;
  const attachments = normalizeAttachments(body.attachments);

  if (!message && attachments.length === 0) {
    return NextResponse.json({ success: false, error: "Message is required" }, { status: 400 });
  }

  const existing = await prisma.ticket.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    return NextResponse.json({ success: false, error: "Ticket not found" }, { status: 404 });
  }

  const ticket = await prisma.$transaction(async (tx) => {
    const createdMessage = await tx.ticketMessage.create({
      data: {
        ticketId: id,
        senderId: auth.user.id,
        body: message || "پیوست ارسال شد.",
        isInternal,
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
        status: isInternal ? undefined : TicketStatus.PENDING_USER,
        assignedAdminId: auth.user.id,
        lastMessageAt: new Date(),
      },
    });

    return tx.ticket.findUniqueOrThrow({ where: { id }, include: ticketInclude });
  });

  return NextResponse.json({ success: true, data: serializeTicket(ticket) });
}
