import { headers } from "next/headers";

import type { Language } from "@/lib/i18n/types";
import { parseLocale } from "@/lib/seo/locale";

/** Server-only: read locale set by middleware (`x-locale`). */
export async function getRequestLocale(): Promise<Language> {
  const h = await headers();
  return parseLocale(h.get("x-locale"));
}
