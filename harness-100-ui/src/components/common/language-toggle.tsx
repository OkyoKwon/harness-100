"use client";

import { useLocale } from "@/hooks/use-locale";

export function LanguageToggle() {
  const { locale, setLocale } = useLocale();

  const toggle = () => setLocale(locale === "ko" ? "en" : "ko");

  return (
    <button
      type="button"
      onClick={toggle}
      className="rounded-md px-1.5 py-0.5 text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-base focus-ring"
      aria-label={locale === "ko" ? "Switch to English" : "한국어로 전환"}
    >
      {locale === "ko" ? "EN" : "한"}
    </button>
  );
}
