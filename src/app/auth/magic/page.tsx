import { Suspense } from "react";

import { getTranslations } from "@/lib/i18n";
import { MagicConfirm } from "./magic-confirm";

export default async function MagicPage() {
  const t = await getTranslations();

  return (
    <Suspense
      fallback={
        <section className="surface section-pad text-center">
          <p className="text-sm text-stone-600">{t.magic.signingIn}</p>
        </section>
      }
    >
      <MagicConfirm signingIn={t.magic.signingIn} />
    </Suspense>
  );
}
