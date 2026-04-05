import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  readdirSync,
} from "fs";
import { resolve, join } from "path";

// ---------------------------------------------------------------------------
// Types (inline — runs outside Next.js)
// ---------------------------------------------------------------------------

interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  tools: string[];
  outputTemplate: string;
  dependencies: string[];
}

interface ExecutionStep {
  agentId: string;
  parallel: boolean;
  dependsOn: string[];
}

interface Skill {
  id: string;
  name: string;
  triggerConditions: string[];
  executionOrder: ExecutionStep[];
}

interface Harness {
  id: number;
  slug: string;
  name: string;
  description: string;
  agents: Agent[];
  skill: Skill;
}

interface DemoStepOutput {
  title: string;
  snippet: string;
}

interface DemoStep {
  agentId: string;
  action: string;
  durationMs: number;
  toolsUsed: string[];
  output: DemoStepOutput;
}

interface DemoScenario {
  id: string;
  title: string;
  userPrompt: string;
  steps: DemoStep[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ROOT = resolve(__dirname, "..");
const DATA_DIR = join(ROOT, "public", "data");
const LOCALES = ["en", "ko"] as const;

function firstSentence(text: string): string {
  const match = text.match(/^[^.!?]+[.!?]/);
  return match ? match[0].trim() : text.slice(0, 120).trim();
}

function extractOutputTitle(template: string): string {
  const headerMatch = template.match(/^#\s+(.+)/m);
  if (headerMatch) return headerMatch[1].trim();
  const firstLine = template.split("\n").find((l) => l.trim().length > 0);
  return firstLine?.replace(/^#+\s*/, "").trim() || "Output";
}

function extractSnippet(template: string, maxLines: number = 5): string {
  if (!template.trim()) return "";
  const lines = template.split("\n");
  return lines.slice(0, maxLines).join("\n").trim();
}

function topologicalSort(
  agents: Agent[],
  executionOrder: ExecutionStep[],
): string[] {
  const agentIds = new Set(agents.map((a) => a.id));
  const orderMap = new Map<string, ExecutionStep>();
  for (const step of executionOrder) {
    orderMap.set(step.agentId, step);
  }

  const visited = new Set<string>();
  const sorted: string[] = [];

  function visit(id: string): void {
    if (visited.has(id) || !agentIds.has(id)) return;
    visited.add(id);

    const step = orderMap.get(id);
    const deps = step?.dependsOn ?? [];
    for (const dep of deps) {
      visit(dep);
    }
    sorted.push(id);
  }

  // Process in executionOrder sequence first, then remaining agents
  for (const step of executionOrder) {
    visit(step.agentId);
  }
  for (const agent of agents) {
    visit(agent.id);
  }

  return sorted;
}

function buildDemoScenario(harness: Harness): DemoScenario {
  const sortedIds = topologicalSort(harness.agents, harness.skill.executionOrder);
  const agentMap = new Map(harness.agents.map((a) => [a.id, a]));

  const userPrompt =
    harness.skill.triggerConditions[0]?.replace(/,\s*$/, "") ||
    harness.description;

  const steps: DemoStep[] = sortedIds
    .map((agentId) => {
      const agent = agentMap.get(agentId);
      if (!agent) return null;

      const baseDuration = 2000;
      const toolBonus = agent.tools.length * 400;
      const durationMs = Math.min(baseDuration + toolBonus, 4000);

      return {
        agentId: agent.id,
        action: firstSentence(agent.description),
        durationMs,
        toolsUsed: agent.tools.slice(0, 3),
        output: {
          title: extractOutputTitle(agent.outputTemplate),
          snippet:
            extractSnippet(agent.outputTemplate) ||
            `[${agent.role} output will appear here]`,
        },
      };
    })
    .filter((s): s is DemoStep => s !== null);

  return {
    id: `${harness.slug}-demo`,
    title: harness.name,
    userPrompt,
    steps,
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  let totalGenerated = 0;

  for (const locale of LOCALES) {
    const harnessDir = join(DATA_DIR, locale, "harness");
    const demoDir = join(DATA_DIR, locale, "demo");

    if (!existsSync(harnessDir)) {
      console.warn(`  ⚠ Harness directory not found: ${harnessDir}`);
      continue;
    }

    if (!existsSync(demoDir)) {
      mkdirSync(demoDir, { recursive: true });
    }

    const files = readdirSync(harnessDir).filter((f) => f.endsWith(".json"));

    for (const file of files) {
      const raw = readFileSync(join(harnessDir, file), "utf-8");
      const harness: Harness = JSON.parse(raw);
      const scenario = buildDemoScenario(harness);

      writeFileSync(
        join(demoDir, file),
        JSON.stringify(scenario, null, 2) + "\n",
      );
      totalGenerated++;
    }

    console.log(`  ✓ ${locale}: ${files.length} demo files generated`);
  }

  console.log(`\nDone! ${totalGenerated} total demo files generated.`);
}

main();
