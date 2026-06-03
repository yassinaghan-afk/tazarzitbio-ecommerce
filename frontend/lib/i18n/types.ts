export const LANGUAGES = ["ar", "fr", "en"] as const;

export type Language = (typeof LANGUAGES)[number];

export const DEFAULT_LANGUAGE: Language = "ar";

export const LANGUAGE_STORAGE_KEY = "tazarzit-language";

export function isLanguage(value: string): value is Language {
  return (LANGUAGES as readonly string[]).includes(value);
}

export function languageDir(locale: Language): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}
