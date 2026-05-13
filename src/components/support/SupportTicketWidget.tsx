"use client";

import { FormEvent, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { TicketPriority } from "@prisma/client";
import { TicketAttachmentView } from "@/types/ticket";

interface SupportTicketWidgetProps {
  locale: string;
}

export default function SupportTicketWidget({ locale }: SupportTicketWidgetProps) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const fileRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("عمومی");
  const [priority, setPriority] = useState<TicketPriority>(TicketPriority.NORMAL);
  const [attachments, setAttachments] = useState<TicketAttachmentView[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  if (pathname.includes("/admin")) return null;

  const uploadFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setIsUploading(true);
    setNotice(null);

    try {
      const uploaded: TicketAttachmentView[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("category", "tickets");

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.error || "آپلود فایل ناموفق بود.");
        }
        uploaded.push({
          url: result.file.url,
          name: result.file.originalName,
          type: result.file.type,
          size: result.file.size,
        });
      }
      setAttachments((current) => [...current, ...uploaded]);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "خطا در آپلود فایل");
    } finally {
      setIsUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const submitTicket = async (event: FormEvent) => {
    event.preventDefault();
    if (status === "unauthenticated") {
      router.push(`/${locale}/auth/login`);
      return;
    }

    setIsSaving(true);
    setNotice(null);
    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message, category, priority, attachments }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "ثبت تیکت ناموفق بود.");
      }
      setSubject("");
      setMessage("");
      setAttachments([]);
      setNotice("تیکت شما ثبت شد. از بخش حساب کاربری می‌توانید گفتگو را دنبال کنید.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "خطا در ثبت تیکت");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-[80] rounded-full bg-primary-orange px-5 py-3 text-sm font-bold text-white shadow-2xl transition hover:bg-orange-600"
      >
        پشتیبانی
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/55 p-4 backdrop-blur-sm md:items-center">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white p-6 shadow-2xl dark:bg-gray-950" dir="rtl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">پشتیبانی HS6Tools</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">مشکل یا سوال خود را ثبت کنید.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10"
              >
                ×
              </button>
            </div>

            {status === "unauthenticated" ? (
              <div className="space-y-4">
                <p className="rounded-2xl bg-orange-50 p-4 text-sm text-orange-900 dark:bg-orange-500/10 dark:text-orange-200">
                  برای ثبت تیکت ابتدا وارد حساب کاربری شوید.
                </p>
                <button
                  type="button"
                  onClick={() => router.push(`/${locale}/auth/login`)}
                  className="w-full rounded-2xl bg-primary-orange px-4 py-3 font-semibold text-white"
                >
                  ورود به حساب کاربری
                </button>
              </div>
            ) : (
              <form onSubmit={submitTicket} className="space-y-4">
                <input
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  required
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none focus:border-primary-orange dark:border-white/10 dark:bg-white/5 dark:text-white"
                  placeholder="موضوع تیکت"
                />
                <div className="grid gap-3 md:grid-cols-2">
                  <select
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none focus:border-primary-orange dark:border-white/10 dark:bg-white/5 dark:text-white"
                  >
                    <option value="عمومی">عمومی</option>
                    <option value="سفارش">سفارش</option>
                    <option value="محصول">محصول</option>
                    <option value="گارانتی">گارانتی</option>
                    <option value="پرداخت">پرداخت</option>
                  </select>
                  <select
                    value={priority}
                    onChange={(event) => setPriority(event.target.value as TicketPriority)}
                    className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none focus:border-primary-orange dark:border-white/10 dark:bg-white/5 dark:text-white"
                  >
                    <option value="NORMAL">معمولی</option>
                    <option value="HIGH">مهم</option>
                    <option value="URGENT">فوری</option>
                    <option value="LOW">کم‌اهمیت</option>
                  </select>
                </div>
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  required
                  rows={5}
                  className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none focus:border-primary-orange dark:border-white/10 dark:bg-white/5 dark:text-white"
                  placeholder="پیام شما"
                />
                <div className="flex items-center justify-between gap-3">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    className="hidden"
                    onChange={(event) => uploadFiles(event.target.files)}
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={isUploading}
                    className="rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-60 dark:border-white/10 dark:text-gray-200 dark:hover:bg-white/10"
                  >
                    {isUploading ? "در حال آپلود..." : "افزودن پیوست"}
                  </button>
                  <span className="text-xs text-gray-500">{attachments.length} فایل</span>
                </div>
                {notice && <p className="rounded-2xl bg-gray-100 p-3 text-sm text-gray-800 dark:bg-white/10 dark:text-gray-100">{notice}</p>}
                <button
                  type="submit"
                  disabled={isSaving || isUploading}
                  className="w-full rounded-2xl bg-primary-orange px-4 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
                >
                  {isSaving ? "در حال ثبت..." : "ثبت تیکت"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
