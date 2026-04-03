"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import type { HarnessMeta } from "@/lib/types";
import { CATEGORIES } from "@/lib/constants";
import { useLocale } from "@/hooks/use-locale";

interface RankingTableProps {
  readonly items: ReadonlyArray<HarnessMeta>;
}

export function RankingTable({ items }: RankingTableProps) {
  const { t, locale } = useLocale();
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filtered = useMemo(() => {
    if (categoryFilter === "all") return items;
    return items.filter((h) => h.category === categoryFilter);
  }, [items, categoryFilter]);

  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryFilter(e.target.value);
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[var(--foreground)]">
          {t("ranking.fullRanking")}
        </h2>
        <select
          value={categoryFilter}
          onChange={handleFilterChange}
          className="rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs text-[var(--foreground)] focus-visible:outline-2 focus-visible:outline-[var(--ring)] transition-base"
        >
          <option value="all">{t("ranking.allCategories")}</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {locale === "en" ? cat.labelEn : cat.label}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-lg border border-[var(--border)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--secondary)] text-[var(--muted-foreground)]">
              <th className="text-left px-4 py-3 font-medium w-16">{t("ranking.rankHeader")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("ranking.harnessHeader")}</th>
              <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">{t("ranking.categoryHeader")}</th>
              <th className="text-center px-4 py-3 font-medium hidden sm:table-cell w-24">{t("ranking.agentHeader")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((harness) => {
              const paddedId = String(harness.id).padStart(2, "0");
              const category = CATEGORIES.find((c) => c.slug === harness.category);
              const categoryLabel = locale === "en" ? (category?.labelEn ?? "") : (category?.label ?? "");
              return (
                <tr
                  key={harness.id}
                  className="border-t border-[var(--border)] hover:bg-[var(--secondary)] transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="font-mono font-bold text-[var(--muted-foreground)]">
                      {harness.popularityRank}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/harness/${paddedId}`}
                      className="hover:text-[var(--primary)] transition-colors focus-ring rounded"
                    >
                      <div className="font-medium text-[var(--foreground)]">{harness.name}</div>
                      <div className="text-xs text-[var(--muted-foreground)] truncate max-w-xs">
                        {harness.description}
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {category && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: category.color }}
                      >
                        {categoryLabel}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center hidden sm:table-cell">
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {t("card.agents", { count: harness.agentCount })}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-[var(--muted-foreground)]">
          <p className="text-sm">{t("ranking.emptyCategory")}</p>
        </div>
      )}
    </div>
  );
}
