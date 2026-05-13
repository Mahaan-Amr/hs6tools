import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { TicketStatus } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isTicketStatus, serializeTicket, ticketInclude } from "@/lib/tickets";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const ticket = await prisma.ticket.findFirst({
    where: { id, userId: session.user.id },
    include: ticketInclude,
  });

  if (!ticket) {
    return NextResponse.json({ success: false, error: "Ticket not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: serializeTicket(ticket) });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as Record<string, unknown>;
  const nextStatus = isTicketStatus(body.status) ? body.status : null;

  if (!nextStatus || (nextStatus !== TicketStatus.OPEN && nextStatus !== TicketStatus.CLOSED)) {
    return NextResponse.json(
      { success: false, error: "Users can only reopen or close tickets" },
      { status: 400 }
    );
  }

  const ticket = await prisma.ticket.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true },
  });

  if (!ticket) {
    return NextResponse.json({ success: false, error: "Ticket not found" }, { status: 404 });
  }

  const updated = await prisma.ticket.update({
    where: { id },
    data: {
      status: nextStatus,
      closedAt: nextStatus === TicketStatus.CLOSED ? new Date() : null,
      resolvedAt: nextStatus === TicketStatus.OPEN ? null : undefined,
    },
    include: ticketInclude,
  });

  return NextResponse.json({ success: true, data: serializeTicket(updated) });
}
