import { cn } from "@/lib/cn";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export function Select({ className, children, ...rest }: SelectProps) {
  return (
    <select
      className={cn(
        "rounded-lg border border-[var(--select-border)] bg-[var(--select-bg)] text-[var(--select-fg)] text-sm",
        "px-3 py-2",
        "focus-visible:outline-2 focus-visible:outline-[var(--ring)] focus-visible:outline-offset-2",
        "transition-base",
        className,
      )}
      {...rest}
    >
      {children}
    </select>
  );
}
