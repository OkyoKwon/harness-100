import { describe, it, expect } from "vitest";
import {
  isValidSlug,
  assertValidSlug,
  isValidPath,
  isAllowedModificationField,
  parseFavoriteIds,
  parseStoredFavorites,
} from "../validation";

describe("isValidSlug", () => {
  it("accepts a simple lowercase slug", () => {
    expect(isValidSlug("hello")).toBe(true);
  });

  it("accepts a hyphenated slug", () => {
    expect(isValidSlug("my-harness")).toBe(true);
  });

  it("accepts a slug with numbers", () => {
    expect(isValidSlug("test-123")).toBe(true);
  });

  it("accepts a single character slug", () => {
    expect(isValidSlug("a")).toBe(true);
  });

  it("rejects an uppercase slug", () => {
    expect(isValidSlug("Hello")).toBe(false);
  });

  it("rejects a slug with leading hyphen", () => {
    expect(isValidSlug("-bad")).toBe(false);
  });

  it("rejects a slug with trailing hyphen", () => {
    expect(isValidSlug("bad-")).toBe(false);
  });

  it("rejects a slug with consecutive hyphens", () => {
    expect(isValidSlug("a--b")).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(isValidSlug("")).toBe(false);
  });

  it("rejects a slug with spaces", () => {
    expect(isValidSlug("has space")).toBe(false);
  });

  it("rejects a slug with special characters", () => {
    expect(isValidSlug("hello@world")).toBe(false);
  });

  it("rejects a slug with underscores", () => {
    expect(isValidSlug("hello_world")).toBe(false);
  });
});

describe("assertValidSlug", () => {
  it("does not throw for a valid slug", () => {
    expect(() => assertValidSlug("valid-slug")).not.toThrow();
  });

  it("throws an Error for an invalid slug", () => {
    expect(() => assertValidSlug("INVALID")).toThrow('Invalid slug: "INVALID"');
  });

  it("throws an Error for an empty string", () => {
    expect(() => assertValidSlug("")).toThrow('Invalid slug: ""');
  });
});

describe("isValidPath", () => {
  it("accepts a simple relative path", () => {
    expect(isValidPath("agents/foo.md")).toBe(true);
  });

  it("accepts a deeply nested path", () => {
    expect(isValidPath("a/b/c/d.txt")).toBe(true);
  });

  it("accepts a filename without directory", () => {
    expect(isValidPath("file.md")).toBe(true);
  });

  it("rejects path traversal with ..", () => {
    expect(isValidPath("../etc/passwd")).toBe(false);
  });

  it("rejects path traversal in the middle", () => {
    expect(isValidPath("foo/../bar")).toBe(false);
  });

  it("rejects an absolute path starting with /", () => {
    expect(isValidPath("/root/file")).toBe(false);
  });

  it("rejects Windows-style special characters <", () => {
    expect(isValidPath("file<name")).toBe(false);
  });

  it("rejects Windows-style special characters >", () => {
    expect(isValidPath("file>name")).toBe(false);
  });

  it("rejects Windows-style special characters :", () => {
    expect(isValidPath("C:file")).toBe(false);
  });

  it("rejects Windows-style special characters |", () => {
    expect(isValidPath("file|name")).toBe(false);
  });

  it("rejects Windows-style special characters ?", () => {
    expect(isValidPath("file?name")).toBe(false);
  });

  it("rejects Windows-style special characters *", () => {
    expect(isValidPath("file*name")).toBe(false);
  });

  it('rejects paths with double quotes', () => {
    expect(isValidPath('file"name')).toBe(false);
  });
});

describe("isAllowedModificationField", () => {
  it.each(["name", "role", "description", "outputTemplate", "enabled"])(
    'accepts allowed field "%s"',
    (field) => {
      expect(isAllowedModificationField(field)).toBe(true);
    },
  );

  it.each(["password", "id", "tools", "dependencies", "admin", ""])(
    'rejects disallowed field "%s"',
    (field) => {
      expect(isAllowedModificationField(field)).toBe(false);
    },
  );
});

describe("parseFavoriteIds", () => {
  it("parses a comma-separated list of valid IDs", () => {
    expect(parseFavoriteIds("1,5,100")).toEqual([1, 5, 100]);
  });

  it("filters out IDs below 1", () => {
    expect(parseFavoriteIds("0,1,2")).toEqual([1, 2]);
  });

  it("filters out IDs above 999", () => {
    expect(parseFavoriteIds("1,1000,5")).toEqual([1, 5]);
  });

  it("filters out non-numeric entries", () => {
    expect(parseFavoriteIds("abc,1,xyz")).toEqual([1]);
  });

  it("returns empty array for empty string input", () => {
    // Note: "".split(",") gives [""], Number("") is 0, filtered out
    expect(parseFavoriteIds("")).toEqual([]);
  });

  it("handles a single valid ID", () => {
    expect(parseFavoriteIds("42")).toEqual([42]);
  });

  it("filters out floating point numbers", () => {
    expect(parseFavoriteIds("1.5,2")).toEqual([2]);
  });
});

describe("parseStoredFavorites", () => {
  it("parses valid JSON array of numbers", () => {
    expect(parseStoredFavorites("[1,2,3]")).toEqual([1, 2, 3]);
  });

  it("returns empty array for invalid JSON", () => {
    expect(parseStoredFavorites("not json")).toEqual([]);
  });

  it("returns empty array for non-array JSON", () => {
    expect(parseStoredFavorites("42")).toEqual([]);
  });

  it("returns empty array for JSON object", () => {
    expect(parseStoredFavorites('{"a":1}')).toEqual([]);
  });

  it("filters out non-integer entries", () => {
    expect(parseStoredFavorites("[1,1.5,2]")).toEqual([1, 2]);
  });

  it("filters out string entries in array", () => {
    expect(parseStoredFavorites('[1,"a",3]')).toEqual([1, 3]);
  });

  it("filters out values below 1", () => {
    expect(parseStoredFavorites("[0,1,2]")).toEqual([1, 2]);
  });

  it("filters out values above 999", () => {
    expect(parseStoredFavorites("[1,1000,5]")).toEqual([1, 5]);
  });

  it("returns empty array for empty string", () => {
    expect(parseStoredFavorites("")).toEqual([]);
  });

  it("returns empty array for JSON null", () => {
    expect(parseStoredFavorites("null")).toEqual([]);
  });
});
