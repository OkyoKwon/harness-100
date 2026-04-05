export type Category =
  | "content"
  | "development"
  | "data-ai"
  | "business"
  | "education"
  | "legal"
  | "lifestyle"
  | "communication"
  | "operations"
  | "specialized";

export interface Agent {
  readonly id: string;
  readonly name: string;
  readonly role: string;
  readonly description: string;
  readonly tools: ReadonlyArray<string>;
  readonly outputTemplate: string;
  readonly dependencies: ReadonlyArray<string>;
}

export interface ExecutionStep {
  readonly agentId: string;
  readonly parallel: boolean;
  readonly dependsOn: ReadonlyArray<string>;
}

export type ExecutionPlan = ReadonlyArray<ExecutionStep>;

export interface SkillMode {
  readonly name: string;
  readonly triggerPattern: string;
  readonly agents: ReadonlyArray<string>;
}

export interface ExtensionSkill {
  readonly name: string;
  readonly path: string;
  readonly targetAgent: string;
  readonly description: string;
}

export interface Skill {
  readonly id: string;
  readonly name: string;
  readonly triggerConditions: ReadonlyArray<string>;
  readonly executionOrder: ReadonlyArray<ExecutionStep>;
  readonly modes: ReadonlyArray<SkillMode>;
  readonly extensionSkills: ReadonlyArray<ExtensionSkill>;
}

export interface RawFiles {
  readonly claudeMd: string;
  readonly agents: Readonly<Record<string, string>>;
  readonly skills: Readonly<Record<string, string>>;
}

export interface Harness {
  readonly id: number;
  readonly slug: string;
  readonly name: string;
  readonly description: string;
  readonly category: Category;
  readonly agents: ReadonlyArray<Agent>;
  readonly skill: Skill;
  readonly frameworks: ReadonlyArray<string>;
  readonly agentCount: number;
  readonly popularityRank: number;
  readonly rawFiles?: RawFiles;
}

export interface HarnessMeta {
  readonly id: number;
  readonly slug: string;
  readonly name: string;
  readonly description: string;
  readonly category: Category;
  readonly agentCount: number;
  readonly frameworks: ReadonlyArray<string>;
  readonly popularityRank: number;
}

export interface Modification {
  readonly agentId: string;
  readonly field: "name" | "role" | "description" | "outputTemplate" | "enabled";
  readonly value: string | boolean;
}

export interface LocalCustomization {
  readonly baseHarnessId: number;
  readonly modifications: ReadonlyArray<Modification>;
  readonly createdAt: string;
}

export interface DemoStepOutput {
  readonly title: string;
  readonly snippet: string;
}

export interface DemoStep {
  readonly agentId: string;
  readonly action: string;
  readonly durationMs: number;
  readonly toolsUsed: ReadonlyArray<string>;
  readonly output: DemoStepOutput;
}

export interface DemoScenario {
  readonly id: string;
  readonly title: string;
  readonly userPrompt: string;
  readonly steps: ReadonlyArray<DemoStep>;
}

export type Favorites = ReadonlyArray<number>;

export interface RecentPath {
  readonly path: string;
  readonly lastUsed: string;
  readonly harnessIds: ReadonlyArray<number>;
}

export type ConflictResolution = "overwrite" | "skip" | "merge";

export interface FileConflict {
  readonly path: string;
  readonly type: "claudeMd" | "agent" | "skill";
  readonly resolution: ConflictResolution;
}

export interface ConflictReport {
  readonly conflicts: ReadonlyArray<FileConflict>;
  readonly dirHandle: FileSystemDirectoryHandle;
}

export interface SetupResult {
  readonly success: boolean;
  readonly filesWritten: number;
  readonly filesSkipped: number;
  readonly filesMerged: number;
  readonly path: string;
  readonly error?: string;
}
