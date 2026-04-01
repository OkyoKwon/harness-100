"use client";

import { useState, useCallback } from "react";
import type { Harness, Modification, SetupResult } from "@/lib/types";
import { setupToLocal, isFileSystemAccessSupported } from "@/lib/local-writer";

type Status = "idle" | "selecting" | "writing" | "complete" | "error" | "unsupported";

export function useLocalSetup() {
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<SetupResult | null>(null);
  const supported = isFileSystemAccessSupported();

  const setup = useCallback(
    async (harness: Harness, modifications?: ReadonlyArray<Modification>) => {
      if (!supported) {
        setStatus("unsupported");
        return;
      }

      setStatus("selecting");
      try {
        const setupResult = await setupToLocal(harness, modifications);
        setResult(setupResult);
        setStatus(setupResult.success ? "complete" : "error");
      } catch (err) {
        console.error("Local setup failed:", err);
        setStatus("error");
      }
    },
    [supported],
  );

  return { status, result, supported, setup } as const;
}
