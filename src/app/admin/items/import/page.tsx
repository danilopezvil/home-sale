import Link from "next/link";
import { FileJson, ArrowLeft } from "lucide-react";

import { requireAdminUser } from "@/lib/admin-auth";
import { getTranslations } from "@/lib/i18n";
import { ImportForm } from "./import-form";

export default async function ImportItemsPage() {
  await requireAdminUser("/admin/items/import");
  const t = await getTranslations();

  return (
    <section className="space-y-5">
      <header className="surface section-pad">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">Admin / import</p>
            <h1 className="section-title mt-2 flex items-center gap-3">
              <FileJson size={24} className="text-stone-500" />
              {t.importItems.heading}
            </h1>
            <p className="section-copy mt-2 max-w-3xl">{t.importItems.subtitle}</p>
          </div>
          <Link href="/admin/items" className="btn-secondary h-11">
            <ArrowLeft size={15} />
            {t.importItems.back}
          </Link>
        </div>
      </header>

      <div className="admin-grid xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="admin-panel section-pad">
          <ImportForm t={t.importItems} />
        </div>

        <aside className="admin-panel section-pad">
          <p className="eyebrow">Import checklist</p>
          <div className="mt-4 space-y-3 text-sm text-stone-600">
            <div className="admin-metric">
              <p className="font-semibold text-stone-900">Use factual fields</p>
              <p className="mt-1">Title, price, category, condition and pickup area should be complete before import.</p>
            </div>
            <div className="admin-metric">
              <p className="font-semibold text-stone-900">Batch carefully</p>
              <p className="mt-1">Smaller batches make validation errors easier to isolate and fix.</p>
            </div>
            <div className="admin-metric">
              <p className="font-semibold text-stone-900">Review after publish</p>
              <p className="mt-1">Open the inventory table immediately after import to confirm titles and status.</p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
