"use client";

import { CATEGORIES, TOTAL_HARNESS_COUNT } from "@/lib/constants";

interface CategoryTabsProps {
  readonly active: string;
  readonly onSelect: (slug: string) => void;
  readonly favoriteCount: number;
}

export function CategoryTabs({ active, onSelect, favoriteCount }: CategoryTabsProps) {
  const baseClass =
    "shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer whitespace-nowrap";
  const activeClass = "bg-[var(--primary)] text-[var(--primary-foreground)]";
  const inactiveClass =
    "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--border)]";

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => onSelect("favorites")}
        className={`${baseClass} ${active === "favorites" ? activeClass : inactiveClass}`}
      >
        ★ 즐겨찾기{favoriteCount > 0 ? ` ${favoriteCount}` : ""}
      </button>
      <button
        onClick={() => onSelect("all")}
        className={`${baseClass} ${active === "all" ? activeClass : inactiveClass}`}
      >
        전체 {TOTAL_HARNESS_COUNT}
      </button>
      {CATEGORIES.map((cat) => (
        <button
          key={cat.slug}
          onClick={() => onSelect(cat.slug)}
          className={`${baseClass} ${active === cat.slug ? activeClass : inactiveClass}`}
        >
          {cat.label} {cat.count}
        </button>
      ))}
    </div>
  );
}
