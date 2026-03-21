import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";

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

function getAgeLabel(createdAt: string) {
  const created = new Date(createdAt).getTime();
  const diffHours = Math.max(1, Math.round((Date.now() - created) / (1000 * 60 * 60)));
  if (diffHours < 24) return `${diffHours}h ago`;
  const days = Math.round(diffHours / 24);
  return `${days}d ago`;
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
  const priceLabel = item.price === 0 ? freeLabel : currency.format(item.price);

  return (
    <Link
      href={`/items/${item.id}`}
      className={`group catalog-card overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-[var(--shadow-md)] ${
        viewMode === "list" ? "grid gap-3 p-3 sm:grid-cols-[220px_minmax(0,1fr)]" : "flex flex-col"
      }`}
    >
      <div
        className={`relative overflow-hidden rounded-2xl bg-[hsl(var(--surface-muted))] ${
          viewMode === "list" ? "aspect-[4/3] h-full min-h-[180px]" : "aspect-[4/3] w-full"
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
          <div className="flex h-full w-full items-center justify-center text-5xl text-stone-500">
            {getCategoryMeta(item.category).emoji}
          </div>
        )}
      </div>

      <div className={`${viewMode === "list" ? "flex min-w-0 flex-col justify-between py-1 pr-1" : "flex flex-1 flex-col p-4"}`}>
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="badge">{categoryLabel}</span>
                <span className={`badge ${condColor}`}>{condLabel}</span>
                {isNew ? <span className="badge badge-warning">{newBadgeLabel}</span> : null}
              </div>
              <h2 className="text-lg font-semibold tracking-[-0.035em] text-stone-950 transition group-hover:text-stone-700 [display:-webkit-box] overflow-hidden [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                {item.title}
              </h2>
            </div>
            <ArrowUpRight size={16} className="mt-1 shrink-0 text-stone-300 transition group-hover:text-stone-600" />
          </div>

          {item.description ? (
            <p className="text-sm leading-6 text-stone-600 [display:-webkit-box] overflow-hidden [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
              {item.description}
            </p>
          ) : null}
        </div>

        <div className="mt-5 grid gap-3 border-t border-stone-200 pt-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <div className="space-y-1">
            <p className="data-label">Price</p>
            <p className="text-2xl font-semibold tracking-[-0.045em] text-stone-950">
              {item.price === 0 ? <span className="text-[hsl(var(--success))]">{priceLabel}</span> : priceLabel}
            </p>
          </div>
          <div className="space-y-1 text-left sm:text-right">
            <p className="data-label flex items-center gap-1 sm:justify-end">
              <Clock3 size={12} /> Listed
            </p>
            <p className="text-sm font-medium text-stone-600">{getAgeLabel(item.createdAt)}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
