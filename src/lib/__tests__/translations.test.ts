import { describe, it, expect } from "vitest";
import { t } from "../translations";

describe("t (translation function)", () => {
  // ── Basic lookup ──
  it("returns Korean text for 'ko' locale", () => {
    expect(t("ko", "nav.ranking")).toBe("랭킹");
  });

  it("returns English text for 'en' locale", () => {
    expect(t("en", "nav.ranking")).toBe("Ranking");
  });

  // ── Missing key fallback ──
  it("returns the key itself when the key does not exist", () => {
    expect(t("ko", "nonexistent.key")).toBe("nonexistent.key");
    expect(t("en", "nonexistent.key")).toBe("nonexistent.key");
  });

  // ── Interpolation ──
  it("replaces {count} parameter in Korean", () => {
    const result = t("ko", "catalog.resultCount", { count: 42 });
    expect(result).toBe("42개 결과");
  });

  it("replaces {count} parameter in English", () => {
    const result = t("en", "catalog.resultCount", { count: 42 });
    expect(result).toBe("42 results");
  });

  it("replaces multiple parameters", () => {
    // "completion.setupDone" has {path}
    const result = t("en", "completion.setupDone", { path: "/my/project" });
    expect(result).toContain("/my/project");
    expect(result).toContain("Setup complete!");
  });

  it("handles {slug} parameter", () => {
    const result = t("en", "completion.zipDone", { slug: "my-harness" });
    expect(result).toContain("my-harness.zip");
  });

  it("handles string parameters", () => {
    const result = t("ko", "card.agents", { count: "5" });
    expect(result).toBe("👥 5명");
  });

  // ── No params ──
  it("returns text without modification when no params provided", () => {
    expect(t("en", "hero.title")).toBe(
      "100 AI Agent Teams, Set Up in 3 Clicks",
    );
  });

  // ── Edge: params with no matching placeholders ──
  it("returns text unchanged when params do not match placeholders", () => {
    const result = t("en", "nav.ranking", { unused: "value" });
    expect(result).toBe("Ranking");
  });

  // ── Various keys exist ──
  it("has translations for all navigation keys", () => {
    expect(t("ko", "nav.composer")).toBe("조합");
    expect(t("en", "nav.guide")).toBe("Guide");
  });

  it("has translations for accessibility keys", () => {
    expect(t("en", "a11y.skipToContent")).toBe("Skip to content");
  });

  it("has translations for search keys", () => {
    expect(t("en", "search.placeholder")).toContain("Search harnesses");
  });

  it("has translations for toast keys", () => {
    const result = t("en", "toast.setupComplete", { count: 5 });
    expect(result).toBe("Setup complete — 5 files created");
  });

  it("has translations for customizer keys with name param", () => {
    const result = t("en", "customizer.enableAgent", { name: "Alpha" });
    expect(result).toBe("Enable Alpha");
  });
});
