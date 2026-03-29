import type { Metadata } from "next";

import { SiteHeader } from "@/components/site-header";
import { getLocale, getTranslations } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  title: "Garage Sale 🏠",
  description: "Furniture, books, gadgets & more — all must go!",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [locale, t] = await Promise.all([getLocale(), getTranslations()]);

  return (
    <html lang={locale}>
      <body className="min-h-screen">
        <div className="app-shell gap-4 sm:gap-5">
          <SiteHeader locale={locale} t={t} />
          <main className="page-stack">{children}</main>
          <footer className="surface section-pad mt-auto">
            <div className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-stone-900">{t.nav.home}</p>
                <p className="text-stone-500">{t.footer}</p>
              </div>
              <p className="text-xs uppercase tracking-[0.18em] text-stone-400">
                Inventory, pickup, admin
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
