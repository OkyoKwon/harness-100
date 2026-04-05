"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import type { HarnessMeta } from "@/lib/types";
import { FavoriteToggle } from "@/components/favorites/favorite-toggle";
import { SetupButton } from "@/components/actions/setup-button";
import { ZipButton } from "@/components/actions/zip-button";
import { QuickPreview } from "@/components/catalog/quick-preview";
import { CATEGORIES } from "@/lib/constants";
import { useLocale } from "@/hooks/use-locale";
import { useHoverCapable } from "@/hooks/use-hover-capable";

interface HarnessCardProps {
  readonly harness: HarnessMeta;
  readonly isFavorite: boolean;
  readonly onToggleFavorite: () => void;
  readonly showRank?: boolean;
}

const RANK_BADGES: ReadonlyArray<{ readonly emoji: string; readonly color: string }> = [
  { emoji: "🥇", color: "bg-amber-500" },
  { emoji: "🥈", color: "bg-gray-400" },
  { emoji: "🥉", color: "bg-orange-500" },
];

export function HarnessCard({ harness, isFavorite, onToggleFavorite, showRank = false }: HarnessCardProps) {
  const router = useRouter();
  const { t, locale } = useLocale();
  const hoverCapable = useHoverCapable();
  const paddedId = String(harness.id).padStart(2, "0");
  const category = CATEGORIES.find((c) => c.slug === harness.category);
  const categoryLabel = locale === "en" ? (category?.labelEn ?? "") : (category?.label ?? "");
  const categoryColor = category?.color ?? "var(--primary)";

  const [showPreview, setShowPreview] = useState(false);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cardRef = useRef<HTMLAnchorElement>(null);

  const handleMouseEnter = useCallback(() => {
    hoverTimer.current = setTimeout(() => setShowPreview(true), 400);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
    setShowPreview(false);
  }, []);

  const hoverHandlers = hoverCapable
    ? { onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave }
    : {};

  return (
    <div className="relative" {...hoverHandlers}>
      <Link
        ref={cardRef}
        href={`/harness/${paddedId}`}
        className="block bg-[var(--card)] border border-[var(--border)] rounded-lg overflow-hidden shadow-[var(--shadow-sm)] hover:border-[var(--primary)] hover:shadow-[var(--shadow-md)] hover:-translate-y-1 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-[var(--ring)] focus-visible:outline-offset-2 transition-base group"
      >
        {/* Category color accent bar */}
        <div className="h-1" style={{ backgroundColor: categoryColor }} />

        <div className="p-4 relative">
          {showRank && harness.popularityRank <= 10 && (
            <span
              className={`absolute -top-1 right-3 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm ${
                harness.popularityRank <= 3
                  ? `${RANK_BADGES[harness.popularityRank - 1].color} text-white`
                  : "bg-[var(--primary)] text-[var(--primary-foreground)]"
              }`}
            >
              {harness.popularityRank <= 3
                ? RANK_BADGES[harness.popularityRank - 1].emoji
                : locale === "en" ? `#${harness.popularityRank}` : `${harness.popularityRank}위`}
            </span>
          )}
          <div className="flex items-start justify-between mb-2">
            <span
              className="text-sm font-bold font-mono"
              style={{ color: categoryColor }}
            >
              {paddedId}
            </span>
            <FavoriteToggle active={isFavorite} onClick={onToggleFavorite} size="sm" />
          </div>

          <h3 className="font-semibold mb-1 group-hover:text-[var(--primary)] transition-colors">
            {harness.name}
          </h3>

          <p className="text-xs text-[var(--muted-foreground)] mb-3 line-clamp-2 min-h-[2lh]">
            {harness.description}
          </p>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--secondary)] text-[var(--secondary-foreground)]">
              {t("card.agents", { count: harness.agentCount })}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--secondary)] text-[var(--secondary-foreground)]">
              {categoryLabel}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <SetupButton onClick={() => router.push(`/harness/${paddedId}?action=setup`)} size="sm" />
            <ZipButton onClick={() => router.push(`/harness/${paddedId}?action=zip`)} size="sm" />
            {!hoverCapable && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowPreview((prev) => !prev);
                }}
                className="ml-auto flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] text-xs text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-base focus-ring"
                aria-label={t("preview.toggle")}
              >
                i
              </button>
            )}
          </div>
        </div>
      </Link>

      {showPreview && (
        <QuickPreview
          harnessId={harness.id}
          anchorRef={cardRef}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
