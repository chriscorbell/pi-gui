import { Braces, Layers, MoreHorizontal, PanelLeft, PanelRight, Pencil, RotateCw, Trash2 } from "lucide-react";
import { useApp } from "@/store/app";
import { IconButton, Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "@/components/ui";
import { cn } from "@/lib/utils";

/** Header of the conversation column: breadcrumb on the left, session actions and panel toggles on the right. */
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
        <IconButton label="Toggle changes panel (Cmd+J)" active={!settings.panelCollapsed} onClick={() => void update({ panelCollapsed: !settings.panelCollapsed })}>
          <PanelRight className="h-4 w-4" strokeWidth={1.75} />
        </IconButton>
      </div>
    </header>
  );
}
