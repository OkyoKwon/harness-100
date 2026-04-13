"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale } from "@/hooks/use-locale";
import { useLocalSetup } from "@/hooks/use-local-setup";
import { useZipDownload } from "@/hooks/use-zip-download";
import { useToast } from "@/hooks/use-toast";
import { toHarness } from "@/lib/custom-harness-converter";
import { buildCliCommand } from "@/lib/cli";
import { generateSkillMd } from "@/lib/zip-builder";
import { CATEGORIES } from "@/lib/constants";
import { AgentList } from "@/components/detail/agent-list";
import { WorkflowDiagram } from "@/components/detail/workflow-diagram";
import { OutputPreview } from "@/components/detail/output-preview";
import { UsageSection } from "@/components/detail/usage-section";
import { CompletionBanner } from "@/components/common/completion-banner";
import { ConflictModal } from "@/components/setup/conflict-modal";
import { MarkdownViewer } from "@/components/common/markdown-viewer";
import { saveAs } from "file-saver";
import type { CustomHarness } from "@/lib/custom-harness-types";

interface CustomHarnessDetailProps {
  readonly harness: CustomHarness;
  readonly onBack: () => void;
  readonly onEdit: (harness: CustomHarness) => void;
}

function getCategoryLabel(category: string, locale: string): string {
  const found = CATEGORIES.find((c) => c.slug === category);
  if (!found) return category;
  return locale === "en" ? found.labelEn : found.label;
}

export function CustomHarnessDetail({ harness, onBack, onEdit }: CustomHarnessDetailProps) {
  const { t, locale } = useLocale();
  const { addToast } = useToast();
  const [skillMdOpen, setSkillMdOpen] = useState(false);
  const [guideExpanded, setGuideExpanded] = useState(true);

  const converted = useMemo(() => toHarness(harness), [harness]);
  const enabledAgents = useMemo(() => harness.agents.filter((a) => a.enabled), [harness]);

  const {
    status: setupStatus,
    result: setupResult,
    supported: setupSupported,
    setup: runSetup,
    conflictReport,
    resolveConflicts,
    cancelConflicts,
  } = useLocalSetup();

  const { status: zipStatus, errorMessage: zipError, download: downloadZip } = useZipDownload();

  useEffect(() => {
    if (setupStatus === "complete" && setupResult) {
      addToast(t("toast.setupComplete", { count: setupResult.filesWritten }), "success");
    }
  }, [setupStatus, setupResult, addToast]);

  useEffect(() => {
    if (zipStatus === "complete") addToast(t("toast.zipComplete"), "success");
    if (zipStatus === "error") addToast(zipError ?? t("error.zipFailed"), "error");
  }, [zipStatus, zipError, addToast]);

  const setupDisabled = !setupSupported || setupStatus === "selecting" || setupStatus === "writing" || setupStatus === "confirming";
  const setupLabel = setupStatus === "selecting" || setupStatus === "writing" || setupStatus === "confirming"
    ? t("action.setupInProgress")
    : t("action.setup");
  const zipLabel = zipStatus === "building" ? t("action.zipBuilding") : t("action.zip");

  const handleExportJson = () => {
    const data = {
      $schema: "harness-100-custom-v1",
      exportedAt: new Date().toISOString(),
      harness,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    saveAs(blob, `${harness.slug}.harness.json`);
  };

  const handleViewSkillMd = useCallback(() => {
    setSkillMdOpen(true);
  }, []);

  const handleCloseSkillMd = useCallback(() => {
    setSkillMdOpen(false);
  }, []);

  const skillMdContent = generateSkillMd(converted, locale);

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-base focus-ring rounded"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        {t("builder.myHarnesses")}
      </button>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">{harness.name}</h1>
          <p className="mt-1 text-sm leading-relaxed text-[var(--muted-foreground)]">{harness.description}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[var(--secondary)] px-2.5 py-0.5 text-xs font-medium text-[var(--secondary-foreground)]">
              {getCategoryLabel(harness.category, locale)}
            </span>
            <span className="text-xs text-[var(--border)]">|</span>
            <span className="text-xs text-[var(--muted-foreground)]">
              {t("detail.agentCount", { count: enabledAgents.length })}
            </span>
            <span className="text-xs text-[var(--border)]">|</span>
            <span className="text-xs text-[var(--muted-foreground)]">
              {new Date(harness.updatedAt).toLocaleDateString(locale)}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(harness)}
            className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-base focus-ring"
          >
            {t("builder.action.edit")}
          </button>
          <button
            type="button"
            onClick={() => runSetup(converted, undefined, locale)}
            disabled={setupDisabled}
            className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:brightness-110 active:brightness-95 disabled:cursor-not-allowed disabled:opacity-50 transition-base focus-ring inline-flex items-center gap-1.5"
          >
            {(setupStatus === "selecting" || setupStatus === "writing" || setupStatus === "confirming") && (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[var(--primary-foreground)]/30 border-t-[var(--primary-foreground)]" />
            )}
            {setupLabel}
          </button>
          <button
            type="button"
            onClick={() => downloadZip(converted, undefined, locale)}
            disabled={zipStatus === "building"}
            className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] disabled:cursor-not-allowed disabled:opacity-50 transition-base focus-ring inline-flex items-center gap-1.5"
          >
            {zipStatus === "building" && (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[var(--muted)] border-t-[var(--foreground)]" />
            )}
            {zipLabel}
          </button>
          <button
            type="button"
            onClick={handleExportJson}
            className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-base focus-ring"
          >
            {t("builder.action.exportJson")}
          </button>
        </div>
      </div>

      {/* Conflict modal */}
      {conflictReport && (
        <ConflictModal
          open={setupStatus === "confirming"}
          conflicts={conflictReport.conflicts}
          onResolve={resolveConflicts}
          onCancel={cancelConflicts}
        />
      )}

      {/* Completion banners */}
      {setupStatus === "complete" && setupResult && (
        <CompletionBanner
          type="setup"
          slug={harness.slug}
          path={setupResult.path}
          filesWritten={setupResult.filesWritten}
          filesSkipped={setupResult.filesSkipped}
          filesMerged={setupResult.filesMerged}
        />
      )}
      {zipStatus === "complete" && (
        <CompletionBanner type="zip" slug={harness.slug} />
      )}

      {/* Setup tip — collapsible */}
      <div className="rounded-lg border border-[var(--info-border)] bg-[var(--info-bg)]">
        <button
          type="button"
          onClick={() => setGuideExpanded((prev) => !prev)}
          className="flex w-full items-center justify-between px-4 py-2.5 text-left"
        >
          <span className="text-xs text-[var(--info-foreground)]">
            {t("detail.setupTip")}
          </span>
          <svg
            className={`h-3.5 w-3.5 shrink-0 text-[var(--info-foreground)] transition-transform ${
              guideExpanded ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {guideExpanded && (
          <div className="border-t border-[var(--info-border)] px-4 py-3">
            <ol className="space-y-1 text-xs text-[var(--info-foreground)] list-decimal list-inside">
              <li>{t("setup.step1")}</li>
              <li>{t("setup.step2")}</li>
              <li>
                {t("setup.step3prefix")}{" "}
                <code className="rounded bg-[var(--badge-tool-bg)] px-1 font-mono">
                  {buildCliCommand(harness.slug)}
                </code>{" "}
                {t("setup.step3suffix")}
              </li>
            </ol>
            <p className="mt-2 text-[10px] text-[var(--info-foreground)] opacity-70">
              {t("setup.tip")}
            </p>
          </div>
        )}
      </div>

      {/* File tree */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-2">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">{t("builder.review.fileTree")}</h3>
        <pre className="text-xs text-[var(--muted-foreground)] font-mono leading-relaxed">
{`.claude/
├── CLAUDE.md
├── agents/
${enabledAgents.map((a, i) => `│   ${i === enabledAgents.length - 1 ? "└──" : "├──"} ${a.name || a.id}.md`).join("\n")}
└── skills/
    └── ${harness.skill.name || harness.slug}/
        └── skill.md`}
        </pre>
      </div>

      {/* Main content: two-panel on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Left panel: Workflow (sticky) + Outputs */}
        <section className="space-y-8 lg:sticky lg:top-20 lg:self-start">
          <div>
            <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">
              {t("detail.workflow")}
            </h2>
            <WorkflowDiagram agents={converted.agents} />
          </div>

          <div>
            <OutputPreview harness={converted} />
          </div>
        </section>

        {/* Right panel: Agent list */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              {t("detail.agents", { count: enabledAgents.length })}
            </h2>
            <button
              type="button"
              onClick={handleViewSkillMd}
              className="flex items-center gap-1.5 rounded-lg border border-dashed border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs font-medium text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-base focus-ring"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {t("detail.viewSkillMd")}
            </button>
          </div>
          <AgentList
            agents={converted.agents}
            harness={converted}
            executionOrder={converted.skill.executionOrder}
            onViewSkillMd={handleViewSkillMd}
          />
        </section>
      </div>

      {/* Usage: trigger conditions + execution modes — full width */}
      <UsageSection harness={converted} />

      {/* Skill markdown viewer */}
      <MarkdownViewer
        title={`${harness.skill.name || harness.slug} — ${t("detail.skillMarkdown")}`}
        content={skillMdContent}
        open={skillMdOpen}
        onClose={handleCloseSkillMd}
      />
    </div>
  );
}
