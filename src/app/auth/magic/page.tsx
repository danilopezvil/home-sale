import { Suspense } from "react";

import { getTranslations } from "@/lib/i18n";
import { MagicConfirm } from "./magic-confirm";

export default async function MagicPage() {
  const t = await getTranslations();

  return (
    <Suspense
      fallback={
        <section className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-slate-600">{t.magic.signingIn}</p>
        </section>
      }
    >
      <MagicConfirm signingIn={t.magic.signingIn} />
    </Suspense>
  );
}
