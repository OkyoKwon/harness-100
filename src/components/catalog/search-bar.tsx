"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { useLocale } from "@/hooks/use-locale";

interface SearchBarProps {
  readonly onSearch: (query: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const { t } = useLocale();
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isDebouncing, setIsDebouncing] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setIsDebouncing(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        onSearch(e.target.value);
        setIsDebouncing(false);
      }, 300);
    },
    [onSearch],
  );

  // "/" keyboard shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !e.ctrlKey &&
        !e.metaKey &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA" &&
        document.activeElement?.tagName !== "SELECT"
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>

      <input
        ref={inputRef}
        type="text"
        placeholder={t("search.placeholder")}
        onChange={handleChange}
        className="w-full pl-10 pr-16 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm hover:border-[var(--primary)] focus-visible:outline-2 focus-visible:outline-[var(--ring)] focus-visible:outline-offset-2 transition-base"
      />

      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
        {/* Debounce loading indicator */}
        {isDebouncing && (
          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[var(--muted)] border-t-[var(--primary)]" />
        )}

        {/* Keyboard shortcut hint */}
        <kbd className="hidden sm:inline-flex items-center rounded border border-[var(--border)] bg-[var(--muted)] px-1.5 py-0.5 text-[10px] font-mono text-[var(--muted-foreground)]">
          /
        </kbd>
      </div>
    </div>
  );
}
