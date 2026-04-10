"use client";

import { useState, useCallback, useMemo } from "react";
import type { Category } from "@/lib/types";
import type { BuilderMeta } from "@/lib/custom-harness-types";
import { validateMeta } from "@/lib/builder-validation";

const INITIAL_META: BuilderMeta = {
  name: "",
  description: "",
  category: "",
};

export function useBuilderMeta(initial?: BuilderMeta) {
  const [meta, setMeta] = useState<BuilderMeta>(initial ?? INITIAL_META);
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const updateField = useCallback((field: keyof BuilderMeta, value: string | ReadonlyArray<string>) => {
    setMeta((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => new Set([...prev, field]));
  }, []);

  const setCategory = useCallback((category: Category | "") => {
    setMeta((prev) => ({ ...prev, category }));
    setTouched((prev) => new Set([...prev, "category"]));
  }, []);

  const errors = useMemo(() => {
    const all = validateMeta(meta);
    // Only show errors for touched fields
    const filtered: Record<string, string> = {};
    for (const [key, value] of Object.entries(all)) {
      if (touched.has(key)) {
        filtered[key] = value;
      }
    }
    return filtered;
  }, [meta, touched]);

  const allErrors = useMemo(() => validateMeta(meta), [meta]);

  const isValid = useMemo(() => Object.keys(allErrors).length === 0, [allErrors]);

  const reset = useCallback((initial?: BuilderMeta) => {
    setMeta(initial ?? INITIAL_META);
    setTouched(new Set());
  }, []);

  const touchAll = useCallback(() => {
    setTouched(new Set(["name", "description", "category"]));
  }, []);

  return {
    meta,
    errors,
    allErrors,
    isValid,
    updateField,
    setCategory,
    reset,
    touchAll,
  } as const;
}
