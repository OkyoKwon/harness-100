import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useToastState, useToast, ToastContext } from "../use-toast";
import React from "react";
import type { ReactNode } from "react";

beforeEach(() => {
  vi.useFakeTimers();
});

describe("useToastState", () => {
  it("starts with empty toasts", () => {
    const { result } = renderHook(() => useToastState());
    expect(result.current.toasts).toEqual([]);
  });

  it("adds a toast with default success type", () => {
    const { result } = renderHook(() => useToastState());
    act(() => {
      result.current.addToast("Hello");
    });
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].message).toBe("Hello");
    expect(result.current.toasts[0].type).toBe("success");
  });

  it("adds a toast with specified type", () => {
    const { result } = renderHook(() => useToastState());
    act(() => {
      result.current.addToast("Error occurred", "error");
    });
    expect(result.current.toasts[0].type).toBe("error");
  });

  it("adds multiple toasts with unique ids", () => {
    const { result } = renderHook(() => useToastState());
    act(() => {
      result.current.addToast("First");
      result.current.addToast("Second");
    });
    expect(result.current.toasts).toHaveLength(2);
    expect(result.current.toasts[0].id).not.toBe(result.current.toasts[1].id);
  });

  it("removes a toast by id", () => {
    const { result } = renderHook(() => useToastState());
    act(() => {
      result.current.addToast("To remove");
    });
    const id = result.current.toasts[0].id;
    act(() => {
      result.current.removeToast(id);
    });
    expect(result.current.toasts).toHaveLength(0);
  });

  it("auto-removes toast after 5 seconds", () => {
    const { result } = renderHook(() => useToastState());
    act(() => {
      result.current.addToast("Temporary");
    });
    expect(result.current.toasts).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.toasts).toHaveLength(0);
  });

  it("does not remove toast before 5 seconds", () => {
    const { result } = renderHook(() => useToastState());
    act(() => {
      result.current.addToast("Temporary");
    });
    act(() => {
      vi.advanceTimersByTime(4999);
    });
    expect(result.current.toasts).toHaveLength(1);
  });

  it("supports info type", () => {
    const { result } = renderHook(() => useToastState());
    act(() => {
      result.current.addToast("Info message", "info");
    });
    expect(result.current.toasts[0].type).toBe("info");
  });
});

describe("useToast (context consumer)", () => {
  it("returns default context values when used outside provider", () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.toasts).toEqual([]);
    // addToast and removeToast are no-ops in default context
    act(() => {
      result.current.addToast("test");
    });
    expect(result.current.toasts).toEqual([]);
  });

  it("works with ToastContext provider", () => {
    const mockAddToast = vi.fn();
    const mockRemoveToast = vi.fn();
    const value = {
      toasts: [{ id: 1, message: "Provided", type: "success" as const }],
      addToast: mockAddToast,
      removeToast: mockRemoveToast,
    };

    const wrapper = ({ children }: { children: ReactNode }) =>
      React.createElement(ToastContext.Provider, { value }, children);

    const { result } = renderHook(() => useToast(), { wrapper });
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].message).toBe("Provided");
  });
});
