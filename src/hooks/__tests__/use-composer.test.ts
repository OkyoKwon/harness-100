import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useComposer } from "../use-composer";
import type { Harness } from "@/lib/types";
import {
  createHarness,
  resetFixtureCounter,
} from "@/test/mocks/harness-fixtures";

// Mock dependencies
vi.mock("@/lib/harness-loader", () => ({
  loadHarnessDetail: vi.fn(),
  clearCache: vi.fn(),
}));

vi.mock("@/lib/merge-harnesses", () => ({
  mergeHarnesses: vi.fn(),
}));

vi.mock("@/hooks/use-locale", () => ({
  useLocale: () => ({
    locale: "ko" as const,
    setLocale: vi.fn(),
    t: (key: string) => key,
  }),
}));

import { loadHarnessDetail } from "@/lib/harness-loader";
import { mergeHarnesses } from "@/lib/merge-harnesses";

const mockLoadHarnessDetail = vi.mocked(loadHarnessDetail);
const mockMergeHarnesses = vi.mocked(mergeHarnesses);

beforeEach(() => {
  resetFixtureCounter();
  mockLoadHarnessDetail.mockReset();
  mockMergeHarnesses.mockReset();
});

describe("useComposer", () => {
  // ── Initial state ──
  it("starts with empty selection and no merged result", () => {
    const { result } = renderHook(() => useComposer());
    expect(result.current.selectedIds).toEqual([]);
    expect(result.current.loadedHarnesses).toEqual([]);
    expect(result.current.merged).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  // ── addHarness ──
  it("adds a harness id to selection", () => {
    const { result } = renderHook(() => useComposer());
    act(() => {
      result.current.addHarness(1);
    });
    expect(result.current.selectedIds).toEqual([1]);
  });

  it("does not add duplicate ids", () => {
    const { result } = renderHook(() => useComposer());
    act(() => {
      result.current.addHarness(1);
    });
    act(() => {
      result.current.addHarness(1);
    });
    expect(result.current.selectedIds).toEqual([1]);
  });

  // ── removeHarness ──
  it("removes a harness id from selection", () => {
    const { result } = renderHook(() => useComposer());
    act(() => {
      result.current.addHarness(1);
      result.current.addHarness(2);
    });
    act(() => {
      result.current.removeHarness(1);
    });
    expect(result.current.selectedIds).toEqual([2]);
  });

  it("does nothing when removing non-existent id", () => {
    const { result } = renderHook(() => useComposer());
    act(() => {
      result.current.addHarness(1);
    });
    act(() => {
      result.current.removeHarness(99);
    });
    expect(result.current.selectedIds).toEqual([1]);
  });

  // ── isSelected ──
  it("returns true for selected ids", () => {
    const { result } = renderHook(() => useComposer());
    act(() => {
      result.current.addHarness(5);
    });
    expect(result.current.isSelected(5)).toBe(true);
    expect(result.current.isSelected(99)).toBe(false);
  });

  // ── clear ──
  it("resets all state to initial", () => {
    const { result } = renderHook(() => useComposer());
    act(() => {
      result.current.addHarness(1);
      result.current.addHarness(2);
    });
    act(() => {
      result.current.clear();
    });
    expect(result.current.selectedIds).toEqual([]);
    expect(result.current.loadedHarnesses).toEqual([]);
    expect(result.current.merged).toBeNull();
  });

  // ── setSelectedIds ──
  it("replaces all selected ids at once", () => {
    const { result } = renderHook(() => useComposer());
    act(() => {
      result.current.setSelectedIds([10, 20, 30]);
    });
    expect(result.current.selectedIds).toEqual([10, 20, 30]);
  });

  // ── Loading & merging ──
  it("loads harness details and merges when ids change", async () => {
    const h1 = createHarness({ id: 1 });
    const h2 = createHarness({ id: 2 });
    const merged = createHarness({ id: 0, name: "Merged" });

    mockLoadHarnessDetail.mockImplementation(async (id: number) => {
      if (id === 1) return h1;
      return h2;
    });
    mockMergeHarnesses.mockReturnValue(merged);

    const { result } = renderHook(() => useComposer());

    act(() => {
      result.current.setSelectedIds([1, 2]);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.merged).not.toBeNull();
    });

    expect(mockLoadHarnessDetail).toHaveBeenCalledTimes(2);
    expect(mockMergeHarnesses).toHaveBeenCalledWith([h1, h2], "ko");
    expect(result.current.loadedHarnesses).toEqual([h1, h2]);
    expect(result.current.merged).toBe(merged);
  });

  it("clears loaded data when selection becomes empty", async () => {
    const h1 = createHarness({ id: 1 });
    mockLoadHarnessDetail.mockResolvedValue(h1);
    mockMergeHarnesses.mockReturnValue(h1);

    const { result } = renderHook(() => useComposer());

    act(() => {
      result.current.addHarness(1);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.removeHarness(1);
    });

    await waitFor(() => {
      expect(result.current.loadedHarnesses).toEqual([]);
      expect(result.current.merged).toBeNull();
    });
  });

  it("handles load errors gracefully", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockLoadHarnessDetail.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useComposer());

    act(() => {
      result.current.addHarness(1);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
