"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { STORAGE_KEYS } from "@/lib/constants";
import { parseFavoriteIds, parseStoredFavorites } from "@/lib/validation";

export function useFavorites() {
  const [favorites, setFavorites] = useState<ReadonlyArray<number>>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("favorites");
    if (fromUrl) {
      setFavorites(parseFavoriteIds(fromUrl));
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.favorites);
      if (stored) {
        setFavorites(parseStoredFavorites(stored));
      }
    } catch {
      // localStorage may be unavailable (private browsing)
    }
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
