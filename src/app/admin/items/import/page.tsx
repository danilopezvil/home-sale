import Link from "next/link";
import { FileJson } from "lucide-react";

import { requireAdminUser } from "@/lib/admin-auth";
import { getTranslations } from "@/lib/i18n";
import { ImportForm } from "./import-form";

export default async function ImportItemsPage() {
  await requireAdminUser("/admin/items/import");
  const t = await getTranslations();

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <FileJson size={22} className="text-orange-400" />
          <div>
            <h1 className="text-2xl font-bold text-stone-900">
              {t.importItems.heading}
            </h1>
            <p className="text-sm text-stone-500">{t.importItems.subtitle}</p>
          </div>
        </div>
      </header>

      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <ImportForm t={t.importItems} />
      </div>

      <Link
        href="/admin/items"
        className="inline-block text-sm text-stone-500 transition hover:text-stone-800"
      >
        {t.importItems.back}
      </Link>
    </section>
  );
}
