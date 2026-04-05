/**
 * Sync agent dependencies and executionOrder from Korean to English harness data.
 *
 * The Korean data files contain the authoritative dependency graph.
 * This script copies structural fields (dependencies, dependsOn, parallel)
 * from ko → en while preserving all English-specific content (name, role, description, tools, etc.).
 *
 * Usage: npx tsx scripts/sync-en-dependencies.ts
 */

import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";

const KO_DIR = join(__dirname, "../public/data/ko/harness");
const EN_DIR = join(__dirname, "../public/data/en/harness");

interface Agent {
  id: string;
  dependencies: string[];
  [key: string]: unknown;
}

interface ExecutionStep {
  agentId: string;
  dependsOn: string[];
  parallel: boolean;
  [key: string]: unknown;
}

interface Harness {
  agents: Agent[];
  skill: {
    executionOrder: ExecutionStep[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

let updatedCount = 0;

const files = readdirSync(KO_DIR).filter((f) => f.endsWith(".json"));

for (const file of files) {
  const koPath = join(KO_DIR, file);
  const enPath = join(EN_DIR, file);

  let ko: Harness;
  let en: Harness;
  try {
    ko = JSON.parse(readFileSync(koPath, "utf-8"));
    en = JSON.parse(readFileSync(enPath, "utf-8"));
  } catch {
    console.warn(`Skipping ${file}: could not read both ko and en files`);
    continue;
  }

  let changed = false;

  // Build ko agent dependency map
  const koDeps = new Map(ko.agents.map((a) => [a.id, a.dependencies]));

  // Sync agent dependencies
  const updatedAgents = en.agents.map((agent) => {
    const koDep = koDeps.get(agent.id);
    if (koDep && JSON.stringify(agent.dependencies) !== JSON.stringify(koDep)) {
      changed = true;
      return { ...agent, dependencies: koDep };
    }
    return agent;
  });

  // Sync executionOrder
  const koExecMap = new Map(
    ko.skill.executionOrder.map((s) => [s.agentId, { dependsOn: s.dependsOn, parallel: s.parallel }]),
  );

  const updatedExec = en.skill.executionOrder.map((step) => {
    const koStep = koExecMap.get(step.agentId);
    if (koStep) {
      const depsChanged = JSON.stringify(step.dependsOn) !== JSON.stringify(koStep.dependsOn);
      const parallelChanged = step.parallel !== koStep.parallel;
      if (depsChanged || parallelChanged) {
        changed = true;
        return { ...step, dependsOn: koStep.dependsOn, parallel: koStep.parallel };
      }
    }
    return step;
  });

  if (changed) {
    const updated: Harness = {
      ...en,
      agents: updatedAgents,
      skill: { ...en.skill, executionOrder: updatedExec },
    };
    writeFileSync(enPath, JSON.stringify(updated, null, 2) + "\n", "utf-8");
    updatedCount++;
    console.log(`✓ ${file} — synced dependencies`);
  }
}

console.log(`\nDone. Updated ${updatedCount} / ${files.length} files.`);
