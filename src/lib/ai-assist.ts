import type { Locale } from "./locale";
import type { Category, AgentRef } from "./types";
import type { CustomAgent, BuilderMeta } from "./custom-harness-types";
import { loadAgentIndex, loadHarnessDetail } from "./harness-loader";

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

/** Generate agent role, description, and instructions from its name */
export async function generateAgentDetails(
  apiKey: string,
  agent: CustomAgent,
  harnessContext: string,
  locale: Locale,
  exampleMd?: string,
): Promise<AiResponse> {
  const exampleBlock = exampleMd
    ? locale === "ko"
      ? `\n\n참고할 기존 에이전트 지침 예시:\n${exampleMd.slice(0, 1500)}`
      : `\n\nExample agent instructions for reference:\n${exampleMd.slice(0, 1500)}`
    : "";

  const prompt = locale === "ko"
    ? `하네스 맥락: "${harnessContext}"
에이전트 이름: "${agent.name}"
선택된 도구: ${agent.tools.join(", ") || "없음"}

이 에이전트에 대해 다음 형식으로 답변해주세요:
역할: (한 줄 역할 설명)
설명: (2-3문장 상세 설명)
출력: (예상 출력 파일 경로, 예: _workspace/report.md)
지침:
(에이전트의 상세 행동 지침을 마크다운으로 작성. 핵심 역할, 작업 원칙, 산출물 포맷, 팀 통신 프로토콜, 에러 핸들링 섹션을 포함)
---${exampleBlock}`
    : `Harness context: "${harnessContext}"
Agent name: "${agent.name}"
Selected tools: ${agent.tools.join(", ") || "none"}

Respond in this exact format:
Role: (one-line role description)
Description: (2-3 sentence detailed description)
Output: (expected output file path, e.g., _workspace/report.md)
Instructions:
(detailed behavioral instructions in markdown. Include sections: Core Role, Working Principles, Output Format, Team Communication, Error Handling)
---${exampleBlock}`;

  return callClaude(apiKey, sys(locale), prompt, 2048);
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
  exampleMd?: string,
): Promise<AiResponse> {
  const contextBlock = agentContext ? `\n\n${agentContext}` : "";
  const exampleBlock = exampleMd
    ? locale === "ko"
      ? `\n\n참고할 기존 에이전트 지침 예시:\n${exampleMd.slice(0, 1500)}`
      : `\n\nExample agent instructions for reference:\n${exampleMd.slice(0, 1500)}`
    : "";

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
설명: (2-3문장)
도구: (쉼표 구분, Read/Edit/Write/Bash/Glob/Grep/WebSearch/WebFetch/Agent 중 선택)
출력: (파일 경로)
의존: (선행 에이전트 이름을 쉼표 구분. 없으면 "없음")
지침:
(핵심 역할, 작업 원칙, 산출물 포맷, 팀 통신 프로토콜, 에러 핸들링을 포함한 상세 행동 지침을 마크다운으로 작성)
재사용: (기존 에이전트를 재활용하는 경우만 "하네스ID/에이전트이름" 형식으로 표기, 예: 1/content-strategist)${exampleBlock}`
    : `Harness name: "${meta.name}"
Description: "${meta.description}"
Category: ${meta.category || "undecided"}${contextBlock}

Suggest an agent team (3-5 agents) for this harness.
If any existing agent listed above fits well, actively reuse it.
Output each agent in this format:

---
Name: (kebab-case)
Role: (one line)
Description: (2-3 sentences)
Tools: (comma-separated, from Read/Edit/Write/Bash/Glob/Grep/WebSearch/WebFetch/Agent)
Output: (file path)
Dependencies: (preceding agent names, comma-separated. "none" if none)
Instructions:
(detailed behavioral instructions in markdown including: Core Role, Working Principles, Output Format, Team Communication, Error Handling)
Reuse: (only if reusing an existing agent, format: harnessId/agentName, e.g., 1/content-strategist)${exampleBlock}`;

  return callClaude(apiKey, sys(locale), prompt, 4096);
}

/** Generate only instructions for an agent that already has name/role/description */
export async function generateAgentInstructions(
  apiKey: string,
  agent: CustomAgent,
  harnessContext: string,
  exampleMd: string,
  locale: Locale,
): Promise<AiResponse> {
  const exampleBlock = exampleMd
    ? locale === "ko"
      ? `\n\n참고할 기존 에이전트 지침 예시:\n${exampleMd.slice(0, 1500)}`
      : `\n\nExample agent instructions for reference:\n${exampleMd.slice(0, 1500)}`
    : "";

  const prompt = locale === "ko"
    ? `하네스 맥락: "${harnessContext}"
에이전트 이름: "${agent.name}"
역할: "${agent.role}"
설명: "${agent.description}"
선택된 도구: ${agent.tools.join(", ") || "없음"}

이 에이전트의 상세 행동 지침을 마크다운으로 작성해주세요.
다음 섹션을 포함하세요: 핵심 역할, 작업 원칙, 산출물 포맷, 팀 통신 프로토콜, 에러 핸들링.
추가 설명 없이 지침 마크다운만 출력하세요.${exampleBlock}`
    : `Harness context: "${harnessContext}"
Agent name: "${agent.name}"
Role: "${agent.role}"
Description: "${agent.description}"
Selected tools: ${agent.tools.join(", ") || "none"}

Write detailed behavioral instructions for this agent in markdown.
Include sections: Core Role, Working Principles, Output Format, Team Communication, Error Handling.
Output only the instructions markdown, no extra explanation.${exampleBlock}`;

  return callClaude(apiKey, sys(locale), prompt, 2048);
}

// ---------------------------------------------------------------------------
// Reference agent loader — loads existing agent MDs for the reference panel
// ---------------------------------------------------------------------------

export interface ReferenceAgent {
  readonly name: string;
  readonly role: string;
  readonly harnessId: number;
  readonly harnessName: string;
  readonly rawMd: string;
}

/** Load existing agents with rawFile content for the reference panel */
export async function loadReferenceAgents(
  category: Category | "",
  locale: Locale,
): Promise<ReadonlyArray<ReferenceAgent>> {
  if (!category) return [];

  try {
    const agentIndex = await loadAgentIndex(locale);
    const sameCategory = agentIndex.filter((a) => a.category === category);
    if (sameCategory.length === 0) return [];

    // Group by harnessId and pick up to 5 unique harnesses
    const harnessIds = [...new Set(sameCategory.map((a) => a.harnessId))].slice(0, 5);

    const results: ReferenceAgent[] = [];

    for (const hid of harnessIds) {
      try {
        const harness = await loadHarnessDetail(hid, locale);
        const rawAgents = harness.rawFiles?.agents ?? {};

        for (const agent of harness.agents) {
          const rawMd = rawAgents[agent.id];
          if (!rawMd) continue;
          results.push({
            name: agent.name,
            role: agent.role,
            harnessId: harness.id,
            harnessName: harness.name,
            rawMd,
          });
        }
      } catch {
        // Skip harnesses that fail to load
      }
    }

    return results;
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Parsers
// ---------------------------------------------------------------------------

/** Parse agent details response into structured fields */
export function parseAgentDetails(text: string): {
  role: string;
  description: string;
  outputTemplate: string;
  instructions: string;
} {
  const lines = text.split("\n");
  let role = "";
  let description = "";
  let outputTemplate = "";
  let instructions = "";
  let collectingInstructions = false;
  const instructionLines: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (collectingInstructions) {
      // Stop at delimiter or reference section
      if (line === "---" || line.match(/^참고할 기존|^Example agent/i)) break;
      instructionLines.push(rawLine);
      continue;
    }

    if (line.match(/^(역할|Role)\s*[:：]/i)) {
      role = line.replace(/^(역할|Role)\s*[:：]\s*/i, "");
    } else if (line.match(/^(설명|Description)\s*[:：]/i)) {
      description = line.replace(/^(설명|Description)\s*[:：]\s*/i, "");
    } else if (line.match(/^(출력|Output)\s*[:：]/i)) {
      outputTemplate = line.replace(/^(출력|Output)\s*[:：]\s*/i, "");
    } else if (line.match(/^(지침|Instructions)\s*[:：]/i)) {
      const inline = line.replace(/^(지침|Instructions)\s*[:：]\s*/i, "");
      if (inline) instructionLines.push(inline);
      collectingInstructions = true;
    }
  }

  instructions = instructionLines.join("\n").trim();

  return { role, description, outputTemplate, instructions };
}

/** Parsed agent from the AI team generation response */
export interface ParsedTeamAgent {
  readonly name: string;
  readonly role: string;
  readonly description: string;
  readonly instructions: string;
  readonly tools: ReadonlyArray<string>;
  readonly outputTemplate: string;
  readonly dependencyNames: ReadonlyArray<string>;
  readonly reuseRef?: { readonly harnessId: number; readonly agentId: string };
}

/** Parse agent team response into array of agent data */
export function parseAgentTeam(text: string): ReadonlyArray<ParsedTeamAgent> {
  const VALID_TOOLS = new Set(["Read", "Edit", "Write", "Bash", "Glob", "Grep", "WebSearch", "WebFetch", "Agent", "NotebookEdit"]);
  const blocks = text.split("---").filter((b) => b.trim());

  return blocks.map((block) => {
    const lines = block.split("\n");
    let name = "";
    let role = "";
    let description = "";
    let tools: string[] = [];
    let outputTemplate = "";
    let dependencyNames: string[] = [];
    let reuseRef: { harnessId: number; agentId: string } | undefined;
    let collectingInstructions = false;
    const instructionLines: string[] = [];

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line && !collectingInstructions) continue;

      if (collectingInstructions) {
        // Stop at reuse line or end
        if (line.match(/^(재사용|Reuse)\s*[:：]/i)) {
          collectingInstructions = false;
          // Parse reuse on this line
          const refStr = line.replace(/^(재사용|Reuse)\s*[:：]\s*/i, "").trim();
          const match = refStr.match(/^(\d+)\/(.+)$/);
          if (match) {
            reuseRef = { harnessId: Number(match[1]), agentId: match[2].trim() };
          }
          continue;
        }
        instructionLines.push(rawLine);
        continue;
      }

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
      } else if (line.match(/^(의존|Dependencies)\s*[:：]/i)) {
        const depStr = line.replace(/^(의존|Dependencies)\s*[:：]\s*/i, "").trim();
        if (depStr && !depStr.match(/^(없음|none)$/i)) {
          dependencyNames = depStr.split(/[,，]\s*/).map((d) => d.trim()).filter(Boolean);
        }
      } else if (line.match(/^(지침|Instructions)\s*[:：]/i)) {
        const inline = line.replace(/^(지침|Instructions)\s*[:：]\s*/i, "");
        if (inline) instructionLines.push(inline);
        collectingInstructions = true;
      } else if (line.match(/^(재사용|Reuse)\s*[:：]/i)) {
        const refStr = line.replace(/^(재사용|Reuse)\s*[:：]\s*/i, "").trim();
        const match = refStr.match(/^(\d+)\/(.+)$/);
        if (match) {
          reuseRef = { harnessId: Number(match[1]), agentId: match[2].trim() };
        }
      }
    }

    const instructions = instructionLines.join("\n").trim();

    return { name, role, description, instructions, tools, outputTemplate, dependencyNames, reuseRef };
  }).filter((a) => a.name);
}
