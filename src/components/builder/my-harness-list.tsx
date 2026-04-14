"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/hooks/use-locale";
import { useCustomHarnesses } from "@/hooks/use-custom-harnesses";
import { useLocalSetup } from "@/hooks/use-local-setup";
import { useToast } from "@/hooks/use-toast";
import { Modal, ModalBody } from "@/components/ui/modal";
import { ConflictModal } from "@/components/setup/conflict-modal";
import { toHarness } from "@/lib/custom-harness-converter";
import { buildZip } from "@/lib/zip-builder";
import { saveAs } from "file-saver";
import { CATEGORIES } from "@/lib/constants";
import type { CustomHarness } from "@/lib/custom-harness-types";

function getCategoryLabel(category: string, locale: string): string {
  const found = CATEGORIES.find((c) => c.slug === category);
  if (!found) return category;
  return locale === "en" ? found.labelEn : found.label;
}

interface MyHarnessListProps {
  readonly onEdit: (harness: CustomHarness) => void;
  readonly onView: (harness: CustomHarness) => void;
  readonly onCreateNew: () => void;
}

export function MyHarnessList({ onEdit, onView, onCreateNew }: MyHarnessListProps) {
  const { t, locale } = useLocale();
  const { harnesses, isLoading, remove, duplicate } = useCustomHarnesses();
  const { addToast } = useToast();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const {
    status: setupStatus,
    result: setupResult,
    supported: setupSupported,
    setup: runSetup,
    conflictReport,
    resolveConflicts,
    cancelConflicts,
  } = useLocalSetup();

  const handleExport = async (harness: CustomHarness) => {
    try {
      const converted = toHarness(harness);
      const blob = await buildZip(converted, undefined, locale);
      saveAs(blob, `${harness.slug}.zip`);
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  const handleSetup = (harness: CustomHarness) => {
    const converted = toHarness(harness);
    runSetup(converted, undefined, locale);
  };

  const handleDelete = async () => {
    if (deleteTarget) {
      await remove(deleteTarget);
      setDeleteTarget(null);
    }
  };

  useEffect(() => {
    if (setupStatus === "complete" && setupResult) {
      addToast(t("toast.setupComplete", { count: setupResult.filesWritten }), "success");
    }
  }, [setupStatus, setupResult, addToast]);

  const setupBusy = setupStatus === "selecting" || setupStatus === "writing" || setupStatus === "confirming";

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-16 rounded-lg bg-[var(--muted)]" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {harnesses.length > 0 && (
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            {t("builder.myHarnesses")} ({harnesses.length})
          </h2>
          <button
            type="button"
            onClick={onCreateNew}
            className="rounded-lg bg-[var(--primary)] px-3 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 transition-base focus-ring"
          >
            + {t("builder.newHarness")}
          </button>
        </div>
      )}

      {harnesses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-[var(--muted-foreground)] mb-4">{t("builder.empty")}</p>
          <button
            type="button"
            onClick={onCreateNew}
            className="rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 transition-base focus-ring"
          >
            + {t("builder.newHarness")}
          </button>
        </div>
      ) : (
        <ul className="space-y-2">
          {harnesses.map((harness) => (
            <li
              key={harness.id}
              className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 hover:border-[var(--primary)]/40 transition-base cursor-pointer"
              onClick={() => onView(harness)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-sm text-[var(--foreground)] truncate">
                    {harness.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-[var(--muted-foreground)]">
                    <span className="rounded bg-[var(--muted)] px-1.5 py-0.5">{getCategoryLabel(harness.category, locale)}</span>
                    <span>{locale === "ko" ? `에이전트 ${harness.agents.filter(a => a.enabled).length}개` : `${harness.agents.filter(a => a.enabled).length} agents`}</span>
                    <span>{new Date(harness.updatedAt).toLocaleDateString(locale)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => handleSetup(harness)}
                    disabled={!setupSupported || setupBusy}
                    className="rounded px-2 py-1 text-xs font-medium text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-base focus-ring disabled:opacity-50"
                  >
                    {t("action.setup")}
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit(harness)}
                    className="rounded px-2 py-1 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-base focus-ring"
                  >
                    {t("builder.action.edit")}
                  </button>
                  <button
                    type="button"
                    onClick={() => duplicate(harness.id)}
                    className="rounded px-2 py-1 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-base focus-ring"
                  >
                    {t("builder.action.duplicate")}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExport(harness)}
                    className="rounded px-2 py-1 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-base focus-ring"
                  >
                    {t("builder.action.download")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(harness.id)}
                    className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 transition-base focus-ring"
                  >
                    {t("builder.action.delete")}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Conflict resolution modal */}
      {conflictReport && (
        <ConflictModal
          open={setupStatus === "confirming"}
          conflicts={conflictReport.conflicts}
          onResolve={resolveConflicts}
          onCancel={cancelConflicts}
        />
      )}

      {/* Delete confirmation modal */}
      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title={t("builder.action.deleteConfirm")}
      >
        <ModalBody>
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[var(--muted)] transition-base focus-ring"
            >
              {t("builder.action.prev")}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-base focus-ring"
            >
              {t("builder.action.delete")}
            </button>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
}
