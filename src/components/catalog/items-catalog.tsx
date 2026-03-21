"use client";

import { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal, Package2 } from "lucide-react";

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
    <section className="space-y-4">
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

      <div className={`${filtersOpen ? "block" : "hidden"} surface section-pad sm:block`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow">Filters</p>
            <p className="mt-1 text-sm text-stone-500">Trim the list to what matters and scan faster.</p>
          </div>
          <div className="inline-flex items-center gap-2 text-sm text-stone-500">
            <SlidersHorizontal size={15} />
            Category view
          </div>
        </div>
        <div className="mt-4">
          <CategoryChips
            selectedCategory={selectedCategory}
            categories={t.categories}
            allLabel={t.items.filterAll}
            onSelectCategory={setSelectedCategory}
          />
        </div>
      </div>

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
          <Package2 size={30} className="text-stone-300" />
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
              ? "grid grid-cols-1 gap-4 min-[520px]:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
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
