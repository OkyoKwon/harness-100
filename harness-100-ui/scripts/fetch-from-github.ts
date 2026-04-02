import { execSync } from "child_process";
import {
  readFileSync,
  readdirSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  rmSync,
  statSync,
} from "fs";
import { resolve, join, basename } from "path";

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

interface SkillMode {
  name: string;
  triggerPattern: string;
  agents: string[];
}

interface ExtensionSkill {
  name: string;
  path: string;
  targetAgent: string;
  description: string;
}

interface Skill {
  id: string;
  name: string;
  triggerConditions: string[];
  executionOrder: ExecutionStep[];
  modes: SkillMode[];
  extensionSkills: ExtensionSkill[];
}

interface RawFiles {
  claudeMd: string;
  agents: Record<string, string>;
  skills: Record<string, string>;
}

interface Harness {
  id: number;
  slug: string;
  name: string;
  description: string;
  category: string;
  agents: Agent[];
  skill: Skill;
  frameworks: string[];
  agentCount: number;
  popularityRank: number;
  rawFiles: RawFiles;
}

interface HarnessMeta {
  id: number;
  slug: string;
  name: string;
  description: string;
  category: string;
  agentCount: number;
  popularityRank: number;
  frameworks: string[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const REPO_URL = "https://github.com/revfactory/harness-100.git";
const TEMP_DIR = resolve("/tmp/harness-100-source");
const KO_DIR = join(TEMP_DIR, "ko");
const EN_DIR = join(TEMP_DIR, "en");

const KNOWN_TOOLS = [
  "WebSearch",
  "WebFetch",
  "Read",
  "Write",
  "Edit",
  "Bash",
  "SendMessage",
  "Skill",
  "TaskCreate",
  "TaskUpdate",
  "Agent",
  "Glob",
  "Grep",
  "NotebookEdit",
] as const;

const KNOWN_FRAMEWORKS = [
  "AIDA",
  "SOLID",
  "DDD",
  "OWASP Top 10",
  "DORA",
  "SemVer",
  "MADR",
  "ADDIE",
  "CEFR",
  "IRAC",
  "GDPR",
  "PIPA",
  "BMC",
  "OKR",
  "BSC",
  "SWOT",
  "RICE",
  "RACI",
  "SIPOC",
  "SMART",
  "Bloom's Taxonomy",
  "Porter's Five Forces",
  "TAM/SAM/SOM",
  "PESTLE",
  "MoSCoW",
  "Eisenhower",
  "Kanban",
  "Scrum",
  "Agile",
  "Lean",
  "Six Sigma",
  "TOGAF",
  "C4 Model",
  "12-Factor App",
  "CAP Theorem",
  "ACID",
  "REST",
  "GraphQL",
  "gRPC",
  "CQRS",
  "Event Sourcing",
  "Saga Pattern",
  "Circuit Breaker",
  "IMRaD",
  "APA",
  "IEEE",
  "GRI Standards",
  "GHG Protocol",
  "TCFD",
  "ISSB",
  "CSRD",
  "ESRS",
  "K-ESG",
  "SBTi",
  "ISO 14064",
  "UN SDGs",
  "SA8000",
  "UNGPs",
  "Van Westendorp PSM",
  "Gabor-Granger",
  "PED/XED",
  "Cap Rate",
  "IRR",
  "NPV",
  "DCF",
  "Diataxis",
  "STAR",
  "Star Schema",
  "Snowflake Schema",
  "SHAP",
  "LIME",
  "CRISP-DM",
  "MLOps",
  "CI/CD",
  "GitOps",
  "IaC",
  "Terraform",
  "Pulumi",
  "STRIDE",
  "MITRE ATT&CK",
  "OWASP ASVS",
  "CWE",
  "CVE",
  "NIST",
] as const;

// Category assignments from existing data (these are accurate)
const HARNESS_META: ReadonlyArray<{
  id: number;
  slug: string;
  name: string;
  category: string;
}> = [
  { id: 1, slug: "youtube-production", name: "YouTube Production", category: "content" },
  { id: 2, slug: "podcast-studio", name: "Podcast Studio", category: "content" },
  { id: 3, slug: "newsletter-engine", name: "Newsletter Engine", category: "content" },
  { id: 4, slug: "content-repurposer", name: "Content Repurposer", category: "content" },
  { id: 5, slug: "game-narrative", name: "Game Narrative", category: "content" },
  { id: 6, slug: "brand-identity", name: "Brand Identity", category: "content" },
  { id: 7, slug: "comic-creator", name: "Comic Creator", category: "content" },
  { id: 8, slug: "course-builder", name: "Course Builder", category: "content" },
  { id: 9, slug: "documentary-research", name: "Documentary Research", category: "content" },
  { id: 10, slug: "social-media-manager", name: "Social Media Manager", category: "content" },
  { id: 11, slug: "book-publishing", name: "Book Publishing", category: "content" },
  { id: 12, slug: "advertising-campaign", name: "Advertising Campaign", category: "content" },
  { id: 13, slug: "presentation-designer", name: "Presentation Designer", category: "content" },
  { id: 14, slug: "translation-localization", name: "Translation & Localization", category: "content" },
  { id: 15, slug: "visual-storytelling", name: "Visual Storytelling", category: "content" },
  { id: 16, slug: "fullstack-webapp", name: "Fullstack Web App", category: "development" },
  { id: 17, slug: "mobile-app-builder", name: "Mobile App Builder", category: "development" },
  { id: 18, slug: "api-designer", name: "API Designer", category: "development" },
  { id: 19, slug: "database-architect", name: "Database Architect", category: "development" },
  { id: 20, slug: "cicd-pipeline", name: "CI/CD Pipeline", category: "development" },
  { id: 21, slug: "code-reviewer", name: "Code Reviewer", category: "development" },
  { id: 22, slug: "legacy-modernizer", name: "Legacy Modernizer", category: "development" },
  { id: 23, slug: "microservice-designer", name: "Microservice Designer", category: "development" },
  { id: 24, slug: "test-automation", name: "Test Automation", category: "development" },
  { id: 25, slug: "incident-postmortem", name: "Incident Postmortem", category: "development" },
  { id: 26, slug: "infra-as-code", name: "Infrastructure as Code", category: "development" },
  { id: 27, slug: "data-pipeline", name: "Data Pipeline", category: "development" },
  { id: 28, slug: "security-audit", name: "Security Audit", category: "development" },
  { id: 29, slug: "performance-optimizer", name: "Performance Optimizer", category: "development" },
  { id: 30, slug: "open-source-launcher", name: "Open Source Launcher", category: "development" },
  { id: 31, slug: "ml-experiment", name: "ML Experiment", category: "data-ai" },
  { id: 32, slug: "data-analysis", name: "Data Analysis", category: "data-ai" },
  { id: 33, slug: "text-processor", name: "Text Processor", category: "data-ai" },
  { id: 34, slug: "data-migration", name: "Data Migration", category: "data-ai" },
  { id: 35, slug: "api-client-generator", name: "API Client Generator", category: "data-ai" },
  { id: 36, slug: "design-system", name: "Design System", category: "data-ai" },
  { id: 37, slug: "web-scraper", name: "Web Scraper", category: "data-ai" },
  { id: 38, slug: "chatbot-builder", name: "Chatbot Builder", category: "data-ai" },
  { id: 39, slug: "changelog-generator", name: "Changelog Generator", category: "data-ai" },
  { id: 40, slug: "cli-tool-builder", name: "CLI Tool Builder", category: "data-ai" },
  { id: 41, slug: "llm-app-builder", name: "LLM App Builder", category: "data-ai" },
  { id: 42, slug: "bi-dashboard", name: "BI Dashboard", category: "data-ai" },
  { id: 43, slug: "startup-launcher", name: "Startup Launcher", category: "business" },
  { id: 44, slug: "market-research", name: "Market Research", category: "business" },
  { id: 45, slug: "gov-funding-plan", name: "Gov Funding Plan", category: "business" },
  { id: 46, slug: "product-manager", name: "Product Manager", category: "business" },
  { id: 47, slug: "strategy-framework", name: "Strategy Framework", category: "business" },
  { id: 48, slug: "sales-enablement", name: "Sales Enablement", category: "business" },
  { id: 49, slug: "customer-support", name: "Customer Support", category: "business" },
  { id: 50, slug: "pricing-strategy", name: "Pricing Strategy", category: "business" },
  { id: 51, slug: "investor-report", name: "Investor Report", category: "business" },
  { id: 52, slug: "scenario-planner", name: "Scenario Planner", category: "business" },
  { id: 53, slug: "financial-modeler", name: "Financial Modeler", category: "business" },
  { id: 54, slug: "grant-writer", name: "Grant Writer", category: "business" },
  { id: 55, slug: "rfp-responder", name: "RFP Responder", category: "business" },
  { id: 56, slug: "language-tutor", name: "Language Tutor", category: "education" },
  { id: 57, slug: "exam-prep", name: "Exam Prep", category: "education" },
  { id: 58, slug: "thesis-advisor", name: "Thesis Advisor", category: "education" },
  { id: 59, slug: "coding-bootcamp", name: "Coding Bootcamp", category: "education" },
  { id: 60, slug: "debate-simulator", name: "Debate Simulator", category: "education" },
  { id: 61, slug: "competency-modeler", name: "Competency Modeler", category: "education" },
  { id: 62, slug: "adr-writer", name: "ADR Writer", category: "education" },
  { id: 63, slug: "research-assistant", name: "Research Assistant", category: "education" },
  { id: 64, slug: "knowledge-base-builder", name: "Knowledge Base Builder", category: "education" },
  { id: 65, slug: "personal-branding", name: "Personal Branding", category: "education" },
  { id: 66, slug: "contract-analyzer", name: "Contract Analyzer", category: "legal" },
  { id: 67, slug: "compliance-checker", name: "Compliance Checker", category: "legal" },
  { id: 68, slug: "patent-drafter", name: "Patent Drafter", category: "legal" },
  { id: 69, slug: "privacy-engineer", name: "Privacy Engineer", category: "legal" },
  { id: 70, slug: "legal-research", name: "Legal Research", category: "legal" },
  { id: 71, slug: "service-legal-docs", name: "Service Legal Docs", category: "legal" },
  { id: 72, slug: "regulatory-filing", name: "Regulatory Filing", category: "legal" },
  { id: 73, slug: "meal-planner", name: "Meal Planner", category: "lifestyle" },
  { id: 74, slug: "fitness-program", name: "Fitness Program", category: "lifestyle" },
  { id: 75, slug: "tax-calculator", name: "Tax Calculator", category: "lifestyle" },
  { id: 76, slug: "travel-planner", name: "Travel Planner", category: "lifestyle" },
  { id: 77, slug: "space-concept-board", name: "Space Concept Board", category: "lifestyle" },
  { id: 78, slug: "personal-finance", name: "Personal Finance", category: "lifestyle" },
  { id: 79, slug: "side-project-launcher", name: "Side Project Launcher", category: "lifestyle" },
  { id: 80, slug: "wedding-planner", name: "Wedding Planner", category: "lifestyle" },
  { id: 81, slug: "technical-writer", name: "Technical Writer", category: "communication" },
  { id: 82, slug: "report-generator", name: "Report Generator", category: "communication" },
  { id: 83, slug: "sop-writer", name: "SOP Writer", category: "communication" },
  { id: 84, slug: "meeting-strategist", name: "Meeting Strategist", category: "communication" },
  { id: 85, slug: "public-speaking", name: "Public Speaking", category: "communication" },
  { id: 86, slug: "proposal-writer", name: "Proposal Writer", category: "communication" },
  { id: 87, slug: "crisis-communication", name: "Crisis Communication", category: "communication" },
  { id: 88, slug: "risk-register", name: "Risk Register", category: "communication" },
  { id: 89, slug: "event-organizer", name: "Event Organizer", category: "operations" },
  { id: 90, slug: "hiring-pipeline", name: "Hiring Pipeline", category: "operations" },
  { id: 91, slug: "onboarding-system", name: "Onboarding System", category: "operations" },
  { id: 92, slug: "operations-manual", name: "Operations Manual", category: "operations" },
  { id: 93, slug: "feedback-analyzer", name: "Feedback Analyzer", category: "operations" },
  { id: 94, slug: "audit-report", name: "Audit Report", category: "operations" },
  { id: 95, slug: "procurement-docs", name: "Procurement Docs", category: "operations" },
  { id: 96, slug: "real-estate-analyst", name: "Real Estate Analyst", category: "specialized" },
  { id: 97, slug: "ecommerce-launcher", name: "E-commerce Launcher", category: "specialized" },
  { id: 98, slug: "academic-paper", name: "Academic Paper", category: "specialized" },
  { id: 99, slug: "sustainability-audit", name: "Sustainability Audit", category: "specialized" },
  { id: 100, slug: "ip-portfolio", name: "IP Portfolio", category: "specialized" },
];

// ---------------------------------------------------------------------------
// Parsing utilities
// ---------------------------------------------------------------------------

function parseFrontmatter(content: string): { meta: Record<string, string>; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    return { meta: {}, body: content };
  }

  const meta: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    let value = line.slice(colonIdx + 1).trim();
    // Remove surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    meta[key] = value;
  }

  return { meta, body: match[2] };
}

function extractSection(body: string, heading: string): string {
  const headingRegex = new RegExp(`^##\\s+${escapeRegex(heading)}\\s*$`, "m");
  const match = body.match(headingRegex);
  if (!match || match.index === undefined) return "";

  const start = match.index + match[0].length;
  const nextHeading = body.slice(start).match(/^##\s+/m);
  const end = nextHeading?.index !== undefined ? start + nextHeading.index : body.length;

  return body.slice(start, end).trim();
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractTools(body: string): string[] {
  const tools = new Set<string>();

  // Match English tool names
  for (const tool of KNOWN_TOOLS) {
    const regex = new RegExp(`\\b${escapeRegex(tool)}\\b`);
    if (regex.test(body)) {
      tools.add(tool);
    }
  }

  // Match Korean patterns that imply tool usage
  const koreanToolMap: ReadonlyArray<[RegExp, string]> = [
    [/웹\s*검색/i, "WebSearch"],
    [/WebSearch\/WebFetch/i, "WebSearch"],
    [/웹\s*(?:페이지|사이트)\s*(?:가져|읽|수집)/i, "WebFetch"],
    [/파일.*(?:읽|확인|분석)/i, "Read"],
    [/파일.*(?:작성|생성|저장|기록)/i, "Write"],
    [/코드.*(?:수정|편집|리팩)/i, "Edit"],
    [/(?:명령|터미널|셸|쉘|커맨드|빌드|테스트.*실행|npm|pip|cargo)/i, "Bash"],
    [/SendMessage/i, "SendMessage"],
    [/(?:에이전트|팀원).*(?:전달|요청|보고|피드백)/i, "SendMessage"],
    [/_workspace\/.*\.md/i, "Write"],
  ];

  for (const [pattern, tool] of koreanToolMap) {
    if (pattern.test(body)) {
      tools.add(tool);
    }
  }

  // All agents that produce output files implicitly use Read/Write
  if (body.includes("_workspace/") || body.includes("산출물")) {
    tools.add("Read");
    tools.add("Write");
  }

  return [...tools];
}

function extractFrameworks(allContent: string): string[] {
  const found = new Set<string>();
  for (const fw of KNOWN_FRAMEWORKS) {
    const regex = new RegExp(`\\b${escapeRegex(fw)}\\b`, "i");
    if (regex.test(allContent)) {
      found.add(fw);
    }
  }
  return [...found];
}

/**
 * Parse the workflow table from skill.md to extract execution order.
 * Table format:
 * | 순서 | 작업 | 담당 | 의존 | 산출물 |
 */
function parseWorkflowTable(
  body: string,
  agentFileNames: string[],
): { steps: ExecutionStep[]; agentOrder: string[] } {
  // Find the workflow table (Phase 2 section usually)
  const tableRegex = /\|[^\n]*(?:순서|Order|Step)[^\n]*\|[^\n]*\n\|[-| ]+\n((?:\|[^\n]*\n)*)/;
  const match = body.match(tableRegex);

  if (!match) {
    // Fallback: try to find any table with agent names
    return buildSequentialFallback(agentFileNames);
  }

  const rows = match[1].trim().split("\n").filter((r) => r.trim().startsWith("|"));
  const steps: ExecutionStep[] = [];
  const agentOrder: string[] = [];

  // Track parallel groups (e.g., 1a, 1b → parallel)
  const orderGroups = new Map<string, string[]>();

  for (const row of rows) {
    const cells = row
      .split("|")
      .map((c) => c.trim())
      .filter((c) => c.length > 0);
    if (cells.length < 4) continue;

    const order = cells[0].trim();
    const agentRef = cells[2].trim().toLowerCase();
    const depStr = cells[3].trim();

    // Find the matching agent filename
    const agentId = resolveAgentId(agentRef, agentFileNames);
    if (!agentId) continue;

    agentOrder.push(agentId);

    // Detect parallel: orders like "1a", "1b", "2a", "2b"
    const baseOrder = order.replace(/[a-z]$/i, "");
    const isParallelOrder = /[a-z]$/i.test(order);

    if (isParallelOrder) {
      if (!orderGroups.has(baseOrder)) {
        orderGroups.set(baseOrder, []);
      }
      orderGroups.get(baseOrder)!.push(agentId);
    }

    // Parse dependencies
    const deps = parseDependencies(depStr, agentFileNames, agentOrder);

    steps.push({
      agentId,
      parallel: isParallelOrder,
      dependsOn: deps,
    });
  }

  return { steps, agentOrder };
}

function resolveAgentId(ref: string, agentFileNames: string[]): string | null {
  // ref might be: "strategist", "writer", "cost-analyst", etc.
  const refLower = ref.toLowerCase().replace(/\s+/g, "-");

  // Direct match
  for (const name of agentFileNames) {
    if (name === refLower || name.includes(refLower) || refLower.includes(name)) {
      return name;
    }
  }

  // Partial match: try matching the last part
  for (const name of agentFileNames) {
    const parts = name.split("-");
    if (parts.some((p) => refLower.includes(p) && p.length > 3)) {
      return name;
    }
  }

  // Try matching by position keywords
  const keywordMap: Record<string, string[]> = {
    strategist: ["strateg"],
    writer: ["writ", "script"],
    designer: ["design", "thumbnail"],
    reviewer: ["review", "검증"],
    optimizer: ["optim", "seo"],
    analyst: ["analy"],
    assessor: ["assess", "value"],
    simulator: ["simul"],
    planner: ["plan"],
    reporter: ["report"],
  };

  for (const name of agentFileNames) {
    for (const [, keywords] of Object.entries(keywordMap)) {
      if (keywords.some((kw) => name.includes(kw)) && keywords.some((kw) => refLower.includes(kw))) {
        return name;
      }
    }
  }

  return null;
}

function parseDependencies(
  depStr: string,
  agentFileNames: string[],
  agentOrder: string[],
): string[] {
  if (!depStr || depStr === "없음" || depStr === "-" || depStr.toLowerCase() === "none" || depStr === "—") {
    return [];
  }

  const deps: string[] = [];

  // Pattern: "작업 1", "작업 1a, 1b", "작업 1, 2", "Task 1", "Step 1"
  const taskRefs = depStr.match(/(?:작업|Task|Step)\s*[\d]+[a-z]?/gi) ?? [];
  for (const ref of taskRefs) {
    const numMatch = ref.match(/(\d+)([a-z])?/i);
    if (!numMatch) continue;
    const num = parseInt(numMatch[1], 10);
    const suffix = numMatch[2];

    if (suffix) {
      // Specific subtask like "작업 1a"
      const idx = findTaskIndex(num, suffix, agentOrder);
      if (idx >= 0 && agentOrder[idx]) {
        deps.push(agentOrder[idx]);
      }
    } else {
      // All subtasks of this number
      // Find all agents at this task number position
      // Simple approach: map task number to agent order index
      const idx = num - 1;
      if (idx >= 0 && idx < agentOrder.length) {
        deps.push(agentOrder[idx]);
      }
      // Also check for parallel siblings (e.g., 1a, 1b both under task 1)
    }
  }

  // Also handle comma-separated direct references
  if (taskRefs.length === 0) {
    // Try to match agent names directly
    const refs = depStr.split(/[,、]/).map((s) => s.trim());
    for (const ref of refs) {
      const agentId = resolveAgentId(ref, agentFileNames);
      if (agentId) {
        deps.push(agentId);
      }
    }
  }

  // Handle "작업 1a, 1b, 2" combined patterns
  const allNums = depStr.match(/\d+[a-z]?/gi) ?? [];
  if (taskRefs.length > 0 && allNums.length > taskRefs.length) {
    // There are additional number references
    for (const numRef of allNums) {
      const num = parseInt(numRef, 10);
      const suffix = numRef.match(/[a-z]$/i)?.[0];
      const idx = findTaskIndex(num, suffix, agentOrder);
      if (idx >= 0 && agentOrder[idx] && !deps.includes(agentOrder[idx])) {
        deps.push(agentOrder[idx]);
      }
    }
  }

  return [...new Set(deps)];
}

function findTaskIndex(num: number, suffix: string | undefined, agentOrder: string[]): number {
  // Simple mapping: task numbers roughly correspond to agent order
  // Task 1 → index 0, Task 1a → index 0, Task 1b → index 1, Task 2 → next after 1s, etc.
  if (num <= 0) return -1;
  return Math.min(num - 1 + (suffix ? suffix.charCodeAt(0) - "a".charCodeAt(0) : 0), agentOrder.length - 1);
}

function buildSequentialFallback(agentFileNames: string[]): {
  steps: ExecutionStep[];
  agentOrder: string[];
} {
  const steps: ExecutionStep[] = agentFileNames.map((name, i) => ({
    agentId: name,
    parallel: false,
    dependsOn: i === 0 ? [] : [agentFileNames[i - 1]],
  }));
  return { steps, agentOrder: [...agentFileNames] };
}

/**
 * Parse modes table from skill.md
 * | 사용자 요청 패턴 | 실행 모드 | 투입 에이전트 |
 */
function parseModesTable(body: string, agentFileNames: string[]): SkillMode[] {
  // Find the modes section
  const modesSection =
    extractSection(body, "작업 규모별 모드") ||
    extractSection(body, "실행 모드") ||
    extractSection(body, "Modes by Scope") ||
    extractSection(body, "Execution Modes") ||
    "";

  if (!modesSection) return buildDefaultModes(agentFileNames);

  const tableRegex = /\|[^\n]*(?:요청|모드|패턴|Request|Mode|Pattern|Trigger)[^\n]*\|\n\|[-| ]+\n((?:\|[^\n]*\n)*)/;
  const match = modesSection.match(tableRegex);

  if (!match) return buildDefaultModes(agentFileNames);

  const rows = match[1].trim().split("\n").filter((r) => r.trim().startsWith("|"));
  const modes: SkillMode[] = [];

  for (const row of rows) {
    const cells = row
      .split("|")
      .map((c) => c.trim())
      .filter((c) => c.length > 0);
    if (cells.length < 3) continue;

    const triggerPattern = cells[0].replace(/[""]/g, "").trim();
    const modeName = cells[1].replace(/\*\*/g, "").trim();
    const agentsStr = cells[2].trim();

    // Parse agent list
    const modeAgents = parseModeAgents(agentsStr, agentFileNames);

    modes.push({
      name: modeName,
      triggerPattern,
      agents: modeAgents,
    });
  }

  return modes.length > 0 ? modes : buildDefaultModes(agentFileNames);
}

function parseModeAgents(agentsStr: string, agentFileNames: string[]): string[] {
  // Handle special cases
  if (/전원|전체|all\b|everyone|5명/i.test(agentsStr)) {
    return [...agentFileNames];
  }
  if (/단독|alone|solo|only|1명/i.test(agentsStr)) {
    // Find the mentioned agent by matching all name parts
    const lower = agentsStr.toLowerCase();
    for (const name of agentFileNames) {
      const parts = name.split("-");
      // Match if any meaningful part (>3 chars) of the agent name appears
      if (parts.some((p) => p.length > 3 && lower.includes(p))) {
        return [name];
      }
    }
    // Also check common Korean role words
    const roleMap: Record<string, string[]> = {
      "리뷰": ["review"],
      "검증": ["review", "checker"],
      "검토": ["review"],
      "작성": ["writer", "script"],
      "설계": ["design", "architect"],
      "분석": ["analy"],
    };
    for (const [korean, englishParts] of Object.entries(roleMap)) {
      if (lower.includes(korean)) {
        for (const name of agentFileNames) {
          if (englishParts.some((ep) => name.includes(ep))) {
            return [name];
          }
        }
      }
    }
    // Default to last agent (usually reviewer)
    return [agentFileNames[agentFileNames.length - 1]];
  }

  // Parse "agent1 + agent2 + reviewer" or comma-separated
  const refs = agentsStr.split(/[+,、]/).map((s) => s.trim().toLowerCase());
  const agents: string[] = [];
  for (const ref of refs) {
    const agentId = resolveAgentId(ref, agentFileNames);
    if (agentId && !agents.includes(agentId)) {
      agents.push(agentId);
    }
  }

  return agents.length > 0 ? agents : [...agentFileNames];
}

function buildDefaultModes(agentFileNames: string[]): SkillMode[] {
  return [
    {
      name: "풀 파이프라인",
      triggerPattern: "전체 작업 요청",
      agents: [...agentFileNames],
    },
  ];
}

/**
 * Parse extension skills table from skill.md
 */
function parseExtensionSkills(body: string): ExtensionSkill[] {
  const section =
    extractSection(body, "에이전트별 확장 스킬") ||
    extractSection(body, "확장 스킬") ||
    extractSection(body, "Extension Skills per Agent") ||
    extractSection(body, "Extension Skills") ||
    "";

  if (!section) return [];

  const tableRegex = /\|[^\n]*(?:스킬|Skill)[^\n]*\|\n\|[-| ]+\n((?:\|[^\n]*\n)*)/;
  const match = section.match(tableRegex);
  if (!match) return [];

  const rows = match[1].trim().split("\n").filter((r) => r.trim().startsWith("|"));
  const skills: ExtensionSkill[] = [];

  for (const row of rows) {
    const cells = row
      .split("|")
      .map((c) => c.trim())
      .filter((c) => c.length > 0);
    if (cells.length < 4) continue;

    skills.push({
      name: cells[0].trim(),
      path: cells[1].trim().replace(/`/g, ""),
      targetAgent: cells[2].trim(),
      description: cells[3].trim(),
    });
  }

  return skills;
}

/**
 * Extract trigger conditions from skill description
 */
function extractTriggerConditions(description: string): string[] {
  // Extract quoted strings from description
  const triggers: string[] = [];
  const quoteMatches = description.match(/'[^']+'/g) ?? [];
  for (const q of quoteMatches) {
    triggers.push(q.slice(1, -1));
  }
  return triggers;
}

/**
 * Extract output template from agent body
 */
function extractOutputTemplate(body: string): string {
  const section = extractSection(body, "산출물 포맷") || extractSection(body, "산출물") || extractSection(body, "Output Format") || extractSection(body, "Output");
  if (!section) return "";

  // Extract the markdown code block (may contain nested code blocks)
  // Use a greedy approach to find ```markdown ... ``` at the outermost level
  const codeBlockStart = section.indexOf("```markdown");
  if (codeBlockStart !== -1) {
    const afterStart = codeBlockStart + "```markdown".length;
    // Find the closing ``` that is at the start of a line (not nested)
    const remaining = section.slice(afterStart);
    const closingMatch = remaining.match(/\n```\s*$/m);
    if (closingMatch && closingMatch.index !== undefined) {
      return remaining.slice(0, closingMatch.index).trim();
    }
    // If no closing found, take everything
    return remaining.trim();
  }

  // Try indented block (4 spaces)
  const indentedLines: string[] = [];
  let inBlock = false;
  for (const line of section.split("\n")) {
    if (line.startsWith("    ") || (inBlock && line.trim() === "")) {
      inBlock = true;
      indentedLines.push(line.replace(/^ {4}/, ""));
    } else if (inBlock) {
      break;
    }
  }
  if (indentedLines.length > 3) {
    return indentedLines.join("\n").trim();
  }

  // Return section content after the file path line
  const lines = section.split("\n");
  const startIdx = lines.findIndex((l) => l.includes("파일로 저장") || l.includes("save to file") || l.includes("Save to"));
  if (startIdx >= 0) {
    const content = lines.slice(startIdx + 1).join("\n").trim();
    // Remove leading/trailing code fences
    return content.replace(/^```\w*\n?/, "").replace(/\n?```\s*$/, "").trim();
  }

  return section.slice(0, 1000);
}

// ---------------------------------------------------------------------------
// Harness directory parser
// ---------------------------------------------------------------------------

function parseHarnessDir(dirPath: string, meta: (typeof HARNESS_META)[number]): Harness {
  const claudeDir = join(dirPath, ".claude");
  const agentsDir = join(claudeDir, "agents");
  const skillsDir = join(claudeDir, "skills");

  // --- Parse CLAUDE.md ---
  const claudeMdPath = join(claudeDir, "CLAUDE.md");
  const claudeMd = readFileSync(claudeMdPath, "utf-8");
  const { body: claudeBody } = parseFrontmatter(claudeMd);

  // Extract description from CLAUDE.md first paragraph
  const descMatch = claudeBody.match(/^#[^\n]+\n+([^\n#]+)/);
  const description = descMatch ? descMatch[1].trim() : meta.name;

  // --- Parse agent files ---
  const agentFiles = readdirSync(agentsDir)
    .filter((f) => f.endsWith(".md"))
    .sort();

  const agentFileNames = agentFiles.map((f) => f.replace(".md", ""));
  const agents: Agent[] = [];

  for (const file of agentFiles) {
    const content = readFileSync(join(agentsDir, file), "utf-8");
    const { meta: agentMeta, body: agentBody } = parseFrontmatter(content);
    const agentId = file.replace(".md", "");

    // Extract role from header: "# Name — Korean Role"
    const headerMatch = agentBody.match(/^#\s+.+?—\s*(.+)$/m);
    const role = headerMatch ? headerMatch[1].trim() : agentMeta.description?.split(".")[0] ?? agentId;

    // Extract tools
    const tools = extractTools(agentBody);

    // Extract output template
    const outputTemplate = extractOutputTemplate(agentBody);

    agents.push({
      id: agentId,
      name: agentMeta.name ?? agentId,
      role,
      description: agentMeta.description ?? "",
      tools,
      outputTemplate,
      dependencies: [], // Will be filled from skill workflow
    });
  }

  // --- Parse main skill file ---
  const mainSkillDir = join(skillsDir, meta.slug);
  const mainSkillPath = join(mainSkillDir, "skill.md");

  let skill: Skill;

  if (existsSync(mainSkillPath)) {
    const skillContent = readFileSync(mainSkillPath, "utf-8");
    const { meta: skillMeta, body: skillBody } = parseFrontmatter(skillContent);

    // Parse workflow
    const { steps } = parseWorkflowTable(skillBody, agentFileNames);

    // Update agent dependencies from workflow steps
    for (const step of steps) {
      const agent = agents.find((a) => a.id === step.agentId);
      if (agent) {
        agent.dependencies = [...step.dependsOn];
      }
    }

    // Parse modes
    const modes = parseModesTable(skillBody, agentFileNames);

    // Parse extension skills
    const extensionSkills = parseExtensionSkills(skillBody);

    // Extract trigger conditions
    const triggerConditions = extractTriggerConditions(skillMeta.description ?? "");

    skill = {
      id: `${meta.slug}-skill`,
      name: skillMeta.name ?? `${meta.name} 워크플로`,
      triggerConditions:
        triggerConditions.length > 0
          ? triggerConditions
          : [`${meta.name} 관련 작업 요청`, `/${meta.slug}`],
      executionOrder: steps.length > 0 ? steps : buildSequentialFallback(agentFileNames).steps,
      modes,
      extensionSkills,
    };
  } else {
    // Fallback: no skill file found
    const { steps } = buildSequentialFallback(agentFileNames);
    skill = {
      id: `${meta.slug}-skill`,
      name: `${meta.name} 워크플로`,
      triggerConditions: [`${meta.name} 관련 작업 요청`, `/${meta.slug}`],
      executionOrder: steps,
      modes: buildDefaultModes(agentFileNames),
      extensionSkills: [],
    };
  }

  // --- Collect raw files ---
  const rawAgents: Record<string, string> = {};
  for (const file of agentFiles) {
    rawAgents[file.replace(".md", "")] = readFileSync(join(agentsDir, file), "utf-8");
  }

  const rawSkills: Record<string, string> = {};
  if (existsSync(skillsDir)) {
    const skillDirs = readdirSync(skillsDir).filter((d) =>
      statSync(join(skillsDir, d)).isDirectory(),
    );
    for (const dir of skillDirs) {
      const skillPath = join(skillsDir, dir, "skill.md");
      if (existsSync(skillPath)) {
        rawSkills[`${dir}/skill.md`] = readFileSync(skillPath, "utf-8");
      }
    }
  }

  const rawFiles: RawFiles = {
    claudeMd,
    agents: rawAgents,
    skills: rawSkills,
  };

  // --- Extract frameworks from all content ---
  const allContent = [
    claudeMd,
    ...Object.values(rawAgents),
    ...Object.values(rawSkills),
  ].join("\n");

  const frameworks = extractFrameworks(allContent);

  return {
    id: meta.id,
    slug: meta.slug,
    name: meta.name,
    description,
    category: meta.category,
    agents,
    skill,
    frameworks,
    agentCount: agents.length,
    popularityRank: computePopularityRank(meta.id),
    rawFiles,
  };
}

function readExtensionSkillContents(skillsDir: string, mainSkillSlug: string): string[] {
  if (!existsSync(skillsDir)) return [];

  const contents: string[] = [];
  const dirs = readdirSync(skillsDir).filter((d) => {
    const fullPath = join(skillsDir, d);
    return statSync(fullPath).isDirectory() && d !== mainSkillSlug;
  });

  for (const dir of dirs) {
    const skillPath = join(skillsDir, dir, "skill.md");
    if (existsSync(skillPath)) {
      contents.push(readFileSync(skillPath, "utf-8"));
    }
  }

  return contents;
}

// ---------------------------------------------------------------------------
// Popularity rankings (curated TOP 10, rest by ID order)
// ---------------------------------------------------------------------------

const POPULARITY_TOP_10: ReadonlyMap<number, number> = new Map([
  [16, 1],  // Fullstack Web App
  [21, 2],  // Code Reviewer
  [1, 3],   // YouTube Production
  [43, 4],  // Startup Launcher
  [32, 5],  // Data Analysis
  [41, 6],  // LLM App Builder
  [46, 7],  // Product Manager
  [10, 8],  // Social Media Manager
  [66, 9],  // Contract Analyzer
  [44, 10], // Market Research
]);

function computePopularityRank(id: number): number {
  const topRank = POPULARITY_TOP_10.get(id);
  if (topRank !== undefined) return topRank;

  const topIds = new Set(POPULARITY_TOP_10.keys());
  const remaining = HARNESS_META
    .filter((m) => !topIds.has(m.id))
    .map((m) => m.id)
    .sort((a, b) => a - b);

  const index = remaining.indexOf(id);
  return index + 11;
}

// ---------------------------------------------------------------------------
// File helpers
// ---------------------------------------------------------------------------

function padId(id: number): string {
  return String(id).padStart(2, "0");
}

function ensureDir(dir: string): void {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function writeJson(filePath: string, data: unknown): void {
  writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

// ---------------------------------------------------------------------------
// Locale processing
// ---------------------------------------------------------------------------

function processLocale(
  langDir: string,
  outputDataDir: string,
  locale: string,
): { count: number; errors: string[] } {
  const harnessDir = resolve(outputDataDir, "harness");

  ensureDir(outputDataDir);
  ensureDir(harnessDir);

  const metaList: HarnessMeta[] = [];
  const errors: string[] = [];

  if (!existsSync(langDir)) {
    console.log(`  ⚠ Directory not found: ${langDir} — skipping ${locale}`);
    return { count: 0, errors: [`Directory not found: ${langDir}`] };
  }

  const dirs = readdirSync(langDir)
    .filter((d) => {
      const fullPath = join(langDir, d);
      return statSync(fullPath).isDirectory() && /^\d{2,3}-/.test(d);
    })
    .sort();

  console.log(`  Found ${dirs.length} harness directories for ${locale}`);

  for (const dir of dirs) {
    const dirPath = join(langDir, dir);
    const idMatch = dir.match(/^(\d+)-/);
    if (!idMatch) continue;

    const id = parseInt(idMatch[1], 10);
    const meta = HARNESS_META.find((m) => m.id === id);
    if (!meta) {
      errors.push(`[${locale}] No metadata for harness ${id} (${dir})`);
      continue;
    }

    try {
      const harness = parseHarnessDir(dirPath, meta);

      metaList.push({
        id: harness.id,
        slug: harness.slug,
        name: harness.name,
        description: harness.description,
        category: harness.category,
        agentCount: harness.agentCount,
        frameworks: harness.frameworks,
        popularityRank: harness.popularityRank,
      });

      const fileName = `${padId(id)}.json`;
      writeJson(resolve(harnessDir, fileName), harness);

      console.log(
        `  ✓ [${locale}] ${padId(id)} ${meta.name} — ${harness.agentCount} agents, ${harness.skill.modes.length} modes`,
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`[${locale}] Error parsing ${dir}: ${msg}`);
      console.error(`  ✗ [${locale}] ${padId(id)} ${meta.name} — ${msg}`);
    }
  }

  metaList.sort((a, b) => a.id - b.id);
  writeJson(resolve(outputDataDir, "harnesses.json"), metaList);

  return { count: metaList.length, errors };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  console.log("Step 1: Cloning repository...");

  if (existsSync(TEMP_DIR)) {
    rmSync(TEMP_DIR, { recursive: true, force: true });
  }

  execSync(`git clone --depth 1 ${REPO_URL} ${TEMP_DIR}`, {
    stdio: "pipe",
  });
  console.log("  ✓ Repository cloned");

  const projectRoot = resolve(__dirname, "..");
  const dataDir = resolve(projectRoot, "public", "data");
  const allErrors: string[] = [];

  // Process Korean
  console.log("\nStep 2a: Parsing Korean harnesses...");
  const ko = processLocale(KO_DIR, resolve(dataDir, "ko"), "ko");
  allErrors.push(...ko.errors);

  // Process English
  console.log("\nStep 2b: Parsing English harnesses...");
  const en = processLocale(EN_DIR, resolve(dataDir, "en"), "en");
  allErrors.push(...en.errors);

  console.log(`\nStep 3: Complete!`);
  console.log(`  Korean: ${ko.count} harnesses → public/data/ko/`);
  console.log(`  English: ${en.count} harnesses → public/data/en/`);

  if (allErrors.length > 0) {
    console.log(`\n  ⚠ ${allErrors.length} errors:`);
    for (const err of allErrors) {
      console.log(`    - ${err}`);
    }
  }

  // Cleanup
  console.log("\nStep 4: Cleaning up temp directory...");
  rmSync(TEMP_DIR, { recursive: true, force: true });
  console.log("  ✓ Done");
}

main();
