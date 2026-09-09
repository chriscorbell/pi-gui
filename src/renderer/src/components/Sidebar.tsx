import { useMemo } from "react";
import { ChevronRight, FolderOpen, Plus } from "lucide-react";
import type { SessionStatus } from "@shared/contract";
import { keyForPath, useApp } from "@/store/app";
import { IconButton, Spinner } from "@/components/ui";
import { cn, relativeTime } from "@/lib/utils";

function StatusDot({ status }: { status: SessionStatus | "off" }) {
  if (status === "working") return <Spinner className="h-3 w-3 text-fg-muted" />;
  if (status === "needs-input") return <span className="anim-pulse h-2 w-2 rounded-full bg-warn" />;
  if (status === "unread") return <span className="h-2 w-2 rounded-full bg-accent" />;
  return <span className="h-2 w-2 rounded-full bg-transparent" />;
}

export function Sidebar() {
  const projects = useApp((s) => s.projects);
  const live = useApp((s) => s.live);
  const sessions = useApp((s) => s.sessions);
  const selectedKey = useApp((s) => s.selectedKey);
  const settings = useApp((s) => s.settings);
  const update = useApp((s) => s.updateSettings);
  const openSession = useApp((s) => s.openSession);
  const selectSession = useApp((s) => s.selectSession);
  const openFolder = useApp((s) => s.openFolder);

  // Sessions that exist only as a live process (new, no file listed yet).
  const pendingByCwd = useMemo(() => {
    const listed = new Set(projects.flatMap((p) => p.sessions.map((s) => s.path)));
    const out: Record<string, { key: string }[]> = {};
    for (const l of Object.values(live)) {
      if (l.path && listed.has(l.path)) continue;
      if (!sessions[l.key]) continue;
      (out[l.cwd] ??= []).push({ key: l.key });
    }
    return out;
  }, [projects, live, sessions]);

  const allCwds = useMemo(() => {
    const set = new Set(projects.map((p) => p.cwd));
    for (const cwd of Object.keys(pendingByCwd)) set.add(cwd);
    return [...set];
  }, [projects, pendingByCwd]);

  const collapsed = new Set(settings.collapsedProjects);
  const toggle = (cwd: string) => {
    const next = new Set(collapsed);
    if (next.has(cwd)) next.delete(cwd);
    else next.add(cwd);
    void update({ collapsedProjects: [...next] });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-2 pt-2 pb-4">
        {allCwds.length === 0 && (
          <div className="px-3 pt-10 text-center text-[12.5px] text-fg-muted">
            No projects yet.
            <div className="mt-1 text-fg-faint">Open a folder to start a session.</div>
          </div>
        )}
        {allCwds.map((cwd) => {
          const project = projects.find((p) => p.cwd === cwd);
          const name = project?.name ?? cwd.split("/").filter(Boolean).pop() ?? cwd;
          const pending = pendingByCwd[cwd] ?? [];
          const rows = [
            ...pending.map((p) => ({ key: p.key, path: null as string | null, title: "New session", modifiedAt: null as string | null })),
            ...(project?.sessions ?? []).map((s) => ({ key: keyForPath(live, s.path), path: s.path, title: s.title, modifiedAt: s.modifiedAt })),
          ];
          const isCollapsed = collapsed.has(cwd);
          const attention = rows.filter((r) => {
            const st = live[r.key]?.status;
            return st === "unread" || st === "needs-input";
          }).length;
          return (
            <div key={cwd} className="mb-1">
              <div className="group flex h-7 items-center gap-1 rounded-md pr-1 pl-1 text-[12px] hover:bg-hover">
                <button onClick={() => toggle(cwd)} className="flex min-w-0 flex-1 items-center gap-1 text-left" title={cwd}>
                  <ChevronRight className={cn("h-3.5 w-3.5 shrink-0 text-fg-faint transition-transform duration-150", !isCollapsed && "rotate-90")} strokeWidth={2} />
                  <span className="truncate font-medium text-fg-muted">{name}</span>
                  {isCollapsed && attention > 0 && (
                    <span className="ml-1 rounded-full bg-accent px-1.5 text-[10px] font-semibold leading-4 text-accent-fg">{attention}</span>
                  )}
                </button>
                <IconButton label="New session here" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => void openSession(cwd, null)}>
                  <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                </IconButton>
              </div>
              {!isCollapsed && (
                <div className="mt-0.5 ml-2 flex flex-col gap-px border-l border-border pl-1">
                  {rows.length === 0 && <div className="px-2 py-1 text-[12px] text-fg-faint">No sessions</div>}
                  {rows.map((r) => {
                    const st = live[r.key];
                    const status: SessionStatus | "off" = st ? st.status : "off";
                    const selected = selectedKey === r.key;
                    const emphasized = status === "unread" || status === "needs-input";
                    return (
                      <button
                        key={r.key}
                        onClick={() => {
                          if (sessions[r.key]) void selectSession(r.key);
                          else if (r.path) void openSession(cwd, r.path);
                        }}
                        className={cn(
                          "flex h-7 w-full items-center gap-2 rounded-md px-2 text-left text-[12.5px] transition-colors duration-100",
                          selected ? "bg-active text-fg" : "text-fg-muted hover:bg-hover hover:text-fg",
                          emphasized && !selected && "text-fg",
                        )}
                      >
                        <span className="flex h-3 w-3 shrink-0 items-center justify-center">
                          <StatusDot status={status} />
                        </span>
                        <span className={cn("min-w-0 flex-1 truncate", emphasized && "font-medium")}>{r.title ?? "Empty session"}</span>
                        {r.modifiedAt && <span className="shrink-0 text-[10.5px] tabular-nums text-fg-faint">{relativeTime(r.modifiedAt)}</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="border-t border-border p-2">
        <button
          onClick={() => void openFolder()}
          className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-[12.5px] text-fg-muted transition-colors hover:bg-hover hover:text-fg"
        >
          <FolderOpen className="h-4 w-4" strokeWidth={1.75} />
          Open folder
        </button>
      </div>
    </div>
  );
}
