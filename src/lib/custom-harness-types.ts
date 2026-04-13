import type { Agent, Category, Skill } from "./types";

/** Tracks the origin of a reused agent */
export interface AgentSourceRef {
  readonly harnessId: number;
  readonly harnessName: string;
  readonly agentId: string;
}

/** Agent with an enabled toggle for the builder */
export interface CustomAgent extends Agent {
  readonly enabled: boolean;
  readonly sourceRef?: AgentSourceRef;
}

export interface CustomHarness {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly description: string;
  readonly category: Category;
  readonly agents: ReadonlyArray<CustomAgent>;
  readonly skill: Skill;
  readonly frameworks: ReadonlyArray<string>;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly version: number;
  readonly baseHarnessId?: number;
  readonly skillMarkdown?: string;
}

export interface CustomHarnessStore {
  readonly version: 1;
  readonly harnesses: ReadonlyArray<CustomHarness>;
}

export interface BuilderMeta {
  readonly name: string;
  readonly description: string;
  readonly category: Category | "";
}

export interface AgentTemplate {
  readonly name: string;
  readonly role: string;
  readonly description: string;
  readonly instructions?: string;
  readonly tools: ReadonlyArray<string>;
  readonly outputTemplate: string;
  readonly dependencies?: ReadonlyArray<string>;
}
