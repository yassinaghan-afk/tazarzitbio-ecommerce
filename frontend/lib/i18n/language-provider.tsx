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
  DEFAULT_LANGUAGE,
  isLanguage,
  languageDir,
  LANGUAGE_STORAGE_KEY,
  type Language,
} from "./types";
import { translate, type TranslationKey } from "./translations";

interface LanguageContextValue {
  locale: Language;
  dir: "rtl" | "ltr";
  /** False until client has read localStorage — use Arabic until then */
  ready: boolean;
  setLocale: (locale: Language) => void;
  t: (key: TranslationKey) => string;
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

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Language>(DEFAULT_LANGUAGE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = readStoredLanguage();
    setLocaleState(stored);
    applyDocumentLanguage(stored);
    setReady(true);
  }, []);

  const setLocale = useCallback((next: Language) => {
    setLocaleState(next);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    applyDocumentLanguage(next);
  }, []);

  const effectiveLocale = ready ? locale : DEFAULT_LANGUAGE;
  const dir = languageDir(effectiveLocale);

  const t = useCallback(
    (key: TranslationKey) => translate(effectiveLocale, key),
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
