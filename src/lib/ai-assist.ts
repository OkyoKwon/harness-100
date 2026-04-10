import type { Locale } from "./locale";
import type { Category, AgentRef } from "./types";
import type { CustomAgent, BuilderMeta } from "./custom-harness-types";

const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-6";

interface AiResponse {
  readonly success: boolean;
  readonly text: string;
  readonly error?: string;
}

async function callClaude(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 1024,
): Promise<AiResponse> {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      if (res.status === 401) return { success: false, text: "", error: "ai.error.invalidKey" };
      if (res.status === 429) return { success: false, text: "", error: "ai.error.rateLimit" };
      return { success: false, text: "", error: "ai.error.apiFailed" };
    }

    const data = await res.json();
    const text = data.content?.[0]?.text?.trim() ?? "";
    return { success: true, text };
  } catch {
    return { success: false, text: "", error: "ai.error.network" };
  }
}

const SYSTEM_PROMPT_KO = `당신은 Claude Code 하네스(에이전트 팀 워크플로우) 설계 전문가입니다.
사용자가 만들고 있는 하네스에 대해 간결하고 실용적인 제안을 합니다.
- 한국어로 답변합니다.
- 추가 설명 없이 요청한 내용만 바로 출력합니다.
- 마크다운 포맷 없이 순수 텍스트로 답변합니다.`;

const SYSTEM_PROMPT_EN = `You are an expert in designing Claude Code harnesses (agent team workflows).
You provide concise, practical suggestions for the harness the user is building.
- Respond in English.
- Output only what was requested, no extra explanation.
- Use plain text, no markdown formatting.`;

function sys(locale: Locale) {
  return locale === "ko" ? SYSTEM_PROMPT_KO : SYSTEM_PROMPT_EN;
}

// ---------------------------------------------------------------------------
// Agent context builder — filters relevant existing agents for the AI prompt
// ---------------------------------------------------------------------------

const RELATED_CATEGORIES: Readonly<Record<Category, ReadonlyArray<Category>>> = {
  content: ["communication"],
  development: ["data-ai", "operations"],
  "data-ai": ["development", "business"],
  business: ["operations", "data-ai"],
  education: ["content"],
  legal: ["business"],
  lifestyle: ["content", "communication"],
  communication: ["content", "business"],
  operations: ["development", "business"],
  specialized: [],
};

const MAX_CONTEXT_AGENTS = 20;

/** Build a compact string of relevant existing agents for the AI prompt */
export function buildAgentContext(
  agentIndex: ReadonlyArray<AgentRef>,
  category: Category | "",
  locale: Locale,
): string {
  if (!category || agentIndex.length === 0) return "";

  // Primary: same category agents
  const primary = agentIndex.filter((a) => a.category === category);
  // Secondary: related category agents
  const related = (RELATED_CATEGORIES[category] ?? []) as ReadonlyArray<Category>;
  const secondary = agentIndex.filter(
    (a) => a.category !== category && related.includes(a.category as Category),
  );

  // Deduplicate by name (keep first occurrence)
  const seen = new Set<string>();
  const selected: AgentRef[] = [];

  for (const agent of [...primary, ...secondary]) {
    if (seen.has(agent.name)) continue;
    seen.add(agent.name);
    selected.push(agent);
    if (selected.length >= MAX_CONTEXT_AGENTS) break;
  }

  if (selected.length === 0) return "";

  const header = locale === "ko"
    ? "재활용 가능한 기존 에이전트 목록:"
    : "Available existing agents you can reuse:";

  const lines = selected.map(
    (a) => `- ${a.name} (하네스: "${a.harnessName}", ID: ${a.harnessId}) — ${a.role}, 도구: ${a.tools.join(",")}`,
  );

  return `${header}\n${lines.join("\n")}`;
}

// ---------------------------------------------------------------------------
// Generation functions
// ---------------------------------------------------------------------------

/** Generate a harness description from its name and category */
export async function generateHarnessDescription(
  apiKey: string,
  meta: BuilderMeta,
  locale: Locale,
): Promise<AiResponse> {
  const prompt = locale === "ko"
    ? `하네스 이름: "${meta.name}"
카테고리: ${meta.category || "미정"}

이 하네스가 수행하는 작업을 2-3문장으로 설명해주세요.`
    : `Harness name: "${meta.name}"
Category: ${meta.category || "undecided"}

Describe what this harness does in 2-3 sentences.`;

  return callClaude(apiKey, sys(locale), prompt);
}

/** Generate agent role and description from its name */
export async function generateAgentDetails(
  apiKey: string,
  agent: CustomAgent,
  harnessContext: string,
  locale: Locale,
): Promise<AiResponse> {
  const prompt = locale === "ko"
    ? `하네스 맥락: "${harnessContext}"
에이전트 이름: "${agent.name}"
선택된 도구: ${agent.tools.join(", ") || "없음"}

이 에이전트에 대해 다음 형식으로 답변해주세요:
역할: (한 줄 역할 설명)
설명: (2-3문장 상세 설명)
출력: (예상 출력 파일 경로, 예: _workspace/report.md)`
    : `Harness context: "${harnessContext}"
Agent name: "${agent.name}"
Selected tools: ${agent.tools.join(", ") || "none"}

Respond in this exact format:
Role: (one-line role description)
Description: (2-3 sentence detailed description)
Output: (expected output file path, e.g., _workspace/report.md)`;

  return callClaude(apiKey, sys(locale), prompt);
}

/** Generate trigger conditions for the skill */
export async function generateTriggerConditions(
  apiKey: string,
  harnessName: string,
  agentNames: ReadonlyArray<string>,
  locale: Locale,
): Promise<AiResponse> {
  const prompt = locale === "ko"
    ? `하네스: "${harnessName}"
에이전트 목록: ${agentNames.join(", ")}

이 하네스를 실행시킬 수 있는 자연어 트리거 조건을 5개 제안해주세요.
한 줄에 하나씩, 번호 없이 출력하세요.`
    : `Harness: "${harnessName}"
Agents: ${agentNames.join(", ")}

Suggest 5 natural language trigger conditions to activate this harness.
One per line, no numbering.`;

  return callClaude(apiKey, sys(locale), prompt);
}

/** Generate full agent team from harness name/description, with existing agent context */
export async function generateAgentTeam(
  apiKey: string,
  meta: BuilderMeta,
  locale: Locale,
  agentContext?: string,
): Promise<AiResponse> {
  const contextBlock = agentContext ? `\n\n${agentContext}` : "";

  const prompt = locale === "ko"
    ? `하네스 이름: "${meta.name}"
설명: "${meta.description}"
카테고리: ${meta.category || "미정"}${contextBlock}

이 하네스에 적합한 에이전트 팀(3-5명)을 제안해주세요.
기존 에이전트 중 이 하네스에 적합한 것이 있으면 적극 재활용하세요.
각 에이전트를 다음 형식으로 출력하세요:

---
이름: (영문 kebab-case)
역할: (한 줄)
설명: (한 줄)
도구: (쉼표 구분, Read/Edit/Write/Bash/Glob/Grep/WebSearch/WebFetch/Agent 중 선택)
출력: (파일 경로)
재사용: (기존 에이전트를 재활용하는 경우만 "하네스ID/에이전트이름" 형식으로 표기, 예: 1/content-strategist)`
    : `Harness name: "${meta.name}"
Description: "${meta.description}"
Category: ${meta.category || "undecided"}${contextBlock}

Suggest an agent team (3-5 agents) for this harness.
If any existing agent listed above fits well, actively reuse it.
Output each agent in this format:

---
Name: (kebab-case)
Role: (one line)
Description: (one line)
Tools: (comma-separated, from Read/Edit/Write/Bash/Glob/Grep/WebSearch/WebFetch/Agent)
Output: (file path)
Reuse: (only if reusing an existing agent, format: harnessId/agentName, e.g., 1/content-strategist)`;

  return callClaude(apiKey, sys(locale), prompt, 2048);
}

// ---------------------------------------------------------------------------
// Parsers
// ---------------------------------------------------------------------------

/** Parse agent details response into structured fields */
export function parseAgentDetails(text: string): {
  role: string;
  description: string;
  outputTemplate: string;
} {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  let role = "";
  let description = "";
  let outputTemplate = "";

  for (const line of lines) {
    if (line.match(/^(역할|Role)\s*[:：]/i)) {
      role = line.replace(/^(역할|Role)\s*[:：]\s*/i, "");
    } else if (line.match(/^(설명|Description)\s*[:：]/i)) {
      description = line.replace(/^(설명|Description)\s*[:：]\s*/i, "");
    } else if (line.match(/^(출력|Output)\s*[:：]/i)) {
      outputTemplate = line.replace(/^(출력|Output)\s*[:：]\s*/i, "");
    }
  }

  return { role, description, outputTemplate };
}

/** Parsed agent from the AI team generation response */
export interface ParsedTeamAgent {
  readonly name: string;
  readonly role: string;
  readonly description: string;
  readonly tools: ReadonlyArray<string>;
  readonly outputTemplate: string;
  readonly reuseRef?: { readonly harnessId: number; readonly agentId: string };
}

/** Parse agent team response into array of agent data */
export function parseAgentTeam(text: string): ReadonlyArray<ParsedTeamAgent> {
  const VALID_TOOLS = new Set(["Read", "Edit", "Write", "Bash", "Glob", "Grep", "WebSearch", "WebFetch", "Agent", "NotebookEdit"]);
  const blocks = text.split("---").filter((b) => b.trim());

  return blocks.map((block) => {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    let name = "";
    let role = "";
    let description = "";
    let tools: string[] = [];
    let outputTemplate = "";
    let reuseRef: { harnessId: number; agentId: string } | undefined;

    for (const line of lines) {
      if (line.match(/^(이름|Name)\s*[:：]/i)) {
        name = line.replace(/^(이름|Name)\s*[:：]\s*/i, "");
      } else if (line.match(/^(역할|Role)\s*[:：]/i)) {
        role = line.replace(/^(역할|Role)\s*[:：]\s*/i, "");
      } else if (line.match(/^(설명|Description)\s*[:：]/i)) {
        description = line.replace(/^(설명|Description)\s*[:：]\s*/i, "");
      } else if (line.match(/^(도구|Tools?)\s*[:：]/i)) {
        const toolStr = line.replace(/^(도구|Tools?)\s*[:：]\s*/i, "");
        tools = toolStr.split(/[,，]\s*/).map((t) => t.trim()).filter((t) => VALID_TOOLS.has(t));
      } else if (line.match(/^(출력|Output)\s*[:：]/i)) {
        outputTemplate = line.replace(/^(출력|Output)\s*[:：]\s*/i, "");
      } else if (line.match(/^(재사용|Reuse)\s*[:：]/i)) {
        const refStr = line.replace(/^(재사용|Reuse)\s*[:：]\s*/i, "").trim();
        const match = refStr.match(/^(\d+)\/(.+)$/);
        if (match) {
          reuseRef = { harnessId: Number(match[1]), agentId: match[2].trim() };
        }
      }
    }

    return { name, role, description, tools, outputTemplate, reuseRef };
  }).filter((a) => a.name);
}
