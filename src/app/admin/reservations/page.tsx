import { CalendarCheck2, CheckCheck, Ban, ShoppingBag, Clock, CheckCircle2, XCircle, CalendarDays, User, Mail, Phone, MessageSquare, ArrowLeft, Inbox, CircleDashed } from "lucide-react";
import Link from "next/link";

import { requireAdminUser } from "@/lib/admin-auth";
import { supabaseServiceRoleClient } from "@/lib/supabase/server";
import { getTranslations, type Dictionary } from "@/lib/i18n";
import {
  cancelReservationAction,
  confirmReservationAction,
  markSoldAction,
} from "./actions";

type SearchParams = { status?: string; error?: string };

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
    return (
      <span className="badge badge-success">
        <CheckCircle2 size={11} />
        {t.confirmed}
      </span>
    );
  }
  if (status === "pending") {
    return (
      <span className="badge badge-warning">
        <Clock size={11} />
        {t.pending}
      </span>
    );
  }
  return (
    <span className="badge badge-neutral">
      <XCircle size={11} />
      {t.cancelled}
    </span>
  );
}

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

function ConfirmButton({ reservationId, label }: { reservationId: string; label: string }) {
  return (
    <form action={confirmReservationAction}>
      <input type="hidden" name="reservationId" value={reservationId} />
      <button type="submit" className="btn-primary h-9 px-3 text-xs">
        <CheckCheck size={13} /> {label}
      </button>
    </form>
  );
}

function CancelButton({ reservationId, itemId, label }: { reservationId: string; itemId: string; label: string }) {
  return (
    <form action={cancelReservationAction}>
      <input type="hidden" name="reservationId" value={reservationId} />
      <input type="hidden" name="itemId" value={itemId} />
      <button type="submit" className="btn-secondary h-9 px-3 text-xs text-red-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700">
        <Ban size={13} /> {label}
      </button>
    </form>
  );
}

function MarkSoldButton({ itemId, label }: { itemId: string; label: string }) {
  return (
    <form action={markSoldAction}>
      <input type="hidden" name="itemId" value={itemId} />
      <button type="submit" className="btn-secondary h-9 px-3 text-xs">
        <ShoppingBag size={13} /> {label}
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

  const selectedStatus: StatusOption = (STATUS_OPTIONS as readonly string[]).includes(
    params.status ?? "",
  )
    ? (params.status as StatusOption)
    : "all";

  let query = supabaseServiceRoleClient
    .from("reservations")
    .select(
      "id, item_id, customer_name, customer_email, customer_phone, message, status, reserved_at, created_at, items(title)",
    )
    .order("created_at", { ascending: false });

  if (selectedStatus !== "all") {
    query = query.eq("status", selectedStatus);
  }

  const { data, error } = await query;
  const reservations = (data ?? []) as unknown as ReservationRow[];
  const pendingCount = reservations.filter((reservation) => reservation.status === "pending").length;
  const confirmedCount = reservations.filter((reservation) => reservation.status === "confirmed").length;
  const cancelledCount = reservations.filter((reservation) => reservation.status === "cancelled").length;

  return (
    <section className="space-y-5">
      <header className="surface section-pad">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">Admin / reservations</p>
            <h1 className="section-title mt-2 flex items-center gap-3">
              <CalendarCheck2 size={24} className="text-stone-500" />
              {t.adminReservations.heading}
            </h1>
            <p className="section-copy mt-2 max-w-3xl">{t.adminReservations.subtitle}</p>
          </div>
          <Link href="/admin" className="btn-secondary h-11">
            <ArrowLeft size={15} />
            Admin home
          </Link>
        </div>
      </header>

      {params.error && <p className="notice-danger">{params.error}</p>}
      {error && <p className="notice-danger">{t.adminReservations.error} {error.message}</p>}

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="admin-metric">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="data-label">Pending</p>
              <p className="data-value">{pendingCount}</p>
            </div>
            <Inbox size={18} className="text-[hsl(var(--warning))]" />
          </div>
          <p className="mt-1 text-sm text-stone-500">Needs a decision from admin.</p>
        </div>
        <div className="admin-metric">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="data-label">Confirmed</p>
              <p className="data-value">{confirmedCount}</p>
            </div>
            <CheckCircle2 size={18} className="text-[hsl(var(--success))]" />
          </div>
          <p className="mt-1 text-sm text-stone-500">Waiting on successful pickup.</p>
        </div>
        <div className="admin-metric">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="data-label">Cancelled</p>
              <p className="data-value">{cancelledCount}</p>
            </div>
            <CircleDashed size={18} className="text-stone-500" />
          </div>
          <p className="mt-1 text-sm text-stone-500">Closed requests kept for traceability.</p>
        </div>
      </div>

      <section className="admin-panel section-pad">
        <div className="flex flex-col gap-4 border-b border-stone-200 pb-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">Reservation queue</p>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-stone-950">Incoming requests</h2>
            <p className="mt-2 text-sm text-stone-500">Keep pending, confirmed and cancelled reservations readable without opening each record.</p>
          </div>
          <div className="admin-panel px-4 py-3 text-sm text-stone-600">{reservations.length} matching reservations</div>
        </div>

        <form className="mt-4 grid gap-3 sm:grid-cols-[220px_auto]" action="/admin/reservations" method="get">
          <label className="field-shell">
            <span className="field-label">{t.adminReservations.filter.label}</span>
            <select name="status" defaultValue={selectedStatus} className="select-base h-11">
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {getStatusFilterLabel(t.adminReservations.status, s)}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <button type="submit" className="btn-primary h-11 w-full sm:w-auto">{t.adminReservations.filter.apply}</button>
          </div>
        </form>

        {reservations.length === 0 ? (
          <div className="empty-state mt-6 py-10">
            <CalendarCheck2 size={30} className="text-stone-300" />
            <p className="mt-3 text-sm text-stone-500">{t.adminReservations.empty}</p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {reservations.map((r) => (
              <div key={r.id} className="rounded-[18px] border border-stone-200 bg-[hsl(var(--surface-muted))] p-4 sm:p-5">
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-2">
                        <p className="text-lg font-semibold tracking-[-0.03em] text-stone-950">
                          {r.items?.title ?? (
                            <span className="italic text-stone-400">{t.adminReservations.labels.deletedItem}</span>
                          )}
                        </p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-600">
                          <span className="flex items-center gap-1.5"><User size={13} /> {r.customer_name}</span>
                          <span className="flex items-center gap-1.5"><Mail size={13} /> {r.customer_email}</span>
                          {r.customer_phone && <span className="flex items-center gap-1.5"><Phone size={13} /> {r.customer_phone}</span>}
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-500">
                          <span className="flex items-center gap-1.5"><CalendarDays size={12} /> {t.adminReservations.labels.submitted} {formatDate(r.created_at)}</span>
                          {r.reserved_at && <span className="flex items-center gap-1.5"><Clock size={12} /> {t.adminReservations.labels.pickup} {formatDate(r.reserved_at)}</span>}
                        </div>
                      </div>

                      <StatusBadge status={r.status} t={t.adminReservations.status} />
                    </div>

                    {r.message && (
                      <div className="rounded-2xl border border-stone-200 bg-white/90 px-4 py-3 text-sm text-stone-600">
                        <p className="flex items-center gap-2 font-medium text-stone-900"><MessageSquare size={14} /> Buyer note</p>
                        <p className="mt-2 italic">&ldquo;{r.message}&rdquo;</p>
                      </div>
                    )}
                  </div>

                  {r.status !== "cancelled" && (
                    <div className="flex min-w-[210px] flex-col gap-2">
                      {r.status === "pending" && <ConfirmButton reservationId={r.id} label={t.adminReservations.actions.confirm} />}
                      {(r.status === "pending" || r.status === "confirmed") && (
                        <CancelButton reservationId={r.id} itemId={r.item_id} label={t.adminReservations.actions.cancel} />
                      )}
                      {r.status === "confirmed" && <MarkSoldButton itemId={r.item_id} label={t.adminReservations.actions.markSold} />}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
