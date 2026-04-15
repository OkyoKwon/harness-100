import JSZip from "jszip";
import type { Locale } from "./locale";
import type { Agent, ExtensionSkill, Harness, Modification } from "./types";
import { t } from "./translations";
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

function generateAgentMd(agent: Agent, locale: Locale = "ko"): string {
  const instructionsBlock = agent.instructions?.trim()
    ? `\n${agent.instructions.trim()}\n`
    : "";

  return `---
name: ${agent.name}
description: "${agent.description}"
---

# ${agent.name} — ${agent.role}

${agent.description}
${instructionsBlock}
## ${t(locale, "gen.outputFormat")}

${agent.outputTemplate}
`;
}

function generateClaudeMd(harness: Harness, locale: Locale = "ko"): string {
  return `# ${harness.name}

${harness.description}

## ${t(locale, "gen.agentConfig")}

${harness.agents.map((a) => `- **${a.name}**: ${a.role}`).join("\n")}
`;
}

/** Group execution steps into phases by dependency depth (BFS). */
function buildPhases(
  harness: Harness,
): ReadonlyArray<ReadonlyArray<{ agentId: string; parallel: boolean; dependsOn: ReadonlyArray<string> }>> {
  const steps = harness.skill.executionOrder;
  if (steps.length === 0) return [];

  const resolved = new Set<string>();
  const remaining = [...steps];
  const phases: Array<Array<typeof steps[number]>> = [];

  while (remaining.length > 0) {
    const batch = remaining.filter((s) =>
      s.dependsOn.every((d) => resolved.has(d)),
    );
    if (batch.length === 0) {
      // Circular or unresolvable — dump the rest into one phase
      phases.push(remaining.splice(0));
      break;
    }
    for (const s of batch) {
      resolved.add(s.agentId);
      remaining.splice(remaining.indexOf(s), 1);
    }
    phases.push(batch);
  }
  return phases;
}

function generateSkillMd(harness: Harness, locale: Locale = "ko"): string {
  const ko = locale === "ko";
  const agents = harness.agents;
  const agentMap = new Map(agents.map((a) => [a.id, a]));

  // ── Frontmatter ──
  const triggerDesc = harness.skill.triggerConditions
    .map((tc) => `'${tc}'`)
    .join(", ");

  // ── Agent config table ──
  const agentTable = agents
    .map((a) => `| ${a.id} | \`.claude/agents/${a.id}.md\` | ${a.role} | general-purpose |`)
    .join("\n");

  // ── Phase-based workflow ──
  const phases = buildPhases(harness);
  let outputIndex = 1;
  const phaseBlocks = phases.map((batch, pi) => {
    const phaseTitle = ko
      ? `### Phase ${pi + 1}`
      : `### Phase ${pi + 1}`;

    const rows = batch.map((step) => {
      const agent = agentMap.get(step.agentId);
      const role = agent?.role ?? step.agentId;
      const deps = step.dependsOn.length > 0
        ? step.dependsOn.join(", ")
        : t(locale, "gen.none");
      const idx = String(outputIndex).padStart(2, "0");
      const output = `\`_workspace/${idx}_${step.agentId}_output.md\``;
      outputIndex++;
      const parallel = step.parallel ? (ko ? " (병렬)" : " (parallel)") : "";
      return `| ${step.agentId} | ${role}${parallel} | ${deps} | ${output} |`;
    });

    const header = ko
      ? `| 담당 | 역할 | 의존 | 산출물 |`
      : `| Agent | Role | Depends On | Output |`;

    return `${phaseTitle}\n\n${header}\n|------|------|------|--------|\n${rows.join("\n")}`;
  });

  // ── Execution order table (legacy compact view) ──
  const execTable = harness.skill.executionOrder
    .map((s, i) => {
      const deps = s.dependsOn.length > 0 ? s.dependsOn.join(", ") : t(locale, "gen.none");
      return `| ${i + 1}${s.parallel ? "a" : ""} | ${s.agentId} | ${deps} |`;
    })
    .join("\n");

  // ── Modes table ──
  const modesTable = harness.skill.modes
    .map((m) => `| "${m.triggerPattern}" | **${m.name}** | ${m.agents.join(", ")} |`)
    .join("\n");

  // ── Extension skills ──
  const extSkillsSection =
    harness.skill.extensionSkills.length > 0
      ? `## ${t(locale, "gen.extensionSkills")}\n\n| ${t(locale, "gen.skillHeader")} | ${t(locale, "gen.pathHeader")} | ${t(locale, "gen.targetAgent")} | ${t(locale, "gen.roleHeader")} |\n|------|------|-------------|------|\n${harness.skill.extensionSkills.map((s) => `| ${s.name} | ${s.path} | ${s.targetAgent} | ${s.description} |`).join("\n")}\n`
      : "";

  // ── Communication protocol ──
  const commSection = ko
    ? `## 에이전트 간 통신 프로토콜

- 에이전트 간 SendMessage를 통해 직접 통신하며 작업 결과를 교차 검증한다
- 각 에이전트는 작업 완료 후 산출물을 \`_workspace/\` 디렉토리에 저장한다
- 후속 에이전트는 선행 에이전트의 산출물을 읽어 작업을 이어간다`
    : `## Inter-Agent Communication Protocol

- Agents communicate directly via SendMessage and cross-verify outputs
- Each agent saves deliverables to the \`_workspace/\` directory upon completion
- Downstream agents read upstream outputs to continue the workflow`;

  // ── Preparation phase ──
  const prepSection = ko
    ? `## 실행 준비 (오케스트레이터 수행)

1. 사용자 입력에서 핵심 요구사항을 추출한다
2. \`_workspace/\` 디렉토리를 프로젝트 루트에 생성한다
3. 입력을 정리하여 \`_workspace/00_input.md\`에 저장한다
4. 요청 범위에 따라 실행 모드를 결정한다 (아래 "작업 규모별 모드" 참조)`
    : `## Preparation (Orchestrator)

1. Extract core requirements from user input
2. Create \`_workspace/\` directory at the project root
3. Organize input into \`_workspace/00_input.md\`
4. Determine execution mode based on request scope (see "Modes by Scale" below)`;

  // ── Constraints ──
  const constraintSection = ko
    ? `## 제약사항

- 이 스킬은 위 에이전트 팀의 협업 범위 내에서 동작한다
- 에이전트 정의에 명시되지 않은 외부 도구 실행이나 배포는 이 스킬의 범위가 아니다
- 산출물은 모두 \`_workspace/\` 디렉토리에 마크다운 형식으로 저장된다`
    : `## Constraints

- This skill operates within the collaboration scope of the agent team above
- External tool execution or deployment not specified in agent definitions is out of scope
- All deliverables are saved as markdown files in the \`_workspace/\` directory`;

  return `---
name: ${harness.skill.name}
description: "${triggerDesc}"
---

# ${harness.skill.name} — ${harness.name}

${harness.description}

## ${t(locale, "gen.agentConfig")}

| ${t(locale, "gen.agentHeader")} | ${t(locale, "gen.fileHeader")} | ${t(locale, "gen.roleHeader")} | ${t(locale, "gen.typeHeader")} |
|---------|------|------|------|
${agentTable}

${prepSection}

## ${t(locale, "gen.workflow")}

${phaseBlocks.join("\n\n")}

${commSection}

## ${t(locale, "gen.orderHeader")} (${ko ? "요약" : "Summary"})

| ${t(locale, "gen.orderHeader")} | ${t(locale, "gen.assignee")} | ${t(locale, "gen.depends")} |
|------|------|------|
${execTable}

## ${t(locale, "gen.modeByScale")}

| ${t(locale, "gen.requestPattern")} | ${t(locale, "gen.execMode")} | ${t(locale, "gen.deployedAgents")} |
|----------------|----------|-------------|
${modesTable}

${extSkillsSection}
${constraintSection}
`;
}

function generateExtensionSkillMd(
  ext: ExtensionSkill,
  harness: Harness,
  locale: Locale = "ko",
): string {
  const ko = locale === "ko";
  const agent = harness.agents.find((a) => a.id === ext.targetAgent || a.name === ext.targetAgent);
  const agentRole = agent?.role ?? ext.targetAgent;

  const triggerLine = ko
    ? `'${ext.name} 실행', '${ext.description}'`
    : `'run ${ext.name}', '${ext.description}'`;

  const body = ko
    ? `이 스킬은 **${agent?.name ?? ext.targetAgent}** 에이전트의 전문 지식을 강화합니다.

## 대상 에이전트

- **${agent?.name ?? ext.targetAgent}** — ${agentRole}

## 실행 방법

1. 사용자가 "${ext.description}" 관련 요청을 하면 이 스킬이 트리거됩니다
2. 대상 에이전트가 확장된 전문 지식을 활용하여 작업을 수행합니다
3. 산출물은 \`_workspace/\` 디렉토리에 저장됩니다

## 제약사항

- 이 스킬은 대상 에이전트의 도구와 권한 범위 내에서 동작합니다
- 메인 오케스트레이터 스킬과 함께 사용할 수 있습니다`
    : `This skill enhances the domain expertise of the **${agent?.name ?? ext.targetAgent}** agent.

## Target Agent

- **${agent?.name ?? ext.targetAgent}** — ${agentRole}

## How It Works

1. This skill is triggered when the user requests something related to "${ext.description}"
2. The target agent performs the task using its enhanced domain expertise
3. Deliverables are saved to the \`_workspace/\` directory

## Constraints

- This skill operates within the tools and permissions of the target agent
- Can be used alongside the main orchestrator skill`;

  return `---
name: ${ext.name}
description: "${triggerLine}"
---

# ${ext.name} — ${ext.description}

${body}
`;
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
  locale: Locale = "ko",
  skillMarkdown?: string,
  extensionSkillMarkdowns?: Readonly<Record<string, string>>,
): Promise<Blob> {
  const zip = new JSZip();
  const claude = zip.folder(".claude");
  if (!claude) throw new Error("Failed to create .claude folder in ZIP");

  const raw = harness.rawFiles;

  // CLAUDE.md — use original if available
  claude.file("CLAUDE.md", raw?.claudeMd ?? generateClaudeMd(harness, locale));

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
      agentsFolder.file(`${agent.id}.md`, generateAgentMd(agent, locale));
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
    // Fallback: use custom markdown or generate from structured data
    const skillDir = skillsFolder.folder(harness.slug);
    if (skillDir) {
      skillDir.file("skill.md", skillMarkdown || generateSkillMd(harness, locale));
    }

    // Extension skills
    for (const ext of harness.skill.extensionSkills) {
      if (!ext.name || !isValidPath(ext.name)) continue;
      const extDir = skillsFolder.folder(ext.name);
      if (extDir) {
        const customMd = extensionSkillMarkdowns?.[ext.name];
        extDir.file("skill.md", customMd || generateExtensionSkillMd(ext, harness, locale));
      }
    }
  }

  return zip.generateAsync({ type: "blob" });
}

export { applyModifications, generateAgentMd, generateClaudeMd, generateSkillMd, generateExtensionSkillMd };
