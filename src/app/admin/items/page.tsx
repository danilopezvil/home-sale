import Link from "next/link";
import { Package, ChevronUp, ChevronDown, Pencil, FileJson } from "lucide-react";

import {
  moveItemImageAction,
  toggleItemStatusAction,
} from "@/app/admin/items/actions";
import { ItemForm, UploadImagesForm } from "@/app/admin/items/item-form";
import { requireAdminUser } from "@/lib/admin-auth";
import { supabaseServiceRoleClient } from "@/lib/supabase/server";
import { getCategoryMeta } from "@/lib/category-meta";
import { getTranslations, type Dictionary } from "@/lib/i18n";

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

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function statusBadgeClasses(status: ItemRow["status"]) {
  if (status === "available") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "reserved")  return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-stone-200 bg-stone-100 text-stone-600";
}

function getStatusLabel(t: Dictionary["adminItems"]["status"], status: string): string {
  return (t as Record<string, string>)[status] ?? status;
}

function getCatLabel(categories: Dictionary["categories"], key: string | null | undefined): string {
  if (!key) return categories.other;
  return (categories as Record<string, string>)[key] ?? key;
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

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Package size={22} className="text-orange-400" />
            <div>
              <h1 className="text-2xl font-bold text-stone-900">{t.adminItems.heading}</h1>
              <p className="text-sm text-stone-500">{t.adminItems.subtitle}</p>
            </div>
          </div>
          <Link
            href="/admin/items/import"
            className="flex items-center gap-2 rounded-xl border border-stone-200 px-4 py-2 text-sm font-medium text-stone-600 transition hover:border-orange-200 hover:text-orange-600"
          >
            <FileJson size={15} />
            {t.adminItems.importJson}
          </Link>
        </div>
      </header>

      {params.success ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{params.success}</p>
      ) : null}
      {params.error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">{params.error}</p>
      ) : null}
      {itemsError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          Failed to load items: {itemsError.message}
        </p>
      ) : null}
      {imagesError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          Failed to load images: {imagesError.message}
        </p>
      ) : null}

      <ItemForm
        mode="create"
        initialValues={{
          title: "",
          description: "",
          price: "",
          category: "",
          condition: "good",
          pickup_area: "",
        }}
        t={t.itemForm}
        categories={t.categories}
      />

      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <form className="flex flex-wrap items-end gap-3" action="/admin/items" method="get">
          <label className="text-sm font-medium text-stone-700">
            {t.adminItems.filter.status}
            <select name="status" defaultValue={selectedStatus} className="ml-2 rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300">
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {getStatusLabel(t.adminItems.status, status)}
                </option>
              ))}
            </select>
          </label>
          <input
            name="search"
            defaultValue={searchTerm}
            placeholder={t.adminItems.filter.search}
            className="rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
          <button type="submit" className="rounded-lg bg-stone-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-900">
            {t.adminItems.filter.apply}
          </button>
        </form>

        {items.length === 0 ? (
          <p className="mt-6 text-sm text-stone-500">{t.adminItems.empty}</p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-100 text-sm">
              <thead>
                <tr className="text-left text-xs font-medium uppercase tracking-wide text-stone-400">
                  <th className="px-3 py-3">{t.adminItems.table.item}</th>
                  <th className="px-3 py-3">{t.adminItems.table.price}</th>
                  <th className="px-3 py-3">{t.adminItems.table.category}</th>
                  <th className="px-3 py-3">{t.adminItems.table.condition}</th>
                  <th className="px-3 py-3">{t.adminItems.table.pickupArea}</th>
                  <th className="px-3 py-3">{t.adminItems.table.status}</th>
                  <th className="px-3 py-3">{t.adminItems.table.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {items.map((item) => {
                  const cat = getCategoryMeta(item.category);
                  const condLabel = (t.items.condition as Record<string, string>)[item.condition] ?? item.condition;
                  return (
                  <tr key={item.id} className="hover:bg-stone-50">
                    <td className="px-3 py-3 font-medium text-stone-900">{item.title}</td>
                    <td className="px-3 py-3 font-semibold text-stone-800">{currencyFormatter.format(Number(item.price))}</td>
                    <td className="px-3 py-3 text-stone-600">{cat.emoji} {getCatLabel(t.categories, item.category)}</td>
                    <td className="px-3 py-3 text-stone-600">{condLabel}</td>
                    <td className="px-3 py-3 text-stone-600">{item.pickup_area || "—"}</td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusBadgeClasses(item.status)}`}>
                        {getStatusLabel(t.adminItems.status, item.status)}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/admin/items?status=${selectedStatus}&search=${encodeURIComponent(searchTerm)}&edit=${item.id}`}
                          className="flex items-center gap-1 rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:border-orange-200 hover:text-orange-600"
                        >
                          <Pencil size={11} /> {t.adminItems.actions.edit}
                        </Link>
                        <form action={toggleItemStatusAction}>
                          <input type="hidden" name="itemId" value={item.id} />
                          <input type="hidden" name="currentStatus" value={item.status} />
                          <button type="submit" className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-100">
                            {item.status === "sold" ? t.adminItems.actions.makeAvailable : t.adminItems.actions.markSold}
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editItem ? (
        <section className="space-y-4">
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

          <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-stone-900">{t.adminItems.imageOrder}</h3>
              <Link href="/admin/items" className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 transition hover:bg-stone-50">
                {t.adminItems.actions.doneEditing}
              </Link>
            </div>

            {(imagesByItem.get(editItem.id) ?? []).length === 0 ? (
              <p className="mt-4 text-sm text-stone-500">{t.adminItems.noImages}</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {(imagesByItem.get(editItem.id) ?? []).map((image, index, array) => (
                  <li key={image.id} className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 bg-stone-50 p-3">
                    <span className="truncate text-xs text-stone-600">
                      <span className="mr-2 font-semibold text-stone-400">#{image.sort_order}</span>
                      {image.image_url}
                    </span>
                    <div className="flex gap-1.5">
                      <form action={moveItemImageAction}>
                        <input type="hidden" name="itemId" value={editItem.id} />
                        <input type="hidden" name="imageId" value={image.id} />
                        <input type="hidden" name="direction" value="up" />
                        <button type="submit" disabled={index === 0} className="rounded-lg border border-stone-200 p-1.5 text-stone-600 transition hover:bg-stone-200 disabled:opacity-30">
                          <ChevronUp size={13} />
                        </button>
                      </form>
                      <form action={moveItemImageAction}>
                        <input type="hidden" name="itemId" value={editItem.id} />
                        <input type="hidden" name="imageId" value={image.id} />
                        <input type="hidden" name="direction" value="down" />
                        <button type="submit" disabled={index === array.length - 1} className="rounded-lg border border-stone-200 p-1.5 text-stone-600 transition hover:bg-stone-200 disabled:opacity-30">
                          <ChevronDown size={13} />
                        </button>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </section>
      ) : null}
    </section>
  );
}
