import { CalendarCheck2, CheckCheck, Ban, ShoppingBag, Clock, CheckCircle2, XCircle, CalendarDays, User, Mail, Phone, MessageSquare } from "lucide-react";

import { requireAdminUser } from "@/lib/admin-auth";
import { supabaseServiceRoleClient } from "@/lib/supabase/server";
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

function StatusBadge({ status }: { status: string }) {
  if (status === "confirmed") {
    return (
      <span className="flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
        <CheckCircle2 size={11} />
        Confirmed
      </span>
    );
  }
  if (status === "pending") {
    return (
      <span className="flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
        <Clock size={11} />
        Pending
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 rounded-full border border-stone-200 bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-500">
      <XCircle size={11} />
      Cancelled
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

function ConfirmButton({ reservationId }: { reservationId: string }) {
  return (
    <form action={confirmReservationAction}>
      <input type="hidden" name="reservationId" value={reservationId} />
      <button type="submit" className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-600">
        <CheckCheck size={13} /> Confirm
      </button>
    </form>
  );
}

function CancelButton({ reservationId, itemId }: { reservationId: string; itemId: string }) {
  return (
    <form action={cancelReservationAction}>
      <input type="hidden" name="reservationId" value={reservationId} />
      <input type="hidden" name="itemId" value={itemId} />
      <button type="submit" className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-50">
        <Ban size={13} /> Cancel
      </button>
    </form>
  );
}

function MarkSoldButton({ itemId }: { itemId: string }) {
  return (
    <form action={markSoldAction}>
      <input type="hidden" name="itemId" value={itemId} />
      <button type="submit" className="flex items-center gap-1.5 rounded-lg bg-stone-800 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-stone-900">
        <ShoppingBag size={13} /> Mark sold
      </button>
    </form>
  );
}

export default async function AdminReservationsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdminUser("/admin/reservations");
  const params = await searchParams;

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
  const reservations = (data ?? []) as ReservationRow[];

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <CalendarCheck2 size={22} className="text-orange-400" />
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Reservations</h1>
            <p className="text-sm text-stone-500">Confirm, cancel, or mark items sold.</p>
          </div>
        </div>
      </header>

      {params.error && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {params.error}
        </p>
      )}
      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          Failed to load reservations: {error.message}
        </p>
      )}

      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        {/* Filter */}
        <form className="flex flex-wrap items-end gap-3" action="/admin/reservations" method="get">
          <label className="text-sm font-medium text-stone-700">
            Filter
            <select
              name="status"
              defaultValue={selectedStatus}
              className="ml-2 rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s === "all" ? "All statuses" : s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="rounded-lg bg-stone-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-900"
          >
            Apply
          </button>
        </form>

        {reservations.length === 0 ? (
          <div className="mt-8 flex flex-col items-center justify-center py-8 text-center">
            <CalendarCheck2 size={32} className="text-stone-200" />
            <p className="mt-3 text-sm text-stone-500">No reservations found.</p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {reservations.map((r) => (
              <div
                key={r.id}
                className="rounded-xl border border-stone-200 bg-stone-50 p-4 transition hover:border-stone-300"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  {/* Item + buyer */}
                  <div className="space-y-1">
                    <p className="font-semibold text-stone-900">
                      {r.items?.title ?? (
                        <span className="italic text-stone-400">Deleted item</span>
                      )}
                    </p>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-stone-500">
                      <span className="flex items-center gap-1">
                        <User size={11} /> {r.customer_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail size={11} /> {r.customer_email}
                      </span>
                      {r.customer_phone && (
                        <span className="flex items-center gap-1">
                          <Phone size={11} /> {r.customer_phone}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-stone-400">
                      <span className="flex items-center gap-1">
                        <CalendarDays size={11} /> Submitted {formatDate(r.created_at)}
                      </span>
                      {r.reserved_at && (
                        <span className="flex items-center gap-1">
                          <Clock size={11} /> Pickup {formatDate(r.reserved_at)}
                        </span>
                      )}
                    </div>
                  </div>

                  <StatusBadge status={r.status} />
                </div>

                {r.message && (
                  <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-white px-3 py-2 text-xs italic text-stone-500">
                    <MessageSquare size={11} className="mt-0.5 shrink-0" />
                    &ldquo;{r.message}&rdquo;
                  </p>
                )}

                {r.status !== "cancelled" && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {r.status === "pending" && <ConfirmButton reservationId={r.id} />}
                    {(r.status === "pending" || r.status === "confirmed") && (
                      <CancelButton reservationId={r.id} itemId={r.item_id} />
                    )}
                    {r.status === "confirmed" && <MarkSoldButton itemId={r.item_id} />}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
