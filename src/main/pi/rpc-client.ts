import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { EventEmitter } from "node:events";
import type { PiCommandResult, PiEvent } from "@shared/contract";

interface Pending {
  resolve: (r: PiCommandResult) => void;
  command: string;
}

export interface RpcClientEvents {
  event: [PiEvent];
  exit: [{ code: number | null; signal: NodeJS.Signals | null; stderr: string }];
}

/**
 * One `pi --mode rpc` process. JSON lines over stdio, split on LF only.
 * Node's readline is not protocol compliant (it also splits on U+2028/2029), hence the hand splitter.
 */
export class RpcClient extends EventEmitter<RpcClientEvents> {
  private proc: ChildProcessWithoutNullStreams;
  private buffer = "";
  private pending = new Map<string, Pending>();
  private seq = 0;
  private stderrTail: string[] = [];
  private exited = false;

  constructor(piPath: string, cwd: string, args: string[]) {
    super();
    this.proc = spawn(piPath, ["--mode", "rpc", "--approve", ...args], {
      cwd,
      env: { ...process.env, PI_GUI: "1" },
      stdio: ["pipe", "pipe", "pipe"],
    });
    this.proc.stdout.setEncoding("utf8");
    this.proc.stdout.on("data", (chunk: string) => this.onData(chunk));
    this.proc.stderr.setEncoding("utf8");
    this.proc.stderr.on("data", (chunk: string) => {
      this.stderrTail.push(chunk);
      if (this.stderrTail.length > 50) this.stderrTail.shift();
    });
    this.proc.on("exit", (code, signal) => {
      this.exited = true;
      for (const p of this.pending.values()) p.resolve({ success: false, error: "pi exited" });
      this.pending.clear();
      this.emit("exit", { code, signal, stderr: this.stderrTail.join("").slice(-4000) });
    });
    this.proc.on("error", (err) => {
      this.stderrTail.push(String(err));
    });
  }

  get pid(): number | undefined {
    return this.proc.pid;
  }

  get alive(): boolean {
    return !this.exited;
  }

  private onData(chunk: string): void {
    this.buffer += chunk;
    let idx: number;
    while ((idx = this.buffer.indexOf("\n")) >= 0) {
      let line = this.buffer.slice(0, idx);
      this.buffer = this.buffer.slice(idx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line) continue;
      let msg: Record<string, unknown>;
      try {
        msg = JSON.parse(line);
      } catch {
        continue;
      }
      if (msg.type === "response") {
        const id = typeof msg.id === "string" ? msg.id : undefined;
        const pending = id ? this.pending.get(id) : undefined;
        if (pending) {
          this.pending.delete(id!);
          pending.resolve({ success: msg.success === true, data: msg.data, error: msg.error as string | undefined });
        }
        continue;
      }
      this.emit("event", msg as PiEvent);
    }
  }

  send(command: Record<string, unknown>): Promise<PiCommandResult> {
    if (this.exited) return Promise.resolve({ success: false, error: "pi is not running" });
    const id = `c${++this.seq}`;
    return new Promise((resolve) => {
      this.pending.set(id, { resolve, command: String(command.type) });
      this.proc.stdin.write(JSON.stringify({ ...command, id }) + "\n");
    });
  }

  /** Extension UI responses carry the request id and expect no reply. */
  write(message: Record<string, unknown>): void {
    if (this.exited) return;
    this.proc.stdin.write(JSON.stringify(message) + "\n");
  }

  kill(): void {
    if (this.exited) return;
    this.proc.kill("SIGTERM");
    setTimeout(() => {
      if (!this.exited) this.proc.kill("SIGKILL");
    }, 3000).unref();
  }
}
