import { useId } from "react";
import { cn } from "@/lib/cn";

interface CheckboxProps {
  readonly checked: boolean;
  readonly onChange: (checked: boolean) => void;
  readonly label: string;
  readonly description?: string;
  readonly disabled?: boolean;
  readonly className?: string;
}

export function Checkbox({ checked, onChange, label, description, disabled, className }: CheckboxProps) {
  const id = useId();
  const descId = description ? `${id}-desc` : undefined;

  return (
    <label
      htmlFor={id}
      className={cn(
        "flex items-start gap-2.5 cursor-pointer select-none",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        aria-describedby={descId}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border border-[var(--input-border)] bg-[var(--input-bg)] accent-[var(--primary)] focus-visible:outline-2 focus-visible:outline-[var(--ring)] focus-visible:outline-offset-2"
      />
      <div className="flex flex-col gap-0.5">
        <span className="text-sm text-[var(--foreground)] leading-tight">{label}</span>
        {description && (
          <span id={descId} className="text-xs text-[var(--muted-foreground)] leading-tight">
            {description}
          </span>
        )}
      </div>
    </label>
  );
}
