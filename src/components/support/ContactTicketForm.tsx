"use client";

import { FormEvent, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ContactPageContentPayload } from "@/types/page-cms";

interface ContactTicketFormProps {
  locale: string;
  form: ContactPageContentPayload["content"]["form"];
}

export default function ContactTicketForm({ locale, form }: ContactTicketFormProps) {
  const { status } = useSession();
  const router = useRouter();
  const fields = form.fields;
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (status === "unauthenticated") {
      router.push(`/${locale}/auth/login`);
      return;
    }

    setIsSaving(true);
    setNotice(null);
    const response = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, message, category: "تماس با ما" }),
    });
    const result = await response.json();
    if (result.success) {
      setSubject("");
      setMessage("");
      setNotice("پیام شما به صورت تیکت ثبت شد و از حساب کاربری قابل پیگیری است.");
    } else {
      setNotice(result.error || "ثبت پیام ناموفق بود.");
    }
    setIsSaving(false);
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
            {fields.firstNameLabel}
          </label>
          <input
            type="text"
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-orange dark:border-white/20 dark:bg-white/10 dark:text-white dark:placeholder:text-gray-400"
            placeholder={fields.firstNamePlaceholder}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
            {fields.lastNameLabel}
          </label>
          <input
            type="text"
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-orange dark:border-white/20 dark:bg-white/10 dark:text-white dark:placeholder:text-gray-400"
            placeholder={fields.lastNamePlaceholder}
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
          {fields.emailLabel}
        </label>
        <input
          type="email"
          className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-orange dark:border-white/20 dark:bg-white/10 dark:text-white dark:placeholder:text-gray-400"
          placeholder={fields.emailPlaceholder}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
          {fields.subjectLabel}
        </label>
        <input
          type="text"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          required
          className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-orange dark:border-white/20 dark:bg-white/10 dark:text-white dark:placeholder:text-gray-400"
          placeholder={fields.subjectPlaceholder}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
          {fields.messageLabel}
        </label>
        <textarea
          rows={4}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          required
          className="w-full resize-none rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-orange dark:border-white/20 dark:bg-white/10 dark:text-white dark:placeholder:text-gray-400"
          placeholder={fields.messagePlaceholder}
        />
      </div>

      {notice && <p className="rounded-2xl bg-white/70 p-3 text-sm text-gray-800 dark:bg-white/10 dark:text-gray-100">{notice}</p>}

      <button
        type="submit"
        disabled={isSaving}
        className="w-full rounded-xl bg-gradient-to-r from-primary-orange to-orange-500 px-8 py-4 font-semibold text-white transition-transform duration-300 hover:scale-105 disabled:opacity-60"
      >
        {isSaving ? "در حال ارسال..." : form.submitLabel}
      </button>
    </form>
  );
}
