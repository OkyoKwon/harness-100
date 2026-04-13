"use client";

import { useState, useEffect, useRef } from "react";

/**
 * Tracks which section is currently visible in the viewport using IntersectionObserver.
 * Returns the ID of the active section.
 */
export function useActiveSection(sectionIds: ReadonlyArray<string>): string {
  const [activeId, setActiveId] = useState(sectionIds[0] ?? "");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (sectionIds.length === 0) return;

    const visibleEntries = new Map<string, number>();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visibleEntries.set(entry.target.id, entry.intersectionRatio);
          } else {
            visibleEntries.delete(entry.target.id);
          }
        }

        // Pick the first visible section in DOM order
        for (const id of sectionIds) {
          if (visibleEntries.has(id)) {
            setActiveId(id);
            return;
          }
        }
      },
      {
        rootMargin: "-20% 0px -60% 0px",
        threshold: [0, 0.1],
      },
    );

    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    for (const el of elements) {
      observerRef.current.observe(el!);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [sectionIds]);

  return activeId;
}
