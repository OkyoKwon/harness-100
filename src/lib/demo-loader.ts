import type { DemoScenario } from "./types";
import type { Locale } from "./locale";
import { DEFAULT_LOCALE } from "./locale";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const MAX_DEMO_CACHE = 20;

let demoCacheEntries: ReadonlyArray<readonly [string, DemoScenario | null]> =
  [];

function demoKey(id: number, locale: Locale): string {
  return `demo:${locale}:${id}`;
}

function getDemoCache(
  id: number,
  locale: Locale,
): DemoScenario | null | undefined {
  const key = demoKey(id, locale);
  const entry = demoCacheEntries.find(([k]) => k === key);
  return entry === undefined ? undefined : entry[1];
}

function setDemoCache(
  id: number,
  locale: Locale,
  data: DemoScenario | null,
): void {
  const key = demoKey(id, locale);
  const without = demoCacheEntries.filter(([k]) => k !== key);
  const trimmed =
    without.length >= MAX_DEMO_CACHE ? without.slice(1) : without;
  demoCacheEntries = [...trimmed, [key, data]];
}

export function clearDemoCache(): void {
  demoCacheEntries = [];
}

export async function loadDemoScenario(
  id: number,
  locale: Locale = DEFAULT_LOCALE,
): Promise<DemoScenario | null> {
  const cached = getDemoCache(id, locale);
  if (cached !== undefined) return cached;

  const paddedId = String(id).padStart(2, "0");
  try {
    const res = await fetch(
      `${basePath}/data/${locale}/demo/${paddedId}.json`,
    );
    if (!res.ok) {
      setDemoCache(id, locale, null);
      return null;
    }
    const data: DemoScenario = await res.json();
    setDemoCache(id, locale, data);
    return data;
  } catch {
    setDemoCache(id, locale, null);
    return null;
  }
}
