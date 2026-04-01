"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import type { HarnessMeta } from "@/lib/types";
import { loadCatalog } from "@/lib/harness-loader";
import { RankingPodium } from "@/components/ranking/ranking-podium";
import { RankingList } from "@/components/ranking/ranking-list";
import { RankingTable } from "@/components/ranking/ranking-table";

export default function RankingPage() {
  const [catalog, setCatalog] = useState<ReadonlyArray<HarnessMeta>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCatalog()
      .then(setCatalog)
      .catch((err: unknown) => {
        setError(
          err instanceof Error ? err.message : "데이터를 불러오는 데 실패했습니다.",
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const sorted = useMemo(
    () => [...catalog].sort((a, b) => a.popularityRank - b.popularityRank),
    [catalog],
  );

  const top3 = useMemo(() => sorted.slice(0, 3), [sorted]);
  const top4to10 = useMemo(() => sorted.slice(3, 10), [sorted]);
  const rest = useMemo(() => sorted.slice(10), [sorted]);

  if (loading) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-[var(--muted)] rounded" />
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 bg-[var(--muted)] rounded-xl" />
            ))}
          </div>
          <div className="space-y-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-16 bg-[var(--muted)] rounded-lg" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-8">
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
    <main id="main-content" className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-6">
        <Link
          href="/"
          className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-base focus-ring rounded"
        >
          ← 카탈로그
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-2">
          인기 랭킹
        </h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          가장 실용적이고 범용적인 하네스 TOP 10과 전체 순위표
        </p>
      </div>

      {/* TOP 3 Podium */}
      <RankingPodium items={top3} />

      {/* 4-10위 List */}
      {top4to10.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-[var(--foreground)] mb-4">
            4 ~ 10위
          </h2>
          <RankingList items={top4to10} />
        </div>
      )}

      {/* 11-100위 Table */}
      {rest.length > 0 && <RankingTable items={rest} />}

      <div className="text-center py-8 text-xs sm:text-sm text-[var(--muted-foreground)]">
        Harness 100 · Apache License 2.0
      </div>
    </main>
  );
}
