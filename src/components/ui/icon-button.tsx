import { cn } from "@/lib/cn";

interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly ariaLabel: string;
  readonly size?: "sm" | "md";
}

const SIZE_CLASSES = {
  sm: "p-1 min-w-[44px] min-h-[44px] flex items-center justify-center",
  md: "p-1.5 min-w-[44px] min-h-[44px] flex items-center justify-center",
} as const;

export function IconButton({
  ariaLabel,
  size = "md",
  className,
  children,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={cn(
        "rounded-md text-[var(--muted-foreground)]",
        "hover:text-[var(--foreground)] hover:bg-[var(--muted)]",
        "transition-base focus-ring",
        SIZE_CLASSES[size],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
