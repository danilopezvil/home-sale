import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { getCategoryMeta } from "@/lib/category-meta";
import type { Dictionary } from "@/lib/i18n";

import type { CatalogItem, ViewMode } from "./types";

const CONDITION_COLOR: Record<string, string> = {
  new: "badge-success",
  like_new: "badge-success",
  good: "badge-neutral",
  fair: "badge-warning",
  parts: "badge-danger",
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
  const condColor = CONDITION_COLOR[item.condition] ?? "badge-neutral";
  const isNew = Date.now() - new Date(item.createdAt).getTime() < NEW_ITEM_MS;
  const categoryLabel = getCatLabel(categories, item.category);

  return (
    <Link
      href={`/items/${item.id}`}
      className={`group surface overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-[var(--shadow-md)] ${
        viewMode === "list" ? "flex gap-4 p-3" : "flex flex-col"
      }`}
    >
      <div
        className={`relative overflow-hidden rounded-2xl bg-stone-100 ${
          viewMode === "list" ? "h-28 w-32 shrink-0" : "aspect-[4/3] w-full"
        }`}
      >
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            className="object-cover transition duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl text-stone-500">
            {getCategoryMeta(item.category).emoji}
          </div>
        )}
      </div>

      <div className={`${viewMode === "list" ? "flex flex-1 flex-col justify-between py-1 pr-1" : "flex flex-1 flex-col p-4"}`}>
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {isNew && <span className="badge badge-warning">{newBadgeLabel}</span>}
            <span className={`badge ${condColor}`}>{condLabel}</span>
          </div>

          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold tracking-[-0.03em] text-stone-950 transition group-hover:text-stone-700 [display:-webkit-box] overflow-hidden [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                {item.title}
              </h2>
              <p className="mt-1 text-sm text-stone-500">{categoryLabel}</p>
            </div>
            <ArrowUpRight size={16} className="mt-1 shrink-0 text-stone-300 transition group-hover:text-stone-600" />
          </div>

          {item.description && (
            <p className="mt-3 text-sm leading-6 text-stone-600 [display:-webkit-box] overflow-hidden [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
              {item.description}
            </p>
          )}
        </div>

        <div className="mt-4 flex items-end justify-between gap-3 border-t border-stone-200 pt-3">
          <p className="text-xl font-semibold tracking-[-0.04em] text-stone-950">
            {item.price === 0 ? <span className="text-emerald-700">{freeLabel}</span> : currency.format(item.price)}
          </p>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-400">View item</p>
        </div>
      </div>
    </Link>
  );
}
