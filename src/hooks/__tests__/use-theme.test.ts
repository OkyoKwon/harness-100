import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTheme } from "../use-theme";

// Mock matchMedia for jsdom
const mockMatchMedia = vi.fn().mockReturnValue({
  matches: false,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
});

beforeEach(() => {
  vi.stubGlobal("matchMedia", mockMatchMedia);
  // Reset DOM state
  document.documentElement.removeAttribute("data-theme");
  localStorage.removeItem("harness100_theme");
  mockMatchMedia.mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
});

describe("useTheme", () => {
  // ── Initial state ──
  it("starts with system theme", () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("system");
  });

  it("resolves effective theme based on system preference", () => {
    const { result } = renderHook(() => useTheme());
    // In jsdom, matchMedia defaults to not matching, so effective = light
    expect(result.current.effective).toBe("light");
  });

  // ── setTheme ──
  it("switches to dark theme", () => {
    const { result } = renderHook(() => useTheme());
    act(() => {
      result.current.setTheme("dark");
    });
    expect(result.current.theme).toBe("dark");
    expect(result.current.effective).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("switches to light theme", () => {
    const { result } = renderHook(() => useTheme());
    act(() => {
      result.current.setTheme("light");
    });
    expect(result.current.theme).toBe("light");
    expect(result.current.effective).toBe("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("removes data-theme attribute when set to system", () => {
    const { result } = renderHook(() => useTheme());
    act(() => {
      result.current.setTheme("dark");
    });
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");

    act(() => {
      result.current.setTheme("system");
    });
    expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
  });

  it("persists theme to localStorage", () => {
    const { result } = renderHook(() => useTheme());
    act(() => {
      result.current.setTheme("dark");
    });
    expect(localStorage.getItem("harness100_theme")).toBe("dark");
  });

  // ── toggle ──
  it("toggles from light to dark", () => {
    const { result } = renderHook(() => useTheme());
    // default effective is light (jsdom)
    act(() => {
      result.current.toggle();
    });
    expect(result.current.theme).toBe("dark");
    expect(result.current.effective).toBe("dark");
  });

  it("toggles from dark back to light", () => {
    const { result } = renderHook(() => useTheme());
    act(() => {
      result.current.setTheme("dark");
    });
    act(() => {
      result.current.toggle();
    });
    expect(result.current.theme).toBe("light");
    expect(result.current.effective).toBe("light");
  });

  // ── Restore from localStorage ──
  it("restores dark theme from localStorage on mount", () => {
    localStorage.setItem("harness100_theme", "dark");

    const { result } = renderHook(() => useTheme());

    // After useEffect runs
    act(() => {});

    expect(result.current.theme).toBe("dark");
    expect(result.current.effective).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("ignores invalid stored theme and defaults to system", () => {
    localStorage.setItem("harness100_theme", "rainbow");

    const { result } = renderHook(() => useTheme());
    act(() => {});

    expect(result.current.theme).toBe("system");
  });
});
