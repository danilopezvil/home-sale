import Link from "next/link";
import { Package2, ChevronUp, ChevronDown, FileJson, ArrowLeft, Boxes, CheckCircle2, Clock3, Archive, Search } from "lucide-react";

import { moveItemImageAction } from "@/app/admin/items/actions";
import { CreateItemModal } from "@/app/admin/items/create-item-modal";
import { ItemForm, UploadImagesForm } from "@/app/admin/items/item-form";
import { ItemsTable } from "@/app/admin/items/items-table";
import { requireAdminUser } from "@/lib/admin-auth";
import { supabaseServiceRoleClient } from "@/lib/supabase/server";
import { getTranslations } from "@/lib/i18n";

type SearchParams = {
  status?: string;
  search?: string;
  edit?: string;
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

type ItemImageRow = {
  id: string;
  item_id: string;
  image_url: string;
  sort_order: number;
};

const statusOptions = ["all", "available", "reserved", "sold"] as const;

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

  let itemsQuery = supabaseServiceRoleClient
    .from("items")
    .select("id, title, description, price, category, condition, pickup_area, status, created_at")
    .order("created_at", { ascending: false });

  if (selectedStatus !== "all") {
    itemsQuery = itemsQuery.eq("status", selectedStatus);
  }

  if (searchTerm) {
    itemsQuery = itemsQuery.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`);
  }

  const [{ data: itemsData, error: itemsError }, { data: imagesData, error: imagesError }] = await Promise.all([
    itemsQuery,
    supabaseServiceRoleClient
      .from("item_images")
      .select("id, item_id, image_url, sort_order")
      .order("sort_order", { ascending: true }),
  ]);

  const items = ((itemsData ?? []) as ItemRow[]).map((item) => ({
    ...item,
    category: item.category ?? "",
    pickup_area: item.pickup_area ?? "",
  }));
  const imagesByItem = new Map<string, ItemImageRow[]>();

  for (const image of (imagesData ?? []) as ItemImageRow[]) {
    const current = imagesByItem.get(image.item_id) ?? [];
    current.push(image);
    imagesByItem.set(image.item_id, current);
  }

  const editId = params.edit;
  const editItem = editId ? items.find((item) => item.id === editId) : null;
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
      {imagesError ? <p className="notice-danger">Failed to load images: {imagesError.message}</p> : null}

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

      <div className={editItem ? "admin-grid xl:items-start" : "space-y-5"}>
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
            <div className="rounded-lg bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">{items.length} matching items</div>
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
              selectedStatus={selectedStatus}
              searchTerm={searchTerm}
              t={t.adminItems}
              categories={t.categories}
              conditionT={t.items.condition}
            />
          )}
        </section>

        {editItem ? (
          <aside className="space-y-5 xl:sticky xl:top-28">
            <section className="space-y-5">
              <ItemForm
                mode="edit"
                initialValues={{
                  id: editItem.id,
                  title: editItem.title,
                  description: editItem.description ?? "",
                  price: String(editItem.price),
                  category: editItem.category ?? "",
                  condition: editItem.condition,
                  pickup_area: editItem.pickup_area ?? "",
                } as Parameters<typeof ItemForm>[0]["initialValues"]}
                t={t.itemForm}
                categories={t.categories}
              />

              <UploadImagesForm itemId={editItem.id} t={t.uploadForm} />

              <section className="admin-panel section-pad">
                <div className="flex flex-col gap-3 border-b border-stone-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="eyebrow">Image sequence</p>
                    <h3 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-stone-950">{t.adminItems.imageOrder}</h3>
                  </div>
                  <Link href="/admin/items" className="btn-secondary h-11">
                    {t.adminItems.actions.doneEditing}
                  </Link>
                </div>

                {(imagesByItem.get(editItem.id) ?? []).length === 0 ? (
                  <div className="empty-state mt-5 py-10">
                    <p className="text-sm text-stone-500">{t.adminItems.noImages}</p>
                  </div>
                ) : (
                  <ul className="mt-5 space-y-2">
                    {(imagesByItem.get(editItem.id) ?? []).map((image, index, array) => (
                      <li key={image.id} className="rounded-2xl border border-stone-200 bg-[hsl(var(--surface-muted))] px-4 py-3">
                        <div className="flex items-start justify-between gap-3">
                          <span className="min-w-0 truncate text-xs text-stone-600">
                            <span className="mr-2 font-semibold text-stone-400">#{image.sort_order}</span>
                            {image.image_url}
                          </span>
                          <div className="flex gap-2">
                            <form action={moveItemImageAction}>
                              <input type="hidden" name="itemId" value={editItem.id} />
                              <input type="hidden" name="imageId" value={image.id} />
                              <input type="hidden" name="direction" value="up" />
                              <button type="submit" disabled={index === 0} title="Move up" className="btn-secondary h-9 px-3 disabled:opacity-30">
                                <ChevronUp size={14} />
                              </button>
                            </form>
                            <form action={moveItemImageAction}>
                              <input type="hidden" name="itemId" value={editItem.id} />
                              <input type="hidden" name="imageId" value={image.id} />
                              <input type="hidden" name="direction" value="down" />
                              <button type="submit" disabled={index === array.length - 1} title="Move down" className="btn-secondary h-9 px-3 disabled:opacity-30">
                                <ChevronDown size={14} />
                              </button>
                            </form>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </section>
          </aside>
        ) : null}
      </div>
    </section>
  );
}
