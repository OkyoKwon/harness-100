"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { CATEGORIES, TOTAL_HARNESS_COUNT } from "@/lib/constants";

interface CategoryTabsProps {
  readonly active: string;
  readonly onSelect: (slug: string) => void;
  readonly favoriteCount: number;
}

export function CategoryTabs({ active, onSelect, favoriteCount }: CategoryTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkOverflow = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkOverflow();
    el.addEventListener("scroll", checkOverflow, { passive: true });

    const ro = new ResizeObserver(checkOverflow);
    ro.observe(el);

    return () => {
      el.removeEventListener("scroll", checkOverflow);
      ro.disconnect();
    };
  }, [checkOverflow]);

  const scroll = useCallback((direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction === "left" ? -200 : 200, behavior: "smooth" });
  }, []);

  const baseClass =
    "shrink-0 px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer whitespace-nowrap transition-base focus-visible:outline-2 focus-visible:outline-[var(--ring)] focus-visible:outline-offset-2";
  const activeClass = "bg-[var(--primary)] text-[var(--primary-foreground)]";
  const inactiveClass =
    "bg-[var(--muted)] text-[var(--secondary-foreground)] hover:bg-[var(--secondary)]";

  return (
    <div className="relative">
      {/* Left fade + arrow */}
      {canScrollLeft && (
        <>
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[var(--background)] to-transparent z-10 pointer-events-none" />
          <button
            type="button"
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 rounded-full bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow-sm)] p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-base focus-ring"
            aria-label="이전 카테고리"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </>
      )}

      {/* Right fade + arrow */}
      {canScrollRight && (
        <>
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[var(--background)] to-transparent z-10 pointer-events-none" />
          <button
            type="button"
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 rounded-full bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow-sm)] p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-base focus-ring"
            aria-label="다음 카테고리"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-1"
      >
        <button
          type="button"
          onClick={() => onSelect("favorites")}
          className={`${baseClass} ${active === "favorites" ? activeClass : inactiveClass}`}
        >
          ★ 즐겨찾기{favoriteCount > 0 ? ` ${favoriteCount}` : ""}
        </button>
        <button
          type="button"
          onClick={() => onSelect("all")}
          className={`${baseClass} ${active === "all" ? activeClass : inactiveClass}`}
        >
          전체 {TOTAL_HARNESS_COUNT}
        </button>
        {CATEGORIES.map((cat) => (
          <button
            type="button"
            key={cat.slug}
            onClick={() => onSelect(cat.slug)}
            className={`${baseClass} ${active === cat.slug ? activeClass : inactiveClass}`}
          >
            {cat.label} {cat.count}
          </button>
        ))}
      </div>
    </div>
  );
}
