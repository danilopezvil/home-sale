import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { getCategoryMeta } from "@/lib/category-meta";
import { getTranslations } from "@/lib/i18n";
import { supabaseServerAnonClient } from "@/lib/supabase/server";

type HomeItemRow = {
  id: string;
  title: string;
  price: number | string;
  category: string | null;
  created_at: string;
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const heroStats = [
  { label: "Ítems Únicos", value: "12k+" },
  { label: "Satisfacción", value: "98%" },
  { label: "Ventas Exitosas", value: "45k" },
  { label: "Soporte Concierge", value: "24h" },
] as const;

function getCategoryLabel(
  categories: Record<string, string>,
  key: string | null | undefined,
) {
  if (!key) return categories.other ?? "Other";
  return categories[key] ?? key;
}

export default async function Home() {
  const t = await getTranslations();

  let availableCount = 0;
  let latestItems: HomeItemRow[] = [];
  let categoryCounts: Record<string, number> = {};

  try {
    const [{ data, error, count }, { data: categoriesData, error: categoriesError }] = await Promise.all([
      supabaseServerAnonClient
        .from("items")
        .select("id, title, price, category, created_at", { count: "exact" })
        .eq("status", "available")
        .order("created_at", { ascending: false })
        .limit(8),
      supabaseServerAnonClient
        .from("items")
        .select("category")
        .eq("status", "available"),
    ]);

    if (error) {
      console.error("Failed to load homepage inventory.", error);
    } else {
      availableCount = count ?? 0;
      latestItems = (data ?? []) as HomeItemRow[];
    }

    if (categoriesError) {
      console.error("Failed to load category counts.", categoriesError);
    } else {
      categoryCounts = (categoriesData ?? []).reduce<Record<string, number>>((acc, row) => {
        const key = row.category ?? "other";
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      }, {});
    }
  } catch (error) {
    console.error("Unexpected error while loading homepage inventory.", error);
  }

  const featuredCategories = t.home.categories.slice(0, 3);
  const highlightedItems = latestItems.slice(0, 4);

  return (
    <div className="space-y-10 pb-8">
      <section className="relative overflow-hidden rounded-3xl border border-sky-100 bg-gradient-to-br from-cyan-50 via-white to-sky-100 px-6 py-12 shadow-sm sm:px-10 sm:py-16 lg:px-14">
        <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-sky-200/35 blur-3xl" />
        <div className="absolute -bottom-12 -left-10 h-48 w-48 rounded-full bg-blue-200/30 blur-3xl" />

        <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
              <Sparkles size={14} />
              Elegancia Circular
            </p>
            <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Objetos con historia, curados para tu hogar.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Transformamos el mercado de segunda mano en una experiencia premium. Cada pieza se publica con
              detalle, precio claro y reserva en minutos.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/items" className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700">
                Explorar Catálogo
                <ArrowRight size={16} />
              </Link>
              <Link href="/items?sort=newest" className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                Recién llegados
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Top of the queue</p>
            <p className="mt-1 text-sm text-slate-600">Listado real de artículos disponibles ahora mismo.</p>
            <div className="mt-4 space-y-3">
              {highlightedItems.length > 0 ? (
                highlightedItems.map((item) => (
                  <Link
                    key={item.id}
                    href={`/items/${item.id}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white p-3 transition hover:border-sky-200 hover:shadow-sm"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-slate-900">{item.title}</span>
                      <span className="mt-0.5 block text-xs text-slate-500">
                        {getCategoryLabel(t.categories as Record<string, string>, item.category)}
                      </span>
                    </span>
                    <span className="text-sm font-bold text-sky-700">
                      {Number(item.price) === 0 ? t.items.free : currency.format(Number(item.price))}
                    </span>
                  </Link>
                ))
              ) : (
                <p className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
                  Aún no hay publicaciones. ¡Vuelve en unos minutos!
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
      
      <section className="surface section-pad">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <p className="eyebrow">Navegación Selecta</p>
            <h2 className="section-title mt-2">Categorías destacadas</h2>
          </div>
          <Link href="/items" className="btn-ghost inline-flex items-center gap-2">
            Ver todas
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {featuredCategories.map((category) => (
            <Link
              key={category.label}
              href={category.key ? `/items?category=${category.key}` : "/items"}
              className="group rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md"
            >
              <div className="text-3xl">{category.emoji}</div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">{category.label}</h3>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                {categoryCounts[category.key || "other"] ?? 0} artículos
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="surface section-pad">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <p className="eyebrow">Recién llegados</p>
            <h2 className="section-title mt-2">Top of the Queue</h2>
            <p className="section-copy mt-2">{availableCount} {t.home.inventoryLabel} disponibles para reservar.</p>
          </div>
          <Link href="/items?sort=newest" className="btn-secondary">Ver inventario completo</Link>
        </div>

        {latestItems.length > 0 ? (
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {latestItems.map((item) => (
              <Link
                key={item.id}
                href={`/items/${item.id}`}
                className="group rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-2xl">
                  {getCategoryMeta(item.category).emoji}
                </div>
                <h3 className="mt-4 line-clamp-2 text-sm font-semibold text-slate-900 group-hover:text-sky-700">{item.title}</h3>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <p className="text-base font-black text-slate-900">
                    {Number(item.price) === 0 ? t.items.free : currency.format(Number(item.price))}
                  </p>
                  <span className="text-xs uppercase tracking-[0.18em] text-slate-500">ver detalle</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state mt-5">
            <p className="text-sm text-slate-500">Aún no hay artículos publicados en este momento.</p>
          </div>
        )}
      </section>
    </div>
  );
}
