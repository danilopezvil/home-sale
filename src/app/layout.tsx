import type { Metadata } from "next";

import { SiteHeader } from "@/components/site-header";
import { getLocale, getTranslations } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  title: "Home Sale 🏠",
  description: "Furniture, books, gadgets & more — all must go!",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [locale, t] = await Promise.all([getLocale(), getTranslations()]);

  return (
    <html lang={locale}>
      <body className="min-h-screen" style={{ backgroundColor: "#faf8f5" }}>
        <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-5 sm:py-5">
          <SiteHeader locale={locale} t={t} />
          <main className="flex-1">{children}</main>
          <footer className="mt-10 text-center text-xs text-stone-400">{t.footer}</footer>
        </div>
      </body>
    </html>
  );
}
