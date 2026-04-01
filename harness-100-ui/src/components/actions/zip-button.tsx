"use client";

interface ZipButtonProps {
  readonly onClick: () => void;
  readonly disabled?: boolean;
  readonly size?: "sm" | "md";
}

export function ZipButton({ onClick, disabled, size = "md" }: ZipButtonProps) {
  const sizeClass = size === "sm" ? "px-3 py-1 text-xs" : "px-4 py-2 text-sm";

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      disabled={disabled}
      className={`${sizeClass} rounded-lg font-medium border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)] disabled:opacity-50 transition-colors`}
    >
      ZIP ↓
    </button>
  );
}
