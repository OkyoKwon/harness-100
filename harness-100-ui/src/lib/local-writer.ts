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

function hasModifications(
  agentId: string,
  modifications?: ReadonlyArray<Modification>,
): boolean {
  if (!modifications) return false;
  return modifications.some((m) => m.agentId === agentId);
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
    const raw = harness.rawFiles;

    const claudeDir = await getOrCreateDir(dirHandle, ".claude");

    // CLAUDE.md — use original if available (consistent with zip-builder)
    await writeFile(claudeDir, "CLAUDE.md", raw?.claudeMd ?? generateClaudeMd(harness));
    filesWritten++;

    // Agents — use original if no modifications
    const agentsDir = await getOrCreateDir(claudeDir, "agents");
    const agents = applyModifications(harness.agents, modifications);
    for (const agent of agents) {
      const rawContent = raw?.agents?.[agent.id];
      if (rawContent && !hasModifications(agent.id, modifications)) {
        await writeFile(agentsDir, `${agent.id}.md`, rawContent);
      } else {
        await writeFile(agentsDir, `${agent.id}.md`, generateAgentMd(agent));
      }
      filesWritten++;
    }

    // Skills — use original skill files if available (consistent with zip-builder)
    const skillsDir = await getOrCreateDir(claudeDir, "skills");
    if (raw?.skills && Object.keys(raw.skills).length > 0) {
      for (const [path, content] of Object.entries(raw.skills)) {
        if (path.includes("..") || path.startsWith("/")) continue;
        const parts = path.split("/");
        const dirName = parts[0];
        const fileName = parts.slice(1).join("/");
        if (!dirName || !fileName) continue;
        const dir = await getOrCreateDir(skillsDir, dirName);
        await writeFile(dir, fileName, content);
        filesWritten++;
      }
    } else {
      const skillDir = await getOrCreateDir(skillsDir, harness.slug);
      await writeFile(skillDir, "skill.md", generateSkillMd(harness));
      filesWritten++;
    }

    return {
      success: true,
      filesWritten,
      path: dirHandle.name,
    };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return { success: false, filesWritten: 0, path: "", error: "cancelled" };
    }
    console.error("Local setup failed:", err);
    return {
      success: false,
      filesWritten: 0,
      path: "",
      error: "파일 쓰기에 실패했습니다.",
    };
  }
}
