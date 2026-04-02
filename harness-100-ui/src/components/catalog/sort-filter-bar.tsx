"use client";

import { useLocale } from "@/hooks/use-locale";

export type SortKey = "id" | "name" | "agentCount" | "popularity";

interface SortFilterBarProps {
  readonly sortKey: SortKey;
  readonly onSortChange: (key: SortKey) => void;
  readonly resultCount: number;
  readonly hasQuery: boolean;
}

export function SortFilterBar({ sortKey, onSortChange, resultCount, hasQuery }: SortFilterBarProps) {
  const { t } = useLocale();

  const sortOptions: ReadonlyArray<{ readonly key: SortKey; readonly label: string }> = [
    { key: "id", label: t("sort.byId") },
    { key: "popularity", label: t("sort.byPopularity") },
    { key: "name", label: t("sort.byName") },
    { key: "agentCount", label: t("sort.byAgentCount") },
  ];

  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <div className="text-xs text-[var(--muted-foreground)]">
        {hasQuery ? t("catalog.resultCount", { count: resultCount }) : t("catalog.harnessCount", { count: resultCount })}
      </div>
      <div className="flex items-center gap-1.5">
        <label htmlFor="sort-select" className="text-xs text-[var(--muted-foreground)] shrink-0">
          {t("sort.label")}
        </label>
        <select
          id="sort-select"
          value={sortKey}
          onChange={(e) => onSortChange(e.target.value as SortKey)}
          className="rounded-md border border-[var(--border)] bg-[var(--card)] px-2 py-1 text-xs text-[var(--foreground)] focus-visible:outline-2 focus-visible:outline-[var(--ring)] transition-base"
        >
          {sortOptions.map((opt) => (
            <option key={opt.key} value={opt.key}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
