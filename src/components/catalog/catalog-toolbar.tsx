import { ArrowUpDown, Filter, LayoutGrid, Rows3, Search } from "lucide-react";

import type { SortOption, ViewMode } from "./types";

type CatalogToolbarProps = {
  title: string;
  countLabel: string;
  searchPlaceholder: string;
  sortLabel: string;
  sortNewestLabel: string;
  sortPriceAscLabel: string;
  sortPriceDescLabel: string;
  filtersLabel: string;
  gridLabel: string;
  listLabel: string;
  searchValue: string;
  selectedSort: SortOption;
  viewMode: ViewMode;
  filtersOpen: boolean;
  onSearchChange: (value: string) => void;
  onSortChange: (value: SortOption) => void;
  onViewChange: (value: ViewMode) => void;
  onToggleFilters: () => void;
};

export function CatalogToolbar({
  title,
  countLabel,
  searchPlaceholder,
  sortLabel,
  sortNewestLabel,
  sortPriceAscLabel,
  sortPriceDescLabel,
  filtersLabel,
  gridLabel,
  listLabel,
  searchValue,
  selectedSort,
  viewMode,
  filtersOpen,
  onSearchChange,
  onSortChange,
  onViewChange,
  onToggleFilters,
}: CatalogToolbarProps) {
  return (
    <section className="surface section-pad">
      <div className="flex flex-col gap-4 border-b border-stone-200 pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">Inventory</p>
          <h1 className="section-title mt-2">{title}</h1>
          <p className="section-copy mt-2">{countLabel}</p>
        </div>
        <button
          type="button"
          onClick={onToggleFilters}
          className={`sm:hidden ${filtersOpen ? "btn-primary" : "btn-secondary"}`}
        >
          <Filter size={15} />
          {filtersLabel}
        </button>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1fr)_190px_auto] xl:items-center">
        <label className="relative block">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
          />
          <input
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="input-base pl-10"
          />
        </label>

        <label className="relative block">
          <ArrowUpDown
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
          />
          <select
            value={selectedSort}
            onChange={(event) => onSortChange(event.target.value as SortOption)}
            aria-label={sortLabel}
            className="select-base appearance-none pl-10 pr-8"
          >
            <option value="newest">{sortNewestLabel}</option>
            <option value="price_asc">{sortPriceAscLabel}</option>
            <option value="price_desc">{sortPriceDescLabel}</option>
          </select>
        </label>

        <div className="inline-flex h-11 items-center rounded-2xl border border-stone-200 bg-stone-50 p-1">
          <button
            type="button"
            onClick={() => onViewChange("grid")}
            className={`inline-flex h-full items-center gap-2 rounded-xl px-3 text-sm font-medium transition ${
              viewMode === "grid" ? "bg-white text-stone-950 shadow-sm" : "text-stone-500 hover:text-stone-900"
            }`}
          >
            <LayoutGrid size={15} /> {gridLabel}
          </button>
          <button
            type="button"
            onClick={() => onViewChange("list")}
            className={`inline-flex h-full items-center gap-2 rounded-xl px-3 text-sm font-medium transition ${
              viewMode === "list" ? "bg-white text-stone-950 shadow-sm" : "text-stone-500 hover:text-stone-900"
            }`}
          >
            <Rows3 size={15} /> {listLabel}
          </button>
        </div>
      </div>
    </section>
  );
}
