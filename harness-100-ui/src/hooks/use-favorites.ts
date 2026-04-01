"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { STORAGE_KEYS } from "@/lib/constants";

export function useFavorites() {
  const [favorites, setFavorites] = useState<ReadonlyArray<number>>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("favorites");
    if (fromUrl) {
      setFavorites(fromUrl.split(",").map(Number).filter(Boolean));
      return;
    }

    const stored = localStorage.getItem(STORAGE_KEYS.favorites);
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch {
        // ignore invalid JSON
      }
    }
  }, []);

  const toggle = useCallback((id: number) => {
    setFavorites((prev) => {
      const next = prev.includes(id)
        ? prev.filter((f) => f !== id)
        : [...prev, id];
      localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(next));
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (id: number) => favorites.includes(id),
    [favorites],
  );

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined" || favorites.length === 0) return "";
    return `${window.location.origin}?favorites=${favorites.join(",")}`;
  }, [favorites]);

  return { favorites, toggle, isFavorite, shareUrl } as const;
}
