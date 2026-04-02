"use client";

import { useLocale } from "@/hooks/use-locale";
import { IconButton } from "@/components/ui";

export function LanguageToggle() {
  const { locale, setLocale } = useLocale();

  const toggle = () => setLocale(locale === "ko" ? "en" : "ko");

  return (
    <IconButton
      ariaLabel={locale === "ko" ? "Switch to English" : "한국어로 전환"}
      onClick={toggle}
      className="px-1.5 py-0.5 text-xs font-semibold"
    >
      {locale === "ko" ? "EN" : "한"}
    </IconButton>
  );
}
