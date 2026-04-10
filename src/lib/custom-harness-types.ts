import type { Agent, Category, Skill } from "./types";

/** Agent with an enabled toggle for the builder */
export interface CustomAgent extends Agent {
  readonly enabled: boolean;
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
}

export interface CustomHarnessStore {
  readonly version: 1;
  readonly harnesses: ReadonlyArray<CustomHarness>;
}

export interface BuilderMeta {
  readonly name: string;
  readonly description: string;
  readonly category: Category | "";
  readonly frameworks: ReadonlyArray<string>;
}

export interface AgentTemplate {
  readonly name: string;
  readonly role: string;
  readonly description: string;
  readonly tools: ReadonlyArray<string>;
  readonly outputTemplate: string;
}
