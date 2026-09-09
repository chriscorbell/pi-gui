import { accessSync, constants } from "node:fs";
import { delimiter, join } from "node:path";
import { homedir } from "node:os";

const KNOWN_DIRS = ["/opt/homebrew/bin", "/usr/local/bin", join(homedir(), ".local/bin"), join(homedir(), ".npm-global/bin")];

function executable(path: string): boolean {
  try {
    accessSync(path, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

/** Find the pi binary. An explicit override wins; otherwise PATH plus the usual macOS locations. */
export function locatePi(override: string | null): string | null {
  if (override && executable(override)) return override;
  const dirs = [...(process.env.PATH ?? "").split(delimiter), ...KNOWN_DIRS].filter(Boolean);
  for (const dir of dirs) {
    const candidate = join(dir, "pi");
    if (executable(candidate)) return candidate;
  }
  return null;
}
