import Link from "next/link";
import { Package2, CalendarCheck2, LogOut, LogIn, ArrowUpRight, ShieldCheck } from "lucide-react";

import { env } from "@/lib/env";
import { getSessionUser } from "@/lib/supabase/server";
import { getTranslations, type Dictionary } from "@/lib/i18n";
import { signOutAction } from "./actions";
import { LoginForm } from "./login-form";

type SearchParams = { error?: string; next?: string; email?: string };

function getAccessErrorMessage(params: SearchParams, t: Dictionary["admin"]["errors"]) {
  if (params.error === "not-signed-in") {
    return `${t.notSignedIn} ${params.next ?? "that page"}.`;
  }
  if (params.error === "not-allowed") {
    if (params.email) return `${params.email} ${t.notAllowed}`;
    return t.notAllowedGeneral;
  }
  return null;
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const [user, t, params] = await Promise.all([
    getSessionUser(),
    getTranslations(),
    searchParams,
  ]);
  const accessError = getAccessErrorMessage(params, t.admin.errors);

  const isAdmin = user?.email
    ? env.ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(user.email.toLowerCase())
    : false;

  return (
    <section className="space-y-5">
      <header className="surface section-pad">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">Admin console</p>
            <h1 className="section-title mt-2">{t.admin.heading}</h1>
            <p className="section-copy mt-2 max-w-2xl">{t.admin.subtitle}</p>
          </div>
          <div className="surface-muted flex items-center gap-3 px-4 py-3 text-sm text-stone-600">
            <ShieldCheck size={16} className="text-stone-500" />
            Inventory, reservations and publishing in one place.
          </div>
        </div>
      </header>

      {accessError && <p className="notice-warning">{accessError}</p>}

      {!user && (
        <div className="admin-grid">
          <section className="surface section-pad">
            <div className="flex items-start gap-3 border-b border-stone-200 pb-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-100 text-stone-700">
                <LogIn size={18} />
              </span>
              <div>
                <h2 className="text-lg font-semibold tracking-[-0.03em] text-stone-950">{t.admin.signIn.heading}</h2>
                <p className="mt-1 text-sm text-stone-500">{t.admin.signIn.subtitle}</p>
              </div>
            </div>
            <LoginForm t={t.loginForm} />
          </section>

          <aside className="surface section-pad">
            <p className="eyebrow">What this covers</p>
            <div className="mt-4 space-y-3 text-sm text-stone-600">
              <div className="surface-muted p-4">
                <p className="font-semibold text-stone-900">Listings</p>
                <p className="mt-1">Create, adjust and retire item listings without touching backend logic.</p>
              </div>
              <div className="surface-muted p-4">
                <p className="font-semibold text-stone-900">Reservations</p>
                <p className="mt-1">Confirm demand quickly and keep sold or reserved stock up to date.</p>
              </div>
              <div className="surface-muted p-4">
                <p className="font-semibold text-stone-900">Moving-sale workflow</p>
                <p className="mt-1">The admin UI stays compact and quick to scan so coordination stays easy.</p>
              </div>
            </div>
          </aside>
        </div>
      )}

      {user && !isAdmin && (
        <div className="surface section-pad space-y-4">
          <p className="text-sm text-stone-600">
            {t.admin.signedInAs} <span className="font-semibold text-stone-950">{user.email}</span> {t.admin.notAdmin}
          </p>
          <form action={signOutAction}>
            <button type="submit" className="btn-secondary">
              <LogOut size={15} />
              {t.admin.signOut}
            </button>
          </form>
        </div>
      )}

      {user && isAdmin && (
        <section className="space-y-5">
          <div className="surface section-pad">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm text-stone-500">
                  {t.admin.signedInAs} <span className="font-semibold text-stone-900">{user.email}</span>
                </p>
                <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-stone-950">Choose the next area to manage.</p>
              </div>
              <form action={signOutAction}>
                <button type="submit" className="btn-secondary">
                  <LogOut size={15} />
                  {t.admin.signOut}
                </button>
              </form>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Link href="/admin/items" className="surface section-pad group">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">Inventory</p>
                  <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-stone-950">{t.admin.menu.items.label}</p>
                  <p className="mt-2 text-sm text-stone-500">{t.admin.menu.items.subtitle}</p>
                </div>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-stone-200 bg-stone-50 text-stone-700">
                  <Package2 size={20} />
                </span>
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-stone-200 pt-4 text-sm font-medium text-stone-600 group-hover:text-stone-950">
                Open inventory admin
                <ArrowUpRight size={16} />
              </div>
            </Link>

            <Link href="/admin/reservations" className="surface section-pad group">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">Reservation queue</p>
                  <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-stone-950">{t.admin.menu.reservations.label}</p>
                  <p className="mt-2 text-sm text-stone-500">{t.admin.menu.reservations.subtitle}</p>
                </div>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-stone-200 bg-stone-50 text-stone-700">
                  <CalendarCheck2 size={20} />
                </span>
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-stone-200 pt-4 text-sm font-medium text-stone-600 group-hover:text-stone-950">
                Open reservation admin
                <ArrowUpRight size={16} />
              </div>
            </Link>
          </div>
        </section>
      )}
    </section>
  );
}
