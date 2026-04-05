"use client";

import { useState, useCallback } from "react";
import type { ConflictReport, FileConflict, Harness, Modification, SetupResult } from "@/lib/types";
import type { Locale } from "@/lib/locale";
import {
  openProjectDir,
  detectConflicts,
  writeWithResolutions,
  isFileSystemAccessSupported,
} from "@/lib/local-writer";

type Status = "idle" | "selecting" | "confirming" | "writing" | "complete" | "error" | "unsupported";

interface PendingSetup {
  readonly harness: Harness;
  readonly modifications?: ReadonlyArray<Modification>;
  readonly locale: Locale;
}

export function useLocalSetup() {
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<SetupResult | null>(null);
  const [conflictReport, setConflictReport] = useState<ConflictReport | null>(null);
  const [pendingSetup, setPendingSetup] = useState<PendingSetup | null>(null);
  const supported = isFileSystemAccessSupported();

  const setup = useCallback(
    async (harness: Harness, modifications?: ReadonlyArray<Modification>, locale: Locale = "ko") => {
      if (!supported) {
        setStatus("unsupported");
        return;
      }

      setStatus("selecting");
      try {
        const dirHandle = await openProjectDir();

        // Detect conflicts
        const report = await detectConflicts(dirHandle, harness, modifications);

        if (report.conflicts.length > 0) {
          // Show conflict modal
          setPendingSetup({ harness, modifications, locale });
          setConflictReport(report);
          setStatus("confirming");
          return;
        }

        // No conflicts — write directly
        setStatus("writing");
        const setupResult = await writeWithResolutions(dirHandle, harness, modifications, undefined, locale);
        setResult(setupResult);
        setStatus(setupResult.success ? "complete" : "error");
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          setStatus("idle");
          return;
        }
        console.error("Local setup failed:", err);
        setStatus("error");
      }
    },
    [supported],
  );

  const resolveConflicts = useCallback(
    async (resolutions: ReadonlyArray<FileConflict>) => {
      if (!conflictReport || !pendingSetup) return;

      setStatus("writing");
      try {
        const resMap = new Map(resolutions.map((r) => [r.path, r.resolution]));
        const setupResult = await writeWithResolutions(
          conflictReport.dirHandle,
          pendingSetup.harness,
          pendingSetup.modifications,
          resMap,
          pendingSetup.locale,
        );
        setResult(setupResult);
        setConflictReport(null);
        setPendingSetup(null);
        setStatus(setupResult.success ? "complete" : "error");
      } catch (err) {
        console.error("Local setup failed:", err);
        setStatus("error");
      }
    },
    [conflictReport, pendingSetup],
  );

  const cancelConflicts = useCallback(() => {
    setConflictReport(null);
    setPendingSetup(null);
    setStatus("idle");
  }, []);

  return {
    status,
    result,
    supported,
    setup,
    conflictReport,
    resolveConflicts,
    cancelConflicts,
  } as const;
}
