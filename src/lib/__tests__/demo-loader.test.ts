import { describe, it, expect, beforeEach, vi } from "vitest";
import { loadDemoScenario, clearDemoCache } from "../demo-loader";
import { createDemoScenario } from "@/test/mocks/harness-fixtures";

function mockFetchSuccess(data: unknown) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(data),
  });
}

function mockFetchNotFound() {
  return vi.fn().mockResolvedValue({
    ok: false,
    status: 404,
  });
}

function mockFetchNetworkError() {
  return vi.fn().mockRejectedValue(new Error("Network error"));
}

describe("demo-loader", () => {
  beforeEach(() => {
    clearDemoCache();
  });

  it("fetches demo data on cache miss", async () => {
    const demo = createDemoScenario();
    vi.stubGlobal("fetch", mockFetchSuccess(demo));

    const result = await loadDemoScenario(1, "en");

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(result).toEqual(demo);
  });

  it("returns cached data on cache hit", async () => {
    const demo = createDemoScenario();
    vi.stubGlobal("fetch", mockFetchSuccess(demo));

    await loadDemoScenario(1, "en");
    const result = await loadDemoScenario(1, "en");

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(result).toEqual(demo);
  });

  it("fetches separately for different locales", async () => {
    const enDemo = createDemoScenario({ title: "English" });
    const koDemo = createDemoScenario({ title: "Korean" });

    let callCount = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() => {
        callCount++;
        const data = callCount === 1 ? enDemo : koDemo;
        return Promise.resolve({ ok: true, json: () => Promise.resolve(data) });
      }),
    );

    const enResult = await loadDemoScenario(1, "en");
    const koResult = await loadDemoScenario(1, "ko");

    expect(enResult?.title).toBe("English");
    expect(koResult?.title).toBe("Korean");
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("returns null and caches on 404", async () => {
    vi.stubGlobal("fetch", mockFetchNotFound());

    const result = await loadDemoScenario(99, "en");
    expect(result).toBeNull();

    // Second call should not refetch
    const result2 = await loadDemoScenario(99, "en");
    expect(result2).toBeNull();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("returns null on network error", async () => {
    vi.stubGlobal("fetch", mockFetchNetworkError());

    const result = await loadDemoScenario(1, "en");
    expect(result).toBeNull();
  });

  it("uses zero-padded ID in URL", async () => {
    vi.stubGlobal("fetch", mockFetchSuccess(createDemoScenario()));

    await loadDemoScenario(5, "ko");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/data/ko/demo/05.json"),
    );
  });

  it("evicts oldest entries when cache exceeds max size", async () => {
    vi.stubGlobal("fetch", mockFetchSuccess(createDemoScenario()));

    // Fill cache beyond MAX_DEMO_CACHE (20)
    for (let i = 1; i <= 22; i++) {
      await loadDemoScenario(i, "en");
    }

    expect(fetch).toHaveBeenCalledTimes(22);

    // Accessing id=1 should require re-fetch (evicted)
    await loadDemoScenario(1, "en");
    expect(fetch).toHaveBeenCalledTimes(23);
  });
});
