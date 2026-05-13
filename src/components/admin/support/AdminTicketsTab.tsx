"use client";

import { FormEvent, useEffect, useState } from "react";
import { TicketPriority, TicketStatus } from "@prisma/client";
import { TicketView } from "@/types/ticket";

const statusLabel: Record<string, string> = {
  OPEN: "باز",
  PENDING_ADMIN: "در انتظار پشتیبانی",
  PENDING_USER: "در انتظار مشتری",
  RESOLVED: "حل‌شده",
  CLOSED: "بسته",
};

const priorityLabel: Record<string, string> = {
  LOW: "کم",
  NORMAL: "معمولی",
  HIGH: "مهم",
  URGENT: "فوری",
};

export default function AdminTicketsTab() {
  const [tickets, setTickets] = useState<TicketView[]>([]);
  const [activeTicket, setActiveTicket] = useState<TicketView | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [reply, setReply] = useState("");
  const [internal, setInternal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadTickets = async () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    const response = await fetch(`/api/admin/tickets?${params.toString()}`, { cache: "no-store" });
    const result = await response.json();
    if (result.success) setTickets(result.data || []);
    setIsLoading(false);
  };

  const openTicket = async (id: string) => {
    const response = await fetch(`/api/admin/tickets/${id}`, { cache: "no-store" });
    const result = await response.json();
    if (result.success) setActiveTicket(result.data);
  };

  useEffect(() => {
    loadTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const sendReply = async (event: FormEvent) => {
    event.preventDefault();
    if (!activeTicket || !reply.trim()) return;
    const response = await fetch(`/api/admin/tickets/${activeTicket.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: reply, isInternal: internal }),
    });
    const result = await response.json();
    if (result.success) {
      setReply("");
      setInternal(false);
      setActiveTicket(result.data);
      await loadTickets();
    }
  };

  const updateTicket = async (data: Record<string, unknown>) => {
    if (!activeTicket) return;
    const response = await fetch(`/api/admin/tickets/${activeTicket.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (result.success) {
      setActiveTicket(result.data);
      await loadTickets();
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">مرکز پشتیبانی</h1>
          <p className="mt-2 text-sm text-gray-300">مدیریت تیکت‌ها و گفتگو با مشتریان</p>
        </div>
        <div className="flex flex-col gap-2 md:flex-row">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && loadTickets()}
            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-primary-orange"
            placeholder="جستجو..."
          />
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-primary-orange"
          >
            <option value="">همه وضعیت‌ها</option>
            {Object.values(TicketStatus).map((value) => (
              <option key={value} value={value}>{statusLabel[value]}</option>
            ))}
          </select>
          <button onClick={loadTickets} className="rounded-2xl bg-primary-orange px-5 py-3 font-semibold text-white">
            اعمال
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <aside className="rounded-3xl border border-white/10 bg-white/5 p-4">
          {isLoading ? (
            <p className="p-4 text-gray-300">در حال بارگذاری...</p>
          ) : tickets.length === 0 ? (
            <p className="p-4 text-gray-300">تیکتی یافت نشد.</p>
          ) : (
            <div className="space-y-2">
              {tickets.map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => openTicket(ticket.id)}
                  className={`w-full rounded-2xl p-4 text-right transition ${
                    activeTicket?.id === ticket.id ? "bg-primary-orange text-white" : "bg-black/20 text-white hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-bold">{ticket.subject}</span>
                    <span className="text-xs opacity-80">{priorityLabel[ticket.priority]}</span>
                  </div>
                  <div className="mt-2 text-xs opacity-80">
                    {ticket.ticketNumber} · {statusLabel[ticket.status]} · {ticket.user?.firstName} {ticket.user?.lastName}
                  </div>
                </button>
              ))}
            </div>
          )}
        </aside>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
          {!activeTicket ? (
            <div className="flex min-h-96 items-center justify-center text-gray-300">
              یک تیکت را انتخاب کنید.
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-col gap-4 border-b border-white/10 pb-5 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">{activeTicket.subject}</h2>
                  <p className="mt-2 text-sm text-gray-300">
                    {activeTicket.ticketNumber} · {activeTicket.user?.firstName} {activeTicket.user?.lastName} · {activeTicket.user?.email}
                  </p>
                  {activeTicket.order && <p className="mt-1 text-sm text-primary-orange">سفارش: {activeTicket.order.orderNumber}</p>}
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  <select
                    value={activeTicket.status}
                    onChange={(event) => updateTicket({ status: event.target.value })}
                    className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white"
                  >
                    {Object.values(TicketStatus).map((value) => (
                      <option key={value} value={value}>{statusLabel[value]}</option>
                    ))}
                  </select>
                  <select
                    value={activeTicket.priority}
                    onChange={(event) => updateTicket({ priority: event.target.value })}
                    className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white"
                  >
                    {Object.values(TicketPriority).map((value) => (
                      <option key={value} value={value}>{priorityLabel[value]}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="max-h-[520px] space-y-3 overflow-y-auto">
                {(activeTicket.messages || []).map((message) => (
                  <div
                    key={message.id}
                    className={`rounded-2xl p-4 ${message.isInternal ? "border border-yellow-500/30 bg-yellow-500/10" : "bg-black/20"}`}
                  >
                    <div className="mb-2 text-xs text-gray-400">
                      {message.sender.firstName} {message.sender.lastName} · {new Date(message.createdAt).toLocaleString("fa-IR")}
                      {message.isInternal ? " · یادداشت داخلی" : ""}
                    </div>
                    <p className="whitespace-pre-wrap text-sm leading-7 text-gray-100">{message.body}</p>
                    {message.attachments.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.attachments.map((attachment) => (
                          <a key={attachment.url} href={attachment.url} target="_blank" className="rounded-xl bg-white/10 px-3 py-1 text-xs text-primary-orange">
                            {attachment.name}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <form onSubmit={sendReply} className="space-y-3">
                <textarea
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  rows={4}
                  className="w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-primary-orange"
                  placeholder="پاسخ پشتیبانی..."
                />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <label className="flex items-center gap-2 text-sm text-gray-300">
                    <input type="checkbox" checked={internal} onChange={(event) => setInternal(event.target.checked)} />
                    یادداشت داخلی
                  </label>
                  <button className="rounded-2xl bg-primary-orange px-5 py-3 font-semibold text-white">ارسال پاسخ</button>
                </div>
              </form>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
