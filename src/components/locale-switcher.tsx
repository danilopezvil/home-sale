"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import type { Locale } from "@/lib/i18n";

export function LocaleSwitcher({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function setLocale(next: Locale) {
    document.cookie = `locale=${next};path=/;max-age=31536000;SameSite=Lax`;
    startTransition(() => router.refresh());
  }

  return (
    <div className="inline-flex items-center rounded-2xl border border-stone-200 bg-white p-1 text-xs font-semibold text-stone-500 shadow-sm">
      <button
        onClick={() => setLocale("en")}
        disabled={isPending}
        className={`rounded-xl px-3 py-2 transition ${
          locale === "en" ? "bg-stone-950 text-white" : "hover:bg-stone-50 hover:text-stone-900"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLocale("es")}
        disabled={isPending}
        className={`rounded-xl px-3 py-2 transition ${
          locale === "es" ? "bg-stone-950 text-white" : "hover:bg-stone-50 hover:text-stone-900"
        }`}
      >
        ES
      </button>
    </div>
  );
}
