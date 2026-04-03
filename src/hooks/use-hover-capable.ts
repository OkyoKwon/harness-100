"use client";

import { useState, useEffect } from "react";

export function useHoverCapable(): boolean {
  const [capable, setCapable] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
      setCapable(window.matchMedia("(hover: hover)").matches);
    }
  }, []);

  return capable;
}
