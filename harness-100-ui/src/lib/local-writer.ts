import type { Harness, Modification, SetupResult } from "./types";
import { applyModifications, generateAgentMd, generateClaudeMd, generateSkillMd } from "./zip-builder";

export function isFileSystemAccessSupported(): boolean {
  return typeof window !== "undefined" && "showDirectoryPicker" in window;
}

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

export async function setupToLocal(
  harness: Harness,
  modifications?: ReadonlyArray<Modification>,
): Promise<SetupResult> {
  if (!isFileSystemAccessSupported()) {
    return { success: false, filesWritten: 0, path: "", error: "unsupported" };
  }

  try {
    const dirHandle = await window.showDirectoryPicker({ mode: "readwrite" });
    let filesWritten = 0;

    const claudeDir = await getOrCreateDir(dirHandle, ".claude");

    await writeFile(claudeDir, "CLAUDE.md", generateClaudeMd(harness));
    filesWritten++;

    const agentsDir = await getOrCreateDir(claudeDir, "agents");
    const agents = applyModifications(harness.agents, modifications);
    for (const agent of agents) {
      await writeFile(agentsDir, `${agent.id}.md`, generateAgentMd(agent));
      filesWritten++;
    }

    const skillsDir = await getOrCreateDir(claudeDir, "skills");
    const skillDir = await getOrCreateDir(skillsDir, harness.slug);
    await writeFile(skillDir, "skill.md", generateSkillMd(harness));
    filesWritten++;

    return {
      success: true,
      filesWritten,
      path: dirHandle.name,
    };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return { success: false, filesWritten: 0, path: "", error: "cancelled" };
    }
    return {
      success: false,
      filesWritten: 0,
      path: "",
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
