"use client";

export type SortKey = "id" | "name" | "agentCount";

interface SortFilterBarProps {
  readonly sortKey: SortKey;
  readonly onSortChange: (key: SortKey) => void;
  readonly resultCount: number;
  readonly hasQuery: boolean;
}

const SORT_OPTIONS: ReadonlyArray<{ readonly key: SortKey; readonly label: string }> = [
  { key: "id", label: "번호순" },
  { key: "name", label: "이름순" },
  { key: "agentCount", label: "에이전트 수" },
];

export function SortFilterBar({ sortKey, onSortChange, resultCount, hasQuery }: SortFilterBarProps) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <div className="text-xs text-[var(--muted-foreground)]">
        {hasQuery ? `${resultCount}개 결과` : `${resultCount}개 하네스`}
      </div>
      <div className="flex items-center gap-1.5">
        <label htmlFor="sort-select" className="text-xs text-[var(--muted-foreground)] shrink-0">
          정렬
        </label>
        <select
          id="sort-select"
          value={sortKey}
          onChange={(e) => onSortChange(e.target.value as SortKey)}
          className="rounded-md border border-[var(--border)] bg-[var(--card)] px-2 py-1 text-xs text-[var(--foreground)] focus-visible:outline-2 focus-visible:outline-[var(--ring)] transition-base"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.key} value={opt.key}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
