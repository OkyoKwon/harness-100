"use client";

import { useState, useMemo } from "react";
import { useLocale } from "@/hooks/use-locale";
import { GuideBanner } from "./guide-banner";
import { ValidationSummary } from "./validation-summary";
import { useCustomHarnesses } from "@/hooks/use-custom-harnesses";
import { toHarness } from "@/lib/custom-harness-converter";
import { buildZip, generateSkillMd } from "@/lib/zip-builder";
import { saveAs } from "file-saver";
import type { CustomHarness } from "@/lib/custom-harness-types";
import type { ValidationErrors } from "@/lib/builder-validation";
import { hasErrors } from "@/lib/builder-validation";

interface StepReviewProps {
  readonly harness: CustomHarness;
  readonly errors: ValidationErrors;
  readonly onSaved: () => void;
}

export function StepReview({ harness, errors, onSaved }: StepReviewProps) {
  const { t, locale } = useLocale();
  const { save } = useCustomHarnesses();
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<"success" | "error" | null>(null);

  const enabledAgents = harness.agents.filter((a) => a.enabled);
  const isValid = !hasErrors(errors);
  const [skillMdOpen, setSkillMdOpen] = useState(false);

  const skillMdPreview = useMemo(() => {
    if (harness.skillMarkdown) return harness.skillMarkdown;
    const converted = toHarness(harness);
    return generateSkillMd(converted, locale as "ko" | "en");
  }, [harness, locale]);

  const handleSave = async () => {
    setSaving(true);
    setSaveResult(null);
    const success = await save(harness);
    setSaveResult(success ? "success" : "error");
    setSaving(false);
    if (success) onSaved();
  };

  const handleDownloadZip = async () => {
    try {
      const converted = toHarness(harness);
      const blob = await buildZip(converted, undefined, locale, harness.skillMarkdown, harness.extensionSkillMarkdowns);
      saveAs(blob, `${harness.slug}.zip`);
    } catch (err) {
      console.error("ZIP download failed:", err);
    }
  };

  const handleExportJson = () => {
    const data = {
      $schema: "harness-100-custom-v1",
      exportedAt: new Date().toISOString(),
      harness,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    saveAs(blob, `${harness.slug}.harness.json`);
  };

  return (
    <div className="space-y-6">
      <GuideBanner id="step-review">
        <p>{t("builder.guide.review")}</p>
      </GuideBanner>

      {/* Summary card */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
        <h3 className="text-base font-semibold text-[var(--foreground)]">{t("builder.review.summary")}</h3>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <dt className="text-[var(--muted-foreground)]">{t("builder.meta.name")}</dt>
          <dd className="text-[var(--foreground)] font-medium">{harness.name}</dd>
          <dt className="text-[var(--muted-foreground)]">{t("builder.meta.category")}</dt>
          <dd className="text-[var(--foreground)]">{harness.category}</dd>
          <dt className="text-[var(--muted-foreground)]">{t("builder.skill.name")}</dt>
          <dd className="text-[var(--foreground)]">{harness.skill.name || "-"}</dd>
        </dl>
        <p className="text-sm text-[var(--muted-foreground)]">{harness.description}</p>
      </div>

      {/* Agents */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-2">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">
          {t("builder.review.agents", { count: enabledAgents.length })}
        </h3>
        <ul className="space-y-1">
          {enabledAgents.map((agent) => (
            <li key={agent.id} className="flex items-center gap-2 text-sm">
              <span className="font-medium text-[var(--foreground)]">{agent.name}</span>
              <span className="text-[var(--muted-foreground)]">— {agent.role}</span>
              <span className="ml-auto flex gap-1">
                {agent.tools.map((tool) => (
                  <span key={tool} className="rounded bg-[var(--muted)] px-1.5 py-0.5 text-[10px]">{tool}</span>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Extension skills (if any) */}
      {harness.skill.extensionSkills.length > 0 && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-2">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            {t("builder.review.extensionSkills", { count: harness.skill.extensionSkills.length })}
          </h3>
          <ul className="space-y-1">
            {harness.skill.extensionSkills.map((ext) => {
              const agent = enabledAgents.find((a) => a.id === ext.targetAgent || a.name === ext.targetAgent);
              return (
                <li key={ext.name} className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-[var(--foreground)]">{ext.name}</span>
                  <span className="text-[var(--muted-foreground)]">
                    → {agent?.name ?? ext.targetAgent}
                  </span>
                  <span className="ml-auto text-xs text-[var(--muted-foreground)]">{ext.description}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* File tree */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-2">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">{t("builder.review.fileTree")}</h3>
        <pre className="text-xs text-[var(--muted-foreground)] font-mono leading-relaxed">
{`.claude/
├── CLAUDE.md
├── agents/
${enabledAgents.map((a, i) => `│   ${i === enabledAgents.length - 1 ? "└──" : "├──"} ${a.name || a.id}.md`).join("\n")}
└── skills/
    ├── ${harness.skill.name || harness.slug}/
    │   └── skill.md${harness.skill.extensionSkills.map((ext, i) => `\n    ${i === harness.skill.extensionSkills.length - 1 ? "└──" : "├──"} ${ext.name}/\n    ${i === harness.skill.extensionSkills.length - 1 ? "    " : "│   "}└── skill.md`).join("")}`}
        </pre>
      </div>

      {/* Skill markdown preview */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] space-y-0">
        <button
          type="button"
          onClick={() => setSkillMdOpen((p) => !p)}
          className="flex w-full items-center justify-between px-4 py-3 text-left"
        >
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            {t("builder.skill.markdown")}
          </h3>
          <svg
            className={`h-3.5 w-3.5 text-[var(--muted-foreground)] transition-transform ${skillMdOpen ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {skillMdOpen && (
          <pre className="border-t border-[var(--border)] px-4 py-3 text-xs text-[var(--muted-foreground)] font-mono leading-relaxed overflow-x-auto max-h-96 overflow-y-auto">
            {skillMdPreview}
          </pre>
        )}
      </div>

      {/* Validation */}
      <ValidationSummary errors={errors} />

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={!isValid || saving}
          className="rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 transition-base focus-ring disabled:opacity-50"
        >
          {saving ? t("builder.action.save") + "..." : t("builder.action.save")}
        </button>
        <button
          type="button"
          onClick={handleDownloadZip}
          disabled={!isValid}
          className="rounded-lg border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-base focus-ring disabled:opacity-50"
        >
          {t("builder.action.download")}
        </button>
        <button
          type="button"
          onClick={handleExportJson}
          className="rounded-lg border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-base focus-ring"
        >
          {t("builder.action.exportJson")}
        </button>
      </div>

      {/* Save result toast */}
      {saveResult === "success" && (
        <p className="text-sm text-green-600 dark:text-green-400">{t("builder.action.saved")}</p>
      )}
      {saveResult === "error" && (
        <p className="text-sm text-red-500">{t("builder.action.saveFailed")}</p>
      )}
    </div>
  );
}
