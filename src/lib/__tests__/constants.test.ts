import { describe, it, expect } from "vitest";
import {
  CATEGORIES,
  TOTAL_HARNESS_COUNT,
  POPULARITY_RANKINGS,
  STORAGE_KEYS,
} from "../constants";

describe("CATEGORIES", () => {
  it("has exactly 10 categories", () => {
    expect(CATEGORIES).toHaveLength(10);
  });

  it("covers IDs 1 through 100 with contiguous ranges", () => {
    const sortedCategories = [...CATEGORIES].sort(
      (a, b) => a.range[0] - b.range[0],
    );

    expect(sortedCategories[0].range[0]).toBe(1);
    expect(sortedCategories[sortedCategories.length - 1].range[1]).toBe(100);

    // Check contiguity: each range[0] should be previous range[1] + 1
    for (let i = 1; i < sortedCategories.length; i++) {
      expect(sortedCategories[i].range[0]).toBe(
        sortedCategories[i - 1].range[1] + 1,
      );
    }
  });

  it("has no duplicate slugs", () => {
    const slugs = CATEGORIES.map((c) => c.slug);
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(slugs.length);
  });

  it("has correct count for each category matching its range", () => {
    for (const category of CATEGORIES) {
      const expectedCount = category.range[1] - category.range[0] + 1;
      expect(category.count).toBe(expectedCount);
    }
  });

  it("total count across categories equals TOTAL_HARNESS_COUNT", () => {
    const total = CATEGORIES.reduce((sum, c) => sum + c.count, 0);
    expect(total).toBe(TOTAL_HARNESS_COUNT);
  });
});

describe("POPULARITY_RANKINGS", () => {
  it("has exactly 10 entries", () => {
    expect(POPULARITY_RANKINGS.size).toBe(10);
  });

  it("contains ranks 1 through 10", () => {
    const ranks = [...POPULARITY_RANKINGS.values()].sort((a, b) => a - b);
    expect(ranks).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it("has no duplicate ranks", () => {
    const ranks = [...POPULARITY_RANKINGS.values()];
    const uniqueRanks = new Set(ranks);
    expect(uniqueRanks.size).toBe(ranks.length);
  });

  it("all harness IDs are within valid range (1-100)", () => {
    for (const id of POPULARITY_RANKINGS.keys()) {
      expect(id).toBeGreaterThanOrEqual(1);
      expect(id).toBeLessThanOrEqual(100);
    }
  });
});

describe("STORAGE_KEYS", () => {
  it("has all required keys", () => {
    expect(STORAGE_KEYS).toHaveProperty("favorites");
    expect(STORAGE_KEYS).toHaveProperty("recentPaths");
    expect(STORAGE_KEYS).toHaveProperty("customizations");
    expect(STORAGE_KEYS).toHaveProperty("locale");
  });

  it("all values are non-empty strings", () => {
    for (const value of Object.values(STORAGE_KEYS)) {
      expect(typeof value).toBe("string");
      expect(value.length).toBeGreaterThan(0);
    }
  });
});
