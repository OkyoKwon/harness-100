"use client";

import { createContext, useContext, useCallback, useState } from "react";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  readonly id: number;
  readonly message: string;
  readonly type: ToastType;
}

export interface ToastContextValue {
  readonly toasts: ReadonlyArray<ToastItem>;
  readonly addToast: (message: string, type?: ToastType) => void;
  readonly removeToast: (id: number) => void;
}

let nextId = 0;

export const ToastContext = createContext<ToastContextValue>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
});

export function useToastState(): ToastContextValue {
  const [toasts, setToasts] = useState<ReadonlyArray<ToastItem>>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = "success") => {
    const id = ++nextId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 5000);
  }, [removeToast]);

  return { toasts, addToast, removeToast };
}

export function useToast(): ToastContextValue {
  return useContext(ToastContext);
}
