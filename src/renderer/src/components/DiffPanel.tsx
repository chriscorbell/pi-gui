import { useCallback, useEffect, useState } from "react";
import { PatchDiff } from "@pierre/diffs/react";
import { FileDiff, RefreshCw } from "lucide-react";
import type { ChangedFile } from "@shared/contract";
import { useApp } from "@/store/app";
import { bridge } from "@/lib/bridge";
import { IconButton, Spinner } from "@/components/ui";
import { cn } from "@/lib/utils";

const STATUS_GLYPH: Record<ChangedFile["status"], { label: string; tone: string }> = {
  modified: { label: "M", tone: "text-warn" },
  added: { label: "A", tone: "text-ok" },
  untracked: { label: "U", tone: "text-ok" },
  deleted: { label: "D", tone: "text-danger" },
  renamed: { label: "R", tone: "text-accent" },
};

export function DiffPanel() {
  const cwd = useApp((s) => (s.selectedKey ? s.sessions[s.selectedKey]?.cwd : undefined));
  const diffStyle = useApp((s) => s.settings.diffStyle);
  const isDark = document.documentElement.classList.contains("dark");
  const [files, setFiles] = useState<ChangedFile[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [patch, setPatch] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!cwd) {
      setFiles([]);
      return;
    }
    setLoading(true);
    const list = await bridge.git.changes(cwd);
    setFiles(list);
    setLoading(false);
    setSelected((cur) => (cur && list.some((f) => f.path === cur) ? cur : list[0]?.path ?? null));
  }, [cwd]);

  useEffect(() => {
    void refresh();
  }, [refresh]);
  useEffect(() => bridge.events.onGitChanged((changed) => changed === cwd && void refresh()), [cwd, refresh]);

  useEffect(() => {
    const file = files.find((f) => f.path === selected);
    if (!cwd || !file) {
      setPatch("");
      return;
    }
    let cancelled = false;
    void bridge.git.patch(cwd, file).then((p) => !cancelled && setPatch(p));
    return () => {
      cancelled = true;
    };
  }, [cwd, files, selected]);

  return (
    <div className="flex h-full flex-col">
      <div className="drag flex h-[52px] shrink-0 items-center gap-2 border-b border-border px-3 text-[13px] font-medium text-fg-muted">
        <FileDiff className="h-3.5 w-3.5" strokeWidth={1.75} />
        <span className="flex-1">Changes</span>
        {loading && <Spinner />}
        <IconButton label="Refresh" className="h-6 w-6" onClick={() => void refresh()}>
          <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.75} />
        </IconButton>
      </div>
      {!cwd ? (
        <div className="p-4 text-[13px] text-fg-faint">Select a session to see its working tree.</div>
      ) : files.length === 0 ? (
        <div className="p-4 text-[13px] text-fg-faint">No changes in the working tree.</div>
      ) : (
        <>
          <div className="max-h-[38%] shrink-0 overflow-y-auto border-b border-border py-1">
            {files.map((f) => {
              const g = STATUS_GLYPH[f.status];
              return (
                <button
                  key={f.path}
                  onClick={() => setSelected(f.path)}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-1 text-left font-mono text-[12.5px] transition-colors",
                    selected === f.path ? "bg-active text-fg" : "text-fg-muted hover:bg-hover hover:text-fg",
                  )}
                >
                  <span className={cn("w-3 shrink-0 text-center font-semibold", g.tone)}>{g.label}</span>
                  <span className="min-w-0 flex-1 truncate" title={f.path}>
                    {f.path}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="min-h-0 flex-1 overflow-auto" data-diff-root>
            {patch ? (
              <PatchDiff
                key={`${selected}-${diffStyle}-${isDark}`}
                patch={patch}
                disableWorkerPool
                options={{
                  diffStyle,
                  theme: isDark ? "pierre-dark" : "pierre-light",
                  hunkSeparators: "simple",
                  disableFileHeader: true,
                }}
              />
            ) : (
              <div className="p-4 text-[13px] text-fg-faint">Binary or empty change.</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
