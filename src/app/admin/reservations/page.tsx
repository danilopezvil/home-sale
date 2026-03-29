import {
  ArrowLeft,
  Ban,
  CalendarCheck2,
  CalendarDays,
  CheckCheck,
  CheckCircle2,
  CircleDashed,
  Clock,
  Mail,
  MessageSquare,
  Search,
  ShoppingBag,
  User,
} from "lucide-react";
import Link from "next/link";

import { requireAdminUser } from "@/lib/admin-auth";
import { getTranslations, type Dictionary } from "@/lib/i18n";
import { supabaseServiceRoleClient } from "@/lib/supabase/server";
import { cancelReservationAction, confirmReservationAction, markSoldAction } from "./actions";

type SearchParams = { status?: string; q?: string; error?: string };

type ReservationRow = {
  id: string;
  item_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  message: string | null;
  status: "pending" | "confirmed" | "cancelled";
  reserved_at: string | null;
  created_at: string;
  items: { title: string } | null;
};

const STATUS_OPTIONS = ["all", "pending", "confirmed", "cancelled"] as const;
type StatusOption = (typeof STATUS_OPTIONS)[number];

function StatusBadge({ status, t }: { status: string; t: Dictionary["adminReservations"]["status"] }) {
  if (status === "confirmed") {
    return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700">{t.confirmed}</span>;
  }
  if (status === "pending") {
    return <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-amber-700">{t.pending}</span>;
  }
  return <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-slate-600">{t.cancelled}</span>;
}

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleString("es-ES", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ConfirmButton({ reservationId, label }: { reservationId: string; label: string }) {
  return (
    <form action={confirmReservationAction}>
      <input type="hidden" name="reservationId" value={reservationId} />
      <button type="submit" className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-sky-600 px-4 text-sm font-semibold text-white shadow-sm shadow-sky-200 transition hover:bg-sky-700">
        <CheckCheck size={14} /> {label}
      </button>
    </form>
  );
}

function CancelButton({ reservationId, itemId, label }: { reservationId: string; itemId: string; label: string }) {
  return (
    <form action={cancelReservationAction}>
      <input type="hidden" name="reservationId" value={reservationId} />
      <input type="hidden" name="itemId" value={itemId} />
      <button type="submit" className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700">
        <Ban size={14} /> {label}
      </button>
    </form>
  );
}

function MarkSoldButton({ itemId, label }: { itemId: string; label: string }) {
  return (
    <form action={markSoldAction}>
      <input type="hidden" name="itemId" value={itemId} />
      <button type="submit" className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
        <ShoppingBag size={14} /> {label}
      </button>
    </form>
  );
}

function getStatusFilterLabel(t: Dictionary["adminReservations"]["status"], s: StatusOption): string {
  if (s === "all") return t.all;
  return (t as Record<string, string>)[s] ?? s;
}

export default async function AdminReservationsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdminUser("/admin/reservations");
  const [params, t] = await Promise.all([searchParams, getTranslations()]);

  const selectedStatus: StatusOption = (STATUS_OPTIONS as readonly string[]).includes(params.status ?? "")
    ? (params.status as StatusOption)
    : "all";
  const searchTerm = params.q?.trim() ?? "";

  let query = supabaseServiceRoleClient
    .from("reservations")
    .select("id, item_id, customer_name, customer_email, customer_phone, message, status, reserved_at, created_at, items(title)")
    .order("created_at", { ascending: false });

  if (selectedStatus !== "all") {
    query = query.eq("status", selectedStatus);
  }

  const { data, error } = await query;
  const allReservations = (data ?? []) as unknown as ReservationRow[];
  const reservations = searchTerm
    ? allReservations.filter((reservation) => {
        const haystack = `${reservation.customer_name} ${reservation.customer_email} ${reservation.items?.title ?? ""}`.toLowerCase();
        return haystack.includes(searchTerm.toLowerCase());
      })
    : allReservations;

  const pendingCount = allReservations.filter((reservation) => reservation.status === "pending").length;
  const confirmedCount = allReservations.filter((reservation) => reservation.status === "confirmed").length;
  const cancelledCount = allReservations.filter((reservation) => reservation.status === "cancelled").length;

  return (
    <section className="space-y-8">
      <header className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Admin / reservations</p>
            <h1 className="mt-2 flex items-center gap-3 text-3xl font-black tracking-tight text-slate-900">
              <CalendarCheck2 size={24} className="text-sky-600" />
              {t.adminReservations.heading}
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-500">{t.adminReservations.subtitle}</p>
          </div>
          <Link href="/admin" className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            <ArrowLeft size={14} />
            Admin home
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Pendientes</p>
              <Clock size={17} className="text-amber-500" />
            </div>
            <p className="mt-2 text-3xl font-black text-slate-900">{pendingCount}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Confirmadas</p>
              <CheckCircle2 size={17} className="text-emerald-500" />
            </div>
            <p className="mt-2 text-3xl font-black text-slate-900">{confirmedCount}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Canceladas</p>
              <CircleDashed size={17} className="text-slate-500" />
            </div>
            <p className="mt-2 text-3xl font-black text-slate-900">{cancelledCount}</p>
          </div>
        </div>
      </header>

      {params.error && <p className="notice-danger">{params.error}</p>}
      {error && <p className="notice-danger">{t.adminReservations.error} {error.message}</p>}

      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
        <form className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" action="/admin/reservations" method="get">
          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            {STATUS_OPTIONS.map((status) => {
              const isActive = selectedStatus === status;
              return (
                <button
                  key={status}
                  type="submit"
                  name="status"
                  value={status}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    isActive ? "bg-white text-sky-600 shadow-sm ring-1 ring-slate-200" : "bg-slate-100 text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {getStatusFilterLabel(t.adminReservations.status, status)}
                </button>
              );
            })}
          </div>

          <label className="relative w-full sm:w-80">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              name="q"
              defaultValue={searchTerm}
              placeholder="Buscar comprador o producto..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              type="text"
            />
            <input type="hidden" name="status" value={selectedStatus} />
          </label>
        </form>

        {reservations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center">
            <CalendarCheck2 size={30} className="mx-auto text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">{t.adminReservations.empty}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reservations.map((r) => (
              <article key={r.id} className="rounded-xl border border-slate-100 bg-white p-4 transition hover:shadow-md lg:p-5">
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_220px]">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="text-base font-bold text-slate-900">
                          {r.items?.title ?? <span className="italic text-slate-400">{t.adminReservations.labels.deletedItem}</span>}
                        </h2>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                          <span className="inline-flex items-center gap-1.5"><User size={13} /> {r.customer_name}</span>
                          <span className="inline-flex items-center gap-1.5"><Mail size={13} /> {r.customer_email}</span>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1.5"><CalendarDays size={12} /> {t.adminReservations.labels.submitted} {formatDate(r.created_at)}</span>
                          {r.reserved_at && <span className="inline-flex items-center gap-1.5"><Clock size={12} /> {t.adminReservations.labels.pickup} {formatDate(r.reserved_at)}</span>}
                        </div>
                      </div>
                      <StatusBadge status={r.status} t={t.adminReservations.status} />
                    </div>

                    {r.message && (
                      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                        <p className="flex items-center gap-1.5 font-semibold text-slate-800"><MessageSquare size={14} /> Buyer note</p>
                        <p className="mt-1 italic">&ldquo;{r.message}&rdquo;</p>
                      </div>
                    )}
                  </div>

                  {r.status !== "cancelled" && (
                    <div className="flex flex-col gap-2">
                      {r.status === "pending" && <ConfirmButton reservationId={r.id} label={t.adminReservations.actions.confirm} />}
                      {(r.status === "pending" || r.status === "confirmed") && <CancelButton reservationId={r.id} itemId={r.item_id} label={t.adminReservations.actions.cancel} />}
                      {r.status === "confirmed" && <MarkSoldButton itemId={r.item_id} label={t.adminReservations.actions.markSold} />}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
