export type CatalogItem = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  category: string | null;
  condition: string;
  createdAt: string;
  imageUrl: string | null;
};

export type SortOption = "newest" | "price_asc" | "price_desc";
export type ViewMode = "grid" | "list";
