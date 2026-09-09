import { useEffect, useState } from "react";
import { Braces, GitBranch, PanelLeft, PanelRight } from "lucide-react";
import { useApp } from "@/store/app";
import { bridge } from "@/lib/bridge";
import { IconButton } from "@/components/ui";
import { cn } from "@/lib/utils";

function BranchBadge({ cwd }: { cwd: string }) {
  const [branch, setBranch] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    const load = () => void bridge.git.branch(cwd).then((b) => !cancelled && setBranch(b));
    load();
    const off = bridge.events.onGitChanged((changed) => changed === cwd && load());
    return () => {
      cancelled = true;
      off();
    };
  }, [cwd]);
  if (!branch) return null;
  return (
    <span className="no-drag flex h-7 items-center gap-1.5 rounded-md border border-border px-2 text-[12.5px] text-fg-muted" title={`Current branch: ${branch}`}>
      <GitBranch className="h-3.5 w-3.5" strokeWidth={2} />
      {branch}
    </span>
  );
}

/** Header of the conversation column: breadcrumb on the left, branch and panel toggle on the right. Session actions live on the sidebar rows. */
export function MainHeader() {
  const settings = useApp((s) => s.settings);
  const update = useApp((s) => s.updateSettings);
  const session = useApp((s) => (s.selectedKey ? s.sessions[s.selectedKey] : undefined));
  const project = useApp((s) => s.projects.find((p) => p.cwd === session?.cwd));

  const projectName = project?.name ?? session?.cwd.split("/").filter(Boolean).pop();
  const title = session ? session.state?.sessionName ?? project?.sessions.find((x) => x.path === session.path)?.title ?? "New session" : null;

  return (
    <header className={cn("drag flex h-[52px] shrink-0 items-center gap-2 pr-3", settings.sidebarCollapsed ? "pl-[88px]" : "pl-4")}>
      {settings.sidebarCollapsed && (
        <IconButton label="Show sidebar (Cmd+B)" onClick={() => void update({ sidebarCollapsed: false })}>
          <PanelLeft className="h-4 w-4" strokeWidth={1.75} />
        </IconButton>
      )}
      <div className="flex min-w-0 flex-1 items-center gap-2 text-[14px]">
        {session && (
          <>
            <Braces className="h-3.5 w-3.5 shrink-0 text-fg-faint" strokeWidth={1.75} />
            <span className="shrink-0 text-fg-muted">{projectName}</span>
            <span className="text-fg-faint">/</span>
            <span className="truncate font-medium">{title}</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        {session && <BranchBadge cwd={session.cwd} />}
        <IconButton label="Toggle side panel (Cmd+J)" active={!settings.panelCollapsed} onClick={() => void update({ panelCollapsed: !settings.panelCollapsed })}>
          <PanelRight className="h-4 w-4" strokeWidth={1.75} />
        </IconButton>
      </div>
    </header>
  );
}
