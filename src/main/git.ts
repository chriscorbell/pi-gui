import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { ChangedFile } from "@shared/contract";

const run = promisify(execFile);

async function git(cwd: string, args: string[]): Promise<string> {
  const { stdout } = await run("git", args, { cwd, maxBuffer: 32 * 1024 * 1024 });
  return stdout;
}

export async function isRepo(cwd: string): Promise<boolean> {
  try {
    await git(cwd, ["rev-parse", "--is-inside-work-tree"]);
    return true;
  } catch {
    return false;
  }
}

/** Working tree against HEAD, including untracked files. */
export async function changedFiles(cwd: string): Promise<ChangedFile[]> {
  if (!(await isRepo(cwd))) return [];
  const out = await git(cwd, ["status", "--porcelain=v1", "-z", "--untracked-files=all"]);
  const parts = out.split("\0");
  const files: ChangedFile[] = [];
  for (let i = 0; i < parts.length; i++) {
    const rec = parts[i];
    if (rec.length < 4) continue;
    const x = rec[0];
    const y = rec[1];
    const path = rec.slice(3);
    if (x === "?" && y === "?") {
      files.push({ path, status: "untracked" });
      continue;
    }
    if (x === "R" || y === "R") {
      const oldPath = parts[++i];
      files.push({ path, status: "renamed", oldPath });
      continue;
    }
    const code = x !== " " ? x : y;
    const status: ChangedFile["status"] = code === "A" ? "added" : code === "D" ? "deleted" : "modified";
    files.push({ path, status });
  }
  files.sort((a, b) => a.path.localeCompare(b.path));
  return files;
}

export async function patchFor(cwd: string, file: ChangedFile): Promise<string> {
  if (file.status === "untracked") {
    try {
      return await git(cwd, ["diff", "--no-index", "--", "/dev/null", file.path]);
    } catch (err) {
      // git diff --no-index exits 1 when there are differences, which is the normal case.
      const e = err as { stdout?: string };
      return e.stdout ?? "";
    }
  }
  return git(cwd, ["diff", "HEAD", "--", file.path, ...(file.oldPath ? [file.oldPath] : [])]);
}

export async function currentBranch(cwd: string): Promise<string | null> {
  try {
    return (await git(cwd, ["rev-parse", "--abbrev-ref", "HEAD"])).trim() || null;
  } catch {
    return null;
  }
}
