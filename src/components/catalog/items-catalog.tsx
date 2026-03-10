"use client";

import { useEffect, useMemo, useState } from "react";

import type { Dictionary } from "@/lib/i18n";

import { CatalogToolbar } from "./catalog-toolbar";
import { CategoryChips } from "./category-chips";
import { ProductCard } from "./product-card";
import type { CatalogItem, SortOption, ViewMode } from "./types";

type ItemsCatalogProps = {
  items: CatalogItem[];
  t: Dictionary;
};

const VIEW_STORAGE_KEY = "catalog-view-mode";

function getCategoryLabel(categories: Dictionary["categories"], key: string): string {
  return (categories as Record<string, string>)[key] ?? key;
}

export function ItemsCatalog({ items, t }: ItemsCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSort, setSelectedSort] = useState<SortOption>("newest");
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

  const processedItems = useMemo(() => {
    let next = [...items];

    if (selectedCategory) {
      next = next.filter((item) => item.category === selectedCategory);
    }

    if (searchTerm) {
      next = next.filter((item) => {
        const haystack = `${item.title} ${item.category ?? ""} ${item.category ? getCategoryLabel(t.categories, item.category) : ""}`.toLowerCase();
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
    <section>
      <CatalogToolbar
        title={t.items.pageTitle}
        countLabel={`${processedItems.length} ${t.nav.items.toLowerCase()}`}
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

      <div className={`${filtersOpen ? "block" : "hidden"} mb-4 rounded-2xl border border-stone-200 bg-white p-3 shadow-sm sm:block`}>
        <CategoryChips
          selectedCategory={selectedCategory}
          categories={t.categories}
          allLabel={t.items.filterAll}
          onSelectCategory={setSelectedCategory}
        />
      </div>

      {hasFilters && (
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-stone-500">{t.items.activeFilters}</span>
          {selectedCategory ? (
            <span className="rounded-full bg-orange-50 px-2 py-1 text-orange-700">{getCategoryLabel(t.categories, selectedCategory)}</span>
          ) : null}
          {searchTerm ? <span className="rounded-full bg-orange-50 px-2 py-1 text-orange-700">“{searchTerm}”</span> : null}
          {selectedSort !== "newest" ? (
            <span className="rounded-full bg-orange-50 px-2 py-1 text-orange-700">{selectedSort === "price_asc" ? t.items.sort.priceAsc : t.items.sort.priceDesc}</span>
          ) : null}
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-full border border-stone-200 px-2 py-1 font-medium text-stone-600 transition hover:border-orange-200 hover:text-orange-600"
          >
            {t.items.clearFilters}
          </button>
        </div>
      )}

      {processedItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white py-20 text-center">
          <p className="text-3xl">📭</p>
          <p className="mt-4 font-semibold text-stone-700">{hasFilters ? t.items.emptyFiltered.heading : t.items.empty.heading}</p>
          <p className="mt-1 text-sm text-stone-500">{hasFilters ? t.items.emptyFiltered.subtitle : t.items.empty.subtitle}</p>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 gap-3 min-[460px]:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
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
    </section>
  );
}
