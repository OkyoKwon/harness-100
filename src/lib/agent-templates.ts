import type { AgentTemplate } from "./custom-harness-types";

export const AGENT_TEMPLATES: ReadonlyArray<AgentTemplate> = [
  {
    name: "code-reviewer",
    role: "Code quality reviewer",
    description: "Reviews code for quality, readability, and potential bugs. Analyzes patterns and suggests improvements.",
    tools: ["Read", "Grep", "Glob"],
    outputTemplate: "_workspace/code-review.md",
  },
  {
    name: "test-writer",
    role: "Test code generator",
    description: "Writes unit, integration, and e2e tests. Ensures coverage meets project standards.",
    tools: ["Read", "Write", "Edit", "Bash"],
    outputTemplate: "src/__tests__/",
  },
  {
    name: "doc-writer",
    role: "Documentation writer",
    description: "Generates and updates documentation including README, API docs, and guides.",
    tools: ["Read", "Write", "WebSearch"],
    outputTemplate: "_workspace/docs/",
  },
  {
    name: "security-analyst",
    role: "Security vulnerability analyst",
    description: "Analyzes code for security vulnerabilities including OWASP Top 10, injection attacks, and data exposure.",
    tools: ["Read", "Grep", "Glob", "Bash"],
    outputTemplate: "_workspace/security-report.md",
  },
  {
    name: "architect",
    role: "System architect",
    description: "Designs system architecture, evaluates trade-offs, and creates technical specifications.",
    tools: ["Read", "Glob", "Grep", "WebSearch"],
    outputTemplate: "_workspace/architecture.md",
  },
  {
    name: "researcher",
    role: "Research and analysis",
    description: "Conducts research, gathers data from external sources, and synthesizes findings.",
    tools: ["WebSearch", "WebFetch", "Read"],
    outputTemplate: "_workspace/research.md",
  },
] as const;
