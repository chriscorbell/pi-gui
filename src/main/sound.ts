import { execFile } from "node:child_process";
import { loadSettings } from "./settings";

const SOUNDS = {
  turnEnd: "/System/Library/Sounds/Glass.aiff",
  needsInput: "/System/Library/Sounds/Ping.aiff",
} as const;

export function play(kind: keyof typeof SOUNDS): void {
  if (loadSettings().muted) return;
  if (process.platform !== "darwin") return;
  execFile("afplay", [SOUNDS[kind]], () => {});
}
