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
import { CATEGORIES } from "@/lib/constants";

export default function CatalogPage() {
  const [catalog, setCatalog] = useState<ReadonlyArray<HarnessMeta>>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  const { favorites, toggle, isFavorite } = useFavorites();
  const { results, updateQuery } = useSearch(catalog);

  useEffect(() => {
    loadCatalog()
      .then(setCatalog)
      .catch(console.error)
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

    return items;
  }, [results, activeCategory, favorites]);

  const handleCategorySelect = useCallback((slug: string) => {
    setActiveCategory(slug);
  }, []);

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-[var(--muted)] rounded-lg w-full" />
          <div className="h-8 bg-[var(--muted)] rounded-lg w-3/4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-48 bg-[var(--muted)] rounded-lg" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      <p className="text-sm text-[var(--muted-foreground)] mb-4">
        AI 에이전트 팀 워크플로우 100선 — 골라서 바로 세팅
      </p>

      <div className="mb-4">
        <SearchBar onSearch={updateQuery} />
      </div>

      <div className="mb-6">
        <CategoryTabs
          active={activeCategory}
          onSelect={handleCategorySelect}
          favoriteCount={favorites.length}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[var(--muted-foreground)]">
          <p className="text-lg mb-2">검색 결과가 없습니다</p>
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

      <div className="text-center py-8 text-xs text-[var(--muted-foreground)]">
        {filtered.length}개 하네스 · Harness 100 · Apache License 2.0
      </div>
    </main>
  );
}
