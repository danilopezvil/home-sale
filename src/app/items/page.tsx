import Link from "next/link";

import { supabaseServerAnonClient } from "@/lib/supabase/server";

type ItemListRow = {
  id: string;
  title: string;
  price: number | string;
  category: string;
  condition: string;
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function formatCondition(condition: string) {
  return condition
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default async function ItemsPage() {
  const { data, error } = await supabaseServerAnonClient
    .from("items")
    .select("id, title, price, category, condition")
    .eq("status", "available")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <section className="rounded-lg border border-red-200 bg-red-50 p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-red-900">Items</h1>
        <p className="mt-2 text-red-700">We couldn&apos;t load available items right now. Please try again later.</p>
      </section>
    );
  }

  const items = (data ?? []) as ItemListRow[];

  if (items.length === 0) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold">Items</h1>
        <p className="mt-2 text-slate-600">No items are currently available.</p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold">Items</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/items/${item.id}`}
            className="rounded-lg border border-slate-200 p-4 transition hover:border-slate-300 hover:shadow"
          >
            <h2 className="text-lg font-semibold text-slate-900">{item.title}</h2>
            <p className="mt-2 text-sm text-slate-600">Price: {currencyFormatter.format(Number(item.price))}</p>
            <p className="mt-1 text-sm text-slate-600">Category: {item.category}</p>
            <p className="mt-1 text-sm text-slate-600">Condition: {formatCondition(item.condition)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
