import Link from "next/link";
import { ArrowRight, PackageOpen } from "lucide-react";

import { supabaseServerAnonClient } from "@/lib/supabase/server";
import { getCategoryMeta, categoryValues } from "@/lib/category-meta";
import { getTranslations, type Dictionary } from "@/lib/i18n";

type ItemListRow = {
  id: string;
  title: string;
  price: number | string;
  category: string | null;
  condition: string;
  created_at: string;
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const CONDITION_COLOR: Record<string, string> = {
  new:      "bg-emerald-100 text-emerald-700",
  like_new: "bg-teal-100 text-teal-700",
  good:     "bg-sky-100 text-sky-700",
  fair:     "bg-amber-100 text-amber-700",
  parts:    "bg-stone-100 text-stone-600",
};

const SORT_OPTIONS = ["newest", "price_asc", "price_desc"] as const;
type SortOption = (typeof SORT_OPTIONS)[number];

const NEW_ITEM_MS = 72 * 60 * 60 * 1000;

function getCatLabel(categories: Dictionary["categories"], key: string | null | undefined): string {
  if (!key) return categories.other;
  return (categories as Record<string, string>)[key] ?? key;
}

function buildUrl(category: string, sort: SortOption): string {
  const p = new URLSearchParams();
  if (category) p.set("category", category);
  if (sort !== "newest") p.set("sort", sort);
  const qs = p.toString();
  return qs ? `/items?${qs}` : "/items";
}

function pillClass(active: boolean): string {
  return (
    "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition whitespace-nowrap " +
    (active
      ? "border-orange-500 bg-orange-500 text-white"
      : "border-stone-200 bg-white text-stone-600 hover:border-orange-200 hover:text-orange-600")
  );
}

function sortPillClass(active: boolean): string {
  return (
    "rounded-full border px-3 py-1.5 text-xs font-medium transition " +
    (active
      ? "border-stone-700 bg-stone-800 text-white"
      : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50")
  );
}

export default async function ItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string }>;
}) {
  const [t, params] = await Promise.all([getTranslations(), searchParams]);

  const selectedCategory = (categoryValues as readonly string[]).includes(params.category ?? "")
    ? (params.category as string)
    : "";
  const selectedSort: SortOption = (SORT_OPTIONS as readonly string[]).includes(params.sort ?? "")
    ? (params.sort as SortOption)
    : "newest";

  let items: ItemListRow[] = [];
  let loadError = false;

  try {
    let query = supabaseServerAnonClient
      .from("items")
      .select("id, title, price, category, condition, created_at")
      .eq("status", "available");

    if (selectedCategory) {
      query = query.eq("category", selectedCategory);
    }

    if (selectedSort === "price_asc") {
      query = query.order("price", { ascending: true });
    } else if (selectedSort === "price_desc") {
      query = query.order("price", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const { data, error } = await query;
    if (error) {
      console.error("Failed to load available items.", error);
      loadError = true;
    } else {
      items = (data ?? []) as ItemListRow[];
    }
  } catch (err) {
    console.error("Unexpected error while loading available items.", err);
    loadError = true;
  }

  if (loadError) {
    return (
      <section className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-2xl">😬</p>
        <p className="mt-2 font-semibold text-red-800">{t.items.error.heading}</p>
        <p className="mt-1 text-sm text-red-600">{t.items.error.subtitle}</p>
      </section>
    );
  }

  const now = Date.now();
  const sortLabels: Record<SortOption, string> = {
    newest: t.items.sort.newest,
    price_asc: t.items.sort.priceAsc,
    price_desc: t.items.sort.priceDesc,
  };

  return (
    <section>
      {/* Category pills */}
      <div className="scrollbar-hide mb-3 flex gap-2 overflow-x-auto pb-1">
        <Link href={buildUrl("", selectedSort)} className={pillClass(!selectedCategory)}>
          {t.items.filterAll}
        </Link>
        {categoryValues.map((key) => {
          const meta = getCategoryMeta(key);
          return (
            <Link key={key} href={buildUrl(key, selectedSort)} className={pillClass(selectedCategory === key)}>
              {meta.emoji} {getCatLabel(t.categories, key)}
            </Link>
          );
        })}
      </div>

      {/* Sort + count row */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <p className="text-sm text-stone-500">
          <span className="font-semibold text-stone-800">{items.length}</span>{" "}
          {selectedCategory
            ? getCatLabel(t.categories, selectedCategory).toLowerCase()
            : t.items.pageTitle.toLowerCase()}
        </p>
        <div className="flex gap-1.5">
          {SORT_OPTIONS.map((s) => (
            <Link key={s} href={buildUrl(selectedCategory, s)} className={sortPillClass(selectedSort === s)}>
              {sortLabels[s]}
            </Link>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white py-20 text-center">
          <PackageOpen size={40} className="text-stone-300" />
          <p className="mt-4 font-semibold text-stone-700">{t.items.empty.heading}</p>
          <p className="mt-1 text-sm text-stone-500">{t.items.empty.subtitle}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const cat = getCategoryMeta(item.category);
            const condLabel = (t.items.condition as Record<string, string>)[item.condition] ?? item.condition;
            const condColor = CONDITION_COLOR[item.condition] ?? "bg-stone-100 text-stone-600";
            const price = Number(item.price);
            const isNew = now - new Date(item.created_at).getTime() < NEW_ITEM_MS;

            return (
              <Link
                key={item.id}
                href={`/items/${item.id}`}
                className="group flex flex-col rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-orange-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-2xl">{cat.emoji}</span>
                  <div className="flex items-center gap-1.5">
                    {isNew && (
                      <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-600">
                        {t.items.newBadge}
                      </span>
                    )}
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${condColor}`}>
                      {condLabel}
                    </span>
                  </div>
                </div>

                <h2 className="mt-3 font-semibold text-stone-900 transition group-hover:text-orange-600">
                  {item.title}
                </h2>

                <p className="mt-0.5 text-xs text-stone-500">
                  {getCatLabel(t.categories, item.category)}
                </p>

                <div className="mt-auto flex items-center justify-between pt-4">
                  <p className="text-lg font-bold text-stone-900">
                    {price === 0 ? (
                      <span className="text-emerald-600">{t.items.free}</span>
                    ) : (
                      currency.format(price)
                    )}
                  </p>
                  <ArrowRight
                    size={16}
                    className="text-stone-300 transition group-hover:translate-x-1 group-hover:text-orange-400"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
