import type { Harness, HarnessMeta } from "./types";
import type { Locale } from "./locale";
import { DEFAULT_LOCALE } from "./locale";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const MAX_DETAIL_CACHE = 20;

let catalogCache: Map<Locale, ReadonlyArray<HarnessMeta>> = new Map();
let detailCacheEntries: ReadonlyArray<readonly [string, Harness]> = [];

function detailKey(id: number, locale: Locale): string {
  return `${locale}:${id}`;
}

function getDetailCache(id: number, locale: Locale): Harness | undefined {
  const key = detailKey(id, locale);
  const entry = detailCacheEntries.find(([k]) => k === key);
  return entry?.[1];
}

function setDetailCache(id: number, locale: Locale, data: Harness): void {
  const key = detailKey(id, locale);
  const without = detailCacheEntries.filter(([k]) => k !== key);
  const trimmed =
    without.length >= MAX_DETAIL_CACHE ? without.slice(1) : without;
  detailCacheEntries = [...trimmed, [key, data]];
}

export function clearCache(): void {
  catalogCache = new Map();
  detailCacheEntries = [];
}

export async function loadCatalog(
  locale: Locale = DEFAULT_LOCALE,
): Promise<ReadonlyArray<HarnessMeta>> {
  const cached = catalogCache.get(locale);
  if (cached) return cached;

  const res = await fetch(`${basePath}/data/${locale}/harnesses.json`);
  if (!res.ok) {
    throw new Error(`Failed to load catalog: ${res.status}`);
  }
  const data: ReadonlyArray<HarnessMeta> = await res.json();
  const next = new Map(catalogCache);
  next.set(locale, data);
  catalogCache = next;
  return data;
}

export async function loadHarnessDetail(
  id: number,
  locale: Locale = DEFAULT_LOCALE,
): Promise<Harness> {
  const cached = getDetailCache(id, locale);
  if (cached) return cached;

  const paddedId = String(id).padStart(2, "0");
  const res = await fetch(
    `${basePath}/data/${locale}/harness/${paddedId}.json`,
  );
  if (!res.ok) {
    throw new Error(`Failed to load harness ${id}: ${res.status}`);
  }
  const data: Harness = await res.json();
  setDetailCache(id, locale, data);
  return data;
}
