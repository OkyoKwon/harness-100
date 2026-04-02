"use client";

import { useEffect, useState, useRef } from "react";
import type { Harness } from "@/lib/types";
import { loadHarnessDetail } from "@/lib/harness-loader";
import { useLocale } from "@/hooks/use-locale";

interface QuickPreviewProps {
  readonly harnessId: number;
  readonly anchorRef: React.RefObject<HTMLElement | null>;
  readonly onClose: () => void;
}

export function QuickPreview({ harnessId, anchorRef, onClose }: QuickPreviewProps) {
  const { t, locale } = useLocale();
  const [detail, setDetail] = useState<Harness | null>(null);
  const [loading, setLoading] = useState(true);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadHarnessDetail(harnessId, locale)
      .then((data) => {
        if (!cancelled) {
          setDetail(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [harnessId, locale]);

  // Close on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [anchorRef, onClose]);

  return (
    <div
      ref={popoverRef}
      className="absolute left-0 right-0 top-full mt-1 z-40 rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-md)] p-3 text-left"
      onMouseLeave={onClose}
    >
      {loading ? (
        <div className="flex items-center gap-2 py-2">
          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[var(--muted)] border-t-[var(--primary)]" />
          <span className="text-xs text-[var(--muted-foreground)]">{t("preview.loading")}</span>
        </div>
      ) : detail ? (
        <div className="space-y-2">
          <p className="text-xs leading-relaxed text-[var(--card-foreground)]">
            {detail.description}
          </p>

          <div>
            <p className="text-[10px] font-medium text-[var(--muted-foreground)] mb-1">
              {t("detail.agents", { count: detail.agents.length })}
            </p>
            <div className="flex flex-wrap gap-1">
              {detail.agents.map((agent) => (
                <span
                  key={agent.id}
                  className="rounded-full bg-[var(--secondary)] px-2 py-0.5 text-[10px] text-[var(--secondary-foreground)]"
                >
                  {agent.name}
                </span>
              ))}
            </div>
          </div>

          {detail.frameworks.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {detail.frameworks.slice(0, 5).map((fw) => (
                <span
                  key={fw}
                  className="rounded-full bg-[var(--badge-framework-bg)] px-2 py-0.5 text-[10px] text-[var(--badge-framework-fg)]"
                >
                  {fw}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-[var(--muted-foreground)]">{t("preview.error")}</p>
      )}
    </div>
  );
}
