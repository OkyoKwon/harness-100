"use client";

import { useLocale } from "@/hooks/use-locale";

export function HeroSection() {
  const { t } = useLocale();

  return (
    <div className="hero-gradient rounded-xl px-5 py-5 mb-6">
      <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] mb-1">
        {t("hero.title")}
      </h1>
      <p className="text-sm text-[var(--muted-foreground)] mb-2">
        {t("hero.subtitle")}
      </p>
      <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
        <a
          href="https://github.com/revfactory/harness-100"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--primary)] hover:underline"
        >
          revfactory/harness-100
        </a>
        {" "}{t("hero.description")}
      </p>
    </div>
  );
}
