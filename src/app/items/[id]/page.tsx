import Image from "next/image";
import { notFound } from "next/navigation";

import { supabaseServerAnonClient } from "@/lib/supabase/server";

type ItemDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type ItemRow = {
  id: string;
  title: string;
  description: string | null;
  price: number | string;
  category: string | null;
  condition: string;
  status: string;
};

type ItemImageRow = {
  id: string;
  image_url: string;
  sort_order?: number;
  display_order?: number;
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function formatWords(value: string | null | undefined) {
  if (!value) {
    return "N/A";
  }

  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function statusBadgeClasses(status: string) {
  if (status === "available") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "reserved") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (status === "sold") {
    return "border-slate-300 bg-slate-100 text-slate-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
}

async function getItemImages(itemId: string) {
  const bySortOrder = await supabaseServerAnonClient
    .from("item_images")
    .select("id, image_url, sort_order")
    .eq("item_id", itemId)
    .order("sort_order", { ascending: true });

  if (!bySortOrder.error) {
    return {
      images: (bySortOrder.data ?? []) as ItemImageRow[],
      error: null as string | null,
    };
  }

  const byDisplayOrder = await supabaseServerAnonClient
    .from("item_images")
    .select("id, image_url, display_order")
    .eq("item_id", itemId)
    .order("display_order", { ascending: true });

  if (!byDisplayOrder.error) {
    return {
      images: (byDisplayOrder.data ?? []) as ItemImageRow[],
      error: null as string | null,
    };
  }

  console.error("Failed to load item images.", {
    sortOrderError: bySortOrder.error,
    displayOrderError: byDisplayOrder.error,
  });

  return {
    images: [] as ItemImageRow[],
    error: "We couldn't load item images right now.",
  };
}

export default async function ItemDetailPage({ params }: ItemDetailPageProps) {
  const { id } = await params;

  try {
    const { data, error } = await supabaseServerAnonClient
      .from("items")
      .select("id, title, description, price, category, condition, status")
       .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Failed to load item.", error);

      return (
        <section className="rounded-lg border border-red-200 bg-red-50 p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-red-900">Item</h1>
          <p className="mt-2 text-red-700">We couldn&apos;t load this item right now. Please try again later.</p>
        </section>
      );
    }

    if (!data) {
      notFound();
    }

    const item = data as ItemRow;
    const { images, error: imageError } = await getItemImages(item.id);

    return (
      <article className="space-y-6">
        <section className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">{item.title}</h1>
              <p className="mt-2 text-slate-600">{item.description || "No description provided."}</p>
            </div>
            <span
              className={`inline-flex rounded-full border px-3 py-1 text-sm font-medium ${statusBadgeClasses(item.status)}`}
            >
              {formatWords(item.status)}
            </span>
          </div>

          {imageError ? (
            <p className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">{imageError}</p>
          ) : images.length === 0 ? (
            <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-600">
              No images available for this item.
            </div>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((image, index) => (
                <div key={image.id} className="relative aspect-[4/3] overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                  <Image
                    src={image.image_url}
                    alt={`${item.title} image ${index + 1}`}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
            <div className="rounded-md border border-slate-200 p-4">
              <dt className="text-slate-500">Price</dt>
              <dd className="mt-1 text-base font-medium text-slate-900">{currencyFormatter.format(Number(item.price))}</dd>
            </div>
            <div className="rounded-md border border-slate-200 p-4">
              <dt className="text-slate-500">Category</dt>
              <dd className="mt-1 text-base font-medium text-slate-900">{formatWords(item.category)}</dd>
            </div>
            <div className="rounded-md border border-slate-200 p-4">
              <dt className="text-slate-500">Condition</dt>
              <dd className="mt-1 text-base font-medium text-slate-900">{formatWords(item.condition)}</dd>
            </div>
            <div className="rounded-md border border-slate-200 p-4">
              <dt className="text-slate-500">Status</dt>
              <dd className="mt-1 text-base font-medium text-slate-900">{formatWords(item.status)}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Reserve</h2>
          <p className="mt-2 text-slate-600">
            Reservation form coming soon. Please check back later to submit your reservation request.
          </p>
        </section>
      </article>
    );
  } catch (error) {
    console.error("Unexpected error while loading item details.", error);

    return (
      <section className="rounded-lg border border-red-200 bg-red-50 p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-red-900">Item</h1>
        <p className="mt-2 text-red-700">We couldn&apos;t load this item right now. Please try again later.</p>
      </section>
    );
  }
}
