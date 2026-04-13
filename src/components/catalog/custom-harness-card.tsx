"use client";

import Link from "next/link";
import { useLocale } from "@/hooks/use-locale";
import { useLocalSetup } from "@/hooks/use-local-setup";
import { useZipDownload } from "@/hooks/use-zip-download";
import { toHarness } from "@/lib/custom-harness-converter";
import { ConflictModal } from "@/components/setup/conflict-modal";
import { CATEGORIES } from "@/lib/constants";
import type { CustomHarness } from "@/lib/custom-harness-types";

interface CustomHarnessCardProps {
  readonly harness: CustomHarness;
}

export function CustomHarnessCard({ harness }: CustomHarnessCardProps) {
  const { t, locale } = useLocale();
  const category = CATEGORIES.find((c) => c.slug === harness.category);
  const categoryLabel = locale === "en" ? (category?.labelEn ?? "") : (category?.label ?? "");
  const categoryColor = category?.color ?? "var(--primary)";
  const enabledCount = harness.agents.filter((a) => a.enabled).length;

  const {
    status: setupStatus,
    supported: setupSupported,
    setup: runSetup,
    conflictReport,
    resolveConflicts,
    cancelConflicts,
  } = useLocalSetup();

  const { status: zipStatus, download: downloadZip } = useZipDownload();

  const converted = toHarness(harness);
  const setupBusy = setupStatus === "selecting" || setupStatus === "writing" || setupStatus === "confirming";

  return (
    <div className="relative">
      <Link
        href="/builder/"
        className="block bg-[var(--card)] border border-[var(--border)] rounded-lg overflow-hidden shadow-[var(--shadow-sm)] hover:border-[var(--primary)] hover:shadow-[var(--shadow-md)] hover:-translate-y-1 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-[var(--ring)] focus-visible:outline-offset-2 transition-base group"
      >
        {/* Category color accent bar */}
        <div className="h-1" style={{ backgroundColor: categoryColor }} />

        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-violet-600 text-white">
              MY
            </span>
          </div>

          <h3 className="font-semibold mb-1 group-hover:text-[var(--primary)] transition-colors">
            {harness.name}
          </h3>

          <p className="text-xs text-[var(--muted-foreground)] mb-3 line-clamp-2 min-h-[2lh]">
            {harness.description}
          </p>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--secondary)] text-[var(--secondary-foreground)]">
              {t("card.agents", { count: enabledCount })}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--secondary)] text-[var(--secondary-foreground)]">
              {categoryLabel}
            </span>
          </div>

          <div className="flex items-center gap-2" onClick={(e) => e.preventDefault()}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                runSetup(converted, undefined, locale);
              }}
              disabled={!setupSupported || setupBusy}
              className="inline-flex items-center gap-1 rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-medium text-[var(--primary-foreground)] hover:brightness-110 active:brightness-95 disabled:opacity-50 transition-base focus-ring"
            >
              {t("action.setup")} →
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                downloadZip(converted, undefined, locale);
              }}
              disabled={zipStatus === "building"}
              className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted)] disabled:opacity-50 transition-base focus-ring"
            >
              ZIP ↓
            </button>
          </div>
        </div>
      </Link>

      {conflictReport && (
        <ConflictModal
          open={setupStatus === "confirming"}
          conflicts={conflictReport.conflicts}
          onResolve={resolveConflicts}
          onCancel={cancelConflicts}
        />
      )}
    </div>
  );
}
