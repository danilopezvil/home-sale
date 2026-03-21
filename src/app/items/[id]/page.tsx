import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock, XCircle, Tag, Sparkles, MapPin, ArrowUpRight } from "lucide-react";

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
  new: "badge-success",
  like_new: "badge-success",
  good: "badge-neutral",
  fair: "badge-warning",
  parts: "badge-danger",
};

function StatusBadge({ status, t }: { status: string; t: Dictionary["itemDetail"]["status"] }) {
  if (status === "available") {
    return (
      <span className="badge badge-success">
        <CheckCircle2 size={14} />
        {t.available}
      </span>
    );
  }
  if (status === "reserved") {
    return (
      <span className="badge badge-warning">
        <Clock size={14} />
        {t.reserved}
      </span>
    );
  }
  return (
    <span className="badge badge-neutral">
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
        <section className="notice-danger text-center">
          <p className="text-base font-semibold">{t.itemDetail.error.load}</p>
        </section>
      );
    }

    if (!data) notFound();

    const item = data as ItemRow;
    const { images, error: imageError } = await getItemImages(item.id);
    const cat = getCategoryMeta(item.category);
    const price = Number(item.price);
    const condLabel = (t.items.condition as Record<string, string>)[item.condition] ?? item.condition;
    const condColor = CONDITION_COLOR[item.condition] ?? "badge-neutral";
    const catLabel = getCatLabel(t.categories, item.category);

    return (
      <article className="space-y-5">
        <Link href="/items" className="btn-ghost w-fit px-0 py-0 text-sm">
          <ArrowLeft size={14} />
          {t.itemDetail.back}
        </Link>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_380px]">
          <section className="surface section-pad space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-200 pb-4">
              <div className="flex items-start gap-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-stone-200 bg-stone-50 text-3xl">
                  {cat.emoji}
                </span>
                <div>
                  <p className="eyebrow">{catLabel}</p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-stone-950 sm:text-4xl">
                    {item.title}
                  </h1>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <StatusBadge status={item.status} t={t.itemDetail.status} />
                    <span className="badge">
                      <Tag size={13} />
                      {catLabel}
                    </span>
                    <span className={`badge ${condColor}`}>
                      <Sparkles size={13} />
                      {condLabel}
                    </span>
                    {item.pickup_area && (
                      <span className="badge">
                        <MapPin size={13} />
                        {item.pickup_area}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="surface-muted min-w-[170px] px-4 py-3 text-right">
                <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Price</p>
                <p className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-stone-950">
                  {price === 0 ? <span className="text-emerald-700">{t.itemDetail.free}</span> : currency.format(price)}
                </p>
              </div>
            </div>

            {item.description ? (
              <section className="space-y-2">
                <p className="eyebrow">Listing notes</p>
                <p className="max-w-3xl text-sm leading-7 text-stone-600">{item.description}</p>
              </section>
            ) : null}

            <section className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="eyebrow">Photos</p>
                  <p className="mt-1 text-sm text-stone-500">Use the photos to check condition before reaching out.</p>
                </div>
                {images.length > 0 ? (
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-stone-400">
                    {images.length} image{images.length === 1 ? "" : "s"}
                  </span>
                ) : null}
              </div>

              {imageError ? (
                <p className="notice-warning">{t.itemDetail.error.load}</p>
              ) : images.length === 0 ? (
                <div className="empty-state py-12">
                  <p className="text-sm text-stone-500">{t.itemDetail.noPhotos}</p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {images.map((img, i) => (
                    <div
                      key={img.id}
                      className={`relative overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 ${
                        i === 0 ? "aspect-[4/3] sm:col-span-2 xl:row-span-2 xl:min-h-[410px]" : "aspect-[4/3]"
                      }`}
                    >
                      <Image
                        src={img.image_url}
                        alt={`${item.title} — photo ${i + 1}`}
                        fill
                        sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </section>
          </section>

          <aside className="space-y-5">
            <section className="surface section-pad">
              <p className="eyebrow">Reserve or check status</p>
              <h2 className="section-title mt-2">
                {item.status === "available" ? t.itemDetail.reserveHeading : t.itemDetail.reservationHeading}
              </h2>
              <p className="section-copy mt-2">
                This is a real moving-sale listing, so availability can change quickly.
              </p>

              {item.status === "available" ? (
                <div className="mt-5">
                  <ReserveForm itemId={item.id} t={t.reserveForm} />
                </div>
              ) : item.status === "reserved" ? (
                <div className="notice-warning mt-5 flex items-start gap-3">
                  <Clock size={18} className="mt-0.5 shrink-0" />
                  <p>{t.itemDetail.reservedMessage}</p>
                </div>
              ) : (
                <div className="notice mt-5 flex items-start gap-3">
                  <XCircle size={18} className="mt-0.5 shrink-0 text-stone-400" />
                  <p>{t.itemDetail.soldMessage}</p>
                </div>
              )}
            </section>

            <section className="surface section-pad">
              <p className="eyebrow">Quick checklist</p>
              <div className="mt-4 space-y-3 text-sm text-stone-600">
                <div className="surface-muted p-4">
                  <p className="font-semibold text-stone-900">Review condition and photos</p>
                  <p className="mt-1">Make sure the listing matches what you need before reserving it.</p>
                </div>
                <div className="surface-muted p-4">
                  <p className="font-semibold text-stone-900">Share your pickup window</p>
                  <p className="mt-1">A preferred date helps the seller organise departures and handoff timing.</p>
                </div>
                <Link href="/items" className="surface-muted flex items-center justify-between p-4 font-semibold text-stone-900 transition hover:bg-white">
                  Back to all items
                  <ArrowUpRight size={15} className="text-stone-400" />
                </Link>
              </div>
            </section>
          </aside>
        </div>
      </article>
    );
  } catch (err) {
    console.error("Unexpected error while loading item details.", err);
    return (
      <section className="notice-danger text-center">
        <p className="text-base font-semibold">{t.itemDetail.error.general}</p>
      </section>
    );
  }
}
