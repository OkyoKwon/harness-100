import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExtensionSkillEditor } from "../extension-skill-editor";
import type { ExtensionSkill } from "@/lib/types";
import type { CustomAgent } from "@/lib/custom-harness-types";

vi.mock("@/hooks/use-locale", () => ({
  useLocale: () => ({
    locale: "en",
    t: (key: string) => {
      const map: Record<string, string> = {
        "builder.skill.extensionName": "Skill Name",
        "builder.skill.extensionNameHelper": "kebab-case",
        "builder.skill.extensionTarget": "Target Agent",
        "builder.skill.extensionTargetPlaceholder": "Select agent",
        "builder.skill.extensionDesc": "Description",
        "builder.skill.extensionDescPlaceholder": "Domain expertise",
        "builder.skill.generateExtensionMd": "Generate Content",
        "builder.skill.customized": "Edited",
        "builder.skill.markdownHelper": "Edit markdown",
        "builder.skill.resetToAuto": "Reset",
      };
      return map[key] ?? key;
    },
  }),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    addToast: vi.fn(),
  }),
}));

function makeExt(overrides: Partial<ExtensionSkill> = {}): ExtensionSkill {
  return {
    name: "hook-writing",
    path: "hook-writing/skill.md",
    targetAgent: "a1",
    description: "Writes hooks",
    ...overrides,
  };
}

function makeAgent(overrides: Partial<CustomAgent> = {}): CustomAgent {
  return {
    id: "a1",
    name: "Writer",
    role: "Content writer",
    description: "Writes content",
    instructions: "",
    tools: ["Read"],
    outputTemplate: "",
    dependencies: [],
    enabled: true,
    ...overrides,
  };
}

const defaultAi = {
  isConfigured: false,
  loading: false,
  runAssist: vi.fn(),
  apiKey: "",
};

describe("ExtensionSkillEditor", () => {
  const onUpdate = vi.fn();
  const onRemove = vi.fn();
  const onUpdateMarkdown = vi.fn();
  const onClearMarkdown = vi.fn();

  it("renders skill name, target dropdown, and description", () => {
    render(
      <ExtensionSkillEditor
        ext={makeExt()}
        index={0}
        agents={[makeAgent()]}
        harnessName="Test"
        markdown={undefined}
        errors={{}}
        ai={defaultAi as never}
        onUpdate={onUpdate}
        onRemove={onRemove}
        onUpdateMarkdown={onUpdateMarkdown}
        onClearMarkdown={onClearMarkdown}
      />,
    );

    expect(screen.getByDisplayValue("hook-writing")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Writes hooks")).toBeInTheDocument();
    expect(screen.getByText("Writer — Content writer")).toBeInTheDocument();
  });

  it("calls onRemove when delete button clicked", async () => {
    const user = userEvent.setup();
    render(
      <ExtensionSkillEditor
        ext={makeExt()}
        index={2}
        agents={[makeAgent()]}
        harnessName="Test"
        markdown={undefined}
        errors={{}}
        ai={defaultAi as never}
        onUpdate={onUpdate}
        onRemove={onRemove}
        onUpdateMarkdown={onUpdateMarkdown}
        onClearMarkdown={onClearMarkdown}
      />,
    );

    await user.click(screen.getByLabelText('Remove extension skill "hook-writing"'));
    expect(onRemove).toHaveBeenCalledWith(2);
  });

  it("calls onUpdate when name changes", async () => {
    const user = userEvent.setup();
    render(
      <ExtensionSkillEditor
        ext={makeExt({ name: "" })}
        index={0}
        agents={[makeAgent()]}
        harnessName="Test"
        markdown={undefined}
        errors={{}}
        ai={defaultAi as never}
        onUpdate={onUpdate}
        onRemove={onRemove}
        onUpdateMarkdown={onUpdateMarkdown}
        onClearMarkdown={onClearMarkdown}
      />,
    );

    const nameInput = screen.getByPlaceholderText("hook-writing");
    await user.type(nameInput, "a");
    expect(onUpdate).toHaveBeenCalled();
  });

  it("shows validation errors", () => {
    render(
      <ExtensionSkillEditor
        ext={makeExt({ name: "" })}
        index={0}
        agents={[makeAgent()]}
        harnessName="Test"
        markdown={undefined}
        errors={{ "0_name": "builder.validation.extNameRequired" }}
        ai={defaultAi as never}
        onUpdate={onUpdate}
        onRemove={onRemove}
        onUpdateMarkdown={onUpdateMarkdown}
        onClearMarkdown={onClearMarkdown}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("builder.validation.extNameRequired");
  });
});
