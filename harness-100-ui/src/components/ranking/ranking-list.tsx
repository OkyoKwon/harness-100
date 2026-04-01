"use client";

import Link from "next/link";
import type { HarnessMeta } from "@/lib/types";
import { CATEGORIES } from "@/lib/constants";

interface RankingListProps {
  readonly items: ReadonlyArray<HarnessMeta>;
}

function RankingListItem({ harness }: { readonly harness: HarnessMeta }) {
  const paddedId = String(harness.id).padStart(2, "0");
  const category = CATEGORIES.find((c) => c.slug === harness.category);

  return (
    <Link
      href={`/harness/${paddedId}`}
      className="flex items-center gap-4 p-4 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)] hover:shadow-[var(--shadow-sm)] transition-base focus-ring group"
    >
      <div className="shrink-0 w-10 h-10 rounded-full bg-[var(--secondary)] flex items-center justify-center">
        <span className="text-sm font-bold text-[var(--foreground)]">
          {harness.popularityRank}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm group-hover:text-[var(--primary)] transition-colors truncate">
          {harness.name}
        </h3>
        <p className="text-xs text-[var(--muted-foreground)] truncate">
          {harness.description}
        </p>
      </div>

      <div className="hidden sm:flex items-center gap-2 shrink-0">
        <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--secondary)] text-[var(--secondary-foreground)]">
          👥 {harness.agentCount}명
        </span>
        {category && (
          <span
            className="text-xs px-2 py-0.5 rounded-full text-white"
            style={{ backgroundColor: category.color }}
          >
            {category.label}
          </span>
        )}
      </div>
    </Link>
  );
}

export function RankingList({ items }: RankingListProps) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-2 mb-8">
      {items.map((harness) => (
        <RankingListItem key={harness.id} harness={harness} />
      ))}
    </div>
  );
}
