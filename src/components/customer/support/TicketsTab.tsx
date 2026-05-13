"use client";

import { FormEvent, useEffect, useState } from "react";
import { TicketStatus } from "@prisma/client";
import { TicketView } from "@/types/ticket";

const statusLabel: Record<string, string> = {
  OPEN: "باز",
  PENDING_ADMIN: "در انتظار پاسخ پشتیبانی",
  PENDING_USER: "در انتظار پاسخ شما",
  RESOLVED: "حل‌شده",
  CLOSED: "بسته",
};

export default function TicketsTab() {
  const [tickets, setTickets] = useState<TicketView[]>([]);
  const [activeTicket, setActiveTicket] = useState<TicketView | null>(null);
  const [reply, setReply] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const loadTickets = async () => {
    setIsLoading(true);
    const response = await fetch("/api/tickets", { cache: "no-store" });
    const result = await response.json();
    if (result.success) setTickets(result.data || []);
    setIsLoading(false);
  };

  const openTicket = async (id: string) => {
    const response = await fetch(`/api/tickets/${id}`, { cache: "no-store" });
    const result = await response.json();
    if (result.success) setActiveTicket(result.data);
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const sendReply = async (event: FormEvent) => {
    event.preventDefault();
    if (!activeTicket || !reply.trim()) return;
    setIsSending(true);
    const response = await fetch(`/api/tickets/${activeTicket.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: reply }),
    });
    const result = await response.json();
    if (result.success) {
      setReply("");
      setActiveTicket(result.data);
      await loadTickets();
    }
    setIsSending(false);
  };

  const updateStatus = async (status: TicketStatus) => {
    if (!activeTicket) return;
    const response = await fetch(`/api/tickets/${activeTicket.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const result = await response.json();
    if (result.success) {
      setActiveTicket(result.data);
      await loadTickets();
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]" dir="rtl">
      <aside className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">تیکت‌های من</h3>
          <button onClick={loadTickets} className="text-sm text-primary-orange">بروزرسانی</button>
        </div>
        {isLoading ? (
          <p className="text-sm text-gray-500">در حال بارگذاری...</p>
        ) : tickets.length === 0 ? (
          <p className="text-sm text-gray-500">هنوز تیکتی ثبت نشده است.</p>
        ) : (
          <div className="space-y-2">
            {tickets.map((ticket) => (
              <button
                key={ticket.id}
                onClick={() => openTicket(ticket.id)}
                className={`w-full rounded-2xl p-3 text-right transition ${
                  activeTicket?.id === ticket.id
                    ? "bg-primary-orange text-white"
                    : "bg-white/60 text-gray-900 hover:bg-white dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
                }`}
              >
                <div className="font-semibold">{ticket.subject}</div>
                <div className="mt-1 text-xs opacity-80">
                  {ticket.ticketNumber} · {statusLabel[ticket.status] || ticket.status}
                </div>
              </button>
            ))}
          </div>
        )}
      </aside>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        {!activeTicket ? (
          <div className="flex min-h-72 items-center justify-center text-gray-500">
            یک تیکت را برای مشاهده گفتگو انتخاب کنید.
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex flex-col gap-3 border-b border-white/10 pb-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{activeTicket.subject}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {activeTicket.ticketNumber} · {statusLabel[activeTicket.status] || activeTicket.status}
                </p>
              </div>
              <div className="flex gap-2">
                {activeTicket.status === TicketStatus.CLOSED ? (
                  <button onClick={() => updateStatus(TicketStatus.OPEN)} className="rounded-xl bg-primary-orange px-4 py-2 text-sm text-white">
                    بازگشایی
                  </button>
                ) : (
                  <button onClick={() => updateStatus(TicketStatus.CLOSED)} className="rounded-xl border border-white/15 px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                    بستن تیکت
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-[460px] space-y-3 overflow-y-auto">
              {(activeTicket.messages || []).filter((item) => !item.isInternal).map((message) => {
                const isAdmin = message.sender.role === "ADMIN" || message.sender.role === "SUPER_ADMIN";
                return (
                  <div key={message.id} className={`rounded-2xl p-4 ${isAdmin ? "bg-orange-500/10" : "bg-white/70 dark:bg-white/10"}`}>
                    <div className="mb-2 text-xs text-gray-500">
                      {message.sender.firstName} {message.sender.lastName} · {new Date(message.createdAt).toLocaleString("fa-IR")}
                    </div>
                    <p className="whitespace-pre-wrap text-sm leading-7 text-gray-800 dark:text-gray-100">{message.body}</p>
                    {message.attachments.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.attachments.map((attachment) => (
                          <a key={attachment.url} href={attachment.url} target="_blank" className="rounded-xl bg-black/10 px-3 py-1 text-xs text-primary-orange">
                            {attachment.name}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {activeTicket.status !== TicketStatus.CLOSED && (
              <form onSubmit={sendReply} className="space-y-3">
                <textarea
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  rows={4}
                  className="w-full resize-none rounded-2xl border border-white/10 bg-white/70 px-4 py-3 text-gray-900 outline-none focus:border-primary-orange dark:bg-white/5 dark:text-white"
                  placeholder="پاسخ خود را بنویسید..."
                />
                <button disabled={isSending} className="rounded-2xl bg-primary-orange px-5 py-3 font-semibold text-white disabled:opacity-60">
                  {isSending ? "در حال ارسال..." : "ارسال پاسخ"}
                </button>
              </form>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
