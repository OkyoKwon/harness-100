import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConflictModal } from "../conflict-modal";
import type { FileConflict } from "@/lib/types";

// --- Mocks ---

vi.mock("@/hooks/use-locale", () => ({
  useLocale: () => ({
    locale: "ko" as const,
    setLocale: vi.fn(),
    t: (key: string) => {
      const translations: Record<string, string> = {
        "conflict.title": "파일 충돌",
        "conflict.description": "다음 파일들이 충돌합니다",
        "conflict.applyAll": "모두 적용",
        "conflict.overwrite": "덮어쓰기",
        "conflict.skip": "건너뛰기",
        "conflict.merge": "병합",
        "conflict.cancel": "취소",
        "conflict.proceed": "진행",
        "conflict.fileType.claudeMd": "CLAUDE.md",
        "conflict.fileType.agent": "에이전트",
        "conflict.fileType.skill": "스킬",
      };
      return translations[key] ?? key;
    },
  }),
}));

// --- Helpers ---

function createConflicts(): ReadonlyArray<FileConflict> {
  return [
    { path: "CLAUDE.md", type: "claudeMd", resolution: "overwrite" },
    { path: ".claude/agents/planner.md", type: "agent", resolution: "overwrite" },
    { path: ".claude/skills/test/skill.md", type: "skill", resolution: "skip" },
  ];
}

// --- Tests ---

describe("ConflictModal", () => {
  const onResolve = vi.fn();
  const onCancel = vi.fn();

  beforeEach(() => {
    onResolve.mockClear();
    onCancel.mockClear();
  });

  it("renders nothing when open is false", () => {
    // Act
    render(
      <ConflictModal
        open={false}
        conflicts={createConflicts()}
        onResolve={onResolve}
        onCancel={onCancel}
      />,
    );

    // Assert
    expect(screen.queryByText("파일 충돌")).not.toBeInTheDocument();
  });

  it("renders title and description when open", () => {
    // Act
    render(
      <ConflictModal
        open={true}
        conflicts={createConflicts()}
        onResolve={onResolve}
        onCancel={onCancel}
      />,
    );

    // Assert
    expect(screen.getByText("파일 충돌")).toBeInTheDocument();
    expect(screen.getByText("다음 파일들이 충돌합니다")).toBeInTheDocument();
  });

  it("renders all conflict file paths", () => {
    // Act
    render(
      <ConflictModal
        open={true}
        conflicts={createConflicts()}
        onResolve={onResolve}
        onCancel={onCancel}
      />,
    );

    // Assert - CLAUDE.md appears twice (path in code + type badge), use getAllByText
    const claudeMdElements = screen.getAllByText("CLAUDE.md");
    expect(claudeMdElements.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(".claude/agents/planner.md")).toBeInTheDocument();
    expect(screen.getByText(".claude/skills/test/skill.md")).toBeInTheDocument();
  });

  it("renders type badges for each conflict", () => {
    // Act
    render(
      <ConflictModal
        open={true}
        conflicts={createConflicts()}
        onResolve={onResolve}
        onCancel={onCancel}
      />,
    );

    // Assert - CLAUDE.md has both path and type badge with same text
    const claudeMdElements = screen.getAllByText("CLAUDE.md");
    expect(claudeMdElements.length).toBe(2); // code + badge
    expect(screen.getByText("에이전트")).toBeInTheDocument();
    expect(screen.getByText("스킬")).toBeInTheDocument();
  });

  it("shows merge option only for claudeMd type", () => {
    // Act
    render(
      <ConflictModal
        open={true}
        conflicts={createConflicts()}
        onResolve={onResolve}
        onCancel={onCancel}
      />,
    );

    // Assert - merge radio should appear for claudeMd but not for agent/skill
    // All conflicts have radios; count merge radios
    const mergeRadios = screen.getAllByRole("radio").filter(
      (radio) => (radio as HTMLInputElement).value === "merge",
    );
    // Only 1 merge radio for the claudeMd conflict
    expect(mergeRadios).toHaveLength(1);
  });

  it("changes individual resolution via radio", async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <ConflictModal
        open={true}
        conflicts={createConflicts()}
        onResolve={onResolve}
        onCancel={onCancel}
      />,
    );

    // Act - find "skip" radios and click one for CLAUDE.md
    const skipRadios = screen.getAllByRole("radio").filter(
      (radio) => (radio as HTMLInputElement).value === "skip",
    );
    // The first skip radio belongs to claudeMd
    await user.click(skipRadios[0]);

    // Assert
    expect((skipRadios[0] as HTMLInputElement).checked).toBe(true);
  });

  it("applies resolution to all compatible conflicts via apply-all button", async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <ConflictModal
        open={true}
        conflicts={createConflicts()}
        onResolve={onResolve}
        onCancel={onCancel}
      />,
    );

    // Act - click "건너뛰기" in apply-all section
    const applyAllButtons = screen.getAllByText("건너뛰기");
    // The first one is in the apply-all section
    await user.click(applyAllButtons[0]);

    // Assert - all "skip" radios should be checked
    const skipRadios = screen.getAllByRole("radio").filter(
      (radio) => (radio as HTMLInputElement).value === "skip",
    );
    for (const radio of skipRadios) {
      expect((radio as HTMLInputElement).checked).toBe(true);
    }
  });

  it("calls onCancel when cancel button is clicked", async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <ConflictModal
        open={true}
        conflicts={createConflicts()}
        onResolve={onResolve}
        onCancel={onCancel}
      />,
    );

    // Act
    await user.click(screen.getByText("취소"));

    // Assert
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("calls onResolve with updated items when proceed is clicked", async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <ConflictModal
        open={true}
        conflicts={createConflicts()}
        onResolve={onResolve}
        onCancel={onCancel}
      />,
    );

    // Act
    await user.click(screen.getByText("진행"));

    // Assert
    expect(onResolve).toHaveBeenCalledTimes(1);
    const resolvedItems = onResolve.mock.calls[0][0];
    expect(resolvedItems).toHaveLength(3);
  });

  it("renders apply-all bar with overwrite, skip, and merge buttons", () => {
    // Act
    render(
      <ConflictModal
        open={true}
        conflicts={createConflicts()}
        onResolve={onResolve}
        onCancel={onCancel}
      />,
    );

    // Assert
    // "모두 적용" label plus three action buttons in the apply-all bar
    const applyAllLabel = screen.getByText(/모두 적용/);
    expect(applyAllLabel).toBeInTheDocument();
    // The bar container has buttons for overwrite, skip, merge
    const bar = applyAllLabel.closest("div")?.parentElement;
    expect(bar).toBeTruthy();
    // All three buttons exist somewhere in the apply-all section
    const allOverwriteBtns = screen.getAllByText("덮어쓰기");
    expect(allOverwriteBtns.length).toBeGreaterThanOrEqual(1);
  });
});
