import { accessSync, constants, existsSync, readdirSync } from "node:fs";
import { delimiter, dirname, join } from "node:path";
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

/** Directories where a Node runtime tends to live when it is not on the login PATH. */
function nodeDirs(): string[] {
  const dirs: string[] = [];
  const nvm = join(homedir(), ".nvm/versions/node");
  if (existsSync(nvm)) {
    const versions = readdirSync(nvm).sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
    for (const v of versions) dirs.push(join(nvm, v, "bin"));
  }
  const volta = join(homedir(), ".volta/bin");
  if (existsSync(volta)) dirs.push(volta);
  const brewOpt = "/opt/homebrew/opt";
  if (existsSync(brewOpt)) {
    for (const e of readdirSync(brewOpt)) if (e === "node" || e.startsWith("node@")) dirs.push(join(brewOpt, e, "bin"));
  }
  return dirs;
}

function searchDirs(): string[] {
  return [...(process.env.PATH ?? "").split(delimiter), ...KNOWN_DIRS, ...nodeDirs()].filter(Boolean);
}

/** Find the pi binary. An explicit override wins; otherwise PATH plus the usual macOS locations. */
export function locatePi(override: string | null): string | null {
  if (override && executable(override)) return override;
  for (const dir of searchDirs()) {
    const candidate = join(dir, "pi");
    if (executable(candidate)) return candidate;
  }
  return null;
}

/**
 * Environment for a pi process. A Dock-launched app has the bare system PATH, and `pi` is a
 * script that asks `env` for `node`, so the PATH is widened with pi's own directory and the
 * places Node is installed. The user's PATH keeps precedence.
 */
export function piEnv(piPath: string): NodeJS.ProcessEnv {
  const extra = [dirname(piPath), ...KNOWN_DIRS, ...nodeDirs()];
  const seen = new Set<string>();
  const path = [...(process.env.PATH ?? "").split(delimiter), ...extra].filter((d) => d && !seen.has(d) && seen.add(d)).join(delimiter);
  return { ...process.env, PATH: path, PI_GUI: "1" };
}
