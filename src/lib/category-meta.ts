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

export const CATEGORY_META: Record<string, { label: string; emoji: string }> = {
  furniture:   { label: "Furniture",   emoji: "🛋️" },
  kitchen:     { label: "Kitchen",     emoji: "🍳" },
  living_room: { label: "Living Room", emoji: "📺" },
  bedroom:     { label: "Bedroom",     emoji: "🛏️" },
  books:       { label: "Books",       emoji: "📚" },
  electronics: { label: "Electronics", emoji: "💻" },
  clothing:    { label: "Clothing",    emoji: "👕" },
  outdoor:     { label: "Outdoor",     emoji: "🌳" },
  tools:       { label: "Tools",       emoji: "🔧" },
  decor:       { label: "Decor",       emoji: "✨" },
  other:       { label: "Other",       emoji: "📦" },
};

export function getCategoryMeta(key: string | null | undefined) {
  if (!key) return { label: "Other", emoji: "📦" };
  return CATEGORY_META[key] ?? { label: key, emoji: "📦" };
}
