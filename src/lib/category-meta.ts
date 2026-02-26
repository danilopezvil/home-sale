export const categoryValues = [
  "furniture",
  "kitchen",
  "living_room",
  "bedroom",
  "books",
  "electronics",
  "clothing",
  "outdoor",
  "tools",
  "decor",
  "other",
] as const;

export const CATEGORY_META: Record<string, { emoji: string }> = {
  furniture:   { emoji: "🛋️" },
  kitchen:     { emoji: "🍳" },
  living_room: { emoji: "📺" },
  bedroom:     { emoji: "🛏️" },
  books:       { emoji: "📚" },
  electronics: { emoji: "💻" },
  clothing:    { emoji: "👕" },
  outdoor:     { emoji: "🌳" },
  tools:       { emoji: "🔧" },
  decor:       { emoji: "✨" },
  other:       { emoji: "📦" },
};

export function getCategoryMeta(key: string | null | undefined): { emoji: string } {
  if (!key) return { emoji: "📦" };
  return CATEGORY_META[key] ?? { emoji: "📦" };
}
