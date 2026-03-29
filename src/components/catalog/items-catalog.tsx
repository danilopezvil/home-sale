"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import type { Dictionary } from "@/lib/i18n";

import { ProductCard } from "./product-card";
import type { CatalogItem, SortOption } from "./types";

type ItemsCatalogProps = {
  items: CatalogItem[];
  t: Dictionary;
  initialCategory?: string;
  initialSort?: SortOption;
};

const PAGE_SIZE = 6;

function getCategoryLabel(categories: Dictionary["categories"], key: string) {
  return (categories as Record<string, string>)[key] ?? key;
}

export function ItemsCatalog({ items, t, initialCategory = "", initialSort = "newest" }: ItemsCatalogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategory ? [initialCategory] : []);
  const [selectedSort, setSelectedSort] = useState<SortOption>(initialSort);
  const [currentPage, setCurrentPage] = useState(1);

  const categories = useMemo(() => {
    const keys = new Set<string>();
    items.forEach((item) => {
      if (item.category) {
        keys.add(item.category);
      }
    });
    return [...keys];
  }, [items]);

  const filteredItems = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    const min = minPrice === "" ? null : Number(minPrice);
    const max = maxPrice === "" ? null : Number(maxPrice);

    const next = items
      .filter((item) => {
        if (selectedCategories.length > 0 && !selectedCategories.includes(item.category ?? "")) {
          return false;
        }

        if (search) {
          const haystack = `${item.title} ${item.description ?? ""} ${item.category ?? ""}`.toLowerCase();
          if (!haystack.includes(search)) {
            return false;
          }
        }

        if (min !== null && item.price < min) {
          return false;
        }

        if (max !== null && item.price > max) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (selectedSort === "price_asc") return a.price - b.price;
        if (selectedSort === "price_desc") return b.price - a.price;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

    return next;
  }, [items, maxPrice, minPrice, searchTerm, selectedCategories, selectedSort]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, page]);

  function onToggleCategory(category: string) {
    setCurrentPage(1);
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((item) => item !== category) : [...prev, category],
    );
  }

  function onApplyFilters() {
    setCurrentPage(1);
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] px-2 sm:px-4">
      <section className="grid gap-8 md:grid-cols-[280px_minmax(0,1fr)] md:items-start">
        <aside className="space-y-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <section>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Search</h3>
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none ring-sky-200 focus:ring"
                placeholder={t.items.searchPlaceholder}
              />
            </label>
          </section>

          <section>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Price Range</h3>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={minPrice}
                onChange={(event) => setMinPrice(event.target.value)}
                className="w-full rounded border border-slate-200 p-2 text-sm outline-none ring-sky-200 focus:ring"
                placeholder="Min"
              />
              <span className="text-slate-300">—</span>
              <input
                type="number"
                value={maxPrice}
                onChange={(event) => setMaxPrice(event.target.value)}
                className="w-full rounded border border-slate-200 p-2 text-sm outline-none ring-sky-200 focus:ring"
                placeholder="Max"
              />
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Categories</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <label key={category} className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => onToggleCategory(category)}
                    className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-600"
                  />
                  {getCategoryLabel(t.categories, category)}
                </label>
              ))}
            </div>
          </section>

          <button
            type="button"
            onClick={onApplyFilters}
            className="w-full rounded-lg bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Apply Filters
          </button>
        </aside>

        <section>
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Article Catalog</h1>
              <p className="mt-1 text-slate-500">Showing {filteredItems.length} high-quality items for your home.</p>
            </div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <span>Sort by:</span>
              <select
                value={selectedSort}
                onChange={(event) => {
                  setSelectedSort(event.target.value as SortOption);
                  setCurrentPage(1);
                }}
                className="rounded border border-slate-200 bg-white px-2 py-1.5 text-sm font-semibold text-slate-900"
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </label>
          </div>

          {paginatedItems.length === 0 ? (
            <div className="empty-state">
              <p className="text-base font-semibold text-slate-800">{t.items.emptyFiltered.heading}</p>
              <p className="mt-1 text-sm text-slate-500">{t.items.emptyFiltered.subtitle}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {paginatedItems.map((item) => (
                  <ProductCard
                    key={item.id}
                    item={item}
                    categories={t.categories}
                    conditionText={t.items.condition}
                    freeLabel={t.items.free}
                  />
                ))}
              </div>

              <div className="mt-10 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  className="h-9 w-9 rounded-lg border border-slate-200 text-sm text-slate-500 disabled:opacity-40"
                  disabled={page === 1}
                >
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, idx) => idx + 1).slice(0, 6).map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`h-9 w-9 rounded-lg border text-sm font-semibold ${
                      pageNumber === page
                        ? "border-sky-600 bg-sky-600 text-white"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  className="h-9 w-9 rounded-lg border border-slate-200 text-sm text-slate-500 disabled:opacity-40"
                  disabled={page === totalPages}
                >
                  ›
                </button>
              </div>
            </>
          )}
        </section>
      </section>
    </div>
  );
}
