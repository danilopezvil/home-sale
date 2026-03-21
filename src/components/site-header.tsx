import Link from "next/link";
import { Package2, Settings, ArrowUpRight } from "lucide-react";

import { LocaleSwitcher } from "@/components/locale-switcher";
import type { Dictionary, Locale } from "@/lib/i18n";

type SiteHeaderProps = {
  locale: Locale;
  t: Dictionary;
};

const navItems = [
  { href: "/", key: "home", icon: ArrowUpRight },
  { href: "/items", key: "items", icon: Package2 },
  { href: "/admin", key: "admin", icon: Settings },
] as const;

export function SiteHeader({ locale, t }: SiteHeaderProps) {
  return (
    <header className="surface section-pad sticky top-4 z-20 border-white/70 bg-white/90 backdrop-blur">
      <nav className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:justify-start lg:gap-6">
          <div>
            <p className="eyebrow">Moving sale</p>
            <Link href="/" className="mt-1 inline-flex items-center gap-2 text-lg font-semibold tracking-[-0.03em] text-stone-950">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 bg-stone-50 text-base">
                🏠
              </span>
              {t.nav.home}
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-stone-200 bg-stone-50/80 p-1">
            {navItems.map(({ href, key, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-stone-600 transition hover:bg-white hover:text-stone-950"
              >
                <Icon size={15} />
                {t.nav[key]}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 lg:justify-end">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-stone-900">Fast scan inventory</p>
            <p className="text-xs text-stone-500">Clear status, quick pickup, simple admin.</p>
          </div>
          <LocaleSwitcher locale={locale} />
        </div>
      </nav>
    </header>
  );
}
