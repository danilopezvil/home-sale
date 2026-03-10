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
    <section className="mb-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-stone-900 sm:text-xl">{title}</h1>
          <p className="text-xs text-stone-500 sm:text-sm">{countLabel}</p>
        </div>
        <button
          type="button"
          onClick={onToggleFilters}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition sm:hidden ${
            filtersOpen
              ? "border-orange-500 bg-orange-50 text-orange-700"
              : "border-stone-200 text-stone-600"
          }`}
        >
          <Filter size={14} />
          {filtersLabel}
        </button>
      </div>

      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_150px_auto] sm:items-center">
        <label className="relative block">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
          />
          <input
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50 pl-9 pr-3 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-orange-300 focus:bg-white"
          />
        </label>

        <label className="relative block">
          <ArrowUpDown
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
          />
          <select
            value={selectedSort}
            onChange={(event) => onSortChange(event.target.value as SortOption)}
            aria-label={sortLabel}
            className="h-10 w-full appearance-none rounded-lg border border-stone-200 bg-white pl-9 pr-8 text-sm text-stone-700 outline-none transition focus:border-orange-300"
          >
            <option value="newest">{sortNewestLabel}</option>
            <option value="price_asc">{sortPriceAscLabel}</option>
            <option value="price_desc">{sortPriceDescLabel}</option>
          </select>
        </label>

        <div className="inline-flex h-10 items-center rounded-lg border border-stone-200 p-1">
          <button
            type="button"
            onClick={() => onViewChange("grid")}
            className={`inline-flex h-full items-center gap-1 rounded-md px-2.5 text-xs font-medium transition ${
              viewMode === "grid" ? "bg-orange-500 text-white" : "text-stone-600"
            }`}
          >
            <LayoutGrid size={14} /> {gridLabel}
          </button>
          <button
            type="button"
            onClick={() => onViewChange("list")}
            className={`inline-flex h-full items-center gap-1 rounded-md px-2.5 text-xs font-medium transition ${
              viewMode === "list" ? "bg-orange-500 text-white" : "text-stone-600"
            }`}
          >
            <Rows3 size={14} /> {listLabel}
          </button>
        </div>
      </div>
    </section>
  );
}
