import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";

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

  try {
    const { data, error, count } = await supabaseServerAnonClient
      .from("items")
      .select("id, title, price, category, created_at", { count: "exact" })
      .eq("status", "available")
      .order("created_at", { ascending: false })
      .limit(6);

    if (error) {
      console.error("Failed to load homepage inventory.", error);
    } else {
      availableCount = count ?? 0;
      latestItems = (data ?? []) as HomeItemRow[];
    }
  } catch (error) {
    console.error("Unexpected error while loading homepage inventory.", error);
  }

  return (
    <div className="space-y-6 pb-6">
      <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)] lg:items-start">
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                {t.home.kicker}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
                  {t.home.heading}
                </h1>
                <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {availableCount} {t.home.inventoryLabel}
                </span>
              </div>
              <p className="max-w-2xl text-sm leading-6 text-stone-600 sm:text-base">
                {t.home.subtitle}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/items"
                className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-700"
              >
                {t.home.primaryAction}
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/items?sort=newest"
                className="inline-flex items-center gap-2 rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:border-stone-300 hover:bg-stone-50"
              >
                <Clock3 size={16} className="text-stone-500" />
                {t.home.secondaryAction}
              </Link>
            </div>

            <div className="space-y-2 border-t border-stone-200 pt-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-stone-900">{t.home.categoriesLabel}</p>
                <Link
                  href="/items"
                  className="text-xs font-medium text-stone-500 transition hover:text-stone-900"
                >
                  {t.home.viewAllCategories}
                </Link>
              </div>
              <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
                {t.home.categories.map(({ emoji, label, key }) => (
                  <Link
                    key={label}
                    href={key ? `/items?category=${key}` : "/items"}
                    className="inline-flex shrink-0 items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-300 hover:bg-white"
                  >
                    <span>{emoji}</span>
                    <span>{label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <aside className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
            <div className="flex items-baseline justify-between gap-3 border-b border-stone-200 pb-3">
              <div>
                <p className="text-sm font-semibold text-stone-900">{t.home.recentHeading}</p>
                <p className="mt-1 text-xs text-stone-500">{t.home.recentSubtitle}</p>
              </div>
              <Link
                href="/items?sort=newest"
                className="text-xs font-medium text-stone-500 transition hover:text-stone-900"
              >
                {t.home.viewLatest}
              </Link>
            </div>

            <div className="mt-3 space-y-2">
              {latestItems.length > 0 ? (
                latestItems.slice(0, 4).map((item) => (
                  <Link
                    key={item.id}
                    href={`/items/${item.id}`}
                    className="flex items-center gap-3 rounded-xl border border-transparent bg-white px-3 py-2.5 transition hover:border-stone-200"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-lg">
                      {getCategoryMeta(item.category).emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-stone-900">{item.title}</p>
                      <p className="text-xs text-stone-500">
                        {getCategoryLabel(t.categories as Record<string, string>, item.category)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-stone-900">
                      {Number(item.price) === 0 ? t.items.free : currency.format(Number(item.price))}
                    </p>
                  </Link>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-stone-300 bg-white px-3 py-6 text-center text-sm text-stone-500">
                  {t.items.empty.subtitle}
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-2 border-b border-stone-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-stone-900">{t.home.inventorySectionTitle}</p>
            <p className="mt-1 text-sm text-stone-500">{t.home.inventorySectionSubtitle}</p>
          </div>
          <p className="text-sm font-medium text-stone-600">
            {availableCount} {t.home.inventoryLabel}
          </p>
        </div>

        {latestItems.length > 0 ? (
          <div className="mt-4 grid gap-2 lg:grid-cols-2">
            {latestItems.map((item) => (
              <Link
                key={item.id}
                href={`/items/${item.id}`}
                className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-stone-200 px-3 py-3 transition hover:border-stone-300 hover:bg-stone-50"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-stone-100 text-lg">
                  {getCategoryMeta(item.category).emoji}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-stone-900">{item.title}</p>
                  <p className="mt-0.5 text-xs text-stone-500">
                    {getCategoryLabel(t.categories as Record<string, string>, item.category)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-stone-900">
                    {Number(item.price) === 0 ? t.items.free : currency.format(Number(item.price))}
                  </p>
                  <p className="mt-1 text-xs font-medium text-orange-600">{t.home.rowAction}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-stone-300 bg-stone-50 px-4 py-10 text-center text-sm text-stone-500">
            {t.items.empty.subtitle}
          </div>
        )}
      </section>
    </div>
  );
}
