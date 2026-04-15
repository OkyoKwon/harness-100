import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  isFileSystemAccessSupported,
  detectConflicts,
  writeWithResolutions,
  setupToLocal,
} from "../local-writer";
import type { Harness, ConflictResolution } from "../types";
import { createAgent, createHarness } from "@/test/mocks/harness-fixtures";

// Mock zip-builder exports
vi.mock("../zip-builder", () => ({
  applyModifications: (agents: ReadonlyArray<unknown>) => agents,
  buildAgentSlugMap: (agents: ReadonlyArray<{ id: string }>) =>
    new Map(agents.map((a) => [a.id, a.id])),
  generateAgentMd: (agent: { id: string; name: string }) => `# ${agent.name}`,
  generateClaudeMd: (harness: { name: string }) => `# ${harness.name}`,
  generateSkillMd: (harness: { name: string }) => `# Skill: ${harness.name}`,
}));

// ── Mock Helpers ──

interface MockWritable {
  write: ReturnType<typeof vi.fn>;
  close: ReturnType<typeof vi.fn>;
}

interface MockFileHandle {
  createWritable: ReturnType<typeof vi.fn>;
  getFile: ReturnType<typeof vi.fn>;
}

function createMockWritable(): MockWritable {
  return {
    write: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
  };
}

function createMockFileHandle(content = ""): MockFileHandle {
  const writable = createMockWritable();
  return {
    createWritable: vi.fn().mockResolvedValue(writable),
    getFile: vi.fn().mockResolvedValue({
      text: () => Promise.resolve(content),
    }),
  };
}

function createMockDirHandle(
  name: string,
  existingFiles: Record<string, string> = {},
  existingDirs: Record<string, ReturnType<typeof createMockDirHandle>> = {},
): FileSystemDirectoryHandle {
  const mockFileHandle = createMockFileHandle();

  const handle = {
    name,
    kind: "directory" as const,
    getFileHandle: vi.fn().mockImplementation((fileName: string, opts?: { create?: boolean }) => {
      if (existingFiles[fileName] !== undefined) {
        return Promise.resolve(createMockFileHandle(existingFiles[fileName]));
      }
      if (opts?.create) {
        return Promise.resolve(mockFileHandle);
      }
      return Promise.reject(new DOMException("Not found", "NotFoundError"));
    }),
    getDirectoryHandle: vi.fn().mockImplementation((dirName: string, opts?: { create?: boolean }) => {
      if (existingDirs[dirName]) {
        return Promise.resolve(existingDirs[dirName]);
      }
      if (opts?.create) {
        const newDir = createMockDirHandle(dirName);
        existingDirs[dirName] = newDir;
        return Promise.resolve(newDir);
      }
      return Promise.reject(new DOMException("Not found", "NotFoundError"));
    }),
    isSameEntry: vi.fn(),
    queryPermission: vi.fn(),
    requestPermission: vi.fn(),
    resolve: vi.fn(),
    keys: vi.fn(),
    values: vi.fn(),
    entries: vi.fn(),
    [Symbol.asyncIterator]: vi.fn(),
    forEach: vi.fn(),
  } as unknown as FileSystemDirectoryHandle;

  return handle;
}

function createTestHarness(overrides?: Partial<Harness>): Harness {
  return createHarness({
    slug: "test-harness",
    ...overrides,
  });
}

// ── Tests ──

describe("isFileSystemAccessSupported", () => {
  it("should_returnFalse_when_showDirectoryPickerMissing", () => {
    // Arrange — jsdom does not define showDirectoryPicker by default

    // Act & Assert
    expect(isFileSystemAccessSupported()).toBe(false);
  });

  it("should_returnTrue_when_showDirectoryPickerExists", () => {
    // Arrange
    vi.stubGlobal("showDirectoryPicker", vi.fn());

    // Act & Assert
    expect(isFileSystemAccessSupported()).toBe(true);
  });
});

describe("detectConflicts", () => {
  let harness: Harness;

  beforeEach(() => {
    harness = createTestHarness();
  });

  it("should_returnEmpty_when_noClaueDir", async () => {
    // Arrange
    const rootDir = createMockDirHandle("project");

    // Act
    const report = await detectConflicts(rootDir, harness);

    // Assert
    expect(report.conflicts).toHaveLength(0);
  });

  it("should_detectClaudeMdConflict_when_claudeMdExists", async () => {
    // Arrange
    const claudeDir = createMockDirHandle(".claude", { "CLAUDE.md": "existing" });
    const rootDir = createMockDirHandle("project", {}, { ".claude": claudeDir });

    // Act
    const report = await detectConflicts(rootDir, harness);

    // Assert
    const claudeMdConflict = report.conflicts.find((c) => c.path === ".claude/CLAUDE.md");
    expect(claudeMdConflict).toBeDefined();
    expect(claudeMdConflict?.type).toBe("claudeMd");
    expect(claudeMdConflict?.resolution).toBe("merge");
  });

  it("should_detectAgentConflicts_when_agentFilesExist", async () => {
    // Arrange
    const agent1 = createAgent({ id: "agent-1" });
    const agent2 = createAgent({ id: "agent-2" });
    harness = createTestHarness({ agents: [agent1, agent2] });

    const agentsDir = createMockDirHandle("agents", { "agent-1.md": "existing" });
    const claudeDir = createMockDirHandle(".claude", {}, { agents: agentsDir });
    const rootDir = createMockDirHandle("project", {}, { ".claude": claudeDir });

    // Act
    const report = await detectConflicts(rootDir, harness);

    // Assert
    const agentConflicts = report.conflicts.filter((c) => c.type === "agent");
    expect(agentConflicts).toHaveLength(1);
    expect(agentConflicts[0].path).toBe(".claude/agents/agent-1.md");
    expect(agentConflicts[0].resolution).toBe("overwrite");
  });

  it("should_detectSkillConflict_when_skillFileExists", async () => {
    // Arrange
    const skillSubDir = createMockDirHandle("test-harness", { "skill.md": "existing" });
    const skillsDir = createMockDirHandle("skills", {}, { "test-harness": skillSubDir });
    const claudeDir = createMockDirHandle(".claude", {}, { skills: skillsDir });
    const rootDir = createMockDirHandle("project", {}, { ".claude": claudeDir });

    // Act
    const report = await detectConflicts(rootDir, harness);

    // Assert
    const skillConflicts = report.conflicts.filter((c) => c.type === "skill");
    expect(skillConflicts).toHaveLength(1);
    expect(skillConflicts[0].path).toBe(".claude/skills/test-harness/skill.md");
  });

  it("should_returnNone_when_claudeDirExistsButEmpty", async () => {
    // Arrange
    const claudeDir = createMockDirHandle(".claude");
    const rootDir = createMockDirHandle("project", {}, { ".claude": claudeDir });

    // Act
    const report = await detectConflicts(rootDir, harness);

    // Assert
    expect(report.conflicts).toHaveLength(0);
  });

  it("should_skipPathTraversalSkills_when_rawFilesContainDotDot", async () => {
    // Arrange
    harness = createTestHarness({
      rawFiles: {
        claudeMd: "# Test",
        agents: {},
        skills: { "../evil/skill.md": "malicious" },
      },
    });
    const skillsDir = createMockDirHandle("skills");
    const claudeDir = createMockDirHandle(".claude", {}, { skills: skillsDir });
    const rootDir = createMockDirHandle("project", {}, { ".claude": claudeDir });

    // Act
    const report = await detectConflicts(rootDir, harness);

    // Assert
    const skillConflicts = report.conflicts.filter((c) => c.type === "skill");
    expect(skillConflicts).toHaveLength(0);
  });
});

describe("writeWithResolutions", () => {
  let harness: Harness;

  beforeEach(() => {
    harness = createTestHarness();
  });

  it("should_writeAllFiles_when_noConflicts", async () => {
    // Arrange
    const rootDir = createMockDirHandle("project");

    // Act
    const result = await writeWithResolutions(rootDir, harness);

    // Assert
    expect(result.success).toBe(true);
    expect(result.filesWritten).toBeGreaterThan(0);
    expect(result.path).toBe("project");
  });

  it("should_skipClaudeMd_when_resolutionIsSkip", async () => {
    // Arrange
    const rootDir = createMockDirHandle("project");
    const resolutions = new Map<string, ConflictResolution>([
      [".claude/CLAUDE.md", "skip"],
    ]);

    // Act
    const result = await writeWithResolutions(rootDir, harness, undefined, resolutions);

    // Assert
    expect(result.filesSkipped).toBe(1);
  });

  it("should_mergeClaudeMd_when_resolutionIsMerge", async () => {
    // Arrange — root must already have .claude dir with CLAUDE.md
    const claudeDir = createMockDirHandle(".claude", { "CLAUDE.md": "existing content" });
    const rootDir = createMockDirHandle("project", {}, { ".claude": claudeDir });
    const resolutions = new Map<string, ConflictResolution>([
      [".claude/CLAUDE.md", "merge"],
    ]);

    // Act
    const result = await writeWithResolutions(rootDir, harness, undefined, resolutions);

    // Assert
    expect(result.filesMerged).toBe(1);
  });

  it("should_skipAgent_when_resolutionIsSkip", async () => {
    // Arrange
    const agent = createAgent({ id: "my-agent" });
    harness = createTestHarness({ agents: [agent] });
    const rootDir = createMockDirHandle("project");
    const resolutions = new Map<string, ConflictResolution>([
      [".claude/agents/my-agent.md", "skip"],
    ]);

    // Act
    const result = await writeWithResolutions(rootDir, harness, undefined, resolutions);

    // Assert
    expect(result.filesSkipped).toBeGreaterThanOrEqual(1);
  });

  it("should_handleAbortError_when_userCancels", async () => {
    // Arrange
    const rootDir = createMockDirHandle("project");
    (rootDir.getDirectoryHandle as ReturnType<typeof vi.fn>).mockRejectedValue(
      new DOMException("Aborted", "AbortError"),
    );

    // Act
    const result = await writeWithResolutions(rootDir, harness);

    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe("cancelled");
  });

  it("should_handleGenericError_when_writeThrows", async () => {
    // Arrange
    const rootDir = createMockDirHandle("project");
    (rootDir.getDirectoryHandle as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Disk full"),
    );

    // Act
    const result = await writeWithResolutions(rootDir, harness);

    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe("파일 쓰기에 실패했습니다.");
  });

  it("should_skipPathTraversalSkills_when_writing", async () => {
    // Arrange
    harness = createTestHarness({
      rawFiles: {
        claudeMd: "# Test",
        agents: {},
        skills: {
          "../evil/skill.md": "malicious",
          "/absolute/skill.md": "malicious",
          "valid-skill/skill.md": "valid",
        },
      },
    });
    const rootDir = createMockDirHandle("project");

    // Act
    const result = await writeWithResolutions(rootDir, harness);

    // Assert — only valid-skill should be written (plus CLAUDE.md and agents)
    expect(result.success).toBe(true);
  });
});

describe("setupToLocal", () => {
  it("should_returnUnsupported_when_apiNotAvailable", async () => {
    // Arrange — ensure showDirectoryPicker is absent
    // Delete it from window in case a previous test stubbed it
    delete (window as Record<string, unknown>).showDirectoryPicker;

    // Act
    const result = await setupToLocal(createTestHarness());

    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe("unsupported");
  });

  it("should_returnCancelled_when_userDismissesPicker", async () => {
    // Arrange
    vi.stubGlobal("showDirectoryPicker", vi.fn().mockRejectedValue(
      new DOMException("Aborted", "AbortError"),
    ));

    // Act
    const result = await setupToLocal(createTestHarness());

    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe("cancelled");
  });
});
