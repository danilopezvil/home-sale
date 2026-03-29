import Link from "next/link";
import { Package2, FileJson, ArrowLeft, Boxes, CheckCircle2, Clock3, Archive, Search } from "lucide-react";

import { CreateItemModal } from "@/app/admin/items/create-item-modal";
import { ItemsTable } from "@/app/admin/items/items-table";
import { requireAdminUser } from "@/lib/admin-auth";
import { supabaseServiceRoleClient } from "@/lib/supabase/server";
import { getTranslations } from "@/lib/i18n";

type SearchParams = {
  status?: string;
  search?: string;
  page?: string;
  success?: string;
  error?: string;
};

type ItemRow = {
  id: string;
  title: string;
  description: string | null;
  price: number | string;
  category: string | null;
  condition: string;
  pickup_area: string | null;
  status: "available" | "reserved" | "sold";
  created_at: string;
};

const statusOptions = ["all", "available", "reserved", "sold"] as const;
const ITEMS_PER_PAGE = 10;

function getStatusLabel(t: Record<string, string>, status: string): string {
  return t[status] ?? status;
}

export default async function AdminItemsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdminUser("/admin/items");
  const [params, t] = await Promise.all([searchParams, getTranslations()]);

  const selectedStatus = statusOptions.includes((params.status as (typeof statusOptions)[number]) ?? "all")
    ? ((params.status as (typeof statusOptions)[number]) ?? "all")
    : "all";
  const searchTerm = (params.search ?? "").trim();
  const currentPage = Math.max(1, Number(params.page ?? "1") || 1);
  const from = (currentPage - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  let itemsQuery = supabaseServiceRoleClient
    .from("items")
    .select("id, title, description, price, category, condition, pickup_area, status, created_at")
    .order("created_at", { ascending: false })
    .range(from, to);
  let countQuery = supabaseServiceRoleClient.from("items").select("id", { count: "exact", head: true });

  if (selectedStatus !== "all") {
    itemsQuery = itemsQuery.eq("status", selectedStatus);
    countQuery = countQuery.eq("status", selectedStatus);
  }

  if (searchTerm) {
    itemsQuery = itemsQuery.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    countQuery = countQuery.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
  }

  const [{ data: itemsData, error: itemsError }, { count: totalItemsCount, error: countError }] = await Promise.all([
    itemsQuery,
    countQuery,
  ]);

  const items = ((itemsData ?? []) as ItemRow[]).map((item) => ({
    ...item,
    description: item.description ?? "",
    category: item.category ?? "",
    pickup_area: item.pickup_area ?? "",
  }));
  const totalItems = totalItemsCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const previousPage = Math.max(1, currentPage - 1);
  const nextPage = Math.min(totalPages, currentPage + 1);
  const buildPageHref = (page: number) =>
    `/admin/items?status=${selectedStatus}&search=${encodeURIComponent(searchTerm)}&page=${page}`;
  const availableCount = items.filter((item) => item.status === "available").length;
  const reservedCount = items.filter((item) => item.status === "reserved").length;
  const soldCount = items.filter((item) => item.status === "sold").length;

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Admin / inventory</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">{t.adminItems.heading}</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-500">{t.adminItems.subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <CreateItemModal t={t.itemForm} categories={t.categories} />
            <Link href="/admin" className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              <ArrowLeft size={15} />
              Admin home
            </Link>
            <Link href="/admin/items/import" className="inline-flex h-11 items-center gap-2 rounded-lg bg-sky-600 px-4 text-sm font-semibold text-white shadow-sm shadow-sky-200 transition hover:bg-sky-700">
              <FileJson size={15} />
              {t.adminItems.importJson}
            </Link>
          </div>
        </div>
      </header>

      {params.success ? <p className="notice-success">{params.success}</p> : null}
      {params.error ? <p className="notice-danger">{params.error}</p> : null}
      {itemsError ? <p className="notice-danger">Failed to load items: {itemsError.message}</p> : null}
      {countError ? <p className="notice-danger">Failed to count items: {countError.message}</p> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Available</p>
              <p className="mt-1 text-3xl font-extrabold text-slate-900">{availableCount}</p>
            </div>
            <CheckCircle2 size={18} className="text-[hsl(var(--success))]" />
          </div>
          <p className="mt-2 text-sm text-slate-500">Currently open for reservation.</p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Reserved</p>
              <p className="mt-1 text-3xl font-extrabold text-slate-900">{reservedCount}</p>
            </div>
            <Clock3 size={18} className="text-[hsl(var(--warning))]" />
          </div>
          <p className="mt-2 text-sm text-slate-500">Need pickup follow-through.</p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Sold</p>
              <p className="mt-1 text-3xl font-extrabold text-slate-900">{soldCount}</p>
            </div>
            <Archive size={18} className="text-stone-500" />
          </div>
          <p className="mt-2 text-sm text-slate-500">Already closed out of stock.</p>
        </div>
      </div>

      <div className="space-y-5">
        <section className="space-y-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Current listings</p>
              <h2 className="mt-2 flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
                <Boxes size={18} className="text-slate-500" />
                Published inventory
              </h2>
              <p className="mt-2 text-sm text-slate-500">Filter by status, search quickly and jump into editing without leaving the table context.</p>
            </div>
            <div className="rounded-lg bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">{totalItems} matching items</div>
          </div>

          <form className="grid gap-3 xl:grid-cols-[190px_minmax(0,1fr)_auto]" action="/admin/items" method="get">
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t.adminItems.filter.status}</span>
              <select name="status" defaultValue={selectedStatus} className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 outline-none ring-sky-500 transition focus:ring-2">
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {getStatusLabel(t.adminItems.status as Record<string, string>, status)}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Search</span>
              <div className="relative">
                <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  name="search"
                  defaultValue={searchTerm}
                  placeholder={t.adminItems.filter.search}
                  className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-800 outline-none ring-sky-500 transition placeholder:text-slate-400 focus:ring-2"
                />
              </div>
            </label>
            <input type="hidden" name="page" value="1" />
            <div className="flex items-end gap-2">
              <button type="submit" className="h-11 w-full rounded-lg bg-sky-600 px-5 text-sm font-semibold text-white shadow-sm shadow-sky-200 transition hover:bg-sky-700 xl:w-auto">{t.adminItems.filter.apply}</button>
            </div>
          </form>

          {items.length === 0 ? (
            <div className="empty-state py-10">
              <Package2 size={28} className="text-stone-300" />
              <p className="mt-3 text-sm text-stone-500">{t.adminItems.empty}</p>
            </div>
          ) : (
            <ItemsTable
              items={items}
              t={t.adminItems}
              itemFormT={t.itemForm}
              categories={t.categories}
              conditionT={t.items.condition}
            />
          )}
          {totalItems > 0 ? (
            <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Link
                  href={buildPageHref(previousPage)}
                  aria-disabled={currentPage <= 1}
                  className={`inline-flex h-10 items-center rounded-lg border px-4 text-sm font-semibold transition ${
                    currentPage <= 1
                      ? "pointer-events-none border-slate-200 bg-slate-100 text-slate-400"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Previous
                </Link>
                <Link
                  href={buildPageHref(nextPage)}
                  aria-disabled={currentPage >= totalPages}
                  className={`inline-flex h-10 items-center rounded-lg border px-4 text-sm font-semibold transition ${
                    currentPage >= totalPages
                      ? "pointer-events-none border-slate-200 bg-slate-100 text-slate-400"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Next
                </Link>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </section>
  );
}
