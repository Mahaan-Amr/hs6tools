import { NextRequest, NextResponse } from "next/server";
import { TicketPriority, TicketStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/authz";
import {
  isTicketPriority,
  isTicketStatus,
  serializeTicket,
  serializeTicketListItem,
  ticketInclude,
  ticketListInclude,
} from "@/lib/tickets";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(["ADMIN", "SUPER_ADMIN"]);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const search = searchParams.get("search") || "";

  const tickets = await prisma.ticket.findMany({
    where: {
      ...(isTicketStatus(status) ? { status } : {}),
      ...(isTicketPriority(priority) ? { priority } : {}),
      ...(search
        ? {
            OR: [
              { ticketNumber: { contains: search, mode: "insensitive" } },
              { subject: { contains: search, mode: "insensitive" } },
              { user: { email: { contains: search, mode: "insensitive" } } },
              { user: { firstName: { contains: search, mode: "insensitive" } } },
              { user: { lastName: { contains: search, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    include: ticketListInclude,
    orderBy: { lastMessageAt: "desc" },
  });

  return NextResponse.json({
    success: true,
    data: tickets.map(serializeTicketListItem),
    filters: {
      statuses: Object.values(TicketStatus),
      priorities: Object.values(TicketPriority),
    },
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(["ADMIN", "SUPER_ADMIN"]);
  if (!auth.ok) return auth.response;

  const body = (await request.json()) as Record<string, unknown>;
  const userId = typeof body.userId === "string" ? body.userId : "";
  const subject = typeof body.subject === "string" ? body.subject.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!userId || !subject || !message) {
    return NextResponse.json(
      { success: false, error: "userId, subject and message are required" },
      { status: 400 }
    );
  }

  const ticket = await prisma.ticket.create({
    data: {
      ticketNumber: `HS6-${Date.now().toString(36).toUpperCase()}`,
      userId,
      subject,
      category: typeof body.category === "string" ? body.category : "عمومی",
      priority: isTicketPriority(body.priority) ? body.priority : TicketPriority.NORMAL,
      status: TicketStatus.PENDING_USER,
      assignedAdminId: auth.user.id,
      messages: {
        create: {
          senderId: auth.user.id,
          body: message,
        },
      },
    },
    include: ticketInclude,
  });

  return NextResponse.json({ success: true, data: serializeTicket(ticket) }, { status: 201 });
}
