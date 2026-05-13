import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { TicketPriority } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  buildTicketNumber,
  isTicketPriority,
  normalizeAttachments,
  serializeTicket,
  serializeTicketListItem,
  ticketInclude,
  ticketListInclude,
} from "@/lib/tickets";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const tickets = await prisma.ticket.findMany({
    where: {
      userId: session.user.id,
      ...(status ? { status: status as never } : {}),
    },
    include: ticketListInclude,
    orderBy: { lastMessageAt: "desc" },
  });

  return NextResponse.json({
    success: true,
    data: tickets.map(serializeTicketListItem),
  });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as Record<string, unknown>;
  const subject = typeof body.subject === "string" ? body.subject.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const category = typeof body.category === "string" && body.category.trim() ? body.category.trim() : "عمومی";
  const priority = isTicketPriority(body.priority) ? body.priority : TicketPriority.NORMAL;
  const orderId = typeof body.orderId === "string" && body.orderId.trim() ? body.orderId.trim() : null;
  const attachments = normalizeAttachments(body.attachments);

  if (!subject || !message) {
    return NextResponse.json(
      { success: false, error: "Subject and message are required" },
      { status: 400 }
    );
  }

  if (orderId) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: session.user.id },
      select: { id: true },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found for current user" },
        { status: 400 }
      );
    }
  }

  const ticket = await prisma.$transaction(async (tx) => {
    const createdTicket = await tx.ticket.create({
      data: {
        ticketNumber: buildTicketNumber(),
        userId: session.user.id,
        orderId,
        subject,
        category,
        priority,
        status: "PENDING_ADMIN",
      },
    });

    const createdMessage = await tx.ticketMessage.create({
      data: {
        ticketId: createdTicket.id,
        senderId: session.user.id,
        body: message,
      },
    });

    if (attachments.length > 0) {
      await tx.ticketAttachment.createMany({
        data: attachments.map((attachment) => ({
          ...attachment,
          ticketId: createdTicket.id,
          messageId: createdMessage.id,
        })),
      });
    }

    return tx.ticket.findUniqueOrThrow({
      where: { id: createdTicket.id },
      include: ticketInclude,
    });
  });

  return NextResponse.json({ success: true, data: serializeTicket(ticket) }, { status: 201 });
}
