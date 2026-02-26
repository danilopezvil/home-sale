import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { getTranslations } from "@/lib/i18n";

export default async function Home() {
  const t = await getTranslations();

  return (
    <section className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-6xl">🏠</div>
      <h1 className="mt-4 text-4xl font-bold text-stone-900">
        {t.home.heading}
      </h1>
      <p className="mt-3 max-w-md text-base text-stone-500">
        {t.home.subtitle}
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/items"
          className="flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 active:scale-95"
        >
          {t.home.browse}
          <ArrowRight size={16} />
        </Link>
        <Link
          href="/items?sort=newest"
          className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-6 py-3 text-sm font-semibold text-stone-700 shadow-sm transition hover:border-stone-300 hover:bg-stone-50"
        >
          <Sparkles size={16} className="text-orange-400" />
          {t.home.whatsNew}
        </Link>
      </div>

      <div className="mt-16 grid grid-cols-3 gap-6 text-center text-sm sm:grid-cols-3">
        {t.home.categories.map(({ emoji, label, key }) => (
          <Link
            key={label}
            href={key ? `/items?category=${key}` : "/items"}
            className="flex flex-col items-center gap-2 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition hover:border-orange-200 hover:shadow-md"
          >
            <span className="text-3xl">{emoji}</span>
            <span className="font-medium text-stone-700">{label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
