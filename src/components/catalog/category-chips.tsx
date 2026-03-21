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
  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
      <button
        type="button"
        onClick={() => onSelectCategory("")}
        className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition ${
          !selectedCategory
            ? "border-stone-950 bg-stone-950 text-white"
            : "border-stone-200 bg-white/80 text-stone-700 hover:border-stone-300 hover:bg-white"
        }`}
      >
        <span className="min-w-0">
          <span className="block text-sm font-semibold">{allLabel}</span>
          <span className={`mt-0.5 block text-xs ${!selectedCategory ? "text-white/75" : "text-stone-500"}`}>
            Entire sale
          </span>
        </span>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${!selectedCategory ? "bg-white/12 text-white" : "bg-stone-100 text-stone-600"}`}>
          {Object.values(counts ?? {}).reduce((sum, value) => sum + value, 0)}
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
            className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition ${
              active
                ? "border-stone-950 bg-stone-950 text-white"
                : "border-stone-200 bg-white/80 text-stone-700 hover:border-stone-300 hover:bg-white"
            }`}
          >
            <span className="min-w-0">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <span>{meta.emoji}</span>
                <span>{getCatLabel(categories, key)}</span>
              </span>
              <span className={`mt-0.5 block text-xs ${active ? "text-white/75" : "text-stone-500"}`}>
                {count === 1 ? "1 item" : `${count} items`}
              </span>
            </span>
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${active ? "bg-white/12 text-white" : "bg-stone-100 text-stone-600"}`}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
