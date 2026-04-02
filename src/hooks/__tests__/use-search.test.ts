import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSearch } from "../use-search";
import { createHarnessMeta } from "@/test/mocks/harness-fixtures";

const fixtures = [
  createHarnessMeta({
    id: 1,
    slug: "youtube-production",
    name: "YouTube Production",
    description: "YouTube content creation workflow",
    category: "content",
  }),
  createHarnessMeta({
    id: 16,
    slug: "fullstack-web-app",
    name: "Fullstack Web App",
    description: "Full stack web application development",
    category: "development",
  }),
  createHarnessMeta({
    id: 43,
    slug: "startup-launcher",
    name: "Startup Launcher",
    description: "Startup planning and launch toolkit",
    category: "business",
  }),
  createHarnessMeta({
    id: 32,
    slug: "data-analysis",
    name: "Data Analysis",
    description: "Data analysis and visualization pipeline",
    category: "data-ai",
  }),
  createHarnessMeta({
    id: 21,
    slug: "code-reviewer",
    name: "Code Reviewer",
    description: "Automated code review pipeline",
    category: "development",
  }),
];

describe("useSearch", () => {
  it("returns all items when query is empty", () => {
    // Arrange & Act
    const { result } = renderHook(() => useSearch(fixtures));

    // Assert
    expect(result.current.results).toEqual(fixtures);
    expect(result.current.query).toBe("");
  });

  it("filters by name match", () => {
    // Arrange
    const { result } = renderHook(() => useSearch(fixtures));

    // Act
    act(() => {
      result.current.updateQuery("YouTube");
    });

    // Assert
    expect(result.current.results.length).toBeGreaterThanOrEqual(1);
    expect(result.current.results.some((r) => r.name === "YouTube Production")).toBe(true);
  });

  it("filters by description match", () => {
    // Arrange
    const { result } = renderHook(() => useSearch(fixtures));

    // Act
    act(() => {
      result.current.updateQuery("visualization");
    });

    // Assert
    expect(result.current.results.length).toBeGreaterThanOrEqual(1);
    expect(result.current.results.some((r) => r.slug === "data-analysis")).toBe(true);
  });

  it("returns empty results for non-matching query", () => {
    // Arrange
    const { result } = renderHook(() => useSearch(fixtures));

    // Act
    act(() => {
      result.current.updateQuery("xyznonexistent12345");
    });

    // Assert
    expect(result.current.results).toHaveLength(0);
  });

  it("fuzzy matching works for partial input", () => {
    // Arrange
    const { result } = renderHook(() => useSearch(fixtures));

    // Act
    act(() => {
      result.current.updateQuery("Fullstck"); // typo: missing 'a'
    });

    // Assert - Fuse.js fuzzy matching should still find "Fullstack Web App"
    expect(result.current.results.length).toBeGreaterThanOrEqual(1);
    expect(result.current.results.some((r) => r.name === "Fullstack Web App")).toBe(true);
  });

  it("returns all items when query is reset to empty string", () => {
    // Arrange
    const { result } = renderHook(() => useSearch(fixtures));

    // Act
    act(() => {
      result.current.updateQuery("YouTube");
    });
    act(() => {
      result.current.updateQuery("");
    });

    // Assert
    expect(result.current.results).toEqual(fixtures);
  });

  it("filters by slug match", () => {
    // Arrange
    const { result } = renderHook(() => useSearch(fixtures));

    // Act
    act(() => {
      result.current.updateQuery("startup-launcher");
    });

    // Assert
    expect(result.current.results.length).toBeGreaterThanOrEqual(1);
    expect(result.current.results.some((r) => r.slug === "startup-launcher")).toBe(true);
  });

  it("updates query state correctly", () => {
    // Arrange
    const { result } = renderHook(() => useSearch(fixtures));

    // Act
    act(() => {
      result.current.updateQuery("test query");
    });

    // Assert
    expect(result.current.query).toBe("test query");
  });

  it("handles whitespace-only query as empty", () => {
    // Arrange
    const { result } = renderHook(() => useSearch(fixtures));

    // Act
    act(() => {
      result.current.updateQuery("   ");
    });

    // Assert - whitespace-only should return all items
    expect(result.current.results).toEqual(fixtures);
  });
});
