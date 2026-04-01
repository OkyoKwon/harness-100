"use client";

import { useState, useCallback } from "react";

interface CopyCliButtonProps {
  readonly text: string;
}

export function CopyCliButton({ text }: CopyCliButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    } catch {
      // Fallback: silently fail if clipboard API is not available
    }
  }, [text]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="focus-ring transition-base inline-flex items-center gap-1 rounded border border-[var(--border)] bg-[var(--card)] px-2 py-1 text-xs font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] active:bg-[var(--secondary)]"
    >
      {copied ? (
        <span className="text-[var(--success)]">복사됨 ✓</span>
      ) : (
        <span>복사</span>
      )}
    </button>
  );
}
