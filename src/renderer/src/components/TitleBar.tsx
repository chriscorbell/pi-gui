import { PanelLeft, PanelRight, Plus, Settings2, MoreHorizontal, Pencil, Trash2, Layers, RotateCw } from "lucide-react";
import { useApp } from "@/store/app";
import { IconButton, Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "@/components/ui";
import { basename } from "@/lib/utils";

export function TitleBar() {
  const settings = useApp((s) => s.settings);
  const update = useApp((s) => s.updateSettings);
  const selectedKey = useApp((s) => s.selectedKey);
  const session = useApp((s) => (s.selectedKey ? s.sessions[s.selectedKey] : undefined));
  const project = useApp((s) => s.projects.find((p) => p.cwd === session?.cwd));
  const openSession = useApp((s) => s.openSession);
  const setSettingsOpen = useApp((s) => s.setSettingsOpen);
  const rename = useApp((s) => s.renameSession);
  const trash = useApp((s) => s.trashSession);
  const compact = useApp((s) => s.compact);
  const restart = useApp((s) => s.restartSession);

  const title = session
    ? session.state?.sessionName ?? project?.sessions.find((x) => x.path === session.path)?.title ?? "New session"
    : "Pi";

  return (
    <header className="drag flex h-[44px] shrink-0 items-center border-b border-border bg-bg pl-[84px] pr-2">
      <div className="flex items-center gap-1">
        <IconButton label="Toggle sidebar (Cmd+B)" active={!settings.sidebarCollapsed} onClick={() => void update({ sidebarCollapsed: !settings.sidebarCollapsed })}>
          <PanelLeft className="h-4 w-4" strokeWidth={1.75} />
        </IconButton>
        {session && (
          <IconButton label="New session (Cmd+N)" onClick={() => void openSession(session.cwd, null)}>
            <Plus className="h-4 w-4" strokeWidth={1.75} />
          </IconButton>
        )}
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-center gap-2 px-3">
        {session && project && <span className="shrink-0 text-[12px] text-fg-faint">{basename(project.cwd)}</span>}
        {session && project && <span className="text-fg-faint">/</span>}
        <span className="truncate text-[13px] font-medium">{title}</span>
      </div>
      <div className="flex items-center gap-1">
        {session && selectedKey && (
          <Menu>
            <MenuTrigger asChild>
              <IconButton label="Session actions">
                <MoreHorizontal className="h-4 w-4" strokeWidth={1.75} />
              </IconButton>
            </MenuTrigger>
            <MenuContent align="end">
              <MenuItem
                onSelect={() => {
                  const name = window.prompt("Session name", session.state?.sessionName ?? "");
                  if (name !== null) void rename(selectedKey, name);
                }}
              >
                <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} /> Rename
              </MenuItem>
              <MenuItem onSelect={() => void compact(selectedKey)}>
                <Layers className="h-3.5 w-3.5" strokeWidth={1.75} /> Compact context
              </MenuItem>
              <MenuItem onSelect={() => void restart(selectedKey)}>
                <RotateCw className="h-3.5 w-3.5" strokeWidth={1.75} /> Restart pi
              </MenuItem>
              <MenuSeparator />
              <MenuItem
                className="text-danger data-[highlighted]:bg-danger-soft"
                disabled={!session.path}
                onSelect={() => {
                  if (session.path && window.confirm("Move this session file to the Trash?")) void trash(selectedKey, session.path);
                }}
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} /> Move to Trash
              </MenuItem>
            </MenuContent>
          </Menu>
        )}
        <IconButton label="Settings (Cmd+,)" onClick={() => setSettingsOpen(true)}>
          <Settings2 className="h-4 w-4" strokeWidth={1.75} />
        </IconButton>
        <IconButton label="Toggle changes panel (Cmd+J)" active={!settings.panelCollapsed} onClick={() => void update({ panelCollapsed: !settings.panelCollapsed })}>
          <PanelRight className="h-4 w-4" strokeWidth={1.75} />
        </IconButton>
      </div>
    </header>
  );
}
