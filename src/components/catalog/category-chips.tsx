import { getCategoryMeta, categoryValues } from "@/lib/category-meta";
import type { Dictionary } from "@/lib/i18n";

type CategoryChipsProps = {
  selectedCategory: string;
  categories: Dictionary["categories"];
  allLabel: string;
  onSelectCategory: (category: string) => void;
};

function getCatLabel(categories: Dictionary["categories"], key: string | null | undefined): string {
  if (!key) return categories.other;
  return (categories as Record<string, string>)[key] ?? key;
}

export function CategoryChips({
  selectedCategory,
  categories,
  allLabel,
  onSelectCategory,
}: CategoryChipsProps) {
  return (
    <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1 lg:flex-wrap">
      <button
        type="button"
        onClick={() => onSelectCategory("")}
        className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition ${
          !selectedCategory
            ? "border-orange-500 bg-orange-500 text-white"
            : "border-stone-200 bg-white text-stone-600 hover:border-orange-200 hover:text-orange-600"
        }`}
      >
        {allLabel}
      </button>
      {categoryValues.map((key) => {
        const meta = getCategoryMeta(key);
        const active = selectedCategory === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelectCategory(key)}
            className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              active
                ? "border-orange-500 bg-orange-500 text-white"
                : "border-stone-200 bg-white text-stone-600 hover:border-orange-200 hover:text-orange-600"
            }`}
          >
            {meta.emoji} {getCatLabel(categories, key)}
          </button>
        );
      })}
    </div>
  );
}
