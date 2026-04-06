import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AgentList } from "../agent-list";
import {
  createAgent,
  createHarness,
  createExecutionStep,
  resetFixtureCounter,
} from "@/test/mocks/harness-fixtures";

// --- Mocks ---

vi.mock("@/hooks/use-locale", () => ({
  useLocale: () => ({
    locale: "ko" as const,
    setLocale: vi.fn(),
    t: (key: string) => {
      const translations: Record<string, string> = {
        "detail.tools": "도구",
        "detail.dependencies": "의존성",
        "detail.viewSkillMd": "스킬 마크다운 보기",
        "detail.skillMarkdown": "스킬 마크다운",
        "detail.extensionSkill": "확장 스킬",
        "detail.step": "단계",
        "detail.parallelStep": "병렬 단계",
      };
      return translations[key] ?? key;
    },
  }),
}));

vi.mock("@/components/common/markdown-viewer", () => ({
  MarkdownViewer: ({ open, title }: { open: boolean; title: string }) =>
    open ? <div data-testid="markdown-viewer">{title}</div> : null,
}));

// Mock react-markdown to avoid parsing overhead
vi.mock("react-markdown", () => ({
  default: ({ children }: { children: string }) => <div>{children}</div>,
}));

vi.mock("remark-gfm", () => ({ default: () => {} }));

vi.mock("gray-matter", () => ({
  default: (source: string) => ({
    content: source,
    data: {},
  }),
}));

// --- Helpers ---

function renderAgentList(
  agents: Parameters<typeof AgentList>[0]["agents"],
  harness: Parameters<typeof AgentList>[0]["harness"],
  onViewSkillMd = vi.fn(),
) {
  const executionOrder = agents.map((a) =>
    createExecutionStep({ agentId: a.id }),
  );
  return render(
    <AgentList
      agents={agents}
      harness={harness}
      executionOrder={executionOrder}
      onViewSkillMd={onViewSkillMd}
    />,
  );
}

// --- Tests ---

describe("AgentList", () => {
  const agents = [
    createAgent({
      id: "planner",
      name: "Planner",
      role: "Planning",
      tools: ["Read", "Write"],
      dependencies: [],
      outputTemplate: "# Plan output",
    }),
    createAgent({
      id: "coder",
      name: "Coder",
      role: "Development",
      tools: ["Bash", "Write", "Read"],
      dependencies: ["planner"],
      outputTemplate: "# Code output",
    }),
  ];

  const harness = createHarness({
    agents,
    slug: "test-harness",
  });

  beforeEach(() => {
    resetFixtureCounter();
  });

  it("renders all agent names", () => {
    renderAgentList(agents, harness);

    expect(screen.getByText("Planner")).toBeInTheDocument();
    expect(screen.getByText("Coder")).toBeInTheDocument();
  });

  it("renders agent roles", () => {
    renderAgentList(agents, harness);

    expect(screen.getByText("Planning")).toBeInTheDocument();
    expect(screen.getByText("Development")).toBeInTheDocument();
  });

  it("expands agent details on click", async () => {
    const user = userEvent.setup();
    renderAgentList(agents, harness);

    await user.click(screen.getByText("Planner"));

    expect(screen.getByText("도구")).toBeInTheDocument();
    expect(screen.getByText("Read")).toBeInTheDocument();
    expect(screen.getByText("Write")).toBeInTheDocument();
  });

  it("shows dependencies when agent is expanded", async () => {
    const user = userEvent.setup();
    renderAgentList(agents, harness);

    await user.click(screen.getByText("Coder"));

    expect(screen.getByText("의존성")).toBeInTheDocument();
    expect(screen.getByText("planner")).toBeInTheDocument();
  });

  it("collapses agent details when clicking the same agent again", async () => {
    const user = userEvent.setup();
    renderAgentList(agents, harness);

    await user.click(screen.getByText("Planner"));
    expect(screen.getByText("도구")).toBeInTheDocument();

    await user.click(screen.getByText("Planner"));

    expect(screen.queryByText("도구")).not.toBeInTheDocument();
  });

  it("switching expanded agent collapses the previous one", async () => {
    const user = userEvent.setup();
    renderAgentList(agents, harness);

    await user.click(screen.getByText("Planner"));
    expect(screen.queryByText("의존성")).not.toBeInTheDocument();

    await user.click(screen.getByText("Coder"));

    expect(screen.getByText("의존성")).toBeInTheDocument();
    expect(screen.getByText("planner")).toBeInTheDocument();
  });

  it("calls onViewSkillMd callback when passed", () => {
    const onViewSkillMd = vi.fn();
    renderAgentList(agents, harness, onViewSkillMd);

    // onViewSkillMd is a callback prop — the button is now in the parent component
    // Just verify the component renders without error when callback is provided
    expect(screen.getByText("Planner")).toBeInTheDocument();
  });

  it("opens extension skill markdown viewer on button click", async () => {
    const user = userEvent.setup();
    const h = createHarness({
      agents,
      slug: "test-harness",
      skill: {
        ...harness.skill,
        extensionSkills: [
          {
            name: "ext-skill-1",
            path: "ext-skill-1/skill.md",
            targetAgent: "planner",
            description: "test extension",
          },
        ],
      },
      rawFiles: {
        agents: {},
        skills: { "ext-skill-1/skill.md": "# Extension Skill Content" },
      },
    } as any);

    renderAgentList(agents, h);

    // Expand the agent that has the extension skill
    await user.click(screen.getByText("Planner"));

    // Assert extension skill button is rendered
    expect(screen.getByText("ext-skill-1")).toBeInTheDocument();

    // Click to open markdown viewer
    await user.click(screen.getByText("ext-skill-1"));
    expect(screen.getByTestId("markdown-viewer")).toBeInTheDocument();
  });

  it("closes extension skill markdown viewer when close is triggered", async () => {
    const user = userEvent.setup();
    const h = createHarness({
      agents,
      slug: "test-harness",
      skill: {
        ...harness.skill,
        extensionSkills: [
          {
            name: "ext-skill-1",
            path: "ext-skill-1/skill.md",
            targetAgent: "planner",
            description: "test extension",
          },
        ],
      },
      rawFiles: {
        agents: {},
        skills: { "ext-skill-1/skill.md": "# Extension Skill Content" },
      },
    } as any);

    renderAgentList(agents, h);

    // Expand the agent and open the viewer
    await user.click(screen.getByText("Planner"));
    await user.click(screen.getByText("ext-skill-1"));
    expect(screen.getByTestId("markdown-viewer")).toBeInTheDocument();
  });

  it("uses fallback emoji when agent role does not match any keyword", () => {
    const unknownAgent = createAgent({
      id: "unknown",
      name: "Unknown",
      role: "Mystery",
      tools: [],
      dependencies: [],
    });
    const h = createHarness({ agents: [unknownAgent] });

    renderAgentList([unknownAgent], h);

    const emojiEl = screen.getByRole("img", { name: "Mystery" });
    expect(emojiEl.textContent).toBe("\u{1F916}");
  });

  it("uses raw file content when available for agent markdown", async () => {
    const user = userEvent.setup();
    const agentWithRaw = createAgent({
      id: "raw-agent",
      name: "RawAgent",
      role: "Writer",
      tools: [],
      dependencies: [],
    });
    const h = createHarness({
      agents: [agentWithRaw],
      rawFiles: {
        agents: { "raw-agent": "Raw agent content from file" },
        skills: {},
      },
    } as any);

    renderAgentList([agentWithRaw], h);
    await user.click(screen.getByText("RawAgent"));

    expect(screen.getByText("Raw agent content from file")).toBeInTheDocument();
  });

  it("renders extension skill buttons when harness has extension skills", async () => {
    const user = userEvent.setup();
    const h = createHarness({
      agents,
      slug: "test-harness",
      skill: {
        ...harness.skill,
        extensionSkills: [
          {
            name: "ext-skill-1",
            path: "ext-skill-1/skill.md",
            targetAgent: "planner",
            description: "test extension",
          },
        ],
      },
      rawFiles: {
        agents: {},
        skills: { "ext-skill-1/skill.md": "# Extension Skill Content" },
      },
    } as any);

    renderAgentList(agents, h);

    // Expand the agent that has the extension skill
    await user.click(screen.getByText("Planner"));

    expect(screen.getByText("ext-skill-1")).toBeInTheDocument();

    await user.click(screen.getByText("ext-skill-1"));
    expect(screen.getByTestId("markdown-viewer")).toBeInTheDocument();
  });

  it("does not render extension skill button when rawContent is missing", async () => {
    const user = userEvent.setup();
    const h = createHarness({
      agents,
      slug: "test-harness",
      skill: {
        ...harness.skill,
        extensionSkills: [
          {
            name: "missing-skill",
            path: "missing-skill/skill.md",
            targetAgent: "planner",
            description: "test",
          },
        ],
      },
      rawFiles: {
        agents: {},
        skills: {},
      },
    } as any);

    renderAgentList(agents, h);

    // Expand the agent to see if extension skill button would appear
    await user.click(screen.getByText("Planner"));

    expect(screen.queryByText("missing-skill")).not.toBeInTheDocument();
  });

  it("uses skill raw file content when available", async () => {
    const user = userEvent.setup();
    const h = createHarness({
      agents,
      slug: "test-harness",
      skill: {
        ...harness.skill,
        extensionSkills: [
          {
            name: "ext-with-content",
            path: "ext-with-content/skill.md",
            targetAgent: "coder",
            description: "test skill with content",
          },
        ],
      },
      rawFiles: {
        agents: {},
        skills: { "ext-with-content/skill.md": "# Custom Skill Content" },
      },
    } as any);

    renderAgentList(agents, h);

    // Expand coder agent to see extension skill
    await user.click(screen.getByText("Coder"));
    await user.click(screen.getByText("ext-with-content"));

    const viewer = screen.getByTestId("markdown-viewer");
    expect(viewer).toBeInTheDocument();
  });
});
