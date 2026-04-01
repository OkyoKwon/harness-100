"use client";

import { useState, useMemo } from "react";
import Fuse, { type IFuseOptions } from "fuse.js";
import type { HarnessMeta } from "@/lib/types";

interface HarnessSelectorProps {
  readonly catalog: ReadonlyArray<HarnessMeta>;
  readonly selectedIds: ReadonlyArray<number>;
  readonly onAdd: (id: number) => void;
  readonly onRemove: (id: number) => void;
}

const FUSE_OPTIONS: IFuseOptions<HarnessMeta> = {
  keys: [
    { name: "name", weight: 2 },
    { name: "slug", weight: 1.5 },
    { name: "description", weight: 1 },
  ],
  threshold: 0.4,
  includeScore: true,
};

function padId(id: number): string {
  return String(id).padStart(2, "0");
}

export function HarnessSelector({
  catalog,
  selectedIds,
  onAdd,
  onRemove,
}: HarnessSelectorProps) {
  const [query, setQuery] = useState("");

  const fuse = useMemo(
    () => new Fuse([...catalog], FUSE_OPTIONS),
    [catalog],
  );

  const filteredItems = useMemo(() => {
    if (!query.trim()) return catalog;
    return fuse.search(query).map((r) => r.item);
  }, [fuse, query, catalog]);

  const selectedSet = useMemo(
    () => new Set(selectedIds),
    [selectedIds],
  );

  const handleToggle = (id: number) => {
    if (selectedSet.has(id)) {
      onRemove(id);
    } else {
      onAdd(id);
    }
  };

  return (
    <div className="flex h-full flex-col rounded-lg border border-[var(--border)] bg-[var(--card)]">
      {/* Search input */}
      <div className="border-b border-[var(--border)] p-3">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">
            🔍
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="에이전트 팀 검색..."
            className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] py-2 pl-9 pr-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] transition-colors focus:border-[var(--ring)] focus:outline-none focus-visible:outline-2 focus-visible:outline-[var(--ring)] focus-visible:outline-offset-2"
          />
        </div>
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredItems.length === 0 ? (
          <p className="px-2 py-4 text-center text-sm text-[var(--muted-foreground)]">
            검색 결과가 없습니다.
          </p>
        ) : (
          <ul className="space-y-1">
            {filteredItems.map((item) => {
              const selected = selectedSet.has(item.id);
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleToggle(item.id)}
                    className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-[var(--ring)] focus-visible:outline-offset-2 ${
                      selected
                        ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "hover:bg-[var(--muted)] text-[var(--foreground)]"
                    }`}
                  >
                    <span className="shrink-0 text-xs">
                      {selected ? "✅" : "☐"}
                    </span>
                    <span className="shrink-0 font-mono text-xs opacity-60">
                      {padId(item.id)}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {item.name}
                    </span>
                    <span className="shrink-0 text-xs opacity-60">
                      {item.agentCount}명
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-[var(--border)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
        선택됨: {selectedIds.length}개
      </div>
    </div>
  );
}
