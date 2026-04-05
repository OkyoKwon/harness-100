import type { Locale } from "./locale";
import type {
  ConflictReport,
  ConflictResolution,
  FileConflict,
  Harness,
  Modification,
  SetupResult,
} from "./types";
import { t } from "./translations";
import { applyModifications, generateAgentMd, generateClaudeMd, generateSkillMd } from "./zip-builder";

export function isFileSystemAccessSupported(): boolean {
  return typeof window !== "undefined" && "showDirectoryPicker" in window;
}

// ── Helpers ──

async function writeFile(
  dirHandle: FileSystemDirectoryHandle,
  name: string,
  content: string,
): Promise<void> {
  const fileHandle = await dirHandle.getFileHandle(name, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(content);
  await writable.close();
}

async function getOrCreateDir(
  parent: FileSystemDirectoryHandle,
  name: string,
): Promise<FileSystemDirectoryHandle> {
  return parent.getDirectoryHandle(name, { create: true });
}

async function fileExists(
  dir: FileSystemDirectoryHandle,
  name: string,
): Promise<boolean> {
  try {
    await dir.getFileHandle(name, { create: false });
    return true;
  } catch {
    return false;
  }
}

async function dirExists(
  parent: FileSystemDirectoryHandle,
  name: string,
): Promise<FileSystemDirectoryHandle | null> {
  try {
    return await parent.getDirectoryHandle(name, { create: false });
  } catch {
    return null;
  }
}

async function readFileContent(
  dir: FileSystemDirectoryHandle,
  name: string,
): Promise<string> {
  const handle = await dir.getFileHandle(name, { create: false });
  const file = await handle.getFile();
  return file.text();
}

function hasModifications(
  agentId: string,
  modifications?: ReadonlyArray<Modification>,
): boolean {
  if (!modifications) return false;
  return modifications.some((m) => m.agentId === agentId);
}

function emptyResult(error: string): SetupResult {
  return { success: false, filesWritten: 0, filesSkipped: 0, filesMerged: 0, path: "", error };
}

// ── Public API ──

export async function openProjectDir(): Promise<FileSystemDirectoryHandle> {
  return window.showDirectoryPicker({ mode: "readwrite" });
}

/**
 * Scan the target directory for existing files that would be overwritten.
 */
export async function detectConflicts(
  dirHandle: FileSystemDirectoryHandle,
  harness: Harness,
  modifications?: ReadonlyArray<Modification>,
): Promise<ConflictReport> {
  const conflicts: FileConflict[] = [];

  const claudeDir = await dirExists(dirHandle, ".claude");
  if (!claudeDir) {
    return { conflicts: [], dirHandle };
  }

  // CLAUDE.md
  if (await fileExists(claudeDir, "CLAUDE.md")) {
    conflicts.push({ path: ".claude/CLAUDE.md", type: "claudeMd", resolution: "merge" });
  }

  // Agents
  const agentsDir = await dirExists(claudeDir, "agents");
  if (agentsDir) {
    const agents = applyModifications(harness.agents, modifications);
    for (const agent of agents) {
      if (await fileExists(agentsDir, `${agent.id}.md`)) {
        conflicts.push({
          path: `.claude/agents/${agent.id}.md`,
          type: "agent",
          resolution: "overwrite",
        });
      }
    }
  }

  // Skills
  const skillsDir = await dirExists(claudeDir, "skills");
  if (skillsDir) {
    const raw = harness.rawFiles;
    if (raw?.skills && Object.keys(raw.skills).length > 0) {
      for (const skillPath of Object.keys(raw.skills)) {
        if (skillPath.includes("..") || skillPath.startsWith("/")) continue;
        const parts = skillPath.split("/");
        const dirName = parts[0];
        const fileName = parts.slice(1).join("/");
        if (!dirName || !fileName) continue;
        const skillSubDir = await dirExists(skillsDir, dirName);
        if (skillSubDir && await fileExists(skillSubDir, fileName)) {
          conflicts.push({
            path: `.claude/skills/${skillPath}`,
            type: "skill",
            resolution: "overwrite",
          });
        }
      }
    } else {
      const skillSubDir = await dirExists(skillsDir, harness.slug);
      if (skillSubDir && await fileExists(skillSubDir, "skill.md")) {
        conflicts.push({
          path: `.claude/skills/${harness.slug}/skill.md`,
          type: "skill",
          resolution: "overwrite",
        });
      }
    }
  }

  return { conflicts, dirHandle };
}

/**
 * Write harness files respecting per-file conflict resolutions.
 */
export async function writeWithResolutions(
  dirHandle: FileSystemDirectoryHandle,
  harness: Harness,
  modifications?: ReadonlyArray<Modification>,
  resolutions?: ReadonlyMap<string, ConflictResolution>,
  locale: Locale = "ko",
): Promise<SetupResult> {
  try {
    let filesWritten = 0;
    let filesSkipped = 0;
    let filesMerged = 0;
    const raw = harness.rawFiles;

    const claudeDir = await getOrCreateDir(dirHandle, ".claude");

    // CLAUDE.md
    const claudeMdResolution = resolutions?.get(".claude/CLAUDE.md");
    if (claudeMdResolution === "skip") {
      filesSkipped++;
    } else {
      const newContent = raw?.claudeMd ?? generateClaudeMd(harness, locale);
      if (claudeMdResolution === "merge") {
        const existing = await readFileContent(claudeDir, "CLAUDE.md");
        await writeFile(claudeDir, "CLAUDE.md", `${existing}\n\n---\n\n${newContent}`);
        filesMerged++;
      } else {
        await writeFile(claudeDir, "CLAUDE.md", newContent);
        filesWritten++;
      }
    }

    // Agents
    const agentsDir = await getOrCreateDir(claudeDir, "agents");
    const agents = applyModifications(harness.agents, modifications);
    for (const agent of agents) {
      const agentPath = `.claude/agents/${agent.id}.md`;
      const resolution = resolutions?.get(agentPath);
      if (resolution === "skip") {
        filesSkipped++;
        continue;
      }
      const rawContent = raw?.agents?.[agent.id];
      if (rawContent && !hasModifications(agent.id, modifications)) {
        await writeFile(agentsDir, `${agent.id}.md`, rawContent);
      } else {
        await writeFile(agentsDir, `${agent.id}.md`, generateAgentMd(agent, locale));
      }
      filesWritten++;
    }

    // Skills
    const skillsDir = await getOrCreateDir(claudeDir, "skills");
    if (raw?.skills && Object.keys(raw.skills).length > 0) {
      for (const [path, content] of Object.entries(raw.skills)) {
        if (path.includes("..") || path.startsWith("/")) continue;
        const parts = path.split("/");
        const dirName = parts[0];
        const fileName = parts.slice(1).join("/");
        if (!dirName || !fileName) continue;
        const skillPath = `.claude/skills/${path}`;
        const resolution = resolutions?.get(skillPath);
        if (resolution === "skip") {
          filesSkipped++;
          continue;
        }
        const dir = await getOrCreateDir(skillsDir, dirName);
        await writeFile(dir, fileName, content);
        filesWritten++;
      }
    } else {
      const skillPath = `.claude/skills/${harness.slug}/skill.md`;
      const resolution = resolutions?.get(skillPath);
      if (resolution === "skip") {
        filesSkipped++;
      } else {
        const skillDir = await getOrCreateDir(skillsDir, harness.slug);
        await writeFile(skillDir, "skill.md", generateSkillMd(harness, locale));
        filesWritten++;
      }
    }

    return { success: true, filesWritten, filesSkipped, filesMerged, path: dirHandle.name };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return emptyResult("cancelled");
    }
    console.error("Local setup failed:", err);
    return emptyResult(t(locale, "error.fileWriteFailed"));
  }
}

/**
 * Backward-compatible convenience wrapper: opens picker and writes directly (no conflict detection).
 */
export async function setupToLocal(
  harness: Harness,
  modifications?: ReadonlyArray<Modification>,
  locale: Locale = "ko",
): Promise<SetupResult> {
  if (!isFileSystemAccessSupported()) {
    return emptyResult("unsupported");
  }

  try {
    const dirHandle = await openProjectDir();
    return writeWithResolutions(dirHandle, harness, modifications, undefined, locale);
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return emptyResult("cancelled");
    }
    console.error("Local setup failed:", err);
    return emptyResult(t(locale, "error.fileWriteFailed"));
  }
}
