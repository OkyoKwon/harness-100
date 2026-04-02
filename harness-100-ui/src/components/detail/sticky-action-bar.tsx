"use client";

import { useState, useEffect, useRef } from "react";
import { useLocale } from "@/hooks/use-locale";

interface StickyActionBarProps {
  readonly name: string;
  readonly favorited: boolean;
  readonly onToggleFavorite: () => void;
  readonly onSetup: () => void;
  readonly onDownloadZip: () => void;
  readonly setupDisabled: boolean;
  readonly zipDisabled: boolean;
  readonly setupLabel: string;
  readonly zipLabel: string;
  readonly triggerRef: React.RefObject<HTMLElement | null>;
}

export function StickyActionBar({
  name,
  favorited,
  onToggleFavorite,
  onSetup,
  onDownloadZip,
  setupDisabled,
  zipDisabled,
  setupLabel,
  zipLabel,
  triggerRef,
}: StickyActionBarProps) {
  const { t } = useLocale();
  const [visible, setVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const el = triggerRef.current;
    if (!el) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        setVisible(!entry.isIntersecting);
      },
      { threshold: 0 },
    );

    observerRef.current.observe(el);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [triggerRef]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-sm lg:sticky lg:top-14 lg:bottom-auto lg:border-t-0 lg:border-b">
      <div className="mx-auto max-w-6xl flex items-center justify-between gap-3 px-4 py-2.5">
        <p className="truncate text-sm font-medium text-[var(--foreground)]">
          {name}
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onToggleFavorite}
            className={`rounded-md px-2 py-1.5 text-sm transition-base focus-ring ${
              favorited
                ? "text-[var(--warning-foreground)]"
                : "text-[var(--muted-foreground)]"
            }`}
            aria-label={favorited ? t("favorite.remove") : t("favorite.add")}
          >
            {favorited ? "★" : "☆"}
          </button>
          <button
            type="button"
            onClick={onSetup}
            disabled={setupDisabled}
            className="rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-medium text-[var(--primary-foreground)] hover:brightness-110 active:brightness-95 disabled:cursor-not-allowed disabled:opacity-50 transition-base focus-ring"
          >
            {setupLabel}
          </button>
          <button
            type="button"
            onClick={onDownloadZip}
            disabled={zipDisabled}
            className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted)] disabled:cursor-not-allowed disabled:opacity-50 transition-base focus-ring"
          >
            {zipLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
