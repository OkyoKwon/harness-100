export interface ToolDefinition {
  readonly id: string;
  readonly labelKey: string;
  readonly descKey: string;
}

export const TOOL_DEFINITIONS: ReadonlyArray<ToolDefinition> = [
  { id: "Read", labelKey: "tool.Read", descKey: "tool.Read.desc" },
  { id: "Edit", labelKey: "tool.Edit", descKey: "tool.Edit.desc" },
  { id: "Write", labelKey: "tool.Write", descKey: "tool.Write.desc" },
  { id: "Bash", labelKey: "tool.Bash", descKey: "tool.Bash.desc" },
  { id: "Glob", labelKey: "tool.Glob", descKey: "tool.Glob.desc" },
  { id: "Grep", labelKey: "tool.Grep", descKey: "tool.Grep.desc" },
  { id: "WebSearch", labelKey: "tool.WebSearch", descKey: "tool.WebSearch.desc" },
  { id: "WebFetch", labelKey: "tool.WebFetch", descKey: "tool.WebFetch.desc" },
  { id: "Agent", labelKey: "tool.Agent", descKey: "tool.Agent.desc" },
  { id: "NotebookEdit", labelKey: "tool.NotebookEdit", descKey: "tool.NotebookEdit.desc" },
] as const;

export const TOOL_IDS = TOOL_DEFINITIONS.map((t) => t.id);
