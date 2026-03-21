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
        className={`chip shrink-0 whitespace-nowrap ${!selectedCategory ? "chip-active" : "hover:border-stone-300 hover:text-stone-900"}`}
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
            className={`chip shrink-0 whitespace-nowrap ${active ? "chip-active" : "hover:border-stone-300 hover:text-stone-900"}`}
          >
            <span>{meta.emoji}</span>
            {getCatLabel(categories, key)}
          </button>
        );
      })}
    </div>
  );
}
