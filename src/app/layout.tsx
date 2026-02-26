import Link from "next/link";
import type { Metadata } from "next";
import { Package, Settings } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Home Sale 🏠",
  description: "Furniture, books, gadgets & more — all must go!",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen" style={{ backgroundColor: "#faf8f5" }}>
        <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-6">
          <header className="mb-8 rounded-2xl border border-stone-200 bg-white px-5 py-3 shadow-sm">
            <nav className="flex items-center gap-1">
              <Link
                href="/"
                className="mr-4 flex items-center gap-2 font-bold text-stone-900 transition hover:text-orange-500"
              >
                <span className="text-xl">🏠</span>
                <span className="text-base">Home Sale</span>
              </Link>

              <Link
                href="/items"
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-stone-600 transition hover:bg-orange-50 hover:text-orange-600"
              >
                <Package size={15} />
                Items
              </Link>

              <Link
                href="/admin"
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-stone-600 transition hover:bg-orange-50 hover:text-orange-600"
              >
                <Settings size={15} />
                Admin
              </Link>
            </nav>
          </header>

          <main className="flex-1">{children}</main>

          <footer className="mt-12 text-center text-xs text-stone-400">
            Everything must go. 📦
          </footer>
        </div>
      </body>
    </html>
  );
}
