import JSZip from "jszip";
import type { Agent, Harness, Modification } from "./types";

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

      let updated = { ...agent };
      for (const mod of agentMods) {
        if (typeof mod.value === "string") {
          updated = { ...updated, [mod.field]: mod.value };
        }
      }
      return updated;
    });
}

function generateAgentMd(agent: Agent): string {
  return `---
name: ${agent.name}
role: ${agent.role}
tools: [${agent.tools.join(", ")}]
dependencies: [${agent.dependencies.join(", ")}]
---

# ${agent.name}

${agent.description}

## 산출물 템플릿

${agent.outputTemplate}
`;
}

function generateClaudeMd(harness: Harness): string {
  return `---
id: ${harness.id}
name: ${harness.name}
slug: ${harness.slug}
category: ${harness.category}
agentCount: ${harness.agentCount}
frameworks: [${harness.frameworks.join(", ")}]
---

# ${harness.name}

${harness.description}

## 에이전트 구성

${harness.agents.map((a) => `- **${a.name}**: ${a.role}`).join("\n")}
`;
}

function generateSkillMd(harness: Harness): string {
  return `---
name: ${harness.skill.name}
trigger: ${harness.skill.triggerConditions.join(", ")}
---

# ${harness.skill.name}

## 트리거 조건

${harness.skill.triggerConditions.map((t) => `- ${t}`).join("\n")}

## 실행 순서

${harness.skill.executionOrder.map((s, i) => `${i + 1}. ${s.agentId}${s.parallel ? " (병렬)" : ""}`).join("\n")}
`;
}

export async function buildZip(
  harness: Harness,
  modifications?: ReadonlyArray<Modification>,
): Promise<Blob> {
  const zip = new JSZip();
  const claude = zip.folder(".claude");
  if (!claude) throw new Error("Failed to create .claude folder in ZIP");

  claude.file("CLAUDE.md", generateClaudeMd(harness));

  const agentsFolder = claude.folder("agents");
  if (!agentsFolder) throw new Error("Failed to create agents folder in ZIP");

  const agents = applyModifications(harness.agents, modifications);
  for (const agent of agents) {
    agentsFolder.file(`${agent.id}.md`, generateAgentMd(agent));
  }

  const skillsFolder = claude.folder("skills");
  if (!skillsFolder) throw new Error("Failed to create skills folder in ZIP");
  const skillDir = skillsFolder.folder(harness.slug);
  if (!skillDir) throw new Error("Failed to create skill folder in ZIP");
  skillDir.file("skill.md", generateSkillMd(harness));

  return zip.generateAsync({ type: "blob" });
}

export { applyModifications, generateAgentMd, generateClaudeMd, generateSkillMd };
