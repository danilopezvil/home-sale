import Link from "next/link";
import { Package, Settings } from "lucide-react";

import { LocaleSwitcher } from "@/components/locale-switcher";
import type { Dictionary, Locale } from "@/lib/i18n";

type SiteHeaderProps = {
  locale: Locale;
  t: Dictionary;
};

export function SiteHeader({ locale, t }: SiteHeaderProps) {
  return (
    <header className="mb-5 h-16 rounded-2xl border border-stone-200/90 bg-white/95 px-4 shadow-sm backdrop-blur sm:h-[68px] sm:px-5">
      <nav className="flex h-full items-center gap-1.5">
        <Link
          href="/"
          className="mr-2 flex items-center gap-2 rounded-lg px-2 py-1.5 font-semibold text-stone-900 transition hover:bg-stone-50 hover:text-orange-500"
        >
          <span className="text-base">🏠</span>
          <span className="text-sm sm:text-base">{t.nav.home}</span>
        </Link>

        <Link
          href="/items"
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-stone-600 transition hover:bg-orange-50 hover:text-orange-600 sm:text-sm"
        >
          <Package size={14} />
          {t.nav.items}
        </Link>

        <Link
          href="/admin"
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-stone-600 transition hover:bg-orange-50 hover:text-orange-600 sm:text-sm"
        >
          <Settings size={14} />
          {t.nav.admin}
        </Link>

        <div className="ml-auto">
          <LocaleSwitcher locale={locale} />
        </div>
      </nav>
    </header>
  );
}
