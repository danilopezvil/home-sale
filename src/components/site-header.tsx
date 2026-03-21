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
    <header className="surface sticky top-4 z-20 border-white/60 bg-[hsl(var(--surface))]/90 backdrop-blur">
      <nav className="flex flex-col gap-4 px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between lg:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-8">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-stone-200 bg-[hsl(var(--surface-muted))] text-lg">
              🏠
            </span>
            <div>
              <p className="eyebrow">Moving sale inventory</p>
              <Link href="/" className="inline-flex items-center gap-2 text-lg font-semibold tracking-[-0.03em] text-stone-950">
                {t.nav.home}
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-stone-200 bg-[hsl(var(--surface-muted))]/80 p-1">
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
            <p className="text-sm font-medium text-stone-900">Actual household stock</p>
            <p className="text-xs text-stone-500">Quick scan, clear status, direct pickup coordination.</p>
          </div>
          <LocaleSwitcher locale={locale} />
        </div>
      </nav>
    </header>
  );
}
