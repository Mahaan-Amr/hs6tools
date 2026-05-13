"use client";

import { useMemo, useState } from "react";
import * as LucideIcons from "lucide-react";
import { Check, Search, X } from "lucide-react";
import IconRenderer, { resolveLucideIcon } from "@/components/shared/IconRenderer";

interface IconPickerProps {
  value?: string | null;
  onChange: (value: string | null) => void;
  label?: string;
  placeholder?: string;
  emptyLabel?: string;
}

const iconNames = Object.keys(LucideIcons)
  .filter((name) => /^[A-Z]/.test(name))
  .filter((name) => resolveLucideIcon(name))
  .sort((a, b) => a.localeCompare(b));

export default function IconPicker({
  value,
  onChange,
  label = "آیکون",
  placeholder = "جستجوی آیکون...",
  emptyLabel = "هیچ آیکونی انتخاب نشده است",
}: IconPickerProps) {
  const [query, setQuery] = useState("");

  const filteredIcons = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return iconNames.slice(0, 120);

    return iconNames
      .filter((name) => name.toLowerCase().includes(normalizedQuery))
      .slice(0, 120);
  }, [query]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <label className="block text-sm font-semibold text-gray-900 dark:text-white">
          {label}
        </label>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          <X className="h-3.5 w-3.5" />
          حذف
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900/60">
        <div className="flex items-center gap-3 rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 dark:border-gray-600 dark:bg-gray-800">
          <Search className="h-4 w-4 text-gray-500" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholder}
            className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-500 dark:text-white dark:placeholder:text-gray-400"
          />
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-800/80">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-orange text-white">
            <IconRenderer
              name={value}
              className="h-6 w-6"
              fallback={<span className="text-xs font-semibold">?</span>}
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {value || emptyLabel}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              نام آیکون Lucide در فیلد `icon` ذخیره می‌شود
            </p>
          </div>
        </div>

        <div className="mt-4 grid max-h-80 grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredIcons.map((iconName) => {
            const isSelected = value === iconName;

            return (
              <button
                key={iconName}
                type="button"
                onClick={() => onChange(iconName)}
                className={`relative flex min-h-24 flex-col items-center justify-center rounded-xl border px-3 py-4 text-center transition ${
                  isSelected
                    ? "border-primary-orange bg-primary-orange/10 text-primary-orange"
                    : "border-gray-200 bg-white text-gray-700 hover:border-primary-orange/50 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900/70 dark:text-gray-200 dark:hover:bg-gray-800"
                }`}
              >
                {isSelected && <Check className="absolute right-2 top-2 h-4 w-4" />}
                <IconRenderer name={iconName} className="mb-3 h-5 w-5 flex-shrink-0" />
                <span className="w-full break-words text-xs font-medium leading-5">{iconName}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
