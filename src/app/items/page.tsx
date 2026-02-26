import Link from "next/link";
import { ArrowRight, PackageOpen } from "lucide-react";

import { supabaseServerAnonClient } from "@/lib/supabase/server";
import { getCategoryMeta } from "@/lib/category-meta";

type ItemListRow = {
  id: string;
  title: string;
  price: number | string;
  category: string | null;
  condition: string;
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const CONDITION_LABEL: Record<string, string> = {
  new:      "New",
  like_new: "Like New",
  good:     "Good",
  fair:     "Fair",
  parts:    "For Parts",
};

const CONDITION_COLOR: Record<string, string> = {
  new:      "bg-emerald-100 text-emerald-700",
  like_new: "bg-teal-100 text-teal-700",
  good:     "bg-sky-100 text-sky-700",
  fair:     "bg-amber-100 text-amber-700",
  parts:    "bg-stone-100 text-stone-600",
};

export default async function ItemsPage() {
  let items: ItemListRow[] = [];
  let loadError = false;

  try {
    const { data, error } = await supabaseServerAnonClient
      .from("items")
      .select("id, title, price, category, condition")
      .eq("status", "available")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to load available items.", error);
      loadError = true;
    } else {
      items = (data ?? []) as ItemListRow[];
    }
  } catch (err) {
    console.error("Unexpected error while loading available items.", err);
    loadError = true;
  }

  if (loadError) {
    return (
      <section className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-2xl">😬</p>
        <p className="mt-2 font-semibold text-red-800">Something went wrong</p>
        <p className="mt-1 text-sm text-red-600">
          Couldn&apos;t load items right now. Please try again later.
        </p>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white py-20 text-center">
        <PackageOpen size={40} className="text-stone-300" />
        <p className="mt-4 font-semibold text-stone-700">Nothing here yet</p>
        <p className="mt-1 text-sm text-stone-500">Check back soon — more items are on the way!</p>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-6 flex items-baseline justify-between">
        <h1 className="text-2xl font-bold text-stone-900">
          Available items{" "}
          <span className="ml-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-sm font-semibold text-orange-600">
            {items.length}
          </span>
        </h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const cat = getCategoryMeta(item.category);
          const condLabel = CONDITION_LABEL[item.condition] ?? item.condition;
          const condColor = CONDITION_COLOR[item.condition] ?? "bg-stone-100 text-stone-600";
          const price = Number(item.price);

          return (
            <Link
              key={item.id}
              href={`/items/${item.id}`}
              className="group flex flex-col rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-orange-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-2xl">{cat.emoji}</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${condColor}`}
                >
                  {condLabel}
                </span>
              </div>

              <h2 className="mt-3 font-semibold text-stone-900 transition group-hover:text-orange-600">
                {item.title}
              </h2>

              <p className="mt-0.5 text-xs text-stone-500">{cat.label}</p>

              <div className="mt-auto flex items-center justify-between pt-4">
                <p className="text-lg font-bold text-stone-900">
                  {price === 0 ? (
                    <span className="text-emerald-600">Free!</span>
                  ) : (
                    currency.format(price)
                  )}
                </p>
                <ArrowRight
                  size={16}
                  className="text-stone-300 transition group-hover:translate-x-1 group-hover:text-orange-400"
                />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
