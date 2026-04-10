"use client";

import { useState, useCallback, useEffect } from "react";
import { STORAGE_KEYS } from "@/lib/constants";

const API_KEY_STORAGE = "harness100_anthropic_api_key";

export function useAiAssist() {
  const [apiKey, setApiKeyState] = useState("");
  const [isConfigured, setIsConfigured] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(API_KEY_STORAGE);
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
        localStorage.setItem(API_KEY_STORAGE, trimmed);
      } else {
        localStorage.removeItem(API_KEY_STORAGE);
      }
    } catch {
      // ignore
    }
  }, []);

  const clearApiKey = useCallback(() => {
    setApiKeyState("");
    setIsConfigured(false);
    try {
      localStorage.removeItem(API_KEY_STORAGE);
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
