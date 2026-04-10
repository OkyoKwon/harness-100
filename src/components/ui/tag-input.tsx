"use client";

import { useState, useCallback, useId, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";

interface TagInputProps {
  readonly tags: ReadonlyArray<string>;
  readonly onChange: (tags: ReadonlyArray<string>) => void;
  readonly label?: string;
  readonly helperText?: string;
  readonly placeholder?: string;
  readonly className?: string;
}

export function TagInput({ tags, onChange, label, helperText, placeholder, className }: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const id = useId();
  const helperId = helperText ? `${id}-helper` : undefined;

  const addTag = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) return;
      if (tags.includes(trimmed)) return;
      onChange([...tags, trimmed]);
    },
    [tags, onChange],
  );

  const removeTag = useCallback(
    (index: number) => {
      onChange(tags.filter((_, i) => i !== index));
    },
    [tags, onChange],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        addTag(inputValue);
        setInputValue("");
      } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
        removeTag(tags.length - 1);
      }
    },
    [inputValue, tags, addTag, removeTag],
  );

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-[var(--foreground)]">
          {label}
        </label>
      )}
      <div
        className="flex flex-wrap gap-1.5 rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 transition-base focus-within:outline-2 focus-within:outline-[var(--ring)] focus-within:outline-offset-2"
      >
        {tags.map((tag, i) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-md bg-[var(--muted)] px-2 py-0.5 text-xs text-[var(--foreground)]"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(i)}
              className="hover:text-red-500 transition-base focus-ring rounded"
              aria-label={`Remove ${tag}`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </span>
        ))}
        <input
          id={id}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (inputValue.trim()) {
              addTag(inputValue);
              setInputValue("");
            }
          }}
          placeholder={tags.length === 0 ? placeholder : ""}
          aria-describedby={helperId}
          className="min-w-[120px] flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--input-placeholder)]"
        />
      </div>
      {helperText && (
        <p id={helperId} className="text-xs text-[var(--muted-foreground)]">
          {helperText}
        </p>
      )}
    </div>
  );
}
