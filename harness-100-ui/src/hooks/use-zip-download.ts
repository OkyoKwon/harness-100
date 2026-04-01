"use client";

import { useState, useCallback } from "react";
import type { Harness, Modification } from "@/lib/types";
import { buildZip } from "@/lib/zip-builder";

type Status = "idle" | "building" | "complete" | "error";

export function useZipDownload() {
  const [status, setStatus] = useState<Status>("idle");

  const download = useCallback(
    async (harness: Harness, modifications?: ReadonlyArray<Modification>) => {
      setStatus("building");
      try {
        const blob = await buildZip(harness, modifications);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${harness.slug}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setStatus("complete");
      } catch {
        setStatus("error");
      }
    },
    [],
  );

  return { status, download } as const;
}
