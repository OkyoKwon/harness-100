"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { LanguageToggle } from "@/components/common/language-toggle";
import { useLocale } from "@/hooks/use-locale";

export function Header() {
  const { t } = useLocale();

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-lg focus:bg-[var(--primary)] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-[var(--primary-foreground)]"
      >
        {t("a11y.skipToContent")}
      </a>

      <header className="sticky top-0 z-50 bg-[var(--background)] border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold focus-ring rounded">
            Harness 100
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link
              href="/ranking"
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-base focus-ring rounded px-1"
            >
              {t("nav.ranking")}
            </Link>
            <Link
              href="/composer"
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-base focus-ring rounded px-1"
            >
              {t("nav.composer")}
            </Link>
            <Link
              href="/guide"
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-base focus-ring rounded px-1"
            >
              {t("nav.guide")}
            </Link>
            <LanguageToggle />
            <ThemeToggle />
          </nav>
        </div>
      </header>
    </>
  );
}
