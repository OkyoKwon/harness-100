import { describe, it, expect } from "vitest";
import { buildCliCommand } from "../cli";

describe("buildCliCommand", () => {
  it("generates a valid CLI command for a simple slug", () => {
    expect(buildCliCommand("my-harness")).toBe('claude "/my-harness"');
  });

  it("generates a valid CLI command for a numeric slug", () => {
    expect(buildCliCommand("test-123")).toBe('claude "/test-123"');
  });

  it("handles Korean slug", () => {
    expect(buildCliCommand("심플한-pptx-제작")).toBe('claude "/심플한-pptx-제작"');
  });

  it("strips shell-dangerous characters", () => {
    expect(buildCliCommand('test"slug')).toBe('claude "/testslug"');
    expect(buildCliCommand("test`cmd`")).toBe('claude "/testcmd"');
    expect(buildCliCommand("test$var")).toBe('claude "/testvar"');
    expect(buildCliCommand("test\\path")).toBe('claude "/testpath"');
  });
});
