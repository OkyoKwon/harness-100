"use client";

interface FavoriteToggleProps {
  readonly active: boolean;
  readonly onClick: () => void;
  readonly size?: "sm" | "md";
}

export function FavoriteToggle({ active, onClick, size = "md" }: FavoriteToggleProps) {
  const sizeClass = size === "sm" ? "text-lg" : "text-xl";

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      aria-label={active ? "즐겨찾기 해제" : "즐겨찾기 추가"}
      className={`${sizeClass} min-w-[44px] min-h-[44px] inline-flex items-center justify-center hover:scale-110 active:scale-95 transition-transform duration-150 focus-visible:outline-2 focus-visible:outline-[var(--ring)] focus-visible:outline-offset-2 focus-visible:rounded ${
        active ? "text-amber-400" : "text-[var(--muted-foreground)] hover:text-amber-300"
      }`}
    >
      {active ? "★" : "☆"}
    </button>
  );
}
