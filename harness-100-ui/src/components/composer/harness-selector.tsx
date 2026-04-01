"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import Fuse, { type IFuseOptions } from "fuse.js";
import type { HarnessMeta } from "@/lib/types";
import { CATEGORIES } from "@/lib/constants";

interface HarnessSelectorProps {
  readonly catalog: ReadonlyArray<HarnessMeta>;
  readonly selectedIds: ReadonlyArray<number>;
  readonly onAdd: (id: number) => void;
  readonly onRemove: (id: number) => void;
}

const FUSE_OPTIONS: IFuseOptions<HarnessMeta> = {
  keys: ["name", "slug", "description"],
  threshold: 0.4,
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
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebouncedQuery(value), 200);
  }, []);

  const fuse = useMemo(() => new Fuse([...catalog], FUSE_OPTIONS), [catalog]);

  const filteredItems = useMemo(() => {
    if (!debouncedQuery.trim()) return catalog;
    return fuse.search(debouncedQuery).map((r) => r.item);
  }, [fuse, debouncedQuery, catalog]);

  const selectedItems = useMemo(
    () => catalog.filter((h) => selectedIds.includes(h.id)),
    [catalog, selectedIds],
  );

  const groupedItems = useMemo(() => {
    const items = filteredItems.filter((h) => !selectedIds.includes(h.id));
    const groups: { label: string; items: ReadonlyArray<HarnessMeta> }[] = [];
    for (const cat of CATEGORIES) {
      const catItems = items.filter((h) => h.category === cat.slug);
      if (catItems.length > 0) {
        groups.push({ label: cat.label, items: catItems });
      }
    }
    return groups;
  }, [filteredItems, selectedIds]);

  return (
    <div className="flex h-full flex-col rounded-lg border border-[var(--border)] bg-[var(--card)]">
      {/* Search */}
      <div className="border-b border-[var(--border)] p-3">
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="에이전트 팀 검색..."
          className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-[var(--ring)] focus-visible:outline-offset-2 transition-base"
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {/* Selected section */}
        {selectedItems.length > 0 && (
          <div className="border-b border-[var(--border)] p-2">
            <div className="px-2 py-1 text-xs font-semibold text-[var(--primary)]">
              선택됨 ({selectedItems.length})
            </div>
            {selectedItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onRemove(item.id)}
                className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm bg-[var(--info-bg)] text-[var(--foreground)] hover:bg-[var(--muted)] transition-base focus-ring"
              >
                <span className="text-[var(--primary)]">✓</span>
                <span className="text-xs opacity-60 font-mono">{padId(item.id)}</span>
                <span className="truncate font-medium flex-1 text-left">{item.name}</span>
                <span className="text-xs text-[var(--muted-foreground)]">✕</span>
              </button>
            ))}
          </div>
        )}

        {/* Categorized list */}
        <div className="p-2">
          {groupedItems.map((group) => (
            <div key={group.label} className="mb-2">
              <div className="px-2 py-1 text-xs font-semibold text-[var(--muted-foreground)]">
                {group.label}
              </div>
              {group.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onAdd(item.id)}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm text-[var(--foreground)] hover:bg-[var(--muted)] transition-base focus-ring"
                >
                  <span className="text-[var(--muted-foreground)]">○</span>
                  <span className="text-xs opacity-60 font-mono">{padId(item.id)}</span>
                  <span className="truncate font-medium flex-1 text-left">{item.name}</span>
                  <span className="text-xs text-[var(--muted-foreground)]">{item.agentCount}명</span>
                </button>
              ))}
            </div>
          ))}
          {groupedItems.length === 0 && debouncedQuery && (
            <div className="py-8 text-center text-sm text-[var(--muted-foreground)]">
              검색 결과 없음
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-[var(--border)] px-3 py-2">
        <span className="text-xs text-[var(--muted-foreground)]">
          {selectedIds.length}개 선택
        </span>
        {selectedIds.length > 0 && (
          <button
            onClick={() => selectedIds.forEach((id) => onRemove(id))}
            className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-base focus-ring rounded"
          >
            전체 해제
          </button>
        )}
      </div>
    </div>
  );
}
