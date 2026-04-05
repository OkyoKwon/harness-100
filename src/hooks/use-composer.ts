"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { Harness } from "@/lib/types";
import { loadHarnessDetail } from "@/lib/harness-loader";
import { mergeHarnesses } from "@/lib/merge-harnesses";
import { useLocale } from "@/hooks/use-locale";

interface ComposerState {
  readonly selectedIds: ReadonlyArray<number>;
  readonly loadedHarnesses: ReadonlyArray<Harness>;
  readonly merged: Harness | null;
  readonly loading: boolean;
}

const INITIAL_STATE: ComposerState = {
  selectedIds: [],
  loadedHarnesses: [],
  merged: null,
  loading: false,
};

export function useComposer() {
  const { locale } = useLocale();
  const [state, setState] = useState<ComposerState>(INITIAL_STATE);
  const loadingRef = useRef(false);

  const addHarness = useCallback((id: number) => {
    setState((prev) => {
      if (prev.selectedIds.includes(id)) return prev;
      return { ...prev, selectedIds: [...prev.selectedIds, id] };
    });
  }, []);

  const removeHarness = useCallback((id: number) => {
    setState((prev) => {
      if (!prev.selectedIds.includes(id)) return prev;
      return {
        ...prev,
        selectedIds: prev.selectedIds.filter((sid) => sid !== id),
      };
    });
  }, []);

  const isSelected = useCallback(
    (id: number) => state.selectedIds.includes(id),
    [state.selectedIds],
  );

  const clear = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  const setSelectedIds = useCallback((ids: ReadonlyArray<number>) => {
    setState((prev) => ({ ...prev, selectedIds: ids }));
  }, []);

  // Load harness details and compute merged result when selectedIds change
  useEffect(() => {
    const ids = state.selectedIds;

    if (ids.length === 0) {
      setState((prev) => ({
        ...prev,
        loadedHarnesses: [],
        merged: null,
        loading: false,
      }));
      return;
    }

    let cancelled = false;
    loadingRef.current = true;

    setState((prev) => ({ ...prev, loading: true }));

    const loadAll = async () => {
      try {
        const harnesses = await Promise.all(
          ids.map((id) => loadHarnessDetail(id, locale)),
        );

        if (cancelled) return;

        const merged =
          harnesses.length > 0 ? mergeHarnesses(harnesses, locale) : null;

        setState((prev) => ({
          ...prev,
          loadedHarnesses: harnesses,
          merged,
          loading: false,
        }));
      } catch (error) {
        if (cancelled) return;

        console.error("Failed to load harness details:", error);
        setState((prev) => ({ ...prev, loading: false }));
      } finally {
        loadingRef.current = false;
      }
    };

    loadAll();

    return () => {
      cancelled = true;
    };
  }, [state.selectedIds, locale]);

  return {
    selectedIds: state.selectedIds,
    loadedHarnesses: state.loadedHarnesses,
    merged: state.merged,
    loading: state.loading,
    addHarness,
    removeHarness,
    isSelected,
    clear,
    setSelectedIds,
  } as const;
}
