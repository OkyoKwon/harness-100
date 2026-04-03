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

function getStoredLocale(): Locale | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (stored === "ko" || stored === "en") return stored;
  return null;
}

async function detectLocaleByIP(): Promise<Locale> {
  try {
    const res = await fetch("https://ipapi.co/country_code/", {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return DEFAULT_LOCALE;
    const countryCode = (await res.text()).trim().toUpperCase();
    return countryCode === "KR" ? "ko" : "en";
  } catch {
    return DEFAULT_LOCALE;
  }
}

export function LanguageProvider({ children }: { readonly children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const stored = getStoredLocale();
    if (stored) {
      setLocaleState(stored);
      document.documentElement.lang = stored;
      return;
    }

    detectLocaleByIP().then((detected) => {
      setLocaleState(detected);
      document.documentElement.lang = detected;
      localStorage.setItem(LOCALE_STORAGE_KEY, detected);
    });
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
