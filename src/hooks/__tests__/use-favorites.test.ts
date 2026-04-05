import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFavorites } from "../use-favorites";
import { STORAGE_KEYS } from "@/lib/constants";

describe("useFavorites", () => {
  beforeEach(() => {
    // jsdom URL reset
    Object.defineProperty(window, "location", {
      writable: true,
      value: {
        ...window.location,
        search: "",
        origin: "http://localhost",
      },
    });
  });

  it("starts with empty favorites", () => {
    const { result } = renderHook(() => useFavorites());
    expect(result.current.favorites).toEqual([]);
  });

  it("hydrates from localStorage on mount", async () => {
    localStorage.setItem(STORAGE_KEYS.favorites, "[1,2,3]");

    const { result } = renderHook(() => useFavorites());

    // useEffect runs asynchronously, wait for state update
    await vi.waitFor(() => {
      expect(result.current.favorites).toEqual([1, 2, 3]);
    });
  });

  it("hydrates from URL params when present", async () => {
    Object.defineProperty(window, "location", {
      writable: true,
      value: {
        ...window.location,
        search: "?favorites=5,10,15",
        origin: "http://localhost",
      },
    });

    const { result } = renderHook(() => useFavorites());

    await vi.waitFor(() => {
      expect(result.current.favorites).toEqual([5, 10, 15]);
    });
  });

  it("URL params merge with localStorage favorites", async () => {
    localStorage.setItem(STORAGE_KEYS.favorites, "[99]");
    Object.defineProperty(window, "location", {
      writable: true,
      value: {
        ...window.location,
        search: "?favorites=1,2",
        origin: "http://localhost",
      },
    });

    const { result } = renderHook(() => useFavorites());

    await vi.waitFor(() => {
      expect(result.current.favorites).toEqual([99, 1, 2]);
    });
  });

  it("toggles a favorite on", () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.toggle(42);
    });

    expect(result.current.isFavorite(42)).toBe(true);
  });

  it("toggles a favorite off on second toggle", () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.toggle(42);
    });
    act(() => {
      result.current.toggle(42);
    });

    expect(result.current.isFavorite(42)).toBe(false);
  });

  it("isFavorite returns false for non-favorite IDs", () => {
    const { result } = renderHook(() => useFavorites());

    expect(result.current.isFavorite(999)).toBe(false);
  });

  it("persists favorites to localStorage on toggle", () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.toggle(7);
    });

    const stored = localStorage.getItem(STORAGE_KEYS.favorites);
    expect(JSON.parse(stored!)).toEqual([7]);
  });

  it("generates a shareUrl with favorites", async () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.toggle(1);
    });
    act(() => {
      result.current.toggle(2);
    });

    expect(result.current.shareUrl).toBe("http://localhost?favorites=1,2");
  });

  it("returns empty shareUrl when no favorites", () => {
    const { result } = renderHook(() => useFavorites());

    expect(result.current.shareUrl).toBe("");
  });

  it("handles localStorage being unavailable gracefully", async () => {
    // Override localStorage to throw on getItem
    const throwingStorage = {
      ...localStorage,
      getItem: () => {
        throw new Error("SecurityError");
      },
      setItem: () => {
        throw new Error("SecurityError");
      },
    } as Storage;
    vi.stubGlobal("localStorage", throwingStorage);

    const { result } = renderHook(() => useFavorites());

    // Should not throw, gracefully falls back to empty
    expect(result.current.favorites).toEqual([]);

    // Toggle should also not throw
    act(() => {
      result.current.toggle(1);
    });
    expect(result.current.favorites).toEqual([1]);
  });
});
