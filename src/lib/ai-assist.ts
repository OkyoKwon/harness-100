import type { Locale } from "./locale";
import type { CustomAgent, BuilderMeta } from "./custom-harness-types";

const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-haiku-4-5-20251001";

interface AiResponse {
  readonly success: boolean;
  readonly text: string;
  readonly error?: string;
}

async function callClaude(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
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
        max_tokens: 1024,
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

/** Generate a harness description from its name and category */
export async function generateHarnessDescription(
  apiKey: string,
  meta: BuilderMeta,
  locale: Locale,
): Promise<AiResponse> {
  const prompt = locale === "ko"
    ? `하네스 이름: "${meta.name}"
카테고리: ${meta.category || "미정"}
프레임워크: ${meta.frameworks.join(", ") || "없음"}

이 하네스가 수행하는 작업을 2-3문장으로 설명해주세요.`
    : `Harness name: "${meta.name}"
Category: ${meta.category || "undecided"}
Frameworks: ${meta.frameworks.join(", ") || "none"}

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

/** Generate full agent team from harness name/description */
export async function generateAgentTeam(
  apiKey: string,
  meta: BuilderMeta,
  locale: Locale,
): Promise<AiResponse> {
  const prompt = locale === "ko"
    ? `하네스 이름: "${meta.name}"
설명: "${meta.description}"
카테고리: ${meta.category || "미정"}

이 하네스에 적합한 에이전트 팀(3-5명)을 제안해주세요.
각 에이전트를 다음 형식으로 출력하세요:

---
이름: (영문 kebab-case)
역할: (한 줄)
설명: (한 줄)
도구: (쉼표 구분, Read/Edit/Write/Bash/Glob/Grep/WebSearch/WebFetch/Agent 중 선택)
출력: (파일 경로)`
    : `Harness name: "${meta.name}"
Description: "${meta.description}"
Category: ${meta.category || "undecided"}

Suggest an agent team (3-5 agents) for this harness.
Output each agent in this format:

---
Name: (kebab-case)
Role: (one line)
Description: (one line)
Tools: (comma-separated, from Read/Edit/Write/Bash/Glob/Grep/WebSearch/WebFetch/Agent)
Output: (file path)`;

  return callClaude(apiKey, sys(locale), prompt);
}

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

/** Parse agent team response into array of agent data */
export function parseAgentTeam(text: string): ReadonlyArray<{
  name: string;
  role: string;
  description: string;
  tools: ReadonlyArray<string>;
  outputTemplate: string;
}> {
  const VALID_TOOLS = new Set(["Read", "Edit", "Write", "Bash", "Glob", "Grep", "WebSearch", "WebFetch", "Agent", "NotebookEdit"]);
  const blocks = text.split("---").filter((b) => b.trim());

  return blocks.map((block) => {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    let name = "";
    let role = "";
    let description = "";
    let tools: string[] = [];
    let outputTemplate = "";

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
      }
    }

    return { name, role, description, tools, outputTemplate };
  }).filter((a) => a.name);
}
