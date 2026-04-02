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

function createWrapper() {
  return function Wrapper({ children }: { children: ReactNode }) {
    return React.createElement(LanguageProvider, null, children);
  };
}

beforeEach(() => {
  mockClearCache.mockReset();
  // Reset documentElement lang
  document.documentElement.lang = "";
});

describe("useLocale (without provider)", () => {
  it("returns default values when used outside provider", () => {
    const { result } = renderHook(() => useLocale());
    expect(result.current.locale).toBe("ko");
    // t returns key as fallback in default context
    expect(result.current.t("nav.ranking")).toBe("nav.ranking");
  });
});

describe("LanguageProvider + useLocale", () => {
  it("defaults to ko locale", () => {
    const { result } = renderHook(() => useLocale(), {
      wrapper: createWrapper(),
    });
    expect(result.current.locale).toBe("ko");
  });

  it("provides translation function that resolves keys", () => {
    const { result } = renderHook(() => useLocale(), {
      wrapper: createWrapper(),
    });
    // Default locale is ko
    expect(result.current.t("nav.ranking")).toBe("랭킹");
  });

  it("switches locale to en", () => {
    const { result } = renderHook(() => useLocale(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setLocale("en");
    });

    expect(result.current.locale).toBe("en");
    expect(result.current.t("nav.ranking")).toBe("Ranking");
  });

  it("persists locale to localStorage", () => {
    const { result } = renderHook(() => useLocale(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setLocale("en");
    });

    expect(localStorage.getItem("harness100_lang")).toBe("en");
  });

  it("sets document.documentElement.lang when locale changes", () => {
    const { result } = renderHook(() => useLocale(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setLocale("en");
    });

    expect(document.documentElement.lang).toBe("en");
  });

  it("calls clearCache when locale changes", () => {
    const { result } = renderHook(() => useLocale(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setLocale("en");
    });

    expect(mockClearCache).toHaveBeenCalled();
  });

  it("reads stored locale from localStorage on mount", () => {
    localStorage.setItem("harness100_lang", "en");

    const { result } = renderHook(() => useLocale(), {
      wrapper: createWrapper(),
    });

    // useEffect runs after render, so locale may still be "ko" initially
    // but after effects settle it should be "en"
    // The hook uses useState default + useEffect, so we check after act
    act(() => {
      // trigger effect flush
    });

    // After effect, locale should reflect stored value
    expect(result.current.locale).toBe("en");
  });

  it("falls back to ko for invalid stored locale", () => {
    localStorage.setItem("harness100_lang", "fr");

    const { result } = renderHook(() => useLocale(), {
      wrapper: createWrapper(),
    });

    act(() => {});

    expect(result.current.locale).toBe("ko");
  });

  it("supports interpolation in t function", () => {
    const { result } = renderHook(() => useLocale(), {
      wrapper: createWrapper(),
    });

    const text = result.current.t("catalog.resultCount", { count: 10 });
    expect(text).toBe("10개 결과");
  });
});
