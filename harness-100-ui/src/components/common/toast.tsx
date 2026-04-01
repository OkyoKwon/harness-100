"use client";

import type { ToastItem } from "@/hooks/use-toast";

interface ToastProps {
  readonly item: ToastItem;
  readonly onDismiss: () => void;
}

const TYPE_STYLES: Record<ToastItem["type"], string> = {
  success: "border-[var(--success-border)] bg-[var(--success-bg)] text-[var(--success-foreground)]",
  error: "border-[var(--danger-border)] bg-[var(--danger-bg)] text-[var(--danger-foreground)]",
  info: "border-[var(--info-border)] bg-[var(--info-bg)] text-[var(--info-foreground)]",
};

const TYPE_ICONS: Record<ToastItem["type"], string> = {
  success: "✓",
  error: "✕",
  info: "ℹ",
};

export function Toast({ item, onDismiss }: ToastProps) {
  return (
    <div
      className={`flex items-start gap-2 rounded-lg border px-3 py-2.5 shadow-[var(--shadow-md)] text-sm animate-toast-in ${TYPE_STYLES[item.type]}`}
      role="status"
      aria-live="polite"
    >
      <span className="shrink-0 font-bold text-xs mt-0.5">{TYPE_ICONS[item.type]}</span>
      <p className="flex-1 text-xs leading-relaxed">{item.message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity text-xs"
        aria-label="닫기"
      >
        ✕
      </button>
    </div>
  );
}
