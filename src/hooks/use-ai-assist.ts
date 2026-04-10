"use client";

import { useState, useCallback, useEffect } from "react";
import { STORAGE_KEYS } from "@/lib/constants";

export function useAiAssist() {
  const [apiKey, setApiKeyState] = useState("");
  const [isConfigured, setIsConfigured] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.anthropicApiKey);
      if (stored) {
        setApiKeyState(stored);
        setIsConfigured(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const saveApiKey = useCallback((key: string) => {
    const trimmed = key.trim();
    setApiKeyState(trimmed);
    setIsConfigured(!!trimmed);
    try {
      if (trimmed) {
        localStorage.setItem(STORAGE_KEYS.anthropicApiKey, trimmed);
      } else {
        localStorage.removeItem(STORAGE_KEYS.anthropicApiKey);
      }
    } catch {
      // ignore
    }
  }, []);

  const clearApiKey = useCallback(() => {
    setApiKeyState("");
    setIsConfigured(false);
    try {
      localStorage.removeItem(STORAGE_KEYS.anthropicApiKey);
    } catch {
      // ignore
    }
  }, []);

  const runAssist = useCallback(
    async <T>(fn: (apiKey: string) => Promise<T>): Promise<T | null> => {
      if (!apiKey) return null;
      setLoading(true);
      try {
        return await fn(apiKey);
      } finally {
        setLoading(false);
      }
    },
    [apiKey],
  );

  return {
    apiKey,
    isConfigured,
    loading,
    saveApiKey,
    clearApiKey,
    runAssist,
  } as const;
}
