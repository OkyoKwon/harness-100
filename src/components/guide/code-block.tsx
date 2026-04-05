"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useLocale } from "@/hooks/use-locale";

interface CodeBlockProps {
  readonly children: string;
}

export function CodeBlock({ children }: CodeBlockProps) {
  const { t } = useLocale();
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopy = useCallback(async () => {
    let success = false;
    try {
      await navigator.clipboard.writeText(children);
      success = true;
    } catch {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = children;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        success = document.execCommand("copy");
        document.body.removeChild(textarea);
      } catch {
        success = false;
      }
    }
    if (success) {
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    }
  }, [children]);

  return (
    <div className="group relative">
      <pre className="bg-[var(--muted)] p-3 rounded text-sm overflow-x-auto">
        {children}
      </pre>
      <button
        type="button"
        onClick={handleCopy}
        className="absolute right-2 top-2 rounded border border-[var(--border)] bg-[var(--card)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-[var(--muted)] transition-base focus-ring"
        aria-label={t("action.copy")}
      >
        {copied ? t("action.copied") : t("action.copy")}
      </button>
    </div>
  );
}
