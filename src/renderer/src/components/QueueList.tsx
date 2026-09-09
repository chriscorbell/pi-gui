import { ArrowUpToLine, X, Zap, Clock } from "lucide-react";
import { useApp } from "@/store/app";
import { IconButton } from "@/components/ui";

export function QueueList({ sessionKey, queue }: { sessionKey: string; queue: { steering: string[]; followUp: string[] } }) {
  const remove = useApp((s) => s.removeQueued);
  const promote = useApp((s) => s.promoteToSteering);
  if (queue.steering.length === 0 && queue.followUp.length === 0) return null;
  return (
    <div className="anim-fade-up mb-2 flex flex-col gap-1">
      {queue.steering.map((m, i) => (
        <div key={`s${i}`} className="flex items-center gap-2 rounded-md border border-border bg-bg-sunken px-2.5 py-1.5 text-[13.5px]">
          <Zap className="h-3.5 w-3.5 shrink-0 text-warn" strokeWidth={2} />
          <span className="min-w-0 flex-1 truncate">{m}</span>
          <span className="text-[11.5px] uppercase tracking-wide text-fg-faint">steering</span>
          <IconButton label="Remove" className="h-6 w-6" onClick={() => void remove(sessionKey, "steering", i)}>
            <X className="h-3.5 w-3.5" strokeWidth={2} />
          </IconButton>
        </div>
      ))}
      {queue.followUp.map((m, i) => (
        <div key={`f${i}`} className="flex items-center gap-2 rounded-md border border-border bg-bg-sunken px-2.5 py-1.5 text-[13.5px]">
          <Clock className="h-3.5 w-3.5 shrink-0 text-fg-faint" strokeWidth={2} />
          <span className="min-w-0 flex-1 truncate">{m}</span>
          <span className="text-[11.5px] uppercase tracking-wide text-fg-faint">follow-up</span>
          <IconButton label="Deliver mid-turn (steer)" className="h-6 w-6" onClick={() => void promote(sessionKey, i)}>
            <ArrowUpToLine className="h-3.5 w-3.5" strokeWidth={2} />
          </IconButton>
          <IconButton label="Remove" className="h-6 w-6" onClick={() => void remove(sessionKey, "followUp", i)}>
            <X className="h-3.5 w-3.5" strokeWidth={2} />
          </IconButton>
        </div>
      ))}
    </div>
  );
}
