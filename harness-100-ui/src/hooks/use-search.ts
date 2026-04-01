"use client";

import { useState, useMemo, useCallback } from "react";
import Fuse, { type IFuseOptions } from "fuse.js";
import type { HarnessMeta } from "@/lib/types";

const FUSE_OPTIONS: IFuseOptions<HarnessMeta> = {
  keys: [
    { name: "name", weight: 2 },
    { name: "slug", weight: 1.5 },
    { name: "description", weight: 1 },
  ],
  threshold: 0.4,
  includeScore: true,
};

export function useSearch(items: ReadonlyArray<HarnessMeta>) {
  const [query, setQuery] = useState("");

  const fuse = useMemo(() => new Fuse([...items], FUSE_OPTIONS), [items]);

  const results = useMemo(() => {
    if (!query.trim()) return items;
    return fuse.search(query).map((r) => r.item);
  }, [fuse, query, items]);

  const updateQuery = useCallback((q: string) => {
    setQuery(q);
  }, []);

  return { query, results, updateQuery } as const;
}
