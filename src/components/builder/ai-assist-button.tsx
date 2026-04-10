"use client";

import { cn } from "@/lib/cn";
import { useLocale } from "@/hooks/use-locale";

interface AiAssistButtonProps {
  readonly onClick: () => void;
  readonly loading?: boolean;
  readonly disabled?: boolean;
  readonly size?: "sm" | "md";
  readonly label?: string;
  readonly className?: string;
}

export function AiAssistButton({
  onClick,
  loading = false,
  disabled = false,
  size = "sm",
  label,
  className,
}: AiAssistButtonProps) {
  const { t } = useLocale();

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md font-medium transition-base focus-ring",
        "bg-gradient-to-r from-violet-500 to-purple-600 text-white",
        "hover:from-violet-600 hover:to-purple-700",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm",
        className,
      )}
      title={t("ai.assist")}
    >
      {loading ? (
        <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeLinecap="round" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      )}
      {(size === "md" || label) && (loading ? t("ai.generating") : (label ?? t("ai.assist")))}
    </button>
  );
}
