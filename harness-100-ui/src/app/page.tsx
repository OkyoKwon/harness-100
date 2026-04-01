"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import type { HarnessMeta } from "@/lib/types";
import { loadCatalog } from "@/lib/harness-loader";
import { useFavorites } from "@/hooks/use-favorites";
import { useSearch } from "@/hooks/use-search";
import { SearchBar } from "@/components/catalog/search-bar";
import { CategoryTabs } from "@/components/catalog/category-tabs";
import { HarnessGrid } from "@/components/catalog/harness-grid";
import { HarnessCard } from "@/components/catalog/harness-card";
import { HeroSection } from "@/components/catalog/hero-section";
import { SortFilterBar, type SortKey } from "@/components/catalog/sort-filter-bar";
import { CATEGORIES } from "@/lib/constants";

function sortItems(items: ReadonlyArray<HarnessMeta>, key: SortKey): ReadonlyArray<HarnessMeta> {
  const sorted = [...items];
  switch (key) {
    case "name":
      sorted.sort((a, b) => a.name.localeCompare(b.name, "ko"));
      break;
    case "agentCount":
      sorted.sort((a, b) => b.agentCount - a.agentCount);
      break;
    case "id":
    default:
      sorted.sort((a, b) => a.id - b.id);
      break;
  }
  return sorted;
}

export default function CatalogPage() {
  const [catalog, setCatalog] = useState<ReadonlyArray<HarnessMeta>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("id");

  const { favorites, toggle, isFavorite } = useFavorites();
  const { query, results, updateQuery } = useSearch(catalog);

  useEffect(() => {
    loadCatalog()
      .then(setCatalog)
      .catch((err: unknown) => {
        setError(
          err instanceof Error ? err.message : "카탈로그를 불러오는 데 실패했습니다.",
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let items = results;

    if (activeCategory === "favorites") {
      items = items.filter((h) => favorites.includes(h.id));
    } else if (activeCategory !== "all") {
      const cat = CATEGORIES.find((c) => c.slug === activeCategory);
      if (cat) {
        items = items.filter((h) => h.category === cat.slug);
      }
    }

    return sortItems(items, sortKey);
  }, [results, activeCategory, favorites, sortKey]);

  const handleCategorySelect = useCallback((slug: string) => {
    setActiveCategory(slug);
  }, []);

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-11 bg-[var(--muted)] rounded-lg w-full" />
          <div className="flex gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-8 w-20 bg-[var(--muted)] rounded-full shrink-0" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
                <div className="h-3 w-8 bg-[var(--muted)] rounded" />
                <div className="h-5 w-3/4 bg-[var(--muted)] rounded" />
                <div className="h-3 w-full bg-[var(--muted)] rounded" />
                <div className="h-3 w-2/3 bg-[var(--muted)] rounded" />
                <div className="flex gap-2 pt-2">
                  <div className="h-7 w-16 bg-[var(--muted)] rounded-lg" />
                  <div className="h-7 w-14 bg-[var(--muted)] rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="rounded-lg border border-[var(--danger-border)] bg-[var(--danger-bg)] p-6 text-center">
          <p className="text-sm text-[var(--danger-foreground)]">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-3 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:brightness-110 transition-base focus-ring"
          >
            다시 시도
          </button>
        </div>
      </main>
    );
  }

  return (
    <main id="main-content" className="max-w-7xl mx-auto px-4 py-6">
      <HeroSection />

      <div className="mb-4">
        <SearchBar onSearch={updateQuery} />
      </div>

      <div className="mb-4">
        <CategoryTabs
          active={activeCategory}
          onSelect={handleCategorySelect}
          favoriteCount={favorites.length}
        />
      </div>

      <div className="mb-4">
        <SortFilterBar
          sortKey={sortKey}
          onSortChange={setSortKey}
          resultCount={filtered.length}
          hasQuery={query.trim().length > 0}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[var(--muted-foreground)]">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-lg font-medium mb-2">검색 결과가 없습니다</p>
          <p className="text-sm">다른 키워드로 검색해 보세요</p>
        </div>
      ) : (
        <HarnessGrid>
          {filtered.map((harness) => (
            <HarnessCard
              key={harness.id}
              harness={harness}
              isFavorite={isFavorite(harness.id)}
              onToggleFavorite={() => toggle(harness.id)}
            />
          ))}
        </HarnessGrid>
      )}

      <div className="text-center py-8 text-xs sm:text-sm text-[var(--muted-foreground)]">
        Harness 100 · Apache License 2.0
      </div>
    </main>
  );
}
