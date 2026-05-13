import { NextRequest, NextResponse } from "next/server";
import { Prisma, TicketStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/authz";
import {
  isTicketPriority,
  isTicketStatus,
  serializeTicket,
  ticketInclude,
} from "@/lib/tickets";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(["ADMIN", "SUPER_ADMIN"]);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const ticket = await prisma.ticket.findUnique({
    where: { id },
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
  const auth = await requireAuth(["ADMIN", "SUPER_ADMIN"]);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const body = (await request.json()) as Record<string, unknown>;
  const data: Prisma.TicketUpdateInput = {};

  if (isTicketStatus(body.status)) {
    data.status = body.status;
    data.resolvedAt = body.status === TicketStatus.RESOLVED ? new Date() : body.status === TicketStatus.OPEN ? null : undefined;
    data.closedAt = body.status === TicketStatus.CLOSED ? new Date() : body.status === TicketStatus.OPEN ? null : undefined;
  }

  if (isTicketPriority(body.priority)) {
    data.priority = body.priority as never;
  }

  if ("assignedAdminId" in body) {
    data.assignedAdmin =
      typeof body.assignedAdminId === "string" && body.assignedAdminId
        ? { connect: { id: body.assignedAdminId } }
        : { disconnect: true };
  }

  if ("orderId" in body) {
    data.order =
      typeof body.orderId === "string" && body.orderId
        ? { connect: { id: body.orderId } }
        : { disconnect: true };
  }

  const ticket = await prisma.ticket.update({
    where: { id },
    data,
    include: ticketInclude,
  });

  return NextResponse.json({ success: true, data: serializeTicket(ticket) });
}
