"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  LANGUAGE_PREF_COOKIE,
  languagePrefCookieOptions,
} from "./browser-locale";
import {
  DEFAULT_LANGUAGE,
  isLanguage,
  languageDir,
  LANGUAGE_STORAGE_KEY,
  type Language,
} from "./types";
import { translate, type TranslationKey } from "./translations";

function persistLanguagePref(locale: Language) {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, locale);
  } catch {
    /* ignore */
  }
  try {
    const { path, sameSite, maxAge } = languagePrefCookieOptions();
    document.cookie = `${LANGUAGE_PREF_COOKIE}=${locale}; path=${path}; max-age=${maxAge}; samesite=${sameSite}`;
  } catch {
    /* ignore */
  }
}

interface LanguageContextValue {
  locale: Language;
  dir: "rtl" | "ltr";
  /** False until client has read localStorage — use Arabic until then */
  ready: boolean;
  setLocale: (locale: Language) => void;
  t: (
    key: TranslationKey,
    params?: Record<string, string | number>,
  ) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readStoredLanguage(): Language {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && isLanguage(stored)) return stored;
  } catch {
    /* ignore */
  }
  return DEFAULT_LANGUAGE;
}

function applyDocumentLanguage(locale: Language) {
  const dir = languageDir(locale);
  document.documentElement.lang = locale;
  document.documentElement.dir = dir;
}

export function LanguageProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  /** When set (e.g. /fr or /en SEO routes), SSR + first paint use this locale. */
  initialLocale?: Language;
}) {
  const bootLocale = initialLocale ?? DEFAULT_LANGUAGE;
  const [locale, setLocaleState] = useState<Language>(bootLocale);
  const [ready, setReady] = useState(Boolean(initialLocale));

  useEffect(() => {
    if (initialLocale) {
      setLocaleState(initialLocale);
      applyDocumentLanguage(initialLocale);
      persistLanguagePref(initialLocale);
      setReady(true);
      return;
    }
    const stored = readStoredLanguage();
    setLocaleState(stored);
    applyDocumentLanguage(stored);
    persistLanguagePref(stored);
    setReady(true);
  }, [initialLocale]);

  const setLocale = useCallback((next: Language) => {
    setLocaleState(next);
    persistLanguagePref(next);
    applyDocumentLanguage(next);
  }, []);

  const effectiveLocale = ready || initialLocale ? locale : DEFAULT_LANGUAGE;
  const dir = languageDir(effectiveLocale);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) =>
      translate(effectiveLocale, key, params),
    [effectiveLocale],
  );

  const value = useMemo(
    () => ({
      locale: effectiveLocale,
      dir,
      ready,
      setLocale,
      t,
    }),
    [effectiveLocale, dir, ready, setLocale, t],
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return ctx;
}

/** Alias for components that only need `t` */
export function useTranslation() {
  const { t, locale, dir, setLocale, ready } = useLanguage();
  return { t, locale, dir, setLocale, ready };
}
