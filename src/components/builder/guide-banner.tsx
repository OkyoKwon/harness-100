"use client";

import { useState, useEffect } from "react";
import { STORAGE_KEYS } from "@/lib/constants";

interface GuideBannerProps {
  readonly id: string;
  readonly children: React.ReactNode;
}

function getDismissed(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.builderGuidesDismissed);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

function setDismissed(dismissed: Set<string>) {
  try {
    localStorage.setItem(
      STORAGE_KEYS.builderGuidesDismissed,
      JSON.stringify([...dismissed]),
    );
  } catch {
    // ignore
  }
}

export function GuideBanner({ id, children }: GuideBannerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = getDismissed();
    if (!dismissed.has(id)) {
      setVisible(true);
    }
  }, [id]);

  if (!visible) return null;

  const handleDismiss = () => {
    setVisible(false);
    const dismissed = getDismissed();
    dismissed.add(id);
    setDismissed(dismissed);
  };

  const handleRestore = () => {
    setVisible(true);
    const dismissed = getDismissed();
    dismissed.delete(id);
    setDismissed(dismissed);
  };

  return (
    <div
      role="status"
      className="relative rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-200"
    >
      <div className="pr-8">{children}</div>
      <button
        type="button"
        onClick={handleDismiss}
        className="absolute right-2 top-2 rounded p-1 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/50 focus-ring"
        aria-label="Close guide"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
