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

export default async function ItemsPage() {
  const t = await getTranslations();

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
      <section className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-2xl">😬</p>
        <p className="mt-2 font-semibold text-red-800">{t.items.error.heading}</p>
        <p className="mt-1 text-sm text-red-600">{t.items.error.subtitle}</p>
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

  return <ItemsCatalog items={parsedItems} t={t} />;
}
