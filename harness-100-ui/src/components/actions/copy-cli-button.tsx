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
      className="inline-flex items-center gap-1 rounded border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 active:bg-gray-100"
    >
      {copied ? (
        <span className="text-green-600">복사됨 ✓</span>
      ) : (
        <span>복사</span>
      )}
    </button>
  );
}
