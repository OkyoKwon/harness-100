"use client";

import { useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import matter from "gray-matter";
import { useLocale } from "@/hooks/use-locale";
import { Input } from "@/components/ui/input";
import type { ExtensionSkill } from "@/lib/types";
import type { CustomAgent } from "@/lib/custom-harness-types";

interface ExtensionSkillEditorProps {
  readonly ext: ExtensionSkill;
  readonly index: number;
  readonly agents: ReadonlyArray<CustomAgent>;
  readonly markdown: string | undefined;
  readonly errors: Readonly<Record<string, string>>;
  readonly onUpdate: (index: number, ext: ExtensionSkill) => void;
  readonly onRemove: (index: number) => void;
  readonly onUpdateMarkdown: (name: string, md: string) => void;
  readonly onClearMarkdown: (name: string) => void;
}

export function ExtensionSkillEditor({
  ext, index, agents, markdown, errors,
  onUpdate, onRemove, onUpdateMarkdown, onClearMarkdown,
}: ExtensionSkillEditorProps) {
  const { t } = useLocale();
  const [mdEditing, setMdEditing] = useState(false);

  const enabledAgents = agents.filter((a) => a.enabled);

  const handleFieldChange = (field: keyof ExtensionSkill, value: string) => {
    onUpdate(index, { ...ext, [field]: value });
  };

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
      {/* Header with delete */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--muted-foreground)]">
          #{index + 1}
        </span>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="text-[var(--muted-foreground)] hover:text-red-500 transition-base focus-ring rounded p-0.5"
          aria-label={`Remove extension skill "${ext.name}"`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Name */}
      <Input
        label={t("builder.skill.extensionName")}
        value={ext.name}
        onChange={(e) => handleFieldChange("name", e.target.value)}
        placeholder="hook-writing"
        helperText={t("builder.skill.extensionNameHelper")}
        errorMessage={errors[`${index}_name`] ? t(errors[`${index}_name`]) : undefined}
      />

      {/* Target agent dropdown */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-[var(--foreground)]">
          {t("builder.skill.extensionTarget")}
        </label>
        <select
          value={ext.targetAgent}
          onChange={(e) => handleFieldChange("targetAgent", e.target.value)}
          className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2.5 text-sm hover:border-[var(--input-focus-border)] focus-visible:outline-2 focus-visible:outline-[var(--ring)] focus-visible:outline-offset-2 transition-base"
        >
          <option value="">{t("builder.skill.extensionTargetPlaceholder")}</option>
          {enabledAgents.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name || a.id} — {a.role}
            </option>
          ))}
        </select>
        {errors[`${index}_target`] && (
          <p className="text-xs text-red-500" role="alert">{t(errors[`${index}_target`])}</p>
        )}
      </div>

      {/* Description */}
      <Input
        label={t("builder.skill.extensionDesc")}
        value={ext.description}
        onChange={(e) => handleFieldChange("description", e.target.value)}
        placeholder={t("builder.skill.extensionDescPlaceholder")}
      />

      {/* Markdown viewer/editor */}
      {markdown && <ExtensionSkillMarkdown
        markdown={markdown}
        editing={mdEditing}
        onToggleEditing={() => setMdEditing((p) => !p)}
        onChange={(md) => onUpdateMarkdown(ext.name, md)}
        onClear={() => onClearMarkdown(ext.name)}
      />}
    </div>
  );
}

// ── Inline Markdown Viewer/Editor ──

interface ExtensionSkillMarkdownProps {
  readonly markdown: string;
  readonly editing: boolean;
  readonly onToggleEditing: () => void;
  readonly onChange: (md: string) => void;
  readonly onClear: () => void;
}

function ExtensionSkillMarkdown({ markdown, editing, onToggleEditing, onChange, onClear }: ExtensionSkillMarkdownProps) {
  const { t } = useLocale();
  const parsed = useMemo(() => matter(markdown), [markdown]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-medium text-[var(--muted-foreground)]">skill.md</h4>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleEditing}
            className="rounded-md border border-[var(--border)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-base focus-ring"
          >
            {editing ? t("builder.skill.preview") : t("builder.skill.edit")}
          </button>
          <button
            type="button"
            onClick={onClear}
            className="text-[10px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] underline transition-base"
          >
            {t("builder.skill.resetToAuto")}
          </button>
        </div>
      </div>

      {editing ? (
        <textarea
          value={markdown}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-48 rounded-lg border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2 text-xs font-mono text-[var(--foreground)] resize-y focus-visible:outline-2 focus-visible:outline-[var(--ring)] focus-visible:outline-offset-2"
          spellCheck={false}
        />
      ) : (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--muted)]/30 p-3 max-h-64 overflow-y-auto">
          {Object.keys(parsed.data).length > 0 && (
            <div className="mb-3 overflow-hidden rounded border border-[var(--border)]">
              <table className="w-full text-xs">
                <tbody>
                  {Object.entries(parsed.data).map(([key, value]) => (
                    <tr key={key} className="border-b border-[var(--border)] last:border-b-0">
                      <td className="bg-[var(--muted)] px-2 py-1 font-medium text-[var(--muted-foreground)]">{key}</td>
                      <td className="px-2 py-1 text-[var(--card-foreground)]">{String(value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="markdown-body text-sm">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {parsed.content}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
