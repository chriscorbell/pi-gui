import { FileDiff, SquareTerminal } from "lucide-react";
import { useApp } from "@/store/app";
import { DiffPanel } from "@/components/DiffPanel";
import { TerminalView } from "@/components/TerminalView";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "changes", label: "Changes", Icon: FileDiff },
  { id: "terminal", label: "Terminal", Icon: SquareTerminal },
] as const;

export function RightPanel() {
  const tab = useApp((s) => s.settings.panelTab);
  const update = useApp((s) => s.updateSettings);
  const key = useApp((s) => s.selectedKey);
  const cwd = useApp((s) => (s.selectedKey ? s.sessions[s.selectedKey]?.cwd : undefined));

  return (
    <div className="flex h-full flex-col">
      <div className="drag flex h-[52px] shrink-0 items-center gap-1 border-b border-border px-2">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => void update({ panelTab: id })}
            className={cn(
              "no-drag flex h-8 items-center gap-1.5 rounded-md px-2.5 text-ui-[13px] transition-colors",
              tab === id ? "bg-active text-fg" : "text-fg-muted hover:bg-hover hover:text-fg",
            )}
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
            {label}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1">
        {tab === "changes" ? (
          <DiffPanel />
        ) : key && cwd ? (
          <TerminalView sessionKey={key} cwd={cwd} />
        ) : (
          <div className="p-4 text-ui-[13px] text-fg-faint">Select a session to open a shell in its project.</div>
        )}
      </div>
    </div>
  );
}
