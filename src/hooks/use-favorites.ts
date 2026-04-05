"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { STORAGE_KEYS } from "@/lib/constants";
import { parseFavoriteIds, parseStoredFavorites } from "@/lib/validation";

export function useFavorites() {
  const [favorites, setFavorites] = useState<ReadonlyArray<number>>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("favorites");

    let stored: ReadonlyArray<number> = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.favorites);
      if (raw) {
        stored = parseStoredFavorites(raw);
      }
    } catch {
      // localStorage may be unavailable (private browsing)
    }

    if (fromUrl) {
      const fromUrlIds = parseFavoriteIds(fromUrl);
      // Merge URL favorites with existing localStorage favorites
      const merged = [...new Set([...stored, ...fromUrlIds])];
      setFavorites(merged);
      try {
        localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(merged));
      } catch {
        // localStorage may be unavailable
      }
      return;
    }

    if (stored.length > 0) {
      setFavorites(stored);
    }
  }, []);

  // Sync favorites across browser tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.favorites && e.newValue) {
        setFavorites(parseStoredFavorites(e.newValue));
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);

  const toggle = useCallback((id: number) => {
    setFavorites((prev) => {
      const next = prev.includes(id)
        ? prev.filter((f) => f !== id)
        : [...prev, id];
      try {
        localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(next));
      } catch {
        // localStorage may be unavailable (private browsing)
      }
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (id: number) => favoriteSet.has(id),
    [favoriteSet],
  );

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined" || favorites.length === 0) return "";
    return `${window.location.origin}?favorites=${favorites.join(",")}`;
  }, [favorites]);

  return { favorites, toggle, isFavorite, shareUrl } as const;
}
