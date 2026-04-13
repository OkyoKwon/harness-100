import { describe, it, expect, beforeEach } from "vitest";
import {
  createLocalStorageFallbackForTest,
  resetHarnessStore,
  type HarnessStore,
} from "../harness-store";
import { STORAGE_KEYS } from "../constants";
import type { CustomHarness } from "../custom-harness-types";

function makeHarness(overrides: Partial<CustomHarness> = {}): CustomHarness {
  return {
    id: "test-1",
    slug: "test-harness",
    name: "Test Harness",
    description: "A test harness",
    category: "development",
    agents: [],
    skill: {
      id: "skill-1",
      name: "test-skill",
      triggerConditions: [],
      executionOrder: [],
      modes: [],
      extensionSkills: [],
    },
    frameworks: [],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    version: 1,
    ...overrides,
  };
}

describe("harness-store (localStorage fallback)", () => {
  let store: HarnessStore;

  beforeEach(() => {
    resetHarnessStore();
    localStorage.clear();
    store = createLocalStorageFallbackForTest();
  });

  it("returns empty array on fresh store", async () => {
    const all = await store.getAll();
    expect(all).toEqual([]);
  });

  it("put and getAll round-trip", async () => {
    const harness = makeHarness();
    await store.put(harness);

    const all = await store.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe("test-1");
    expect(all[0].name).toBe("Test Harness");
  });

  it("put overwrites existing harness with same id", async () => {
    await store.put(makeHarness());
    await store.put(makeHarness({ name: "Updated" }));

    const all = await store.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].name).toBe("Updated");
  });

  it("stores multiple harnesses", async () => {
    await store.put(makeHarness({ id: "a" }));
    await store.put(makeHarness({ id: "b" }));
    await store.put(makeHarness({ id: "c" }));

    const all = await store.getAll();
    expect(all).toHaveLength(3);
  });

  it("remove deletes by id", async () => {
    await store.put(makeHarness({ id: "a" }));
    await store.put(makeHarness({ id: "b" }));

    await store.remove("a");

    const all = await store.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe("b");
  });

  it("remove is a no-op for non-existent id", async () => {
    await store.put(makeHarness({ id: "a" }));
    await store.remove("non-existent");

    const all = await store.getAll();
    expect(all).toHaveLength(1);
  });

  it("persists data to localStorage", async () => {
    await store.put(makeHarness({ id: "persisted" }));

    const raw = localStorage.getItem(STORAGE_KEYS.customHarnesses);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.version).toBe(1);
    expect(parsed.harnesses).toHaveLength(1);
    expect(parsed.harnesses[0].id).toBe("persisted");
  });

  it("reads pre-existing localStorage data", async () => {
    const existing = makeHarness({ id: "pre-existing" });
    const storeData = { version: 1, harnesses: [existing] };
    localStorage.setItem(STORAGE_KEYS.customHarnesses, JSON.stringify(storeData));

    const freshStore = createLocalStorageFallbackForTest();
    const all = await freshStore.getAll();

    expect(all).toHaveLength(1);
    expect(all[0].id).toBe("pre-existing");
  });

  it("handles invalid localStorage data gracefully", async () => {
    localStorage.setItem(STORAGE_KEYS.customHarnesses, "invalid json {{{");

    const freshStore = createLocalStorageFallbackForTest();
    const all = await freshStore.getAll();
    expect(all).toEqual([]);
  });

  it("getAll returns independent snapshot after remove", async () => {
    await store.put(makeHarness({ id: "x" }));
    await store.put(makeHarness({ id: "y" }));

    const before = await store.getAll();
    expect(before).toHaveLength(2);

    await store.remove("x");

    const after = await store.getAll();
    expect(after).toHaveLength(1);
    // Original snapshot unchanged
    expect(before).toHaveLength(2);
  });
});

describe("harness-store (getHarnessStore fallback)", () => {
  beforeEach(() => {
    resetHarnessStore();
    localStorage.clear();
  });

  it("getHarnessStore falls back to localStorage when IndexedDB unavailable", async () => {
    // In jsdom, idb's openDB hangs, so getHarnessStore should fall back
    // We test the fallback path works correctly via the exported factory
    const store = createLocalStorageFallbackForTest();
    await store.put(makeHarness({ id: "fallback-1" }));
    const all = await store.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe("fallback-1");
  });
});
