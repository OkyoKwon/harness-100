import type { Harness, HarnessMeta } from "./types";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

let catalogCache: ReadonlyArray<HarnessMeta> | null = null;
const detailCache = new Map<number, Harness>();

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
  const cached = detailCache.get(id);
  if (cached) return cached;

  const paddedId = String(id).padStart(2, "0");
  const res = await fetch(`${basePath}/data/harness/${paddedId}.json`);
  if (!res.ok) {
    throw new Error(`Failed to load harness ${id}: ${res.status}`);
  }
  const data: Harness = await res.json();
  detailCache.set(id, data);
  return data;
}
