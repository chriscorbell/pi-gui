import { useEffect, useState } from "react";
import { Braces, GitBranch, Layers, MoreHorizontal, PanelLeft, PanelRight, Pencil, RotateCw, Trash2 } from "lucide-react";
import { useApp } from "@/store/app";
import { bridge } from "@/lib/bridge";
import { IconButton, Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "@/components/ui";
import { ConfirmSheet, PromptSheet } from "@/components/PromptSheet";
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

/** Header of the conversation column: breadcrumb on the left, branch, session actions and panel toggle on the right. */
export function MainHeader() {
  const settings = useApp((s) => s.settings);
  const update = useApp((s) => s.updateSettings);
  const selectedKey = useApp((s) => s.selectedKey);
  const session = useApp((s) => (s.selectedKey ? s.sessions[s.selectedKey] : undefined));
  const project = useApp((s) => s.projects.find((p) => p.cwd === session?.cwd));
  const rename = useApp((s) => s.renameSession);
  const trash = useApp((s) => s.trashSession);
  const compact = useApp((s) => s.compact);
  const restart = useApp((s) => s.restartSession);
  const [renaming, setRenaming] = useState(false);
  const [trashing, setTrashing] = useState(false);
  const [compacting, setCompacting] = useState(false);

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
        {session && selectedKey && (
          <Menu>
            <MenuTrigger asChild>
              <IconButton label="Session actions">
                <MoreHorizontal className="h-4 w-4" strokeWidth={1.75} />
              </IconButton>
            </MenuTrigger>
            <MenuContent align="end">
              <MenuItem onSelect={() => setRenaming(true)}>
                <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} /> Rename
              </MenuItem>
              <MenuItem onSelect={() => setCompacting(true)}>
                <Layers className="h-3.5 w-3.5" strokeWidth={1.75} /> Compact context
              </MenuItem>
              <MenuItem onSelect={() => void restart(selectedKey)}>
                <RotateCw className="h-3.5 w-3.5" strokeWidth={1.75} /> Restart pi
              </MenuItem>
              <MenuSeparator />
              <MenuItem className="text-danger data-[highlighted]:bg-danger-soft" disabled={!session.path} onSelect={() => setTrashing(true)}>
                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} /> Move to Trash
              </MenuItem>
            </MenuContent>
          </Menu>
        )}
        <IconButton label="Toggle side panel (Cmd+J)" active={!settings.panelCollapsed} onClick={() => void update({ panelCollapsed: !settings.panelCollapsed })}>
          <PanelRight className="h-4 w-4" strokeWidth={1.75} />
        </IconButton>
      </div>
      {session && selectedKey && (
        <>
          <PromptSheet
            open={renaming}
            title="Rename session"
            initial={session.state?.sessionName ?? ""}
            placeholder="Session name"
            onClose={() => setRenaming(false)}
            onSubmit={(name) => {
              setRenaming(false);
              void rename(selectedKey, name);
            }}
          />
          <PromptSheet
            open={compacting}
            title="Compact context"
            placeholder="Optional: what the summary should keep"
            submitLabel="Compact"
            onClose={() => setCompacting(false)}
            onSubmit={(instructions) => {
              setCompacting(false);
              void compact(selectedKey, instructions.trim() || undefined);
            }}
          />
          <ConfirmSheet
            open={trashing}
            title="Move this session to the Trash?"
            message="The session file goes to the macOS Trash. pi will no longer list it."
            confirmLabel="Move to Trash"
            danger
            onClose={() => setTrashing(false)}
            onConfirm={() => {
              setTrashing(false);
              if (session.path) void trash(selectedKey, session.path);
            }}
          />
        </>
      )}
    </header>
  );
}
