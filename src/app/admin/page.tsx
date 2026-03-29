import Link from "next/link";
import {
  Package2,
  CalendarCheck2,
  LogOut,
  LogIn,
  ShieldCheck,
  Boxes,
  Clock3,
  Settings,
  Search,
  Bell,
  CircleHelp,
  ArrowRight,
  Gavel,
  PlusSquare,
  Upload,
  FileBarChart,
} from "lucide-react";

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
        <div className="space-y-6">
          <header className="rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-sky-50/30 p-6 shadow-sm">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-sky-700">Overview dashboard</p>
                <h1 className="text-4xl font-black tracking-tight text-slate-900">Admin Console</h1>
                <p className="max-w-2xl text-sm text-slate-500">
                  Welcome back. Supervisa inventario, reservas y publicaciones desde un solo lugar.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-[260px] flex-1">
                  <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    disabled
                    placeholder="Search inventory or orders..."
                    className="h-11 w-full rounded-full border border-slate-200 bg-white pl-9 pr-4 text-sm text-slate-500"
                  />
                </div>
                <button className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500">
                  <Bell size={15} />
                </button>
                <button className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500">
                  <CircleHelp size={15} />
                </button>
                <form action={signOutAction}>
                  <button type="submit" className="btn-secondary h-10">
                    <LogOut size={14} />
                    {t.admin.signOut}
                  </button>
                </form>
              </div>
            </div>
          </header>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="inline-flex rounded-lg bg-sky-50 p-2.5 text-sky-600"><Package2 size={18} /></span>
                <span className="badge badge-success">Live</span>
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Published Items</p>
              <p className="mt-1 text-3xl font-black text-slate-900">{dashboardStats.items}</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="inline-flex rounded-lg bg-amber-50 p-2.5 text-amber-600"><Clock3 size={18} /></span>
                <span className="badge badge-warning">Action</span>
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Pending Reservations</p>
              <p className="mt-1 text-3xl font-black text-slate-900">{dashboardStats.pendingReservations}</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="inline-flex rounded-lg bg-indigo-50 p-2.5 text-indigo-600"><ShieldCheck size={18} /></span>
                <span className="badge">Complete</span>
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Sold Items</p>
              <p className="mt-1 text-3xl font-black text-slate-900">{dashboardStats.soldItems}</p>
            </div>
          </div>

          <section className="grid gap-5 lg:grid-cols-2">
            <Link href="/admin/items" className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-sky-50 transition group-hover:scale-110" />
              <div className="relative z-10">
                <span className="inline-flex rounded-xl bg-sky-100 p-3 text-sky-700"><Boxes size={20} /></span>
                <h3 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">Inventory Management</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">Crea, edita y publica artículos con fotos y datos clave de entrega.</p>
                <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-sky-700">
                  Manage Inventory <ArrowRight size={14} />
                </div>
              </div>
            </Link>

            <Link href="/admin/reservations" className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-indigo-50 transition group-hover:scale-110" />
              <div className="relative z-10">
                <span className="inline-flex rounded-xl bg-indigo-100 p-3 text-indigo-700"><CalendarCheck2 size={20} /></span>
                <h3 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">Reservations</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">Confirma o cancela solicitudes y coordina el retiro con compradores.</p>
                <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-indigo-700">
                  Manage Reservations <ArrowRight size={14} />
                </div>
              </div>
            </Link>
          </section>

          <footer className="rounded-2xl border-l-4 border-sky-400 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sky-700"><Gavel size={16} /></span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Listing Standards & Rules</p>
                  <p className="text-sm text-slate-600">Mantén títulos factuales y evita texto promocional para mejorar confianza.</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 font-semibold text-emerald-700">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                  All Systems Operational
                </span>
                <Link href="/admin" className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-50">
                  <Settings size={14} /> System Logs
                </Link>
              </div>
            </div>
          </footer>

          <div className="sticky bottom-4 z-20 mx-auto flex w-fit flex-wrap items-center gap-2 rounded-full border border-slate-200 bg-white/95 p-2 shadow-md backdrop-blur">
            <Link href="/admin/items" className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-sky-50 hover:text-sky-700">
              <PlusSquare size={14} /> New Listing
            </Link>
            <Link href="/admin/items/import" className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-sky-50 hover:text-sky-700">
              <Upload size={14} /> Bulk Import
            </Link>
            <Link href="/admin/reservations" className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-sky-50 hover:text-sky-700">
              <FileBarChart size={14} /> Reservations Report
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
