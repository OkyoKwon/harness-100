"use client";

import Link from "next/link";
import { useLocale } from "@/hooks/use-locale";
import { Badge } from "@/components/ui/badge";

export function GuideHero() {
  const { t } = useLocale();

  return (
    <div className="hero-gradient rounded-xl px-5 py-6 mb-8">
      <div className="flex items-center gap-2 mb-2">
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">
          {t("guide.title")}
        </h1>
        <Badge variant="tool">{t("guide.hero.harnessCount")}</Badge>
      </div>
      <p className="text-sm text-[var(--muted-foreground)] mb-4 leading-relaxed">
        {t("guide.hero.subtitle")}
      </p>
      <div className="flex flex-wrap gap-2">
        <Link
          href="/"
          className="inline-flex items-center rounded-lg bg-[var(--button-primary-bg)] text-[var(--button-primary-fg)] px-4 py-2 text-sm font-medium hover:brightness-110 active:brightness-95 transition-base"
        >
          {t("guide.hero.browseCatalog")}
        </Link>
        <Link
          href="/builder"
          className="inline-flex items-center rounded-lg border border-[var(--button-outline-border)] text-[var(--button-outline-fg)] px-4 py-2 text-sm font-medium hover:bg-[var(--muted)] transition-base"
        >
          {t("guide.hero.buildCustom")}
        </Link>
      </div>
    </div>
  );
}
