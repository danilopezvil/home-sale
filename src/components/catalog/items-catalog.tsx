"use client";

import { useEffect, useMemo, useState } from "react";
import { Package2, SearchX, SlidersHorizontal } from "lucide-react";

import type { Dictionary } from "@/lib/i18n";

import { CatalogToolbar } from "./catalog-toolbar";
import { CategoryChips } from "./category-chips";
import { ProductCard } from "./product-card";
import type { CatalogItem, SortOption, ViewMode } from "./types";

type ItemsCatalogProps = {
  items: CatalogItem[];
  t: Dictionary;
  initialCategory?: string;
  initialSort?: SortOption;
};

const VIEW_STORAGE_KEY = "catalog-view-mode";

function getCategoryLabel(categories: Dictionary["categories"], key: string): string {
  return (categories as Record<string, string>)[key] ?? key;
}

export function ItemsCatalog({ items, t, initialCategory = "", initialSort = "newest" }: ItemsCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSort, setSelectedSort] = useState<SortOption>(initialSort);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(VIEW_STORAGE_KEY);
    if (saved === "grid" || saved === "list") {
      setViewMode(saved);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(VIEW_STORAGE_KEY, viewMode);
  }, [viewMode]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchTerm(searchInput.trim().toLowerCase());
    }, 250);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const categoryCounts = useMemo(() => {
    return items.reduce<Record<string, number>>((acc, item) => {
      const key = item.category ?? "other";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
  }, [items]);

  const processedItems = useMemo(() => {
    let next = [...items];

    if (selectedCategory) {
      next = next.filter((item) => item.category === selectedCategory);
    }

    if (searchTerm) {
      next = next.filter((item) => {
        const haystack = `${item.title} ${item.description ?? ""} ${item.category ?? ""} ${item.category ? getCategoryLabel(t.categories, item.category) : ""}`.toLowerCase();
        return haystack.includes(searchTerm);
      });
    }

    if (selectedSort === "price_asc") {
      next.sort((a, b) => a.price - b.price);
    } else if (selectedSort === "price_desc") {
      next.sort((a, b) => b.price - a.price);
    } else {
      next.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return next;
  }, [items, selectedCategory, searchTerm, selectedSort, t.categories]);

  const hasFilters = Boolean(selectedCategory || searchTerm || selectedSort !== "newest");

  function clearFilters() {
    setSelectedCategory("");
    setSearchInput("");
    setSearchTerm("");
    setSelectedSort("newest");
  }

  return (
    <section className="space-y-5">
      <CatalogToolbar
        title={t.items.pageTitle}
        countLabel={`${processedItems.length} ${t.nav.items.toLowerCase()}`}
        summaryLabel="Explora los artículos por categoría, filtra por precio y cambia entre cuadrícula o lista."
        searchPlaceholder={t.items.searchPlaceholder}
        sortLabel={t.items.sortLabel}
        sortNewestLabel={t.items.sort.newest}
        sortPriceAscLabel={t.items.sort.priceAsc}
        sortPriceDescLabel={t.items.sort.priceDesc}
        filtersLabel={t.items.filtersLabel}
        gridLabel={t.items.gridLabel}
        listLabel={t.items.listLabel}
        searchValue={searchInput}
        selectedSort={selectedSort}
        viewMode={viewMode}
        filtersOpen={filtersOpen}
        onSearchChange={setSearchInput}
        onSortChange={setSelectedSort}
        onViewChange={setViewMode}
        onToggleFilters={() => setFiltersOpen((prev) => !prev)}
      />

      <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)] xl:items-start">
        <aside className={`${filtersOpen ? "block" : "hidden"} space-y-4 xl:sticky xl:top-28 xl:block`}>
          <section className="surface section-pad">
            <div className="flex items-center justify-between gap-3 border-b border-stone-200 pb-4">
              <div>
                <p className="eyebrow">Filters</p>
                <p className="mt-1 text-sm text-stone-500">Ajusta la vista con menos ruido visual.</p>
              </div>
              <SlidersHorizontal size={16} className="text-stone-400" />
            </div>

            <div className="mt-4 rounded-2xl border border-stone-200 bg-[hsl(var(--surface-muted))] p-4">
              <p className="data-label">Categories</p>
              <div className="mt-3">
                <CategoryChips
                  selectedCategory={selectedCategory}
                  categories={t.categories}
                  allLabel={t.items.filterAll}
                  counts={categoryCounts}
                  onSelectCategory={setSelectedCategory}
                />
              </div>
            </div>
          </section>
        </aside>

        <div className="space-y-4">
          {hasFilters && (
            <div className="surface-muted flex flex-wrap items-center gap-2 px-4 py-3 text-xs">
              <span className="font-medium text-stone-500">{t.items.activeFilters}</span>
              {selectedCategory ? (
                <span className="badge">{getCategoryLabel(t.categories, selectedCategory)}</span>
              ) : null}
              {searchTerm ? <span className="badge">“{searchTerm}”</span> : null}
              {selectedSort !== "newest" ? (
                <span className="badge">{selectedSort === "price_asc" ? t.items.sort.priceAsc : t.items.sort.priceDesc}</span>
              ) : null}
              <button type="button" onClick={clearFilters} className="btn-ghost px-2 py-1 text-xs font-semibold">
                {t.items.clearFilters}
              </button>
            </div>
          )}

          {processedItems.length === 0 ? (
            <div className="empty-state">
              {hasFilters ? <SearchX size={30} className="text-stone-300" /> : <Package2 size={30} className="text-stone-300" />}
              <p className="mt-4 text-base font-semibold text-stone-800">
                {hasFilters ? t.items.emptyFiltered.heading : t.items.empty.heading}
              </p>
              <p className="mt-1 max-w-md text-sm text-stone-500">
                {hasFilters ? t.items.emptyFiltered.subtitle : t.items.empty.subtitle}
              </p>
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 gap-4 min-[620px]:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
                  : "grid grid-cols-1 gap-3"
              }
            >
              {processedItems.map((item) => (
                <ProductCard
                  key={item.id}
                  item={item}
                  categories={t.categories}
                  conditionText={t.items.condition}
                  newBadgeLabel={t.items.newBadge}
                  freeLabel={t.items.free}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
