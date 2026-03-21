import { ItemsCatalog } from "@/components/catalog/items-catalog";
import { supabaseServerAnonClient } from "@/lib/supabase/server";
import { getTranslations } from "@/lib/i18n";

type ItemListRow = {
  id: string;
  title: string;
  description: string | null;
  price: number | string;
  category: string | null;
  condition: string;
  created_at: string;
  item_images?: { image_url: string; sort_order: number }[];
};

type ItemsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const SORT_OPTIONS = new Set(["newest", "price_asc", "price_desc"]);

export default async function ItemsPage({ searchParams }: ItemsPageProps) {
  const t = await getTranslations();
  const params = (await searchParams) ?? {};

  let items: ItemListRow[] = [];
  let loadError = false;

  try {
    const { data, error } = await supabaseServerAnonClient
      .from("items")
      .select("id, title, description, price, category, condition, created_at, item_images(image_url, sort_order)")
      .eq("status", "available")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to load available items.", error);
      loadError = true;
    } else {
      items = (data ?? []) as ItemListRow[];
    }
  } catch (err) {
    console.error("Unexpected error while loading available items.", err);
    loadError = true;
  }

  if (loadError) {
    return (
      <section className="notice-danger text-center">
        <p className="text-base font-semibold">{t.items.error.heading}</p>
        <p className="mt-1 text-sm">{t.items.error.subtitle}</p>
      </section>
    );
  }

  const parsedItems = items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    price: Number(item.price),
    category: item.category,
    condition: item.condition,
    createdAt: item.created_at,
    imageUrl:
      item.item_images
        ?.slice()
        .sort((a, b) => a.sort_order - b.sort_order)[0]
        ?.image_url ?? null,
  }));

  const categoryParam = Array.isArray(params.category) ? params.category[0] : params.category;
  const sortParam = Array.isArray(params.sort) ? params.sort[0] : params.sort;
  const initialSort = sortParam && SORT_OPTIONS.has(sortParam) ? sortParam : "newest";

  return <ItemsCatalog items={parsedItems} t={t} initialCategory={categoryParam ?? ""} initialSort={initialSort as "newest" | "price_asc" | "price_desc"} />;
}
