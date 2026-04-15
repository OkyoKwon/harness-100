import { describe, it, expect, vi } from "vitest";
import {
  parseExtensionSkillSuggestions,
  parseSkillDetails,
  generateAllExtensionSkills,
} from "../ai-assist";

describe("parseExtensionSkillSuggestions", () => {
  it("returns empty array for '없음'", () => {
    expect(parseExtensionSkillSuggestions("없음")).toEqual([]);
  });

  it("returns empty array for 'none'", () => {
    expect(parseExtensionSkillSuggestions("none")).toEqual([]);
  });

  it("returns empty array for empty string", () => {
    expect(parseExtensionSkillSuggestions("")).toEqual([]);
  });

  it("parses single Korean extension skill", () => {
    const text = `---
이름: hook-writing
대상: content-writer
설명: 효과적인 훅 작성 전문 지식`;

    const result = parseExtensionSkillSuggestions(text);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      name: "hook-writing",
      targetAgent: "content-writer",
      description: "효과적인 훅 작성 전문 지식",
    });
  });

  it("parses single English extension skill", () => {
    const text = `---
Name: thumbnail-psychology
Target: designer
Description: Psychology of effective thumbnail design`;

    const result = parseExtensionSkillSuggestions(text);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      name: "thumbnail-psychology",
      targetAgent: "designer",
      description: "Psychology of effective thumbnail design",
    });
  });

  it("parses multiple extension skills", () => {
    const text = `---
이름: hook-writing
대상: content-writer
설명: 효과적인 훅 작성
---
이름: thumbnail-psychology
대상: designer
설명: 썸네일 디자인 심리학
---
이름: seo-optimization
대상: content-writer
설명: SEO 최적화 전문 지식`;

    const result = parseExtensionSkillSuggestions(text);
    expect(result).toHaveLength(3);
    expect(result[0].name).toBe("hook-writing");
    expect(result[1].name).toBe("thumbnail-psychology");
    expect(result[2].name).toBe("seo-optimization");
  });

  it("skips blocks without a name", () => {
    const text = `---
대상: content-writer
설명: 이름 없는 스킬
---
이름: valid-skill
대상: designer
설명: 유효한 스킬`;

    const result = parseExtensionSkillSuggestions(text);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("valid-skill");
  });

  it("handles full-width colon", () => {
    const text = `---
이름： hook-writing
대상： content-writer
설명： 훅 작성`;

    const result = parseExtensionSkillSuggestions(text);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("hook-writing");
  });
});

describe("generateAllExtensionSkills", () => {
  it("returns empty result when suggestions return none", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        content: [{ text: "없음" }],
        stop_reason: "end_turn",
      }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const result = await generateAllExtensionSkills(
      "test-key",
      "Test Harness",
      "Test description",
      [{ id: "a1", name: "Writer", role: "writes", description: "writes things" }],
      "ko",
    );

    expect(result.success).toBe(true);
    expect(result.result?.suggestions).toHaveLength(0);
    expect(result.result?.markdowns).toEqual({});

    vi.unstubAllGlobals();
  });

  it("calls onProgress for each markdown generation", async () => {
    let callCount = 0;
    const mockFetch = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        // Suggestion response
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            content: [{ text: "---\n이름: hook-writing\n대상: Writer\n설명: 훅 작성" }],
            stop_reason: "end_turn",
          }),
        });
      }
      // Markdown generation response
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          content: [{ text: "# hook-writing skill.md content" }],
          stop_reason: "end_turn",
        }),
      });
    });
    vi.stubGlobal("fetch", mockFetch);

    const onProgress = vi.fn();
    const result = await generateAllExtensionSkills(
      "test-key",
      "Test Harness",
      "Test description",
      [{ id: "a1", name: "Writer", role: "writes", description: "writes things" }],
      "ko",
      onProgress,
    );

    expect(result.success).toBe(true);
    expect(result.result?.suggestions).toHaveLength(1);
    expect(result.result?.markdowns["hook-writing"]).toContain("hook-writing");
    expect(onProgress).toHaveBeenCalledWith(1, 1);

    vi.unstubAllGlobals();
  });

  it("returns error when suggestion API fails", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: () => Promise.resolve("Unauthorized"),
    });
    vi.stubGlobal("fetch", mockFetch);

    const result = await generateAllExtensionSkills(
      "bad-key",
      "Test",
      "desc",
      [{ id: "a1", name: "W", role: "r", description: "d" }],
      "ko",
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe("ai.error.invalidKey");

    vi.unstubAllGlobals();
  });
});

describe("parseSkillDetails", () => {
  it("parses name and triggers", () => {
    const text = `이름: code-review
트리거:
코드 리뷰해줘
코드 검토해줘
PR 리뷰`;

    const result = parseSkillDetails(text);
    expect(result.name).toBe("code-review");
    expect(result.triggers).toHaveLength(3);
    expect(result.triggers[0]).toBe("코드 리뷰해줘");
  });

  it("parses English format", () => {
    const text = `Name: code-review
Triggers:
review my code
check this PR`;

    const result = parseSkillDetails(text);
    expect(result.name).toBe("code-review");
    expect(result.triggers).toHaveLength(2);
  });
});
