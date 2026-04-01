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
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      disabled={disabled}
      className={`${sizeClass} rounded-lg font-medium border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)] active:bg-[var(--secondary)] disabled:opacity-50 transition-colors focus-visible:outline-2 focus-visible:outline-[var(--ring)] focus-visible:outline-offset-2`}
    >
      ZIP ↓
    </button>
  );
}
