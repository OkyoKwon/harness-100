import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
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

interface Harness {
  id: number;
  slug: string;
  name: string;
  description: string;
  category: string;
  agents: Agent[];
}

interface AgentRef {
  name: string;
  role: string;
  tools: string[];
  harnessId: number;
  harnessName: string;
  category: string;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const ROOT = resolve(__dirname, "..");
const LOCALES = ["ko", "en"] as const;

for (const locale of LOCALES) {
  const harnessDir = join(ROOT, "public", "data", locale, "harness");
  if (!existsSync(harnessDir)) {
    console.log(`Skipping locale "${locale}" — directory not found: ${harnessDir}`);
    continue;
  }

  const files = readdirSync(harnessDir)
    .filter((f) => f.endsWith(".json"))
    .sort();

  const index: AgentRef[] = [];

  for (const file of files) {
    const raw = readFileSync(join(harnessDir, file), "utf-8");
    const harness: Harness = JSON.parse(raw);

    for (const agent of harness.agents) {
      index.push({
        name: agent.name,
        role: agent.role,
        tools: agent.tools,
        harnessId: harness.id,
        harnessName: harness.name,
        category: harness.category,
      });
    }
  }

  const outPath = join(ROOT, "public", "data", locale, "agent-index.json");
  writeFileSync(outPath, JSON.stringify(index, null, 2), "utf-8");
  console.log(`[${locale}] wrote ${index.length} agent refs → ${outPath}`);
}
