import Link from "next/link";
import { Package, ChevronUp, ChevronDown, Pencil } from "lucide-react";

import {
  moveItemImageAction,
  toggleItemStatusAction,
} from "@/app/admin/items/actions";
import { ItemForm, UploadImagesForm } from "@/app/admin/items/item-form";
import { requireAdminUser } from "@/lib/admin-auth";
import { supabaseServiceRoleClient } from "@/lib/supabase/server";
import { getCategoryMeta } from "@/lib/category-meta";

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
  category: (typeof categoryValues)[number] | null;
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

function formatWords(value: string | null | undefined) {
  if (!value) {
    return "N/A";
  }

  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function statusBadgeClasses(status: ItemRow["status"]) {
  if (status === "available") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "reserved")  return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-stone-200 bg-stone-100 text-stone-600";
}

export default async function AdminItemsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdminUser("/admin/items");
  const params = await searchParams;

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
        <div className="flex items-center gap-3">
          <Package size={22} className="text-orange-400" />
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Items</h1>
            <p className="text-sm text-stone-500">Create, edit, and manage listings.</p>
          </div>
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
      />

      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <form className="flex flex-wrap items-end gap-3" action="/admin/items" method="get">
          <label className="text-sm font-medium text-stone-700">
            Status
            <select name="status" defaultValue={selectedStatus} className="ml-2 rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300">
              {statusOptions.map((status) => (
                <option key={status} value={status}>{formatWords(status)}</option>
              ))}
            </select>
          </label>
          <input
            name="search"
            defaultValue={searchTerm}
            placeholder="Search title, description, category…"
            className="rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
          <button type="submit" className="rounded-lg bg-stone-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-900">
            Apply
          </button>
        </form>

        {items.length === 0 ? (
          <p className="mt-6 text-sm text-stone-500">No items found for this filter.</p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-100 text-sm">
              <thead>
                <tr className="text-left text-xs font-medium uppercase tracking-wide text-stone-400">
                  <th className="px-3 py-3">Item</th>
                  <th className="px-3 py-3">Price</th>
                  <th className="px-3 py-3">Category</th>
                  <th className="px-3 py-3">Condition</th>
                  <th className="px-3 py-3">Pickup Area</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {items.map((item) => {
                  const cat = getCategoryMeta(item.category);
                  return (
                  <tr key={item.id} className="hover:bg-stone-50">
                    <td className="px-3 py-3 font-medium text-stone-900">{item.title}</td>
                    <td className="px-3 py-3 font-semibold text-stone-800">{currencyFormatter.format(Number(item.price))}</td>
                    <td className="px-3 py-3 text-stone-600">{cat.emoji} {cat.label}</td>
                    <td className="px-3 py-3 text-stone-600">{formatWords(item.condition)}</td>
                    <td className="px-3 py-3 text-stone-600">{item.pickup_area || "—"}</td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusBadgeClasses(item.status)}`}>
                        {formatWords(item.status)}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/admin/items?status=${selectedStatus}&search=${encodeURIComponent(searchTerm)}&edit=${item.id}`}
                          className="flex items-center gap-1 rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:border-orange-200 hover:text-orange-600"
                        >
                          <Pencil size={11} /> Edit
                        </Link>
                        <form action={toggleItemStatusAction}>
                          <input type="hidden" name="itemId" value={item.id} />
                          <input type="hidden" name="currentStatus" value={item.status} />
                          <button type="submit" className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-100">
                            {item.status === "sold" ? "↩ Available" : "Mark Sold"}
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
          />

          <UploadImagesForm itemId={editItem.id} />

          <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-stone-900">Image Order</h3>
              <Link href="/admin/items" className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 transition hover:bg-stone-50">
                ✓ Done editing
              </Link>
            </div>

            {(imagesByItem.get(editItem.id) ?? []).length === 0 ? (
              <p className="mt-4 text-sm text-stone-500">No images uploaded for this item yet.</p>
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
