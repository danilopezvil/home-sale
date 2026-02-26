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
    <div className="flex items-center rounded-lg border border-stone-200 p-0.5 text-xs font-semibold">
      <button
        onClick={() => setLocale("en")}
        disabled={isPending}
        className={`rounded-md px-2 py-1 transition ${
          locale === "en"
            ? "bg-orange-500 text-white"
            : "text-stone-500 hover:text-stone-800"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLocale("es")}
        disabled={isPending}
        className={`rounded-md px-2 py-1 transition ${
          locale === "es"
            ? "bg-orange-500 text-white"
            : "text-stone-500 hover:text-stone-800"
        }`}
      >
        ES
      </button>
    </div>
  );
}
