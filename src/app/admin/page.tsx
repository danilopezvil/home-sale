import Link from "next/link";
import { Package2, CalendarCheck2, LogOut, LogIn, ArrowUpRight, ShieldCheck, Boxes, Clock3 } from "lucide-react";

import { env } from "@/lib/env";
import { getSessionUser, supabaseServiceRoleClient } from "@/lib/supabase/server";
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

  let dashboardStats = { items: 0, pendingReservations: 0, soldItems: 0 };

  if (isAdmin) {
    const [{ count: itemsCount }, { count: pendingReservations }, { count: soldItems }] = await Promise.all([
      supabaseServiceRoleClient.from("items").select("id", { count: "exact", head: true }),
      supabaseServiceRoleClient.from("reservations").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabaseServiceRoleClient.from("items").select("id", { count: "exact", head: true }).eq("status", "sold"),
    ]);

    dashboardStats = {
      items: itemsCount ?? 0,
      pendingReservations: pendingReservations ?? 0,
      soldItems: soldItems ?? 0,
    };
  }

  return (
    <section className="space-y-5">
      <header className="surface section-pad">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">Admin console</p>
            <h1 className="section-title mt-2">{t.admin.heading}</h1>
            <p className="section-copy mt-2 max-w-3xl">{t.admin.subtitle}</p>
          </div>
          <div className="admin-panel flex items-center gap-3 px-4 py-3 text-sm text-stone-600">
            <ShieldCheck size={16} className="text-stone-500" />
            Operational inventory, reservations and publishing in one place.
          </div>
        </div>
      </header>

      {accessError && <p className="notice-warning">{accessError}</p>}

      {!user && (
        <div className="admin-grid">
          <section className="admin-panel section-pad">
            <div className="flex items-start gap-3 border-b border-stone-200 pb-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[hsl(var(--surface-muted))] text-stone-700">
                <LogIn size={18} />
              </span>
              <div>
                <h2 className="text-lg font-semibold tracking-[-0.03em] text-stone-950">{t.admin.signIn.heading}</h2>
                <p className="mt-1 text-sm text-stone-500">{t.admin.signIn.subtitle}</p>
              </div>
            </div>
            <LoginForm t={t.loginForm} />
          </section>

          <aside className="admin-panel section-pad">
            <p className="eyebrow">What this covers</p>
            <div className="mt-4 space-y-3 text-sm text-stone-600">
              <div className="admin-metric">
                <p className="font-semibold text-stone-900">Listings</p>
                <p className="mt-1 text-sm text-stone-600">Create, adjust and retire item listings without touching backend logic.</p>
              </div>
              <div className="admin-metric">
                <p className="font-semibold text-stone-900">Reservations</p>
                <p className="mt-1 text-sm text-stone-600">Confirm demand quickly and keep sold or reserved stock up to date.</p>
              </div>
              <div className="admin-metric">
                <p className="font-semibold text-stone-900">Moving-sale workflow</p>
                <p className="mt-1 text-sm text-stone-600">Dense, readable screens built for daily operational use rather than dashboard theatre.</p>
              </div>
            </div>
          </aside>
        </div>
      )}

      {user && !isAdmin && (
        <div className="admin-panel section-pad space-y-4">
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
          <div className="admin-panel section-pad">
            <div className="flex flex-col gap-4 border-b border-stone-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm text-stone-500">
                  {t.admin.signedInAs} <span className="font-semibold text-stone-900">{user.email}</span>
                </p>
                <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-stone-950">Compact overview of the moving-sale operation.</p>
              </div>
              <form action={signOutAction}>
                <button type="submit" className="btn-secondary h-11">
                  <LogOut size={15} />
                  {t.admin.signOut}
                </button>
              </form>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="admin-metric">
                <p className="data-label">Published items</p>
                <p className="data-value">{dashboardStats.items}</p>
                <p className="text-sm text-stone-500">Visible inventory records.</p>
              </div>
              <div className="admin-metric">
                <p className="data-label">Pending reservations</p>
                <p className="data-value">{dashboardStats.pendingReservations}</p>
                <p className="text-sm text-stone-500">Requests still waiting on action.</p>
              </div>
              <div className="admin-metric">
                <p className="data-label">Sold items</p>
                <p className="data-value">{dashboardStats.soldItems}</p>
                <p className="text-sm text-stone-500">Items already closed out.</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <Link href="/admin/items" className="admin-panel section-pad group">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">Inventory</p>
                  <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-stone-950">{t.admin.menu.items.label}</p>
                  <p className="mt-2 text-sm text-stone-500">{t.admin.menu.items.subtitle}</p>
                </div>
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-stone-200 bg-[hsl(var(--surface-muted))] text-stone-700">
                  <Boxes size={18} />
                </span>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="admin-metric">
                  <p className="data-label">Use when</p>
                  <p className="text-sm font-medium text-stone-900">Publishing or updating stock</p>
                </div>
                <div className="admin-metric">
                  <p className="data-label">Primary actions</p>
                  <p className="text-sm font-medium text-stone-900">Create, edit, upload, mark sold</p>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-stone-200 pt-4 text-sm font-medium text-stone-600 group-hover:text-stone-950">
                Open inventory admin
                <ArrowUpRight size={16} />
              </div>
            </Link>

            <Link href="/admin/reservations" className="admin-panel section-pad group">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">Reservation queue</p>
                  <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-stone-950">{t.admin.menu.reservations.label}</p>
                  <p className="mt-2 text-sm text-stone-500">{t.admin.menu.reservations.subtitle}</p>
                </div>
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-stone-200 bg-[hsl(var(--surface-muted))] text-stone-700">
                  <CalendarCheck2 size={18} />
                </span>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="admin-metric">
                  <p className="data-label">Use when</p>
                  <p className="text-sm font-medium text-stone-900">Coordinating demand and pickup</p>
                </div>
                <div className="admin-metric">
                  <p className="data-label">Priority</p>
                  <p className="text-sm font-medium text-stone-900">Pending first, then confirmations</p>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-stone-200 pt-4 text-sm font-medium text-stone-600 group-hover:text-stone-950">
                Open reservation admin
                <ArrowUpRight size={16} />
              </div>
            </Link>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="admin-panel section-pad">
              <div className="flex items-center gap-3">
                <Package2 size={18} className="text-stone-500" />
                <div>
                  <p className="text-sm font-semibold text-stone-950">Inventory rule</p>
                  <p className="text-sm text-stone-500">Keep titles factual and statuses current so buyers can scan quickly.</p>
                </div>
              </div>
            </div>
            <div className="admin-panel section-pad">
              <div className="flex items-center gap-3">
                <Clock3 size={18} className="text-stone-500" />
                <div>
                  <p className="text-sm font-semibold text-stone-950">Response rule</p>
                  <p className="text-sm text-stone-500">Pending reservations should be reviewed before more items are published.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </section>
  );
}
