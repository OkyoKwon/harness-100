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
      className="text-xs font-semibold"
    >
      {locale === "ko" ? "한" : "EN"}
    </IconButton>
  );
}
