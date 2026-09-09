import { Brain, ChevronDown, Cpu } from "lucide-react";
import { useApp } from "@/store/app";
import { Menu, MenuContent, MenuItem, MenuLabel, MenuTrigger, Tip } from "@/components/ui";
import { cn, formatCost, formatTokens } from "@/lib/utils";

function ContextMeter({ percent, tokens, window }: { percent: number | null; tokens: number | null; window: number }) {
  const p = percent ?? 0;
  const tone = p >= 80 ? "bg-danger" : p >= 60 ? "bg-warn" : "bg-fg-muted";
  return (
    <Tip label={`Context: ${formatTokens(tokens)} of ${formatTokens(window)} tokens${percent == null ? " (estimating)" : ""}`}>
      <div className="flex items-center gap-1.5 tabular-nums">
        <div className="h-1.5 w-14 overflow-hidden rounded-full bg-border">
          <div className={cn("h-full rounded-full transition-[width] duration-300", tone)} style={{ width: `${Math.min(100, p)}%` }} />
        </div>
        <span>{percent == null ? "–" : `${Math.round(p)}%`}</span>
      </div>
    </Tip>
  );
}

export function StatusBar({ sessionKey }: { sessionKey: string }) {
  const session = useApp((s) => s.sessions[sessionKey]);
  const setModel = useApp((s) => s.setModel);
  const setThinking = useApp((s) => s.setThinking);
  if (!session) return null;
  const model = session.state?.model;
  const byProvider = new Map<string, typeof session.models>();
  for (const m of session.models) {
    const list = byProvider.get(m.provider) ?? [];
    list.push(m);
    byProvider.set(m.provider, list);
  }
  const statuses = Object.values(session.statuses);

  return (
    <div className="flex h-7 items-center gap-3 px-1 text-[11.5px] text-fg-muted">
      <Menu>
        <MenuTrigger asChild>
          <button className="no-drag flex h-6 items-center gap-1 rounded-md px-1.5 transition-colors hover:bg-hover hover:text-fg">
            <Cpu className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span className="max-w-[200px] truncate">{model ? model.name || model.id : "No model"}</span>
            <ChevronDown className="h-3 w-3 text-fg-faint" strokeWidth={2} />
          </button>
        </MenuTrigger>
        <MenuContent align="start" className="max-h-[360px] overflow-y-auto">
          {[...byProvider.entries()].map(([provider, models]) => (
            <div key={provider}>
              <MenuLabel>{provider}</MenuLabel>
              {models.map((m) => (
                <MenuItem key={m.id} onSelect={() => void setModel(sessionKey, m.provider, m.id)} className={cn(model?.id === m.id && model.provider === m.provider && "text-accent")}>
                  <span className="min-w-0 flex-1 truncate">{m.name || m.id}</span>
                  <span className="text-[10.5px] text-fg-faint">{formatTokens(m.contextWindow)}</span>
                </MenuItem>
              ))}
            </div>
          ))}
          {session.models.length === 0 && <MenuItem disabled>No models configured</MenuItem>}
        </MenuContent>
      </Menu>

      <Menu>
        <MenuTrigger asChild>
          <button className="no-drag flex h-6 items-center gap-1 rounded-md px-1.5 transition-colors hover:bg-hover hover:text-fg">
            <Brain className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span>{session.state?.thinkingLevel ?? "off"}</span>
            <ChevronDown className="h-3 w-3 text-fg-faint" strokeWidth={2} />
          </button>
        </MenuTrigger>
        <MenuContent align="start">
          <MenuLabel>Thinking</MenuLabel>
          {session.thinkingLevels.map((l) => (
            <MenuItem key={l} onSelect={() => void setThinking(sessionKey, l)} className={cn(session.state?.thinkingLevel === l && "text-accent")}>
              {l}
            </MenuItem>
          ))}
        </MenuContent>
      </Menu>

      {session.stats?.contextUsage && (
        <ContextMeter percent={session.stats.contextUsage.percent} tokens={session.stats.contextUsage.tokens} window={session.stats.contextUsage.contextWindow} />
      )}
      {session.stats && session.stats.cost > 0 && <span className="tabular-nums">{formatCost(session.stats.cost)}</span>}

      <div className="min-w-0 flex-1 truncate text-right font-mono text-[11px] text-fg-faint selectable" title={statuses.join("\n")}>
        {statuses.join("  ·  ")}
      </div>
    </div>
  );
}
