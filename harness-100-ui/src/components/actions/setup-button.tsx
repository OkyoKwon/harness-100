"use client";

interface SetupButtonProps {
  readonly onClick: () => void;
  readonly disabled?: boolean;
  readonly size?: "sm" | "md";
}

export function SetupButton({ onClick, disabled, size = "md" }: SetupButtonProps) {
  const sizeClass = size === "sm" ? "px-3 py-1 text-xs" : "px-4 py-2 text-sm";

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      disabled={disabled}
      className={`${sizeClass} rounded-lg font-medium bg-[var(--primary)] text-[var(--primary-foreground)] hover:brightness-110 active:brightness-95 disabled:opacity-50 transition-all focus-visible:outline-2 focus-visible:outline-[var(--ring)] focus-visible:outline-offset-2`}
    >
      세팅 →
    </button>
  );
}
