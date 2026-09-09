import { useEffect, useMemo, useRef } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";
import { useApp } from "@/store/app";
import { buildTranscript } from "@/lib/transcript";
import { Transcript } from "@/components/Transcript";
import { Composer } from "@/components/Composer";
import { QueueList } from "@/components/QueueList";
import { StatusBar } from "@/components/StatusBar";
import { Button, Spinner } from "@/components/ui";

export function Thread() {
  const key = useApp((s) => s.selectedKey);
  const session = useApp((s) => (s.selectedKey ? s.sessions[s.selectedKey] : undefined));
  const live = useApp((s) => (s.selectedKey ? s.live[s.selectedKey] : undefined));
  const restart = useApp((s) => s.restartSession);
  const projects = useApp((s) => s.projects);
  const openFolder = useApp((s) => s.openFolder);
  const openSession = useApp((s) => s.openSession);

  const items = useMemo(() => (session ? buildTranscript(session.entries, session.leafId) : []), [session?.entries, session?.leafId]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [key]);
  useEffect(() => {
    const el = scrollRef.current;
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight;
  });
  useEffect(() => {
    stickToBottom.current = true;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [key]);

  if (!key || !session) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
        <div className="text-[15px] font-medium">No session selected</div>
        <div className="max-w-[320px] text-[12.5px] text-fg-muted">
          Pick a session in the sidebar, start a new one in a project, or open a folder.
        </div>
        <div className="mt-2 flex gap-2">
          {projects[0] && (
            <Button variant="primary" onClick={() => void openSession(projects[0].cwd, null)}>
              New session in {projects[0].name}
            </Button>
          )}
          <Button onClick={() => void openFolder()}>Open folder</Button>
        </div>
      </div>
    );
  }

  const widgetsAbove = Object.values(session.widgets);

  return (
    <div className="flex h-full min-h-0 flex-col">
      {live?.crashed && (
        <div className="flex items-start gap-3 border-b border-danger/30 bg-danger-soft px-4 py-2.5 text-[12.5px]">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" strokeWidth={2} />
          <div className="selectable min-w-0 flex-1">
            <div className="font-medium">pi is not running for this session</div>
            <pre className="mt-1 max-h-24 overflow-auto whitespace-pre-wrap font-mono text-[11px] text-fg-muted">{live.crashed}</pre>
          </div>
          <Button size="sm" onClick={() => void restart(key)}>
            <RotateCw className="h-3.5 w-3.5" strokeWidth={2} /> Restart
          </Button>
        </div>
      )}
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[860px] px-6 pt-6 pb-4">
          {session.loading && items.length === 0 ? (
            <div className="flex items-center gap-2 py-10 text-[12.5px] text-fg-muted">
              <Spinner /> Starting pi
            </div>
          ) : (
            <Transcript sessionKey={key} items={items} partial={session.partial} toolRuns={session.toolRuns} working={live?.status === "working"} />
          )}
          {session.compacting && (
            <div className="flex items-center gap-2 py-3 text-[12px] text-fg-muted">
              <Spinner /> Compacting context
            </div>
          )}
          {session.retry && (
            <div className="flex items-center gap-2 py-3 text-[12px] text-warn">
              <Spinner className="text-warn" /> Retrying ({session.retry.attempt}/{session.retry.maxAttempts}): {session.retry.error}
            </div>
          )}
        </div>
      </div>
      <div className="mx-auto w-full max-w-[860px] px-6 pb-3">
        {widgetsAbove.length > 0 && (
          <div className="mb-2 rounded-md border border-border bg-bg-sunken px-3 py-2 font-mono text-[11.5px] leading-relaxed whitespace-pre-wrap text-fg-muted selectable">
            {widgetsAbove.map((lines, i) => (
              <div key={i}>{lines.join("\n")}</div>
            ))}
          </div>
        )}
        <QueueList sessionKey={key} queue={session.queue} />
        <Composer sessionKey={key} />
        <StatusBar sessionKey={key} />
      </div>
    </div>
  );
}
