"use client";

import Link from "next/link";
import type { HarnessMeta } from "@/lib/types";
import { CATEGORIES } from "@/lib/constants";
import { useLocale } from "@/hooks/use-locale";

interface RankingPodiumProps {
  readonly items: ReadonlyArray<HarnessMeta>;
}

const MEDAL_STYLES = [
  { emoji: "🥇", bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-300 dark:border-amber-700", ring: "ring-amber-200" },
  { emoji: "🥈", bg: "bg-gray-50 dark:bg-gray-900/30", border: "border-gray-300 dark:border-gray-600", ring: "ring-gray-200" },
  { emoji: "🥉", bg: "bg-orange-50 dark:bg-orange-950/30", border: "border-orange-300 dark:border-orange-700", ring: "ring-orange-200" },
] as const;

function PodiumCard({ harness, rank }: { readonly harness: HarnessMeta; readonly rank: number }) {
  const { t, locale } = useLocale();
  const style = MEDAL_STYLES[rank];
  const paddedId = String(harness.id).padStart(2, "0");
  const category = CATEGORIES.find((c) => c.slug === harness.category);
  const categoryLabel = locale === "en" ? (category?.labelEn ?? "") : (category?.label ?? "");
  const isFirst = rank === 0;

  return (
    <Link
      href={`/harness/${paddedId}`}
      className={`block rounded-xl border-2 ${style.border} ${style.bg} p-5 hover:ring-2 ${style.ring} hover:-translate-y-1 transition-base focus-ring ${isFirst ? "md:col-span-1 md:row-span-1" : ""}`}
    >
      <div className="text-center">
        <div className={`${isFirst ? "text-5xl" : "text-4xl"} mb-2`}>{style.emoji}</div>
        <div className="text-xs font-bold text-[var(--muted-foreground)] mb-1">
          {t("ranking.rank", { rank: rank + 1 })}
        </div>
        <h3 className={`font-bold mb-2 ${isFirst ? "text-lg" : "text-base"} text-[var(--foreground)]`}>
          {harness.name}
        </h3>
        <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 mb-3">
          {harness.description}
        </p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--secondary)] text-[var(--secondary-foreground)]">
            {t("card.agents", { count: harness.agentCount })}
          </span>
          {category && (
            <span
              className="text-xs px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: category.color }}
            >
              {categoryLabel}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function RankingPodium({ items }: RankingPodiumProps) {
  const top3 = items.slice(0, 3);

  if (top3.length < 3) return null;

  return (
    <div className="mb-8">
      {/* Desktop: 2nd-1st-3rd podium layout */}
      <div className="hidden md:grid md:grid-cols-3 gap-4 items-end">
        <div className="pt-8">
          <PodiumCard harness={top3[1]} rank={1} />
        </div>
        <div>
          <PodiumCard harness={top3[0]} rank={0} />
        </div>
        <div className="pt-12">
          <PodiumCard harness={top3[2]} rank={2} />
        </div>
      </div>

      {/* Mobile: 1st-2nd-3rd order */}
      <div className="md:hidden space-y-3">
        {top3.map((harness, i) => (
          <PodiumCard key={harness.id} harness={harness} rank={i} />
        ))}
      </div>
    </div>
  );
}
