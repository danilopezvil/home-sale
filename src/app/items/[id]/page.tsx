import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  XCircle,
  Tag,
  Sparkles,
  MapPin,
  Package2,
  Heart,
} from "lucide-react";

import { supabaseServerAnonClient } from "@/lib/supabase/server";
import { getCategoryMeta } from "@/lib/category-meta";
import { getTranslations, type Dictionary } from "@/lib/i18n";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";

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
  new: "text-emerald-700 bg-emerald-100 border-emerald-200",
  like_new: "text-emerald-700 bg-emerald-100 border-emerald-200",
  good: "text-slate-700 bg-slate-100 border-slate-200",
  fair: "text-amber-700 bg-amber-100 border-amber-200",
  parts: "text-red-700 bg-red-100 border-red-200",
};

function StatusBadge({ status, t }: { status: string; t: Dictionary["itemDetail"]["status"] }) {
  if (status === "available") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-sky-800">
        <CheckCircle2 size={13} />
        {t.available}
      </span>
    );
  }
  if (status === "reserved") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-amber-800">
        <Clock size={13} />
        {t.reserved}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-slate-700">
      <XCircle size={13} />
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
    const condStyle = CONDITION_COLOR[item.condition] ?? "text-slate-700 bg-slate-100 border-slate-200";
    const catLabel = getCatLabel(t.categories, item.category);
    const mainImage = images[0]?.image_url;

    return (
      <article className="relative -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="flex min-h-screen flex-col bg-[#f9f9ff] lg:flex-row">
          <section className="w-full bg-white px-4 pb-14 pt-5 sm:px-6 lg:w-3/5 lg:px-12 lg:pb-16 lg:pt-10 xl:px-20">
            <Link href="/items" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900">
              <ArrowLeft size={14} />
              {t.itemDetail.back}
            </Link>

            {imageError ? (
              <p className="notice-warning">{t.itemDetail.error.load}</p>
            ) : mainImage ? (
              <>
                <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
                  <Image
                    src={mainImage}
                    alt={`${item.title} — photo 1`}
                    fill
                    sizes="(min-width: 1280px) 55vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    priority
                  />
                  <div className="absolute left-4 top-4 rounded-full bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700 backdrop-blur">
                    ITEM ID: {item.id.slice(0, 8).toUpperCase()}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-4 gap-3">
                  {images.slice(0, 4).map((img, index) => {
                    const isLastPreview = index === 3 && images.length > 4;
                    return (
                      <div
                        key={img.id}
                        className={`relative aspect-square overflow-hidden rounded-xl border ${
                          index === 0 ? "border-sky-400" : "border-slate-200"
                        }`}
                      >
                        <Image
                          src={img.image_url}
                          alt={`${item.title} — photo ${index + 1}`}
                          fill
                          sizes="(min-width: 1024px) 14vw, 25vw"
                          className={`object-cover ${index > 0 ? "opacity-80" : ""}`}
                        />
                        {isLastPreview ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/45 text-sm font-bold text-white">
                            +{images.length - 4}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="empty-state py-16">
                <p className="text-sm text-slate-500">{t.itemDetail.noPhotos}</p>
              </div>
            )}

            <div className="mt-10 max-w-3xl space-y-9">
              <section className="space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Description</p>
                <p className="text-sm leading-7 text-slate-600">{item.description ?? "No additional listing notes were provided by the seller."}</p>
              </section>

              <section className="space-y-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Specifications</p>
                <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-10">
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Category</p>
                    <p className="text-sm font-medium text-slate-900">{cat.emoji} {catLabel}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Condition</p>
                    <p className="text-sm font-medium text-slate-900">{condLabel}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Availability</p>
                    <p className="text-sm font-medium text-slate-900">
                      {t.itemDetail.status[item.status as keyof Dictionary["itemDetail"]["status"]] ?? item.status}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Pickup area</p>
                    <p className="text-sm font-medium text-slate-900">{item.pickup_area ?? "Shared after confirmation"}</p>
                  </div>
                </div>
              </section>
            </div>
          </section>

          <aside className="w-full border-t border-slate-200 bg-[#f9f9ff] px-4 pb-14 pt-8 sm:px-6 lg:sticky lg:top-16 lg:w-2/5 lg:self-start lg:border-l lg:border-t-0 lg:px-10 lg:pb-16 lg:pt-12 xl:px-14">
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <StatusBadge status={item.status} t={t.itemDetail.status} />
                  <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">{item.title}</h1>
                </div>
                <button className="rounded-full p-2.5 text-slate-500 transition hover:bg-slate-200/60 hover:text-slate-900" aria-label="Favorite item">
                  <Heart size={18} />
                </button>
              </div>

              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-slate-950">
                  {price === 0 ? <span className="text-emerald-600">{t.itemDetail.free}</span> : currency.format(price)}
                </p>
                <p className="text-sm font-medium text-slate-500">Local pickup only</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-[#f0f3ff] p-6 shadow-[0_20px_40px_rgba(17,28,45,0.06)]">
                <p className="text-lg font-bold text-slate-900">Reserve this item</p>
                <p className="mt-1 text-sm text-slate-600">Agrega al carrito ahora y completa tus datos al revisar el carrito.</p>

                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-600 text-xs font-bold text-white">1</span>
                    <span>Agrega este artículo al carrito.</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700">2</span>
                    <span>Ingresa tus datos y horario en checkout.</span>
                  </div>
                </div>

                {item.status === "available" ? (
                  <div className="mt-6">
                    <AddToCartButton
                      itemId={item.id}
                      cta={t.itemDetail.cart.add}
                      added={t.itemDetail.cart.added}
                      goToCart={t.itemDetail.cart.goToCart}
                    />
                  </div>
                ) : item.status === "reserved" ? (
                  <div className="notice-warning mt-6 flex items-start gap-3">
                    <Clock size={18} className="mt-0.5 shrink-0" />
                    <p>{t.itemDetail.reservedMessage}</p>
                  </div>
                ) : (
                  <div className="notice mt-6 flex items-start gap-3">
                    <XCircle size={18} className="mt-0.5 shrink-0 text-slate-400" />
                    <p>{t.itemDetail.soldMessage}</p>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
                    <Tag size={12} />
                    {catLabel}
                  </span>
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${condStyle}`}>
                    <Sparkles size={12} />
                    {condLabel}
                  </span>
                  {item.pickup_area ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
                      <MapPin size={12} />
                      {item.pickup_area}
                    </span>
                  ) : null}
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
                    <Package2 size={12} />
                    {images.length} image{images.length === 1 ? "" : "s"}
                  </span>
                </div>
              </div>
            </div>
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
