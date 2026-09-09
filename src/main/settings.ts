import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { DEFAULT_SETTINGS, type GuiSettings } from "@shared/contract";

const DIR = join(homedir(), ".pi", "gui");
const FILE = join(DIR, "settings.json");

let cache: GuiSettings | null = null;

export function loadSettings(): GuiSettings {
  if (cache) return cache;
  try {
    const raw = JSON.parse(readFileSync(FILE, "utf8"));
    cache = { ...DEFAULT_SETTINGS, ...raw };
  } catch {
    cache = { ...DEFAULT_SETTINGS };
  }
  return cache!;
}

export function saveSettings(patch: Partial<GuiSettings>): GuiSettings {
  const next = { ...loadSettings(), ...patch };
  cache = next;
  mkdirSync(DIR, { recursive: true });
  writeFileSync(FILE, JSON.stringify(next, null, 2) + "\n");
  return next;
}
