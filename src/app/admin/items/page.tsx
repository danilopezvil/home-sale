import Link from "next/link";
import { Package2, ChevronUp, ChevronDown, FileJson, ArrowLeft } from "lucide-react";

import { moveItemImageAction } from "@/app/admin/items/actions";
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

  return (
    <section className="space-y-5">
      <header className="surface section-pad">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">Admin / inventory</p>
            <h1 className="section-title mt-2">{t.adminItems.heading}</h1>
            <p className="section-copy mt-2 max-w-2xl">{t.adminItems.subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin" className="btn-secondary">
              <ArrowLeft size={15} />
              Admin home
            </Link>
            <Link href="/admin/items/import" className="btn-primary">
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

      <div className="admin-grid">
        <div className="space-y-5">
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

          {editItem ? (
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

              <section className="surface section-pad">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="eyebrow">Image sequence</p>
                    <h3 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-stone-950">{t.adminItems.imageOrder}</h3>
                  </div>
                  <Link href="/admin/items" className="btn-secondary">
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
                      <li key={image.id} className="surface-muted flex items-center justify-between gap-3 px-4 py-3">
                        <span className="truncate text-xs text-stone-600">
                          <span className="mr-2 font-semibold text-stone-400">#{image.sort_order}</span>
                          {image.image_url}
                        </span>
                        <div className="flex gap-2">
                          <form action={moveItemImageAction}>
                            <input type="hidden" name="itemId" value={editItem.id} />
                            <input type="hidden" name="imageId" value={image.id} />
                            <input type="hidden" name="direction" value="up" />
                            <button type="submit" disabled={index === 0} title="Move up" className="btn-secondary px-3 py-2 disabled:opacity-30">
                              <ChevronUp size={14} />
                            </button>
                          </form>
                          <form action={moveItemImageAction}>
                            <input type="hidden" name="itemId" value={editItem.id} />
                            <input type="hidden" name="imageId" value={image.id} />
                            <input type="hidden" name="direction" value="down" />
                            <button type="submit" disabled={index === array.length - 1} title="Move down" className="btn-secondary px-3 py-2 disabled:opacity-30">
                              <ChevronDown size={14} />
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
        </div>

        <section className="surface section-pad">
          <div className="flex flex-col gap-4 border-b border-stone-200 pb-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow">Current listings</p>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-stone-950">Published inventory</h2>
              <p className="mt-2 text-sm text-stone-500">Filter by status, search quickly and jump into editing.</p>
            </div>
            <div className="surface-muted px-4 py-3 text-sm text-stone-600">{items.length} matching items</div>
          </div>

          <form className="mt-4 grid gap-3 md:grid-cols-[200px_minmax(0,1fr)_auto]" action="/admin/items" method="get">
            <label className="field-shell">
              <span className="field-label">{t.adminItems.filter.status}</span>
              <select name="status" defaultValue={selectedStatus} className="select-base">
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {getStatusLabel(t.adminItems.status as Record<string, string>, status)}
                  </option>
                ))}
              </select>
            </label>
            <label className="field-shell">
              <span className="field-label">Search</span>
              <input
                name="search"
                defaultValue={searchTerm}
                placeholder={t.adminItems.filter.search}
                className="input-base"
              />
            </label>
            <div className="flex items-end">
              <button type="submit" className="btn-primary w-full md:w-auto">{t.adminItems.filter.apply}</button>
            </div>
          </form>

          {items.length === 0 ? (
            <div className="empty-state mt-5 py-10">
              <Package2 size={28} className="text-stone-300" />
              <p className="mt-3 text-sm text-stone-500">{t.adminItems.empty}</p>
            </div>
          ) : (
            <div className="mt-5">
              <ItemsTable
                items={items}
                selectedStatus={selectedStatus}
                searchTerm={searchTerm}
                t={t.adminItems}
                categories={t.categories}
                conditionT={t.items.condition}
              />
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
