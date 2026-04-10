import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import React from "react";
import { LanguageProvider, useLocale } from "../use-locale";
import type { ReactNode } from "react";

// Mock clearCache from harness-loader
vi.mock("@/lib/harness-loader", () => ({
  clearCache: vi.fn(),
}));

import { clearCache } from "@/lib/harness-loader";
const mockClearCache = vi.mocked(clearCache);

// Mock fetch for detectLocaleByIP — return "KR" by default so provider detects ko
const mockFetch = vi.fn();

function createWrapper() {
  return function Wrapper({ children }: { children: ReactNode }) {
    return React.createElement(LanguageProvider, null, children);
  };
}

beforeEach(() => {
  mockClearCache.mockReset();
  mockFetch.mockReset();
  // Default: detectLocaleByIP returns "KR" → locale becomes "ko"
  mockFetch.mockResolvedValue({
    ok: true,
    text: () => Promise.resolve("KR"),
  });
  vi.stubGlobal("fetch", mockFetch);
  // Reset documentElement lang
  document.documentElement.lang = "";
});

describe("useLocale (without provider)", () => {
  it("returns default values when used outside provider", () => {
    // Arrange & Act
    const { result } = renderHook(() => useLocale());

    // Assert — DEFAULT_LOCALE is "ko"
    expect(result.current.locale).toBe("ko");
    // t returns key as fallback in default context
    expect(result.current.t("nav.ranking")).toBe("nav.ranking");
  });
});

describe("LanguageProvider + useLocale", () => {
  it("defaults to ko locale (DEFAULT_LOCALE)", () => {
    // Arrange — no stored locale, IP detection hasn't resolved yet
    mockFetch.mockReturnValue(new Promise(() => {})); // never resolves

    // Act
    const { result } = renderHook(() => useLocale(), {
      wrapper: createWrapper(),
    });

    // Assert
    expect(result.current.locale).toBe("ko");
  });

  it("detects ko locale via IP when no stored preference", async () => {
    // Arrange — IP returns KR
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("KR"),
    });

    // Act
    const { result } = renderHook(() => useLocale(), {
      wrapper: createWrapper(),
    });

    // Assert — after effect settles, locale should be "ko"
    await act(async () => {});
    expect(result.current.locale).toBe("ko");
  });

  it("provides translation function that resolves keys", async () => {
    // Arrange & Act
    const { result } = renderHook(() => useLocale(), {
      wrapper: createWrapper(),
    });

    // Wait for IP detection to settle (returns KR → ko)
    await act(async () => {});
    expect(result.current.t("nav.ranking")).toBe("랭킹");
  });

  it("switches locale to en", async () => {
    // Arrange
    const { result } = renderHook(() => useLocale(), {
      wrapper: createWrapper(),
    });
    await act(async () => {});

    // Act
    act(() => {
      result.current.setLocale("en");
    });

    // Assert
    expect(result.current.locale).toBe("en");
    expect(result.current.t("nav.ranking")).toBe("Ranking");
  });

  it("persists locale to localStorage", async () => {
    // Arrange
    const { result } = renderHook(() => useLocale(), {
      wrapper: createWrapper(),
    });
    await act(async () => {});

    // Act
    act(() => {
      result.current.setLocale("en");
    });

    // Assert
    expect(localStorage.getItem("harness100_lang")).toBe("en");
  });

  it("sets document.documentElement.lang when locale changes", async () => {
    // Arrange
    const { result } = renderHook(() => useLocale(), {
      wrapper: createWrapper(),
    });
    await act(async () => {});

    // Act
    act(() => {
      result.current.setLocale("en");
    });

    // Assert
    expect(document.documentElement.lang).toBe("en");
  });

  it("calls clearCache when locale changes", async () => {
    // Arrange
    const { result } = renderHook(() => useLocale(), {
      wrapper: createWrapper(),
    });
    await act(async () => {});

    // Act
    act(() => {
      result.current.setLocale("en");
    });

    // Assert
    expect(mockClearCache).toHaveBeenCalled();
  });

  it("reads stored locale from localStorage on mount", () => {
    // Arrange
    localStorage.setItem("harness100_lang", "en");

    // Act
    const { result } = renderHook(() => useLocale(), {
      wrapper: createWrapper(),
    });
    act(() => {});

    // Assert — stored locale "en" is used, IP detection skipped
    expect(result.current.locale).toBe("en");
  });

  it("falls back to DEFAULT_LOCALE for invalid stored locale", async () => {
    // Arrange
    localStorage.setItem("harness100_lang", "fr");
    // IP detection returns non-KR → stays as DEFAULT_LOCALE "en"
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("US"),
    });

    // Act
    const { result } = renderHook(() => useLocale(), {
      wrapper: createWrapper(),
    });
    await act(async () => {});

    // Assert — "fr" is invalid, so IP detection runs and returns "en"
    expect(result.current.locale).toBe("en");
  });

  it("supports interpolation in t function", async () => {
    // Arrange
    const { result } = renderHook(() => useLocale(), {
      wrapper: createWrapper(),
    });
    await act(async () => {});

    // Assert — locale is "ko" (IP returned KR)
    const text = result.current.t("catalog.resultCount", { count: 10 });
    expect(text).toBe("10개 결과");
  });

  it("detects en locale when IP returns non-KR country", async () => {
    // Arrange
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("US"),
    });

    // Act
    const { result } = renderHook(() => useLocale(), {
      wrapper: createWrapper(),
    });
    await act(async () => {});

    // Assert
    expect(result.current.locale).toBe("en");
  });

  it("falls back to DEFAULT_LOCALE when IP detection fails", async () => {
    // Arrange
    mockFetch.mockRejectedValue(new Error("Network error"));

    // Act
    const { result } = renderHook(() => useLocale(), {
      wrapper: createWrapper(),
    });
    await act(async () => {});

    // Assert — DEFAULT_LOCALE is now "ko"
    expect(result.current.locale).toBe("ko");
  });
});
