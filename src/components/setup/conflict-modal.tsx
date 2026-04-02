"use client";

import { useState, useCallback } from "react";
import type { ConflictResolution, FileConflict } from "@/lib/types";
import { Modal, ModalBody } from "@/components/ui";
import { useLocale } from "@/hooks/use-locale";

interface ConflictModalProps {
  readonly open: boolean;
  readonly conflicts: ReadonlyArray<FileConflict>;
  readonly onResolve: (resolutions: ReadonlyArray<FileConflict>) => void;
  readonly onCancel: () => void;
}

const RESOLUTIONS_FOR_TYPE: Record<FileConflict["type"], ReadonlyArray<ConflictResolution>> = {
  claudeMd: ["overwrite", "skip", "merge"],
  agent: ["overwrite", "skip"],
  skill: ["overwrite", "skip"],
};

function ResolutionRadio({
  conflict,
  onChange,
}: {
  readonly conflict: FileConflict;
  readonly onChange: (resolution: ConflictResolution) => void;
}) {
  const { t } = useLocale();
  const options = RESOLUTIONS_FOR_TYPE[conflict.type];

  return (
    <div className="flex items-center gap-3">
      {options.map((option) => (
        <label
          key={option}
          className="flex cursor-pointer items-center gap-1.5 text-xs text-[var(--foreground)]"
        >
          <input
            type="radio"
            name={conflict.path}
            value={option}
            checked={conflict.resolution === option}
            onChange={() => onChange(option)}
            className="accent-[var(--primary)]"
          />
          {t(`conflict.${option}`)}
        </label>
      ))}
    </div>
  );
}

export function ConflictModal({ open, conflicts, onResolve, onCancel }: ConflictModalProps) {
  const { t } = useLocale();
  const [items, setItems] = useState<ReadonlyArray<FileConflict>>(conflicts);

  const updateResolution = useCallback((path: string, resolution: ConflictResolution) => {
    setItems((prev) => prev.map((c) => (c.path === path ? { ...c, resolution } : c)));
  }, []);

  const applyToAll = useCallback((resolution: ConflictResolution) => {
    setItems((prev) =>
      prev.map((c) => {
        const allowed = RESOLUTIONS_FOR_TYPE[c.type];
        return allowed.includes(resolution) ? { ...c, resolution } : c;
      }),
    );
  }, []);

  return (
    <Modal open={open} onClose={onCancel} title={t("conflict.title")}>
      <ModalBody>
        <p className="mb-4 text-sm text-[var(--muted-foreground)]">
          {t("conflict.description")}
        </p>

        {/* Apply to all */}
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--muted)] px-3 py-2">
          <span className="text-xs font-medium text-[var(--foreground)]">
            {t("conflict.applyAll")}:
          </span>
          <div className="flex items-center gap-2">
            {(["overwrite", "skip", "merge"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => applyToAll(r)}
                className="rounded px-2 py-0.5 text-xs text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)] transition-base focus-ring"
              >
                {t(`conflict.${r}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Conflict list */}
        <ul className="space-y-3">
          {items.map((conflict) => (
            <li
              key={conflict.path}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5"
            >
              <div className="mb-1.5 flex items-center gap-2">
                <code className="text-xs font-mono text-[var(--foreground)]">
                  {conflict.path}
                </code>
                <span className="rounded-full bg-[var(--secondary)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--secondary-foreground)]">
                  {t(`conflict.fileType.${conflict.type}`)}
                </span>
              </div>
              <ResolutionRadio
                conflict={conflict}
                onChange={(r) => updateResolution(conflict.path, r)}
              />
            </li>
          ))}
        </ul>
      </ModalBody>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 border-t border-[var(--modal-header-border)] px-5 py-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-base focus-ring"
        >
          {t("conflict.cancel")}
        </button>
        <button
          type="button"
          onClick={() => onResolve(items)}
          className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:brightness-110 active:brightness-95 transition-base focus-ring"
        >
          {t("conflict.proceed")}
        </button>
      </div>
    </Modal>
  );
}
