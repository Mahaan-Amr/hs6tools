import { TicketPriority, TicketStatus, UserRole } from "@prisma/client";

export interface TicketAttachmentView {
  id?: string;
  url: string;
  name: string;
  type: string;
  size: number;
}

export interface TicketMessageView {
  id: string;
  body: string;
  isInternal: boolean;
  createdAt: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  };
  attachments: TicketAttachmentView[];
}

export interface TicketView {
  id: string;
  ticketNumber: string;
  subject: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
  };
  order?: {
    id: string;
    orderNumber: string;
    totalAmount: string | number;
    status: string;
  } | null;
  assignedAdmin?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  messages?: TicketMessageView[];
  attachments?: TicketAttachmentView[];
  _count?: {
    messages: number;
    attachments: number;
  };
}
