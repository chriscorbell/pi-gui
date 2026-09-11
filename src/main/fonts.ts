import { openSync, readSync, closeSync, readdirSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { join, extname } from "node:path";
import type { SystemFont } from "@shared/contract";

// The Local Font Access API is not exposed in Electron, so family names come straight from the
// installed font files: the `name` table gives the family, `post` and `OS/2` say whether it is
// fixed pitch. Only the table directory and those three tables are read, never whole files.

const ROOTS = [
  "/System/Library/Fonts",
  "/Library/Fonts",
  join(homedir(), "Library/Fonts"),
  // Fonts downloaded on demand through Font Book land here.
  "/System/Library/AssetsV2/com_apple_MobileAsset_Font7",
];
const EXTS = new Set([".ttf", ".otf", ".ttc"]);

let cache: SystemFont[] | null = null;

export function listSystemFonts(): SystemFont[] {
  if (cache) return cache;
  const families = new Map<string, boolean>();
  for (const root of ROOTS) {
    for (const file of walk(root, 5)) {
      for (const face of readFaces(file)) {
        if (!face.family || face.family.startsWith(".")) continue;
        families.set(face.family, (families.get(face.family) ?? false) || face.monospace);
      }
    }
  }
  cache = [...families]
    .map(([family, monospace]) => ({ family, monospace }))
    .sort((a, b) => a.family.localeCompare(b.family, undefined, { sensitivity: "base" }));
  return cache;
}

function* walk(dir: string, depth: number): Generator<string> {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const name of entries) {
    const full = join(dir, name);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      if (depth > 0) yield* walk(full, depth - 1);
    } else if (EXTS.has(extname(name).toLowerCase())) {
      yield full;
    }
  }
}

function readFaces(file: string): { family: string; monospace: boolean }[] {
  let fd: number;
  try {
    fd = openSync(file, "r");
  } catch {
    return [];
  }
  try {
    const head = readAt(fd, 0, 12);
    if (head.length < 12) return [];
    const tag = head.toString("latin1", 0, 4);
    const offsets: number[] = [];
    if (tag === "ttcf") {
      const n = Math.min(head.readUInt32BE(8), 64);
      const table = readAt(fd, 12, n * 4);
      for (let i = 0; i < n; i++) offsets.push(table.readUInt32BE(i * 4));
    } else {
      offsets.push(0);
    }
    const out: { family: string; monospace: boolean }[] = [];
    for (const off of offsets) {
      const face = readFace(fd, off);
      if (face) out.push(face);
    }
    return out;
  } catch {
    return [];
  } finally {
    closeSync(fd);
  }
}

function readFace(fd: number, base: number): { family: string; monospace: boolean } | null {
  const header = readAt(fd, base, 12);
  const version = header.readUInt32BE(0);
  if (version !== 0x00010000 && version !== 0x4f54544f && version !== 0x74727565) return null; // 1.0, 'OTTO', 'true'
  const numTables = header.readUInt16BE(4);
  const dir = readAt(fd, base + 12, numTables * 16);
  const tables = new Map<string, { offset: number; length: number }>();
  for (let i = 0; i < numTables; i++) {
    const rec = dir.subarray(i * 16, i * 16 + 16);
    tables.set(rec.toString("latin1", 0, 4), { offset: rec.readUInt32BE(8), length: rec.readUInt32BE(12) });
  }
  const name = tables.get("name");
  if (!name) return null;
  const family = parseFamily(readAt(fd, name.offset, Math.min(name.length, 1 << 16)));
  if (!family) return null;
  let monospace = false;
  const post = tables.get("post");
  if (post && post.length >= 16) monospace = readAt(fd, post.offset, 16).readUInt32BE(12) !== 0;
  const os2 = tables.get("OS/2");
  if (!monospace && os2 && os2.length >= 42) monospace = readAt(fd, os2.offset, 42)[32 + 3] === 9; // PANOSE proportion: monospaced
  return { family, monospace };
}

function parseFamily(buf: Buffer): string | null {
  if (buf.length < 6) return null;
  const count = buf.readUInt16BE(2);
  const strings = buf.readUInt16BE(4);
  // Prefer the typographic family (16) over the legacy family (1), and Unicode/Windows over Mac.
  const candidates: { score: number; text: string }[] = [];
  for (let i = 0; i < count; i++) {
    const rec = 6 + i * 12;
    if (rec + 12 > buf.length) break;
    const platform = buf.readUInt16BE(rec);
    const encoding = buf.readUInt16BE(rec + 2);
    const language = buf.readUInt16BE(rec + 4);
    const id = buf.readUInt16BE(rec + 6);
    if (id !== 1 && id !== 16) continue;
    const length = buf.readUInt16BE(rec + 8);
    const offset = strings + buf.readUInt16BE(rec + 10);
    if (offset + length > buf.length) continue;
    const bytes = buf.subarray(offset, offset + length);
    let text: string;
    let score = id === 16 ? 10 : 0;
    if (platform === 3 && (encoding === 1 || encoding === 10)) {
      text = utf16be(bytes);
      score += language === 0x409 ? 3 : 2;
    } else if (platform === 0) {
      text = utf16be(bytes);
      score += 2;
    } else if (platform === 1 && encoding === 0) {
      text = bytes.toString("latin1");
      score += language === 0 ? 1 : 0;
    } else {
      continue;
    }
    text = text.trim();
    if (text) candidates.push({ score, text });
  }
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0]?.text ?? null;
}

function utf16be(bytes: Buffer): string {
  const swapped = Buffer.from(bytes);
  swapped.swap16();
  return swapped.toString("utf16le");
}

function readAt(fd: number, position: number, length: number): Buffer {
  const buf = Buffer.alloc(length);
  const n = readSync(fd, buf, 0, length, position);
  return n === length ? buf : buf.subarray(0, n);
}
