"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { useLocale } from "@/hooks/use-locale";
import { Input } from "@/components/ui/input";

interface ApiKeySettingsProps {
  readonly apiKey: string;
  readonly isConfigured: boolean;
  readonly onSave: (key: string) => void;
  readonly onClear: () => void;
}

export function ApiKeySettings({ apiKey, isConfigured, onSave, onClear }: ApiKeySettingsProps) {
  const { t } = useLocale();
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const [expanded, setExpanded] = useState(false);

  if (!editing && isConfigured) {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 space-y-1.5">
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-green-500 shrink-0" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <polyline points="16 10 11 15 8 12" />
          </svg>
          <span className="text-xs text-[var(--foreground)]">
            {t("ai.keyConfigured")}
          </span>
          <span className="text-xs text-[var(--muted-foreground)] font-mono">
            {apiKey.slice(0, 10)}...
          </span>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="ml-auto text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-base focus-ring rounded px-1"
          >
            {t("ai.manage")}
          </button>
        </div>

        {expanded && (
          <>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => { setEditing(true); setInputValue(""); }}
                className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-base focus-ring rounded px-1"
              >
                {t("ai.changeKey")}
              </button>
              <button
                type="button"
                onClick={onClear}
                className="text-xs text-red-500 hover:text-red-600 transition-base focus-ring rounded px-1"
              >
                {t("ai.removeKey")}
              </button>
            </div>
            <div className="flex items-start gap-1.5 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-2.5 py-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-amber-600 dark:text-amber-400 shrink-0 mt-px" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              <p className="text-[11px] text-amber-700 dark:text-amber-300 leading-snug">{t("ai.keyPrivacy")}</p>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-dashed border-violet-300 dark:border-violet-700 bg-violet-50/50 dark:bg-violet-950/20 p-3 space-y-2">
      <div className="flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-violet-500 shrink-0" aria-hidden="true">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
        <span className="text-sm font-medium text-[var(--foreground)]">{t("ai.title")}</span>
      </div>
      <p className="text-xs text-[var(--muted-foreground)]">{t("ai.description")}</p>
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="sk-ant-..."
          type="password"
          className="flex-1 text-xs font-mono"
        />
        <button
          type="button"
          onClick={() => {
            onSave(inputValue);
            setEditing(false);
          }}
          disabled={!inputValue.trim().startsWith("sk-")}
          className="shrink-0 rounded-lg bg-violet-600 px-3 py-2 text-xs font-medium text-white hover:bg-violet-700 transition-base focus-ring disabled:opacity-50"
        >
          {t("ai.saveKey")}
        </button>
        {isConfigured && (
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="shrink-0 rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-medium hover:bg-[var(--muted)] transition-base focus-ring"
          >
            {t("a11y.close")}
          </button>
        )}
      </div>
      <p className="text-[10px] text-[var(--muted-foreground)]">{t("ai.keyPrivacy")}</p>
    </div>
  );
}
