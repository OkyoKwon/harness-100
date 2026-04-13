"use client";

import { useState, useCallback } from "react";
import { useLocale } from "@/hooks/use-locale";
import { useActiveSection } from "@/hooks/use-active-section";

interface TocSection {
  readonly id: string;
  readonly key: string;
}

interface GuideTocSidebarProps {
  readonly sections: ReadonlyArray<TocSection>;
}

export function GuideTocSidebar({ sections }: GuideTocSidebarProps) {
  const { t } = useLocale();
  const sectionIds = sections.map((s) => s.id);
  const activeId = useActiveSection(sectionIds);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleClick = useCallback(
    (id: string) => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
      setMobileOpen(false);
    },
    [],
  );

  const activeLabel = sections.find((s) => s.id === activeId);

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden lg:block sticky top-20 self-start" aria-label={t("guide.toc")}>
        <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">
          {t("guide.toc")}
        </p>
        <ol className="space-y-1">
          {sections.map((section, i) => {
            const isActive = activeId === section.id;
            return (
              <li key={section.id}>
                <button
                  type="button"
                  onClick={() => handleClick(section.id)}
                  className={`w-full text-left text-sm py-1 pl-3 border-l-2 transition-base ${
                    isActive
                      ? "border-[var(--primary)] text-[var(--primary)] font-medium"
                      : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--border)]"
                  }`}
                >
                  {i + 1}. {t(section.key)}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Mobile floating pill */}
      <div className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-30">
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-sm px-4 py-2 text-sm font-medium text-[var(--foreground)] shadow-lg transition-base"
          aria-label={t("guide.toc")}
        >
          <svg
            className="h-4 w-4 text-[var(--muted-foreground)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span className="max-w-[180px] truncate">
            {activeLabel ? t(activeLabel.key) : t("guide.toc")}
          </span>
        </button>

        {/* Mobile TOC dropdown */}
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-20"
              onClick={() => setMobileOpen(false)}
              onKeyDown={(e) => e.key === "Escape" && setMobileOpen(false)}
              role="button"
              tabIndex={-1}
              aria-label="Close menu"
            />
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 rounded-lg border border-[var(--border)] bg-[var(--background)] shadow-xl overflow-hidden z-30">
              <ol className="py-1">
                {sections.map((section, i) => {
                  const isActive = activeId === section.id;
                  return (
                    <li key={section.id}>
                      <button
                        type="button"
                        onClick={() => handleClick(section.id)}
                        className={`w-full text-left px-4 py-2 text-sm transition-base ${
                          isActive
                            ? "text-[var(--primary)] font-medium bg-[var(--muted)]"
                            : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
                        }`}
                      >
                        {i + 1}. {t(section.key)}
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
          </>
        )}
      </div>
    </>
  );
}
