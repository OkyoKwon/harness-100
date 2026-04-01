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
      className={`${sizeClass} transition-colors hover:scale-110 ${
        active ? "text-amber-400" : "text-[var(--muted-foreground)] hover:text-amber-300"
      }`}
    >
      {active ? "★" : "☆"}
    </button>
  );
}
