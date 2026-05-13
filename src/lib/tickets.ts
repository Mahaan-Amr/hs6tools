import { Prisma, TicketPriority, TicketStatus, UserRole } from "@prisma/client";
import { normalizeUploadUrl } from "@/utils/image-url";

export const ticketInclude = {
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
    },
  },
  order: {
    select: {
      id: true,
      orderNumber: true,
      totalAmount: true,
      status: true,
    },
  },
  assignedAdmin: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  },
  messages: {
    orderBy: { createdAt: "asc" },
    include: {
      sender: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      },
      attachments: true,
    },
  },
  attachments: true,
} satisfies Prisma.TicketInclude;

export const ticketListInclude = {
  user: ticketInclude.user,
  order: ticketInclude.order,
  assignedAdmin: ticketInclude.assignedAdmin,
  _count: {
    select: {
      messages: true,
      attachments: true,
    },
  },
} satisfies Prisma.TicketInclude;

type TicketWithDetails = Prisma.TicketGetPayload<{ include: typeof ticketInclude }>;
type TicketListItem = Prisma.TicketGetPayload<{ include: typeof ticketListInclude }>;

export function serializeTicket(ticket: TicketWithDetails) {
  return {
    ...ticket,
    attachments: ticket.attachments.map((attachment) => ({
      ...attachment,
      url: normalizeUploadUrl(attachment.url),
    })),
    messages: ticket.messages.map((message) => ({
      ...message,
      attachments: message.attachments.map((attachment) => ({
        ...attachment,
        url: normalizeUploadUrl(attachment.url),
      })),
    })),
  };
}

export function serializeTicketListItem(ticket: TicketListItem) {
  return ticket;
}

export function isTicketStatus(value: unknown): value is TicketStatus {
  return typeof value === "string" && Object.values(TicketStatus).includes(value as TicketStatus);
}

export function isTicketPriority(value: unknown): value is TicketPriority {
  return typeof value === "string" && Object.values(TicketPriority).includes(value as TicketPriority);
}

export function isAdminRole(role?: UserRole | null) {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export function normalizeAttachments(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const attachment = item as Record<string, unknown>;
      if (
        typeof attachment.url !== "string" ||
        typeof attachment.name !== "string" ||
        typeof attachment.type !== "string"
      ) {
        return null;
      }

      return {
        url: normalizeUploadUrl(attachment.url),
        name: attachment.name,
        type: attachment.type,
        size: typeof attachment.size === "number" ? attachment.size : 0,
      };
    })
    .filter(Boolean) as Array<{ url: string; name: string; type: string; size: number }>;
}

export function buildTicketNumber() {
  return `HS6-${Date.now().toString(36).toUpperCase()}`;
}
