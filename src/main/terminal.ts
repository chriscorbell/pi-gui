import { EventEmitter } from "node:events";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import * as pty from "node-pty";

export interface TerminalEvents {
  data: [{ id: string; data: string }];
  exit: [{ id: string; exitCode: number }];
}

interface Term {
  id: string;
  proc: pty.IPty;
  cwd: string;
}

function defaultShell(): string {
  const fromEnv = process.env.SHELL;
  if (fromEnv && existsSync(fromEnv)) return fromEnv;
  return "/bin/zsh";
}

/** One login shell per Session, started in the project directory. Plain shell, nothing injected. */
export class TerminalHost extends EventEmitter<TerminalEvents> {
  private terms = new Map<string, Term>();

  open(id: string, cwd: string, cols: number, rows: number): { id: string; created: boolean } {
    const existing = this.terms.get(id);
    if (existing) return { id, created: false };
    const shell = defaultShell();
    const proc = pty.spawn(shell, ["-l"], {
      name: "xterm-256color",
      cols: Math.max(2, cols),
      rows: Math.max(2, rows),
      cwd: existsSync(cwd) ? cwd : homedir(),
      env: { ...process.env, TERM: "xterm-256color", TERM_PROGRAM: "pi-gui", COLORTERM: "truecolor" } as Record<string, string>,
    });
    const term: Term = { id, proc, cwd };
    console.log(`[terminal] spawned ${shell} pid ${proc.pid} in ${cwd}`);
    this.terms.set(id, term);
    proc.onData((data) => this.emit("data", { id, data }));
    proc.onExit(({ exitCode }) => {
      this.terms.delete(id);
      this.emit("exit", { id, exitCode });
    });
    return { id, created: true };
  }

  write(id: string, data: string): void {
    this.terms.get(id)?.proc.write(data);
  }

  resize(id: string, cols: number, rows: number): void {
    const t = this.terms.get(id);
    if (!t) return;
    try {
      t.proc.resize(Math.max(2, cols), Math.max(2, rows));
    } catch {
      /* the pty may have exited between the check and the call */
    }
  }

  close(id: string): void {
    const t = this.terms.get(id);
    if (!t) return;
    this.terms.delete(id);
    t.proc.kill();
  }

  has(id: string): boolean {
    return this.terms.has(id);
  }

  shutdown(): void {
    for (const id of [...this.terms.keys()]) this.close(id);
  }
}
