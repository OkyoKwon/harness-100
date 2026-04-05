"use client";

import { useState, useCallback } from "react";
import type { Harness, Modification } from "@/lib/types";
import type { Locale } from "@/lib/locale";
import { buildZip } from "@/lib/zip-builder";

type Status = "idle" | "building" | "complete" | "error";

export function useZipDownload() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const download = useCallback(
    async (harness: Harness, modifications?: ReadonlyArray<Modification>, locale: Locale = "ko") => {
      setStatus("building");
      setErrorMessage(null);
      try {
        const blob = await buildZip(harness, modifications, locale);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${harness.slug}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setStatus("complete");
      } catch (err) {
        const message = err instanceof Error ? err.message : "ZIP build failed";
        console.error("ZIP build failed:", err);
        setErrorMessage(message);
        setStatus("error");
      }
    },
    [],
  );

  return { status, errorMessage, download } as const;
}
