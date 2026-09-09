import * as ContextMenu from "@radix-ui/react-context-menu";
import { Layers, Pencil, RotateCw, Trash2 } from "lucide-react";
import { create } from "zustand";
import { useApp } from "@/store/app";
import { ConfirmSheet, PromptSheet } from "@/components/PromptSheet";
import { cn } from "@/lib/utils";

export interface SessionTarget {
  key: string;
  cwd: string;
  path: string | null;
  title: string;
}

type Pending = { kind: "rename" | "compact" | "trash"; target: SessionTarget } | null;

const usePending = create<{ pending: Pending; set: (p: Pending) => void }>((set) => ({ pending: null, set: (pending) => set({ pending }) }));

/** Open the Session if no process is attached yet, and return the key that owns it now. */
async function ensureOpen(target: SessionTarget): Promise<string> {
  const app = useApp.getState();
  if (app.sessions[target.key]) return target.key;
  await app.openSession(target.cwd, target.path);
  const live = useApp.getState().live;
  for (const s of Object.values(live)) if (target.path && s.path === target.path) return s.key;
  return target.key;
}

const itemClass =
  "flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-[13.5px] text-fg outline-none data-[highlighted]:bg-hover data-[disabled]:pointer-events-none data-[disabled]:opacity-40";

/** Wrap a sidebar row to give it the session actions on right-click. */
export function SessionContextMenu({ target, children }: { target: SessionTarget; children: React.ReactNode }) {
  const setPending = usePending((s) => s.set);
  const restart = useApp((s) => s.restartSession);
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>{children}</ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content className="anim-fade-up z-50 min-w-[180px] overflow-hidden rounded-lg border border-border bg-surface-raised p-1 shadow-[var(--shadow)]">
          <ContextMenu.Item className={itemClass} onSelect={() => setPending({ kind: "rename", target })}>
            <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} /> Rename
          </ContextMenu.Item>
          <ContextMenu.Item className={itemClass} onSelect={() => setPending({ kind: "compact", target })}>
            <Layers className="h-3.5 w-3.5" strokeWidth={1.75} /> Compact context
          </ContextMenu.Item>
          <ContextMenu.Item
            className={itemClass}
            onSelect={() => {
              void ensureOpen(target).then((key) => restart(key));
            }}
          >
            <RotateCw className="h-3.5 w-3.5" strokeWidth={1.75} /> Restart pi
          </ContextMenu.Item>
          <ContextMenu.Separator className="my-1 h-px bg-border" />
          <ContextMenu.Item
            className={cn(itemClass, "text-danger data-[highlighted]:bg-danger-soft")}
            disabled={!target.path}
            onSelect={() => setPending({ kind: "trash", target })}
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} /> Move to Trash
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}

/** The sheets the context menu opens. Mounted once at the app root. */
export function SessionActionSheets() {
  const pending = usePending((s) => s.pending);
  const setPending = usePending((s) => s.set);
  const rename = useApp((s) => s.renameSession);
  const compact = useApp((s) => s.compact);
  const trash = useApp((s) => s.trashSession);
  const currentName = useApp((s) => (pending ? s.sessions[pending.target.key]?.state?.sessionName : undefined));
  const close = () => setPending(null);
  const t = pending?.target;
  return (
    <>
      <PromptSheet
        open={pending?.kind === "rename"}
        title="Rename session"
        initial={currentName ?? (t?.title === "New session" || t?.title === "Empty session" ? "" : t?.title ?? "")}
        placeholder="Session name"
        onClose={close}
        onSubmit={(name) => {
          close();
          if (t) void ensureOpen(t).then((key) => rename(key, name));
        }}
      />
      <PromptSheet
        open={pending?.kind === "compact"}
        title="Compact context"
        placeholder="Optional: what the summary should keep"
        submitLabel="Compact"
        onClose={close}
        onSubmit={(instructions) => {
          close();
          if (t) void ensureOpen(t).then((key) => compact(key, instructions.trim() || undefined));
        }}
      />
      <ConfirmSheet
        open={pending?.kind === "trash"}
        title={`Move "${t?.title ?? "this session"}" to the Trash?`}
        message="The session file goes to the macOS Trash. pi will no longer list it."
        confirmLabel="Move to Trash"
        danger
        onClose={close}
        onConfirm={() => {
          close();
          if (t?.path) void trash(t.key, t.path);
        }}
      />
    </>
  );
}
