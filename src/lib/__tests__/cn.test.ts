import { describe, it, expect } from "vitest";
import { cn } from "../cn";

describe("cn", () => {
  it("should_joinMultipleStrings_when_allTruthy", () => {
    // Arrange & Act
    const result = cn("foo", "bar", "baz");

    // Assert
    expect(result).toBe("foo bar baz");
  });

  it("should_returnSingleClass_when_onlyOneProvided", () => {
    // Arrange & Act & Assert
    expect(cn("foo")).toBe("foo");
  });

  it("should_filterFalse_when_booleanFalseProvided", () => {
    // Arrange & Act
    const result = cn("foo", false, "bar");

    // Assert
    expect(result).toBe("foo bar");
  });

  it("should_filterUndefined_when_undefinedProvided", () => {
    // Arrange & Act
    const result = cn("foo", undefined, "bar");

    // Assert
    expect(result).toBe("foo bar");
  });

  it("should_filterNull_when_nullProvided", () => {
    // Arrange & Act
    const result = cn("foo", null, "bar");

    // Assert
    expect(result).toBe("foo bar");
  });

  it("should_returnEmptyString_when_noArgsProvided", () => {
    // Arrange & Act & Assert
    expect(cn()).toBe("");
  });

  it("should_returnEmptyString_when_allArgsFalsy", () => {
    // Arrange & Act & Assert
    expect(cn(false, undefined, null)).toBe("");
  });

  it("should_filterEmptyString_when_emptyStringProvided", () => {
    // Arrange & Act — empty string is falsy, so it should be filtered
    const result = cn("foo", "", "bar");

    // Assert
    expect(result).toBe("foo bar");
  });

  it("should_preserveWhitespace_when_classHasSpaces", () => {
    // Arrange & Act
    const result = cn("px-4 py-2", "bg-blue-500");

    // Assert
    expect(result).toBe("px-4 py-2 bg-blue-500");
  });

  it("should_filterMixedFalsyValues_when_multipleFalsyTypes", () => {
    // Arrange & Act
    const result = cn(null, "a", false, undefined, "b", null);

    // Assert
    expect(result).toBe("a b");
  });
});
