import Link from "next/link";
import { ArrowRight, Clock3, MapPin, Package2, ScanSearch } from "lucide-react";

import { getCategoryMeta } from "@/lib/category-meta";
import { getTranslations } from "@/lib/i18n";
import { supabaseServerAnonClient } from "@/lib/supabase/server";

type HomeItemRow = {
  id: string;
  title: string;
  price: number | string;
  category: string | null;
  created_at: string;
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function getCategoryLabel(
  categories: Record<string, string>,
  key: string | null | undefined,
) {
  if (!key) return categories.other ?? "Other";
  return categories[key] ?? key;
}

export default async function Home() {
  const t = await getTranslations();

  let availableCount = 0;
  let latestItems: HomeItemRow[] = [];
  let categoryCounts: Record<string, number> = {};

  try {
    const [{ data, error, count }, { data: categoriesData, error: categoriesError }] = await Promise.all([
      supabaseServerAnonClient
        .from("items")
        .select("id, title, price, category, created_at", { count: "exact" })
        .eq("status", "available")
        .order("created_at", { ascending: false })
        .limit(6),
      supabaseServerAnonClient
        .from("items")
        .select("category")
        .eq("status", "available"),
    ]);

    if (error) {
      console.error("Failed to load homepage inventory.", error);
    } else {
      availableCount = count ?? 0;
      latestItems = (data ?? []) as HomeItemRow[];
    }

    if (categoriesError) {
      console.error("Failed to load category counts.", categoriesError);
    } else {
      categoryCounts = (categoriesData ?? []).reduce<Record<string, number>>((acc, row) => {
        const key = row.category ?? "other";
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      }, {});
    }
  } catch (error) {
    console.error("Unexpected error while loading homepage inventory.", error);
  }

  const freeCount = latestItems.filter((item) => Number(item.price) === 0).length;
  const newestPreview = latestItems.slice(0, 4);

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_340px]">
      <div className="space-y-5">
        <section className="surface section-pad overflow-hidden">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] xl:items-start">
            <div className="space-y-5">
              <div className="space-y-3">
                <p className="eyebrow">{t.home.kicker}</p>
                <h1 className="inventory-title max-w-3xl">{t.home.heading}</h1>
                <p className="display-subtitle max-w-2xl">{t.home.subtitle}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="inventory-metric">
                  <p className="data-label">Available now</p>
                  <p className="data-value">{availableCount}</p>
                  <p className="text-sm text-stone-500">Items still in the sale.</p>
                </div>
                <div className="inventory-metric">
                  <p className="data-label">Just listed</p>
                  <p className="data-value">{newestPreview.length}</p>
                  <p className="text-sm text-stone-500">Fresh items near the top of the queue.</p>
                </div>
                <div className="inventory-metric">
                  <p className="data-label">Free picks</p>
                  <p className="data-value">{freeCount}</p>
                  <p className="text-sm text-stone-500">No-cost items worth checking first.</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href="/items" className="btn-primary">
                  {t.home.primaryAction}
                  <ArrowRight size={16} />
                </Link>
                <Link href="/items?sort=newest" className="btn-secondary">
                  <Clock3 size={16} />
                  {t.home.secondaryAction}
                </Link>
              </div>

              <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-muted))] px-4 py-3 text-sm text-stone-700">
                <span className="font-semibold text-stone-950">Moving-sale pace:</span> listings can disappear quickly once pickup windows are assigned.
              </div>
            </div>

            <aside className="detail-panel p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3 border-b border-stone-200 pb-3">
                <div>
                  <p className="eyebrow">Top of the queue</p>
                  <p className="mt-1 text-sm text-stone-500">Actual listings, ordered by recency.</p>
                </div>
                <Link href="/items?sort=newest" className="btn-ghost px-0 py-0 text-xs font-medium">
                  {t.home.viewLatest}
                </Link>
              </div>

              <div className="mt-4 space-y-2">
                {newestPreview.length > 0 ? (
                  newestPreview.map((item) => (
                    <Link
                      key={item.id}
                      href={`/items/${item.id}`}
                      className="grid grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-transparent bg-white/90 px-3 py-3 transition hover:border-stone-200 hover:bg-white"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--surface-muted))] text-lg">
                        {getCategoryMeta(item.category).emoji}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-stone-900">{item.title}</p>
                        <p className="text-xs text-stone-500">
                          {getCategoryLabel(t.categories as Record<string, string>, item.category)}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-stone-950">
                        {Number(item.price) === 0 ? t.items.free : currency.format(Number(item.price))}
                      </p>
                    </Link>
                  ))
                ) : (
                  <div className="empty-state py-10">
                    <Package2 size={24} className="text-stone-300" />
                    <p className="mt-3 text-sm text-stone-500">{t.items.empty.subtitle}</p>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </section>

        <section className="surface section-pad">
          <div className="flex flex-col gap-4 border-b border-stone-200 pb-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow">Available now</p>
              <h2 className="section-title mt-2">{t.home.inventorySectionTitle}</h2>
              <p className="section-copy mt-2 max-w-2xl">{t.home.inventorySectionSubtitle}</p>
            </div>
            <div className="surface-muted flex items-center gap-3 px-4 py-3 text-sm text-stone-600">
              <ScanSearch size={16} className="text-stone-500" />
              {availableCount} {t.home.inventoryLabel}
            </div>
          </div>

          {latestItems.length > 0 ? (
            <div className="mt-5 grid gap-3 lg:grid-cols-2">
              {latestItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/items/${item.id}`}
                  className="catalog-card grid grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 transition hover:border-stone-300 hover:bg-white"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--surface-muted))] text-lg shadow-sm">
                    {getCategoryMeta(item.category).emoji}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-stone-950">{item.title}</p>
                    <p className="mt-0.5 text-xs text-stone-500">
                      {getCategoryLabel(t.categories as Record<string, string>, item.category)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-stone-950">
                      {Number(item.price) === 0 ? t.items.free : currency.format(Number(item.price))}
                    </p>
                    <p className="mt-1 text-xs font-medium text-stone-500">{t.home.rowAction}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state mt-5">
              <Package2 size={28} className="text-stone-300" />
              <p className="mt-3 text-sm text-stone-500">{t.items.empty.subtitle}</p>
            </div>
          )}
        </section>
      </div>

      <aside className="space-y-5 xl:pt-1">
        <section className="surface section-pad">
          <div className="flex items-center justify-between gap-3 border-b border-stone-200 pb-4">
            <div>
              <p className="eyebrow">Browse by category</p>
              <p className="mt-1 text-sm text-stone-500">Start where the highest concentration of stock still sits.</p>
            </div>
            <Link href="/items" className="btn-ghost px-0 py-0 text-xs font-medium">
              {t.home.viewAllCategories}
            </Link>
          </div>

          <div className="mt-4 space-y-2">
            {t.home.categories.map(({ emoji, label, key }) => (
              <Link
                key={label}
                href={key ? `/items?category=${key}` : "/items"}
                className="flex items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white/80 px-4 py-3 text-sm font-medium text-stone-700 transition hover:border-stone-300 hover:bg-white"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="text-lg">{emoji}</span>
                  <span>{label}</span>
                </span>
                <span className="flex items-center gap-3">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
                    {categoryCounts[key || "other"] ?? 0}
                  </span>
                  <ArrowRight size={15} className="text-stone-400" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="surface section-pad">
          <p className="eyebrow">How pickup works</p>
          <div className="mt-4 space-y-3 text-sm text-stone-600">
            <div className="surface-muted p-4">
              <p className="font-semibold text-stone-900">1. Review the listing</p>
              <p className="mt-1">Check category, condition, price and photos before requesting it.</p>
            </div>
            <div className="surface-muted p-4">
              <p className="font-semibold text-stone-900">2. Reserve with contact details</p>
              <p className="mt-1">Use the reservation form so pickup can be coordinated directly.</p>
            </div>
            <div className="surface-muted p-4">
              <p className="flex items-center gap-2 font-semibold text-stone-900"><MapPin size={15} /> 3. Pick up on schedule</p>
              <p className="mt-1">This is a moving sale, so availability and timing can change quickly.</p>
            </div>
          </div>
        </section>
      </aside>
    </div>
  );
}
