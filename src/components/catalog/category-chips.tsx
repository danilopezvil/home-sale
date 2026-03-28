import { getCategoryMeta, categoryValues } from "@/lib/category-meta";
import type { Dictionary } from "@/lib/i18n";

type CategoryChipsProps = {
  selectedCategory: string;
  categories: Dictionary["categories"];
  allLabel: string;
  counts?: Record<string, number>;
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
  counts,
  onSelectCategory,
}: CategoryChipsProps) {
  const totalCount = Object.values(counts ?? {}).reduce((sum, value) => sum + value, 0);

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onSelectCategory("")}
        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
          !selectedCategory
            ? "border-stone-950 bg-stone-950 text-white"
            : "border-stone-200 bg-white/80 text-stone-700 hover:border-stone-300 hover:bg-white"
        }`}
      >
        <span className="font-medium">{allLabel}</span>
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${!selectedCategory ? "bg-white/15 text-white" : "bg-stone-100 text-stone-600"}`}>
          {totalCount}
        </span>
      </button>

      {categoryValues.map((key) => {
        const meta = getCategoryMeta(key);
        const active = selectedCategory === key;
        const count = counts?.[key] ?? 0;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelectCategory(key)}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
              active
                ? "border-stone-950 bg-stone-950 text-white"
                : "border-stone-200 bg-white/80 text-stone-700 hover:border-stone-300 hover:bg-white"
            }`}
          >
            <span className="text-base leading-none">{meta.emoji}</span>
            <span className="font-medium">{getCatLabel(categories, key)}</span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${active ? "bg-white/15 text-white" : "bg-stone-100 text-stone-600"}`}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
