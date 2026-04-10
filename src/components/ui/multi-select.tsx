"use client";

import { useState, useCallback, useRef, useEffect, useId } from "react";
import { cn } from "@/lib/cn";

interface Option {
  readonly value: string;
  readonly label: string;
}

interface MultiSelectProps {
  readonly options: ReadonlyArray<Option>;
  readonly selected: ReadonlyArray<string>;
  readonly onChange: (selected: ReadonlyArray<string>) => void;
  readonly label?: string;
  readonly helperText?: string;
  readonly placeholder?: string;
  readonly className?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  label,
  helperText,
  placeholder,
  className,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const helperId = helperText ? `${id}-helper` : undefined;

  const toggle = useCallback(
    (value: string) => {
      const next = selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value];
      onChange(next);
    },
    [selected, onChange],
  );

  const remove = useCallback(
    (value: string) => {
      onChange(selected.filter((v) => v !== value));
    },
    [selected, onChange],
  );

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const selectedLabels = selected.map(
    (v) => options.find((o) => o.value === v)?.label ?? v,
  );

  return (
    <div ref={containerRef} className={cn("relative flex flex-col gap-1", className)}>
      {label && (
        <label className="text-sm font-medium text-[var(--foreground)]">{label}</label>
      )}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        aria-expanded={open}
        aria-describedby={helperId}
        className={cn(
          "flex flex-wrap gap-1.5 rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-sm text-left",
          "hover:border-[var(--input-focus-border)] transition-base",
          "focus-visible:outline-2 focus-visible:outline-[var(--ring)] focus-visible:outline-offset-2",
          "min-h-[42px]",
        )}
      >
        {selectedLabels.length > 0 ? (
          selectedLabels.map((label, i) => (
            <span
              key={selected[i]}
              className="inline-flex items-center gap-1 rounded-md bg-[var(--muted)] px-2 py-0.5 text-xs"
            >
              {label}
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  remove(selected[i]);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.stopPropagation();
                    remove(selected[i]);
                  }
                }}
                className="hover:text-red-500 cursor-pointer"
                aria-label={`Remove ${label}`}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </span>
            </span>
          ))
        ) : (
          <span className="text-[var(--input-placeholder)]">
            {placeholder ?? "Select..."}
          </span>
        )}
      </button>

      {open && (
        <ul
          role="listbox"
          aria-multiselectable="true"
          className="absolute top-full left-0 right-0 z-20 mt-1 max-h-48 overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-md)]"
        >
          {options.map((option) => {
            const isSelected = selected.includes(option.value);
            return (
              <li
                key={option.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => toggle(option.value)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-[var(--muted)] transition-base",
                  isSelected && "bg-[var(--muted)]",
                )}
              >
                <span className={cn("h-4 w-4 rounded border border-[var(--input-border)] flex items-center justify-center text-xs", isSelected && "bg-[var(--primary)] border-[var(--primary)] text-white")}>
                  {isSelected && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </span>
                {option.label}
              </li>
            );
          })}
        </ul>
      )}

      {helperText && (
        <p id={helperId} className="text-xs text-[var(--muted-foreground)]">
          {helperText}
        </p>
      )}
    </div>
  );
}
