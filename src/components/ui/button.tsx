import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "outline" | "ghost" | "dashed";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly loading?: boolean;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--button-primary-bg)] text-[var(--button-primary-fg)] hover:brightness-110 active:brightness-95",
  outline:
    "border border-[var(--button-outline-border)] text-[var(--button-outline-fg)] hover:bg-[var(--muted)] active:bg-[var(--secondary)]",
  ghost:
    "text-[var(--button-ghost-fg)] hover:bg-[var(--button-ghost-hover-bg)]",
  dashed:
    "border border-dashed border-[var(--button-dashed-border)] text-[var(--button-dashed-fg)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "px-3 py-1 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={cn(
        "rounded-lg font-medium transition-base",
        "focus-visible:outline-2 focus-visible:outline-[var(--ring)] focus-visible:outline-offset-2",
        "disabled:opacity-50 disabled:pointer-events-none",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
      {...rest}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
