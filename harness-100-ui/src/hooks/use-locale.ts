"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { Locale } from "@/lib/locale";
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY } from "@/lib/locale";
import { t as translate } from "@/lib/translations";
import { clearCache } from "@/lib/harness-loader";
import React from "react";

interface LocaleContextValue {
  readonly locale: Locale;
  readonly setLocale: (next: Locale) => void;
  readonly t: (key: string, params?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: (key) => key,
});

function getStoredLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (stored === "ko" || stored === "en") return stored;
  return DEFAULT_LOCALE;
}

export function LanguageProvider({ children }: { readonly children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const stored = getStoredLocale();
    setLocaleState(stored);
    document.documentElement.lang = stored;
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    localStorage.setItem(LOCALE_STORAGE_KEY, next);
    document.documentElement.lang = next;
    clearCache();
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) =>
      translate(locale, key, params),
    [locale],
  );

  const value: LocaleContextValue = { locale, setLocale, t };

  return React.createElement(LocaleContext.Provider, { value }, children);
}

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext);
}
