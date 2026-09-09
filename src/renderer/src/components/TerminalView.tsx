import { useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import { bridge } from "@/lib/bridge";

function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function themeFromTokens() {
  const dark = document.documentElement.classList.contains("dark");
  return {
    background: cssVar("--bg-sunken") || (dark ? "#101011" : "#fafafa"),
    foreground: cssVar("--fg"),
    cursor: cssVar("--fg"),
    cursorAccent: cssVar("--bg-sunken"),
    selectionBackground: dark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.14)",
    black: dark ? "#1c1c1f" : "#2e2e33",
    brightBlack: dark ? "#5c5c66" : "#7a7a85",
    red: "#e5484d",
    green: "#46a758",
    yellow: "#d4a72c",
    blue: "#5b8def",
    magenta: "#b26bd9",
    cyan: "#3aa9b5",
    white: dark ? "#d8d8dc" : "#3a3a40",
    brightWhite: dark ? "#f4f4f5" : "#18181b",
  };
}

// Terminals live as long as the pty in main. The xterm instance is kept per Session so switching
// tabs or Sessions does not lose scrollback on the renderer side.
// xterm's open() may only run once per Terminal, so each instance owns a host element that is
// reparented into whichever container is mounted.
const instances = new Map<string, { term: Terminal; fit: FitAddon; host: HTMLDivElement; opened: boolean }>();

let listenersBound = false;
function bindListeners() {
  if (listenersBound) return;
  listenersBound = true;
  bridge.events.onTerminalData(({ id, data }) => instances.get(id)?.term.write(data));
  bridge.events.onTerminalExit(({ id, exitCode }) => {
    const inst = instances.get(id);
    if (!inst) return;
    inst.term.writeln(`\r\n\x1b[2m[shell exited with code ${exitCode}]\x1b[0m`);
    inst.opened = false;
  });
}

export function TerminalView({ sessionKey, cwd }: { sessionKey: string; cwd: string }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bindListeners();
    const el = hostRef.current;
    if (!el) return;
    let inst = instances.get(sessionKey);
    if (!inst) {
      const term = new Terminal({
        fontFamily: cssVar("--font-mono") || "Menlo, monospace",
        fontSize: 13,
        lineHeight: 1.25,
        cursorBlink: true,
        cursorStyle: "bar",
        scrollback: 5000,
        allowProposedApi: true,
        macOptionIsMeta: true,
        theme: themeFromTokens(),
      });
      const fit = new FitAddon();
      term.loadAddon(fit);
      const host = document.createElement("div");
      host.className = "h-full w-full";
      inst = { term, fit, host, opened: false };
      instances.set(sessionKey, inst);
      el.appendChild(host);
      term.open(host);
      term.onData((data) => void bridge.terminal.write(sessionKey, data));
      term.onResize(({ cols, rows }) => void bridge.terminal.resize(sessionKey, cols, rows));
    }
    const { term, fit, host } = inst;
    if (host.parentElement !== el) el.appendChild(host);
    term.options.theme = themeFromTokens();
    fit.fit();
    if (!inst.opened) {
      inst.opened = true;
      void bridge.terminal.open(sessionKey, cwd, term.cols, term.rows).then(({ created }) => {
        if (!created) fit.fit();
      });
    }
    term.focus();

    const ro = new ResizeObserver(() => {
      try {
        fit.fit();
      } catch {
        /* container not laid out yet */
      }
    });
    ro.observe(el);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onTheme = () => (term.options.theme = themeFromTokens());
    mq.addEventListener("change", onTheme);
    const observer = new MutationObserver(onTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => {
      ro.disconnect();
      mq.removeEventListener("change", onTheme);
      observer.disconnect();
      // Detach the host element but keep the instance and its scrollback.
      host.remove();
    };
  }, [sessionKey, cwd]);

  return <div ref={hostRef} className="h-full w-full px-2 pt-1" />;
}

export function disposeTerminal(sessionKey: string): void {
  const inst = instances.get(sessionKey);
  if (!inst) return;
  inst.term.dispose();
  instances.delete(sessionKey);
}
