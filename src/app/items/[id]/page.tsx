import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock, XCircle, Tag, Sparkles, MapPin, ArrowUpRight, Package2 } from "lucide-react";

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

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_380px] xl:items-start">
          <section className="space-y-5">
            <div className="surface section-pad space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-200 pb-5">
                <div className="flex min-w-0 items-start gap-4">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-stone-200 bg-[hsl(var(--surface-muted))] text-3xl">
                    {cat.emoji}
                  </span>
                  <div className="min-w-0 space-y-3">
                    <p className="eyebrow">{catLabel}</p>
                    <h1 className="inventory-title text-[2.1rem] sm:text-[2.7rem]">{item.title}</h1>
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge status={item.status} t={t.itemDetail.status} />
                      <span className="badge">
                        <Tag size={13} />
                        {catLabel}
                      </span>
                      <span className={`badge ${condColor}`}>
                        <Sparkles size={13} />
                        {condLabel}
                      </span>
                      {item.pickup_area ? (
                        <span className="badge">
                          <MapPin size={13} />
                          {item.pickup_area}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="detail-panel min-w-[190px] px-4 py-4 text-left sm:text-right">
                  <p className="data-label">Price</p>
                  <p className="mt-2 text-4xl font-semibold tracking-[-0.06em] text-stone-950">
                    {price === 0 ? <span className="text-[hsl(var(--success))]">{t.itemDetail.free}</span> : currency.format(price)}
                  </p>
                  <p className="mt-2 text-sm text-stone-500">Direct handoff, no cart flow.</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="inventory-metric">
                  <p className="data-label">Status</p>
                  <p className="text-base font-semibold text-stone-950">{t.itemDetail.status[item.status as keyof Dictionary["itemDetail"]["status"]] ?? item.status}</p>
                  <p className="text-sm text-stone-500">Updated from the live sale.</p>
                </div>
                <div className="inventory-metric">
                  <p className="data-label">Condition</p>
                  <p className="text-base font-semibold text-stone-950">{condLabel}</p>
                  <p className="text-sm text-stone-500">Review photos before requesting it.</p>
                </div>
                <div className="inventory-metric">
                  <p className="data-label">Pickup</p>
                  <p className="text-base font-semibold text-stone-950">{item.pickup_area ?? "Shared after confirmation"}</p>
                  <p className="text-sm text-stone-500">Used to coordinate timing.</p>
                </div>
              </div>

              {item.description ? (
                <section className="rounded-2xl border border-stone-200 bg-[hsl(var(--surface-muted))] p-5">
                  <p className="eyebrow">Listing notes</p>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-600">{item.description}</p>
                </section>
              ) : null}
            </div>

            <section className="surface section-pad space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="eyebrow">Photos</p>
                  <p className="mt-1 text-sm text-stone-500">The gallery is the quickest way to judge wear, finish and fit.</p>
                </div>
                {images.length > 0 ? (
                  <span className="badge badge-neutral">
                    <Package2 size={13} />
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
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
                  <div className="relative overflow-hidden rounded-3xl border border-stone-200 bg-[hsl(var(--surface-muted))] aspect-[4/3] xl:aspect-[5/4]">
                    <Image
                      src={images[0].image_url}
                      alt={`${item.title} — photo 1`}
                      fill
                      sizes="(min-width: 1280px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                    {images.slice(1).map((img, i) => (
                      <div
                        key={img.id}
                        className="relative overflow-hidden rounded-2xl border border-stone-200 bg-[hsl(var(--surface-muted))] aspect-[4/3]"
                      >
                        <Image
                          src={img.image_url}
                          alt={`${item.title} — photo ${i + 2}`}
                          fill
                          sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover"
                        />
                      </div>
                    ))}
                    {images.length === 1 ? (
                      <div className="flex min-h-[140px] items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-[hsl(var(--surface-muted))] px-5 text-center text-sm text-stone-500">
                        More photos may be added later if needed.
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </section>
          </section>

          <aside className="space-y-5 xl:sticky xl:top-28">
            <section className="surface section-pad">
              <p className="eyebrow">Reserve or check status</p>
              <h2 className="section-title mt-2">
                {item.status === "available" ? t.itemDetail.reserveHeading : t.itemDetail.reservationHeading}
              </h2>
              <p className="section-copy mt-2">
                This is part of a live moving sale. If you want it, send the request before the pickup plan locks in.
              </p>

              <div className="mt-4 rounded-2xl border border-stone-200 bg-[hsl(var(--surface-muted))] px-4 py-3 text-sm text-stone-700">
                <span className="font-semibold text-stone-950">Before sending:</span> review photos, check condition and include a realistic pickup window.
              </div>

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
