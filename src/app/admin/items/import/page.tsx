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
            <p className="section-copy mt-2">{t.importItems.subtitle}</p>
          </div>
          <Link href="/admin/items" className="btn-secondary">
            <ArrowLeft size={15} />
            {t.importItems.back}
          </Link>
        </div>
      </header>

      <div className="surface section-pad">
        <ImportForm t={t.importItems} />
      </div>
    </section>
  );
}
