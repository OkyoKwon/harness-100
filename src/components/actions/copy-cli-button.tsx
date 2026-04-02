"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useLocale } from "@/hooks/use-locale";

interface CopyCliButtonProps {
  readonly text: string;
}

export function CopyCliButton({ text }: CopyCliButtonProps) {
  const { t } = useLocale();
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      console.warn("Clipboard API is not available");
    }
  }, [text]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="focus-ring transition-base inline-flex items-center gap-1 rounded border border-[var(--border)] bg-[var(--card)] px-2 py-1 text-xs font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] active:bg-[var(--secondary)]"
    >
      {copied ? (
        <span className="text-[var(--success)]">{t("action.copied")}</span>
      ) : (
        <span>{t("action.copy")}</span>
      )}
    </button>
  );
}
