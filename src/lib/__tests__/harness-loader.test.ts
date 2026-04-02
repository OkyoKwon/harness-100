import { describe, it, expect, beforeEach, vi } from "vitest";
import { loadCatalog, loadHarnessDetail, clearCache } from "../harness-loader";
import { createHarnessMeta, createHarness } from "@/test/mocks/harness-fixtures";

function mockFetchSuccess(data: unknown) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(data),
  });
}

function mockFetchError(status: number) {
  return vi.fn().mockResolvedValue({
    ok: false,
    status,
    json: () => Promise.resolve({}),
  });
}

describe("harness-loader", () => {
  beforeEach(() => {
    clearCache();
  });

  describe("loadCatalog", () => {
    it("fetches catalog data on cache miss", async () => {
      const catalog = [createHarnessMeta({ id: 1 }), createHarnessMeta({ id: 2 })];
      vi.stubGlobal("fetch", mockFetchSuccess(catalog));

      const result = await loadCatalog("ko");

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(result).toEqual(catalog);
    });

    it("returns cached data on cache hit without re-fetching", async () => {
      const catalog = [createHarnessMeta({ id: 1 })];
      vi.stubGlobal("fetch", mockFetchSuccess(catalog));

      await loadCatalog("ko");
      const result = await loadCatalog("ko");

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(result).toEqual(catalog);
    });

    it("fetches separately for different locales", async () => {
      const koCatalog = [createHarnessMeta({ id: 1, name: "Korean" })];
      const enCatalog = [createHarnessMeta({ id: 1, name: "English" })];

      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(koCatalog) })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(enCatalog) });
      vi.stubGlobal("fetch", fetchMock);

      const ko = await loadCatalog("ko");
      const en = await loadCatalog("en");

      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(ko[0].name).toBe("Korean");
      expect(en[0].name).toBe("English");
    });

    it("throws an error when fetch fails", async () => {
      vi.stubGlobal("fetch", mockFetchError(500));

      await expect(loadCatalog("ko")).rejects.toThrow(
        "Failed to load catalog: 500",
      );
    });
  });

  describe("loadHarnessDetail", () => {
    it("fetches harness detail with padded ID on cache miss", async () => {
      const harness = createHarness({ id: 5 });
      vi.stubGlobal("fetch", mockFetchSuccess(harness));

      const result = await loadHarnessDetail(5, "ko");

      expect(fetch).toHaveBeenCalledTimes(1);
      const url = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
      expect(url).toContain("/data/ko/harness/05.json");
      expect(result).toEqual(harness);
    });

    it("returns cached data on cache hit", async () => {
      const harness = createHarness({ id: 5 });
      vi.stubGlobal("fetch", mockFetchSuccess(harness));

      await loadHarnessDetail(5, "ko");
      const result = await loadHarnessDetail(5, "ko");

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(result).toEqual(harness);
    });

    it("evicts the oldest entry when cache exceeds MAX_DETAIL_CACHE (20)", async () => {
      let callCount = 0;
      const fetchMock = vi.fn().mockImplementation(() => {
        callCount++;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(createHarness({ id: callCount })),
        });
      });
      vi.stubGlobal("fetch", fetchMock);

      // Fill cache with 20 entries
      for (let i = 1; i <= 20; i++) {
        await loadHarnessDetail(i, "ko");
      }
      expect(fetchMock).toHaveBeenCalledTimes(20);

      // Add 21st entry (should evict entry 1)
      await loadHarnessDetail(21, "ko");
      expect(fetchMock).toHaveBeenCalledTimes(21);

      // Entry 1 should be evicted, so it fetches again
      await loadHarnessDetail(1, "ko");
      expect(fetchMock).toHaveBeenCalledTimes(22);
    });

    it("throws an error when fetch fails", async () => {
      vi.stubGlobal("fetch", mockFetchError(404));

      await expect(loadHarnessDetail(999, "ko")).rejects.toThrow(
        "Failed to load harness 999: 404",
      );
    });
  });

  describe("clearCache", () => {
    it("resets all caches so next call fetches again", async () => {
      const catalog = [createHarnessMeta({ id: 1 })];
      vi.stubGlobal("fetch", mockFetchSuccess(catalog));

      await loadCatalog("ko");
      expect(fetch).toHaveBeenCalledTimes(1);

      clearCache();

      await loadCatalog("ko");
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });
});
