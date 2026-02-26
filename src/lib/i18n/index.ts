import { cookies } from "next/headers";

import en from "./en";
import es from "./es";

export type { Dictionary } from "./en";
export type Locale = "en" | "es";

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  return cookieStore.get("locale")?.value === "es" ? "es" : "en";
}

export async function getTranslations() {
  const locale = await getLocale();
  return locale === "es" ? es : en;
}
