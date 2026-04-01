import type { Harness, HarnessMeta } from "./types";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const MAX_DETAIL_CACHE = 20;

let catalogCache: ReadonlyArray<HarnessMeta> | null = null;
let detailCacheEntries: ReadonlyArray<readonly [number, Harness]> = [];

function getDetailCache(id: number): Harness | undefined {
  const entry = detailCacheEntries.find(([key]) => key === id);
  return entry?.[1];
}

function setDetailCache(id: number, data: Harness): void {
  const without = detailCacheEntries.filter(([key]) => key !== id);
  const trimmed =
    without.length >= MAX_DETAIL_CACHE ? without.slice(1) : without;
  detailCacheEntries = [...trimmed, [id, data]];
}

export async function loadCatalog(): Promise<ReadonlyArray<HarnessMeta>> {
  if (catalogCache) return catalogCache;

  const res = await fetch(`${basePath}/data/harnesses.json`);
  if (!res.ok) {
    throw new Error(`Failed to load catalog: ${res.status}`);
  }
  const data: ReadonlyArray<HarnessMeta> = await res.json();
  catalogCache = data;
  return data;
}

export async function loadHarnessDetail(id: number): Promise<Harness> {
  const cached = getDetailCache(id);
  if (cached) return cached;

  const paddedId = String(id).padStart(2, "0");
  const res = await fetch(`${basePath}/data/harness/${paddedId}.json`);
  if (!res.ok) {
    throw new Error(`Failed to load harness ${id}: ${res.status}`);
  }
  const data: Harness = await res.json();
  setDetailCache(id, data);
  return data;
}
