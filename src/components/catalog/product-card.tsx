import Image from "next/image";
import Link from "next/link";

import { getCategoryMeta } from "@/lib/category-meta";
import type { Dictionary } from "@/lib/i18n";

import type { CatalogItem } from "./types";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function getCategoryLabel(categories: Dictionary["categories"], key: string | null | undefined): string {
  if (!key) return categories.other;
  return (categories as Record<string, string>)[key] ?? key;
}

function getStatus(condition: string): "available" | "reserved" | "sold" {
  if (condition === "parts") return "sold";
  if (condition === "fair") return "reserved";
  return "available";
}

const STATUS_STYLES = {
  available: "bg-emerald-500 text-white",
  reserved: "bg-amber-500 text-white",
  sold: "bg-slate-500 text-white",
} as const;

const STATUS_LABELS = {
  available: "Disponible",
  reserved: "Reservado",
  sold: "Vendido",
} as const;

type ProductCardProps = {
  item: CatalogItem;
  categories: Dictionary["categories"];
  conditionText: Dictionary["items"]["condition"];
  freeLabel: string;
};

export function ProductCard({ item, categories, conditionText, freeLabel }: ProductCardProps) {
  const status = getStatus(item.condition);
  const categoryLabel = getCategoryLabel(categories, item.category);
  const conditionLabel = (conditionText as Record<string, string>)[item.condition] ?? item.condition;
  const priceLabel = item.price === 0 ? freeLabel : currency.format(item.price);

  return (
    <article className={`group overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 ${status === "sold" ? "opacity-75" : ""}`}>
      <div className="relative aspect-square overflow-hidden">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            className={`object-cover transition-transform duration-500 group-hover:scale-110 ${status === "sold" ? "grayscale" : ""}`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-100 text-5xl">
            {getCategoryMeta(item.category).emoji}
          </div>
        )}
        <div className="absolute left-3 top-3">
          <span className={`rounded px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[status]}`}>
            {STATUS_LABELS[status]}
          </span>
        </div>
      </div>

      <div className="p-5">
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{categoryLabel} · {conditionLabel}</p>
        <h3 className="mb-1 line-clamp-1 font-bold text-slate-900">{item.title}</h3>
        <p className={`mb-4 text-2xl font-black ${status === "sold" ? "text-slate-400" : "text-sky-600"}`}>{priceLabel}</p>

        <Link
          href={`/items/${item.id}`}
          className={`block w-full rounded-lg border py-2.5 text-center text-sm font-bold transition-all ${
            status === "sold"
              ? "cursor-not-allowed border-slate-100 text-slate-400 pointer-events-none"
              : "border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          {status === "sold" ? "Out of Stock" : "View Details"}
        </Link>
      </div>
    </article>
  );
}
