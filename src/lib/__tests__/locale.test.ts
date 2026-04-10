import { describe, it, expect } from "vitest";
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY } from "../locale";
import type { Locale } from "../locale";

describe("locale", () => {
  describe("DEFAULT_LOCALE", () => {
    it("should_beKo_when_accessed", () => {
      // Assert
      expect(DEFAULT_LOCALE).toBe("ko");
    });

    it("should_satisfyLocaleType_when_checked", () => {
      // Assert — should be assignable to Locale type
      const locale: Locale = DEFAULT_LOCALE;
      expect(["ko", "en"]).toContain(locale);
    });
  });

  describe("LOCALE_STORAGE_KEY", () => {
    it("should_beHarness100Lang_when_accessed", () => {
      // Assert
      expect(LOCALE_STORAGE_KEY).toBe("harness100_lang");
    });

    it("should_beNonEmptyString_when_accessed", () => {
      // Assert
      expect(LOCALE_STORAGE_KEY.length).toBeGreaterThan(0);
    });
  });

  describe("Locale type", () => {
    it("should_acceptKo_when_assigned", () => {
      // Arrange & Assert — TypeScript type check at compile time
      const ko: Locale = "ko";
      expect(ko).toBe("ko");
    });

    it("should_acceptEn_when_assigned", () => {
      // Arrange & Assert
      const en: Locale = "en";
      expect(en).toBe("en");
    });
  });
});
