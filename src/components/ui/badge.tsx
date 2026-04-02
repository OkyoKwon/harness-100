import { cn } from "@/lib/cn";

type BadgeVariant = "default" | "tool" | "framework" | "category";

interface BadgeProps {
  readonly variant?: BadgeVariant;
  readonly color?: string;
  readonly className?: string;
  readonly children: React.ReactNode;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  default: "bg-[var(--badge-default-bg)] text-[var(--badge-default-fg)]",
  tool: "bg-[var(--badge-tool-bg)] text-[var(--badge-tool-fg)]",
  framework: "bg-[var(--badge-framework-bg)] text-[var(--badge-framework-fg)]",
  category: "",
};

export function Badge({
  variant = "default",
  color,
  className,
  children,
}: BadgeProps) {
  const style =
    variant === "category" && color
      ? { backgroundColor: `${color}15`, color }
      : undefined;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        VARIANT_CLASSES[variant],
        className,
      )}
      style={style}
    >
      {children}
    </span>
  );
}
