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

export interface Skill {
  readonly id: string;
  readonly name: string;
  readonly triggerConditions: ReadonlyArray<string>;
  readonly executionOrder: ReadonlyArray<ExecutionStep>;
  readonly modes: {
    readonly full: ExecutionPlan;
    readonly reduced: ExecutionPlan;
    readonly single: ExecutionPlan;
  };
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
}

export interface HarnessMeta {
  readonly id: number;
  readonly slug: string;
  readonly name: string;
  readonly description: string;
  readonly category: Category;
  readonly agentCount: number;
  readonly frameworks: ReadonlyArray<string>;
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

export type Favorites = ReadonlyArray<number>;

export interface RecentPath {
  readonly path: string;
  readonly lastUsed: string;
  readonly harnessIds: ReadonlyArray<number>;
}

export interface SetupResult {
  readonly success: boolean;
  readonly filesWritten: number;
  readonly path: string;
  readonly error?: string;
}
