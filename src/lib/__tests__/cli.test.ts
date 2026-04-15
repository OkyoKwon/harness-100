import { describe, it, expect } from "vitest";
import { buildCliCommand } from "../cli";

describe("buildCliCommand", () => {
  it("generates a valid CLI command for a simple slug", () => {
    expect(buildCliCommand("my-harness")).toBe('claude "/my-harness"');
  });

  it("generates a valid CLI command for a numeric slug", () => {
    expect(buildCliCommand("test-123")).toBe('claude "/test-123"');
  });

  it("handles slug with only ASCII characters", () => {
    expect(buildCliCommand("simple-pptx-maker")).toBe('claude "/simple-pptx-maker"');
  });

  it("strips shell-dangerous characters", () => {
    expect(buildCliCommand('test"slug')).toBe('claude "/testslug"');
    expect(buildCliCommand("test`cmd`")).toBe('claude "/testcmd"');
    expect(buildCliCommand("test$var")).toBe('claude "/testvar"');
    expect(buildCliCommand("test\\path")).toBe('claude "/testpath"');
  });
});
