import { existsSync, readdirSync, statSync, openSync, readSync, closeSync } from "node:fs";
import { homedir } from "node:os";
import { basename, join } from "node:path";
import type { ProjectSummary, SessionSummary } from "@shared/contract";

export const SESSIONS_DIR = join(homedir(), ".pi", "agent", "sessions");

/**
 * Read complete lines from the start of a file until `done` returns true or `maxBytes` is reached.
 * Session lines can be huge (an image paste is one line), so this grows in chunks instead of
 * reading a fixed window.
 */
function readLinesUntil(path: string, done: (line: string) => boolean, maxBytes: number): string[] {
  const fd = openSync(path, "r");
  const out: string[] = [];
  try {
    const chunk = Buffer.alloc(128 * 1024);
    let carry = "";
    let offset = 0;
    while (offset < maxBytes) {
      const n = readSync(fd, chunk, 0, chunk.length, offset);
      if (n === 0) break;
      offset += n;
      carry += chunk.subarray(0, n).toString("utf8");
      let idx: number;
      while ((idx = carry.indexOf("\n")) >= 0) {
        const line = carry.slice(0, idx);
        carry = carry.slice(idx + 1);
        out.push(line);
        if (done(line)) return out;
      }
    }
    if (carry) out.push(carry);
    return out;
  } finally {
    closeSync(fd);
  }
}

/** Read the last `bytes` of a file, for the latest session_info entry. */
function readTail(path: string, bytes: number): string {
  const size = statSync(path).size;
  const start = Math.max(0, size - bytes);
  const fd = openSync(path, "r");
  try {
    const buf = Buffer.alloc(size - start);
    const n = readSync(fd, buf, 0, buf.length, start);
    return buf.subarray(0, n).toString("utf8");
  } finally {
    closeSync(fd);
  }
}

function firstUserText(content: unknown): string | null {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    for (const block of content) {
      if (block && block.type === "text" && typeof block.text === "string") return block.text;
    }
  }
  return null;
}

export function summarizeSession(path: string): SessionSummary | null {
  interface Header { id?: string; cwd?: string; timestamp?: string }
  let header: Header | null = null;
  let title: string | null = null;
  try {
    // Stop at the first user message; that is all the title needs.
    const lines = readLinesUntil(path, (l) => l.includes('"role":"user"'), 32 * 1024 * 1024);
    for (const line of lines) {
      if (!line.trim()) continue;
      let entry: Record<string, unknown>;
      try {
        entry = JSON.parse(line);
      } catch {
        break; // partial last line of the head window
      }
      if (entry.type === "session" && !header) {
        header = entry as Header;
        continue;
      }
      if (entry.type === "session_info" && typeof entry.name === "string") title = entry.name;
      if (!title && entry.type === "message") {
        const msg = entry.message as { role?: string; content?: unknown } | undefined;
        if (msg?.role === "user") {
          const text = firstUserText(msg.content);
          if (text) title = text.split("\n")[0].trim().slice(0, 120);
        }
      }
    }
    if (!header?.cwd) return null;
    // A later rename lives at the end of the file.
    const tail = readTail(path, 16 * 1024);
    for (const line of tail.split("\n").reverse()) {
      if (!line.includes('"session_info"')) continue;
      try {
        const entry = JSON.parse(line);
        if (entry.type === "session_info" && typeof entry.name === "string") {
          title = entry.name;
          break;
        }
      } catch {
        /* partial line */
      }
    }
    const st = statSync(path);
    return {
      path,
      id: header.id ?? basename(path),
      cwd: header.cwd,
      title,
      createdAt: header.timestamp ?? st.birthtime.toISOString(),
      modifiedAt: st.mtime.toISOString(),
    };
  } catch {
    return null;
  }
}

/** Projects are the session directories whose working directory still exists, plus any extra cwds passed in. */
export function scanProjects(extraCwds: string[]): ProjectSummary[] {
  const byCwd = new Map<string, ProjectSummary>();
  const ensure = (cwd: string): ProjectSummary => {
    let p = byCwd.get(cwd);
    if (!p) {
      p = { cwd, name: basename(cwd) || cwd, sessions: [], lastActivity: "" };
      byCwd.set(cwd, p);
    }
    return p;
  };
  if (existsSync(SESSIONS_DIR)) {
    for (const dir of readdirSync(SESSIONS_DIR)) {
      const full = join(SESSIONS_DIR, dir);
      let files: string[];
      try {
        files = readdirSync(full).filter((f) => f.endsWith(".jsonl"));
      } catch {
        continue;
      }
      for (const f of files) {
        const s = summarizeSession(join(full, f));
        if (!s || !existsSync(s.cwd)) continue;
        ensure(s.cwd).sessions.push(s);
      }
    }
  }
  for (const cwd of extraCwds) if (existsSync(cwd)) ensure(cwd);
  const projects = [...byCwd.values()];
  for (const p of projects) {
    p.sessions.sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt));
    p.lastActivity = p.sessions[0]?.modifiedAt ?? "";
  }
  projects.sort((a, b) => b.lastActivity.localeCompare(a.lastActivity));
  return projects;
}
