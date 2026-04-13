"use client";

import { useState, useCallback, useEffect } from "react";
import { nanoid } from "nanoid";
import { getHarnessStore, type HarnessStore } from "@/lib/harness-store";
import { toHarness } from "@/lib/custom-harness-converter";
import type { Harness } from "@/lib/types";
import type { CustomHarness } from "@/lib/custom-harness-types";

export function useCustomHarnesses() {
  const [harnesses, setHarnesses] = useState<ReadonlyArray<CustomHarness>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [store, setStore] = useState<HarnessStore | null>(null);

  // Initialize store and load data (SSR-safe)
  useEffect(() => {
    let cancelled = false;

    getHarnessStore().then(async (s) => {
      if (cancelled) return;
      setStore(s);
      const all = await s.getAll();
      if (!cancelled) {
        setHarnesses(all);
        setIsLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, []);

  // Cross-tab sync
  useEffect(() => {
    if (!store) return;

    const unsubscribe = store.subscribe(async () => {
      const all = await store.getAll();
      setHarnesses(all);
    });

    return unsubscribe;
  }, [store]);

  const save = useCallback(async (harness: CustomHarness): Promise<boolean> => {
    const updated = { ...harness, updatedAt: new Date().toISOString() };

    // Optimistic update
    setHarnesses((prev) => {
      const idx = prev.findIndex((h) => h.id === harness.id);
      return idx >= 0
        ? prev.map((h, i) => (i === idx ? updated : h))
        : [...prev, updated];
    });

    try {
      const s = await getHarnessStore();
      await s.put(updated);
      return true;
    } catch {
      // Rollback
      const s = await getHarnessStore();
      const all = await s.getAll();
      setHarnesses(all);
      return false;
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    setHarnesses((prev) => prev.filter((h) => h.id !== id));

    try {
      const s = await getHarnessStore();
      await s.remove(id);
    } catch {
      // Rollback
      const s = await getHarnessStore();
      const all = await s.getAll();
      setHarnesses(all);
    }
  }, []);

  const duplicate = useCallback(async (id: string): Promise<CustomHarness | null> => {
    const source = harnesses.find((h) => h.id === id);
    if (!source) return null;

    const now = new Date().toISOString();
    const copy: CustomHarness = {
      ...source,
      id: nanoid(),
      name: `${source.name} (copy)`,
      slug: `${source.slug}-copy`,
      createdAt: now,
      updatedAt: now,
    };

    setHarnesses((prev) => [...prev, copy]);

    try {
      const s = await getHarnessStore();
      await s.put(copy);
    } catch {
      // Rollback
      const s = await getHarnessStore();
      const all = await s.getAll();
      setHarnesses(all);
      return null;
    }

    return copy;
  }, [harnesses]);

  const getById = useCallback(
    (id: string): CustomHarness | undefined => harnesses.find((h) => h.id === id),
    [harnesses],
  );

  const convertToHarness = useCallback(
    (id: string): Harness | null => {
      const custom = harnesses.find((h) => h.id === id);
      if (!custom) return null;
      return toHarness(custom);
    },
    [harnesses],
  );

  return {
    harnesses,
    isLoading,
    save,
    remove,
    duplicate,
    getById,
    convertToHarness,
  } as const;
}
