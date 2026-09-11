import { X, AlertTriangle, Info, OctagonAlert } from "lucide-react";
import { useApp } from "@/store/app";
import { cn } from "@/lib/utils";

export function Toasts() {
  const toasts = useApp((s) => s.toasts);
  const dismiss = useApp((s) => s.dismissToast);
  if (!toasts.length) return null;
  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-50 flex w-[360px] flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            t.leaving ? "anim-fade-out" : "anim-fade-up",
            "pointer-events-auto flex items-start gap-2 rounded-lg border bg-surface-raised px-3 py-2.5 text-ui-[13.5px] shadow-[var(--shadow)]",
            t.kind === "error" ? "border-danger/40" : t.kind === "warning" ? "border-warn/40" : "border-border",
          )}
        >
          {t.kind === "error" ? (
            <OctagonAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-danger" strokeWidth={2} />
          ) : t.kind === "warning" ? (
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warn" strokeWidth={2} />
          ) : (
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-fg-muted" strokeWidth={2} />
          )}
          <div className="selectable min-w-0 flex-1 whitespace-pre-wrap break-words">{t.message}</div>
          <button onClick={() => dismiss(t.id)} className="text-fg-faint hover:text-fg" aria-label="Dismiss">
            <X className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>
      ))}
    </div>
  );
}
