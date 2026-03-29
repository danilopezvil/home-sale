import Link from "next/link";
import { LayoutGrid, Package2 } from "lucide-react";

import { CartLink } from "@/components/cart/cart-link";

import { LocaleSwitcher } from "@/components/locale-switcher";
import type { Dictionary, Locale } from "@/lib/i18n";

type SiteHeaderProps = {
  locale: Locale;
  t: Dictionary;
};

const navItems = [
  { href: "/", key: "home", icon: LayoutGrid },
  { href: "/items", key: "items", icon: Package2 },
] as const;

export function SiteHeader({ locale, t }: SiteHeaderProps) {
  return (
    <header className="surface sticky top-4 z-20 bg-white/95 backdrop-blur">
      <nav className="grid gap-4 px-4 py-3 lg:grid-cols-[220px_minmax(0,1fr)_220px] lg:items-center lg:px-6">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-lg text-sky-600">
            🏠
          </span>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Pristine Workspace</p>
            <p className="text-sm font-bold text-slate-900">{t.nav.home}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
          {navItems.map(({ href, key, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-900"
            >
              <Icon size={15} />
              {t.nav[key]}
            </Link>
          ))}
          <CartLink label={t.nav.cart} />
        </div>

        <div className="flex items-center justify-end gap-2">
          <Link href="/admin" className="btn-secondary hidden h-10 sm:inline-flex">Sign In</Link>
          <LocaleSwitcher locale={locale} />
        </div>
      </nav>
    </header>
  );
}
