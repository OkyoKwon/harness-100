import { describe, it, expect } from "vitest";
import { buildCliCommand } from "../cli";

describe("buildCliCommand", () => {
  it("generates a valid CLI command for a simple slug", () => {
    expect(buildCliCommand("my-harness")).toBe('claude "/my-harness"');
  });

  it("generates a valid CLI command for a numeric slug", () => {
    expect(buildCliCommand("test-123")).toBe('claude "/test-123"');
  });

  it("throws when given an invalid slug with uppercase", () => {
    expect(() => buildCliCommand("Invalid")).toThrow("Invalid slug");
  });

  it("throws when given an empty string", () => {
    expect(() => buildCliCommand("")).toThrow("Invalid slug");
  });

  it("throws when given a slug with special characters", () => {
    expect(() => buildCliCommand("hello@world")).toThrow("Invalid slug");
  });
});
