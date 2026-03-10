import Image from "next/image";
import Link from "next/link";

import { getCategoryMeta } from "@/lib/category-meta";
import type { Dictionary } from "@/lib/i18n";

import type { CatalogItem, ViewMode } from "./types";

const CONDITION_COLOR: Record<string, string> = {
  new: "bg-emerald-100 text-emerald-700",
  like_new: "bg-teal-100 text-teal-700",
  good: "bg-sky-100 text-sky-700",
  fair: "bg-amber-100 text-amber-700",
  parts: "bg-stone-100 text-stone-600",
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const NEW_ITEM_MS = 72 * 60 * 60 * 1000;

function getCatLabel(categories: Dictionary["categories"], key: string | null | undefined): string {
  if (!key) return categories.other;
  return (categories as Record<string, string>)[key] ?? key;
}

type ProductCardProps = {
  item: CatalogItem;
  categories: Dictionary["categories"];
  conditionText: Dictionary["items"]["condition"];
  newBadgeLabel: string;
  freeLabel: string;
  viewMode: ViewMode;
};

export function ProductCard({
  item,
  categories,
  conditionText,
  newBadgeLabel,
  freeLabel,
  viewMode,
}: ProductCardProps) {
  const condLabel = (conditionText as Record<string, string>)[item.condition] ?? item.condition;
  const condColor = CONDITION_COLOR[item.condition] ?? "bg-stone-100 text-stone-600";
  const isNew = Date.now() - new Date(item.createdAt).getTime() < NEW_ITEM_MS;
  const categoryLabel = getCatLabel(categories, item.category);

  return (
    <Link
      href={`/items/${item.id}`}
      className={`group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md ${
        viewMode === "list" ? "flex gap-3 p-3" : "flex flex-col"
      }`}
    >
      <div
        className={`relative overflow-hidden rounded-xl bg-stone-100 ${
          viewMode === "list" ? "h-24 w-28 shrink-0" : "aspect-[4/3] w-full"
        }`}
      >
        {item.imageUrl ? (
          <Image src={item.imageUrl} alt={item.title} fill className="object-cover transition duration-300 group-hover:scale-[1.02]" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl">{getCategoryMeta(item.category).emoji}</div>
        )}
      </div>

      <div className={`${viewMode === "list" ? "flex-1" : "p-3.5"}`}>
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          {isNew && (
            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-semibold text-orange-700">
              {newBadgeLabel}
            </span>
          )}
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${condColor}`}>{condLabel}</span>
        </div>

        <h2 className="text-sm font-semibold text-stone-900 transition group-hover:text-orange-600 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
          {item.title}
        </h2>
        <p className="mt-0.5 text-xs text-stone-500">{categoryLabel}</p>
        {item.description && (
          <p className="mt-2 text-xs text-stone-600 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
            {item.description}
          </p>
        )}

        <p className="mt-3 text-lg font-bold leading-none text-stone-900">
          {item.price === 0 ? <span className="text-emerald-600">{freeLabel}</span> : currency.format(item.price)}
        </p>
      </div>
    </Link>
  );
}
