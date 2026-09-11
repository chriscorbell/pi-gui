import { useApp } from "@/store/app";
import { Tip } from "@/components/ui";
import { cn, formatCost, formatTokens } from "@/lib/utils";

export function ContextMeter({ percent, tokens, window }: { percent: number | null; tokens: number | null; window: number }) {
  const p = percent ?? 0;
  const tone = p >= 80 ? "bg-danger" : p >= 60 ? "bg-warn" : "bg-fg-muted";
  return (
    <Tip label={`Context: ${formatTokens(tokens)} of ${formatTokens(window)} tokens${percent == null ? " (estimating)" : ""}`}>
      <div className="flex items-center gap-1.5 tabular-nums">
        <div className="h-1.5 w-14 overflow-hidden rounded-full bg-border-strong/60">
          <div className={cn("h-full rounded-full transition-[width] duration-300", tone)} style={{ width: `${Math.min(100, p)}%` }} />
        </div>
        <span>{percent == null ? "–" : `${Math.round(p)}%`}</span>
      </div>
    </Tip>
  );
}

/** The thin line under the composer: cost and whatever Extensions publish as status. The context meter sits in the composer footer. */
export function ContextStrip({ sessionKey }: { sessionKey: string }) {
  const session = useApp((s) => s.sessions[sessionKey]);
  if (!session) return null;
  const statuses = Object.values(session.statuses);
  const cost = session.stats?.cost ?? 0;
  if (statuses.length === 0 && cost === 0) return null;

  return (
    <div className="-mb-3 flex h-6 items-center gap-3 px-2 pt-1 text-[12px] text-fg-faint">
      {session.stats && session.stats.cost > 0 && <span className="tabular-nums">{formatCost(session.stats.cost)}</span>}
      <div className="selectable min-w-0 flex-1 truncate text-right font-mono" title={statuses.join("\n")}>
        {statuses.join("  ·  ")}
      </div>
    </div>
  );
}
