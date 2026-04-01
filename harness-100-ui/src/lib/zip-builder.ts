import JSZip from "jszip";
import type { Agent, Harness, Modification } from "./types";
import { isAllowedModificationField, isValidPath } from "./validation";

function applyModifications(
  agents: ReadonlyArray<Agent>,
  modifications?: ReadonlyArray<Modification>,
): ReadonlyArray<Agent> {
  if (!modifications || modifications.length === 0) return agents;

  return agents
    .filter((agent) => {
      const enabledMod = modifications.find(
        (m) => m.agentId === agent.id && m.field === "enabled",
      );
      return enabledMod ? enabledMod.value !== false : true;
    })
    .map((agent) => {
      const agentMods = modifications.filter(
        (m) => m.agentId === agent.id && m.field !== "enabled",
      );
      if (agentMods.length === 0) return agent;

      return agentMods.reduce<Agent>(
        (acc, mod) =>
          typeof mod.value === "string" && isAllowedModificationField(mod.field)
            ? { ...acc, [mod.field]: mod.value }
            : acc,
        agent,
      );
    });
}

function generateAgentMd(agent: Agent): string {
  return `---
name: ${agent.name}
description: "${agent.description}"
---

# ${agent.name} — ${agent.role}

${agent.description}

## 산출물 포맷

${agent.outputTemplate}
`;
}

function generateClaudeMd(harness: Harness): string {
  return `# ${harness.name}

${harness.description}

## 에이전트 구성

${harness.agents.map((a) => `- **${a.name}**: ${a.role}`).join("\n")}
`;
}

function generateSkillMd(harness: Harness): string {
  const agentTable = harness.agents
    .map((a) => `| ${a.id} | \`.claude/agents/${a.id}.md\` | ${a.role} | general-purpose |`)
    .join("\n");

  const execTable = harness.skill.executionOrder
    .map((s, i) => {
      const deps = s.dependsOn.length > 0 ? s.dependsOn.join(", ") : "없음";
      return `| ${i + 1}${s.parallel ? "a" : ""} | ${s.agentId} | ${deps} |`;
    })
    .join("\n");

  const modesTable = harness.skill.modes
    .map((m) => `| "${m.triggerPattern}" | **${m.name}** | ${m.agents.join(", ")} |`)
    .join("\n");

  const extSkillsSection =
    harness.skill.extensionSkills.length > 0
      ? `## 에이전트별 확장 스킬\n\n| 스킬 | 경로 | 대상 에이전트 | 역할 |\n|------|------|-------------|------|\n${harness.skill.extensionSkills.map((s) => `| ${s.name} | ${s.path} | ${s.targetAgent} | ${s.description} |`).join("\n")}\n`
      : "";

  return `---
name: ${harness.skill.name}
description: "${harness.skill.triggerConditions.map((t) => `'${t}'`).join(", ")}"
---

# ${harness.skill.name}

## 에이전트 구성

| 에이전트 | 파일 | 역할 | 타입 |
|---------|------|------|------|
${agentTable}

## 워크플로우

| 순서 | 담당 | 의존 |
|------|------|------|
${execTable}

## 작업 규모별 모드

| 사용자 요청 패턴 | 실행 모드 | 투입 에이전트 |
|----------------|----------|-------------|
${modesTable}

${extSkillsSection}`;
}

/**
 * Check if modifications affect any agent (requiring re-generation).
 */
function hasModifications(
  agentId: string,
  modifications?: ReadonlyArray<Modification>,
): boolean {
  if (!modifications) return false;
  return modifications.some((m) => m.agentId === agentId);
}

export async function buildZip(
  harness: Harness,
  modifications?: ReadonlyArray<Modification>,
): Promise<Blob> {
  const zip = new JSZip();
  const claude = zip.folder(".claude");
  if (!claude) throw new Error("Failed to create .claude folder in ZIP");

  const raw = harness.rawFiles;

  // CLAUDE.md — use original if available
  claude.file("CLAUDE.md", raw?.claudeMd ?? generateClaudeMd(harness));

  // Agents
  const agentsFolder = claude.folder("agents");
  if (!agentsFolder) throw new Error("Failed to create agents folder in ZIP");

  const agents = applyModifications(harness.agents, modifications);
  for (const agent of agents) {
    const rawContent = raw?.agents?.[agent.id];
    // Use original markdown if no modifications were made to this agent
    if (rawContent && !hasModifications(agent.id, modifications)) {
      agentsFolder.file(`${agent.id}.md`, rawContent);
    } else {
      agentsFolder.file(`${agent.id}.md`, generateAgentMd(agent));
    }
  }

  // Skills — write all original skill files
  const skillsFolder = claude.folder("skills");
  if (!skillsFolder) throw new Error("Failed to create skills folder in ZIP");

  if (raw?.skills && Object.keys(raw.skills).length > 0) {
    for (const [path, content] of Object.entries(raw.skills)) {
      if (!isValidPath(path)) continue;
      const parts = path.split("/");
      const dirName = parts[0];
      const fileName = parts.slice(1).join("/");
      if (!dirName || !fileName) continue;
      const dir = skillsFolder.folder(dirName);
      if (dir) {
        dir.file(fileName, content);
      }
    }
  } else {
    // Fallback: generate from structured data
    const skillDir = skillsFolder.folder(harness.slug);
    if (skillDir) {
      skillDir.file("skill.md", generateSkillMd(harness));
    }
  }

  return zip.generateAsync({ type: "blob" });
}

export { applyModifications, generateAgentMd, generateClaudeMd, generateSkillMd };
