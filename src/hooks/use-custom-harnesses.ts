"use client";

import { useState, useCallback, useEffect } from "react";
import { STORAGE_KEYS } from "@/lib/constants";
import { parseCustomHarnessStore } from "@/lib/builder-validation";
import { toHarness } from "@/lib/custom-harness-converter";
import { nanoid } from "nanoid";
import type { Harness } from "@/lib/types";
import type { CustomHarness, CustomHarnessStore } from "@/lib/custom-harness-types";

function persist(harnesses: ReadonlyArray<CustomHarness>): boolean {
  try {
    const store: CustomHarnessStore = { version: 1, harnesses };
    localStorage.setItem(STORAGE_KEYS.customHarnesses, JSON.stringify(store));
    return true;
  } catch {
    return false;
  }
}

export function useCustomHarnesses() {
  const [harnesses, setHarnesses] = useState<ReadonlyArray<CustomHarness>>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Read from localStorage on mount (avoids SSR/hydration mismatch)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.customHarnesses);
      const store = parseCustomHarnessStore(raw);
      setHarnesses(store.harnesses);
    } catch {
      // localStorage unavailable
    }
    setIsLoading(false);
  }, []);

  // Cross-tab sync
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.customHarnesses) {
        const store = parseCustomHarnessStore(e.newValue);
        setHarnesses(store.harnesses);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const save = useCallback((harness: CustomHarness): boolean => {
    let success = false;
    setHarnesses((prev) => {
      const idx = prev.findIndex((h) => h.id === harness.id);
      const updated = { ...harness, updatedAt: new Date().toISOString() };
      const next = idx >= 0
        ? prev.map((h, i) => (i === idx ? updated : h))
        : [...prev, updated];
      success = persist(next);
      return success ? next : prev;
    });
    return success;
  }, []);

  const remove = useCallback((id: string) => {
    setHarnesses((prev) => {
      const next = prev.filter((h) => h.id !== id);
      persist(next);
      return next;
    });
  }, []);

  const duplicate = useCallback((id: string): CustomHarness | null => {
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

    setHarnesses((prev) => {
      const next = [...prev, copy];
      persist(next);
      return next;
    });

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
