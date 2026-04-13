"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { LanguageToggle } from "@/components/common/language-toggle";
import { useLocale } from "@/hooks/use-locale";

const NAV_LINKS = [
  { href: "/ranking", key: "nav.ranking" },
  { href: "/composer", key: "nav.composer" },
  { href: "/builder", key: "nav.builder" },
  { href: "/guide", key: "nav.guide" },
] as const;

export function MobileMenu() {
  const { t } = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpen(false), []);

  // Close on route change
  useEffect(() => {
    close();
  }, [pathname, close]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, close]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="sm:hidden">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-base focus-ring"
        aria-label={open ? t("nav.closeMenu") : t("nav.menu")}
        aria-expanded={open}
        aria-controls="mobile-nav"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 top-14 z-40 bg-black/30"
            onClick={close}
            aria-hidden="true"
          />

          {/* Menu panel */}
          <nav
            ref={menuRef}
            id="mobile-nav"
            className="fixed top-14 inset-x-0 z-50 bg-[var(--background)] border-b border-[var(--border)] shadow-[var(--shadow-md)] safe-top"
          >
            <ul className="flex flex-col">
              {NAV_LINKS.map(({ href, key }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={href === "/builder" ? () => window.dispatchEvent(new CustomEvent("builder-nav-reset")) : undefined}
                    className="flex items-center min-h-[44px] px-4 py-3 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-base focus-ring"
                  >
                    {t(key)}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2 px-4 py-3 border-t border-[var(--border)]">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
