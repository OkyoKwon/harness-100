"use client";

import { useLocale } from "@/hooks/use-locale";

interface FavoriteToggleProps {
  readonly active: boolean;
  readonly onClick: () => void;
  readonly size?: "sm" | "md";
}

export function FavoriteToggle({ active, onClick, size = "md" }: FavoriteToggleProps) {
  const { t } = useLocale();
  const sizeClass = size === "sm" ? "text-lg" : "text-xl";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      aria-label={active ? t("favorite.remove") : t("favorite.add")}
      className={`${sizeClass} min-w-[44px] min-h-[44px] inline-flex items-center justify-center hover:scale-110 active:scale-95 transition-transform duration-150 focus-visible:outline-2 focus-visible:outline-[var(--ring)] focus-visible:outline-offset-2 focus-visible:rounded ${
        active ? "text-[var(--warning-foreground)]" : "text-[var(--muted-foreground)] hover:text-[var(--warning-foreground)]"
      }`}
    >
      {active ? "★" : "☆"}
    </button>
  );
}
