import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock, XCircle, Tag, Sparkles, MapPin } from "lucide-react";

import { supabaseServerAnonClient } from "@/lib/supabase/server";
import { getCategoryMeta } from "@/lib/category-meta";
import { getTranslations, type Dictionary } from "@/lib/i18n";
import { ReserveForm } from "./reserve-form";

type ItemDetailPageProps = { params: Promise<{ id: string }> };

type ItemRow = {
  id: string;
  title: string;
  description: string | null;
  price: number | string;
  category: string | null;
  condition: string;
  pickup_area: string | null;
  status: string;
};

type ItemImageRow = {
  id: string;
  image_url: string;
  sort_order?: number;
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

function StatusBadge({ status, t }: { status: string; t: Dictionary["itemDetail"]["status"] }) {
  if (status === "available") {
    return (
      <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
        <CheckCircle2 size={14} />
        {t.available}
      </span>
    );
  }
  if (status === "reserved") {
    return (
      <span className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
        <Clock size={14} />
        {t.reserved}
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-100 px-3 py-1 text-sm font-medium text-stone-600">
      <XCircle size={14} />
      {t.sold}
    </span>
  );
}

async function getItemImages(itemId: string) {
  const { data, error } = await supabaseServerAnonClient
    .from("item_images")
    .select("id, image_url, sort_order")
    .eq("item_id", itemId)
    .order("sort_order", { ascending: true });

  if (!error) return { images: (data ?? []) as ItemImageRow[], error: null };

  console.error("Failed to load item images.", error);
  return { images: [] as ItemImageRow[], error: true };
}

function getCatLabel(categories: Dictionary["categories"], key: string | null | undefined): string {
  if (!key) return categories.other;
  return (categories as Record<string, string>)[key] ?? key;
}

export default async function ItemDetailPage({ params }: ItemDetailPageProps) {
  const { id } = await params;
  const t = await getTranslations();

  try {
    const { data, error } = await supabaseServerAnonClient
      .from("items")
      .select("id, title, description, price, category, condition, pickup_area, status")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Failed to load item.", error);
      return (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-2xl">😬</p>
          <p className="mt-2 font-semibold text-red-800">{t.itemDetail.error.load}</p>
        </section>
      );
    }

    if (!data) notFound();

    const item = data as ItemRow;
    const { images, error: imageError } = await getItemImages(item.id);
    const cat = getCategoryMeta(item.category);
    const price = Number(item.price);
    const condLabel = (t.items.condition as Record<string, string>)[item.condition] ?? item.condition;
    const condColor = CONDITION_COLOR[item.condition] ?? "bg-stone-100 text-stone-600";
    const catLabel = getCatLabel(t.categories, item.category);

    return (
      <article className="space-y-5">
        <Link
          href="/items"
          className="inline-flex items-center gap-1.5 text-sm text-stone-500 transition hover:text-stone-800"
        >
          <ArrowLeft size={14} />
          {t.itemDetail.back}
        </Link>

        {/* Main card */}
        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="text-4xl">{cat.emoji}</span>
              <div>
                <h1 className="text-2xl font-bold text-stone-900">{item.title}</h1>
                <p className="mt-0.5 text-sm text-stone-500">{catLabel}</p>
              </div>
            </div>
            <StatusBadge status={item.status} t={t.itemDetail.status} />
          </div>

          {item.description && (
            <p className="mt-4 text-sm leading-relaxed text-stone-600">{item.description}</p>
          )}

          {/* Images */}
          {imageError ? (
            <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
              {t.itemDetail.error.load}
            </p>
          ) : images.length === 0 ? (
            <div className="mt-5 flex items-center justify-center rounded-xl border border-dashed border-stone-200 bg-stone-50 py-12 text-sm text-stone-400">
              {t.itemDetail.noPhotos}
            </div>
          ) : (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((img, i) => (
                <div
                  key={img.id}
                  className="relative aspect-[4/3] overflow-hidden rounded-xl border border-stone-200 bg-stone-100"
                >
                  <Image
                    src={img.image_url}
                    alt={`${item.title} — photo ${i + 1}`}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Info chips */}
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-sm font-semibold text-stone-800">
              {price === 0 ? (
                <span className="text-emerald-600">{t.itemDetail.free}</span>
              ) : (
                currency.format(price)
              )}
            </span>
            <span className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${condColor}`}>
              <Sparkles size={13} />
              {condLabel}
            </span>
            {item.pickup_area && (
              <span className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-sm text-stone-600">
                <MapPin size={13} />
                {item.pickup_area}
              </span>
            )}
            <span className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-sm text-stone-600">
              <Tag size={13} />
              {catLabel}
            </span>
          </div>
        </section>

        {/* Reservation section */}
        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-stone-900">
            {item.status === "available" ? t.itemDetail.reserveHeading : t.itemDetail.reservationHeading}
          </h2>

          {item.status === "available" ? (
            <div className="mt-4">
              <ReserveForm itemId={item.id} t={t.reserveForm} />
            </div>
          ) : item.status === "reserved" ? (
            <div className="mt-3 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <Clock size={18} className="mt-0.5 shrink-0 text-amber-500" />
              <p className="text-sm text-amber-800">{t.itemDetail.reservedMessage}</p>
            </div>
          ) : (
            <div className="mt-3 flex items-start gap-3 rounded-xl border border-stone-200 bg-stone-50 p-4">
              <XCircle size={18} className="mt-0.5 shrink-0 text-stone-400" />
              <p className="text-sm text-stone-600">{t.itemDetail.soldMessage}</p>
            </div>
          )}
        </section>
      </article>
    );
  } catch (err) {
    console.error("Unexpected error while loading item details.", err);
    return (
      <section className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-2xl">😬</p>
        <p className="mt-2 font-semibold text-red-800">{t.itemDetail.error.general}</p>
      </section>
    );
  }
}
