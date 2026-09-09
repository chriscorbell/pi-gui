import { useEffect, useState } from "react";
import { useApp } from "@/store/app";
import { Button, Sheet } from "@/components/ui";

/** Extension dialog requests (select, confirm, input, editor) for the selected Session. */
export function DialogSheet() {
  const key = useApp((s) => s.selectedKey);
  const dialog = useApp((s) => (s.selectedKey ? s.sessions[s.selectedKey]?.dialogs[0] : undefined));
  const respond = useApp((s) => s.respondDialog);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!dialog) return;
    setText(dialog.method === "editor" ? dialog.prefill ?? "" : "");
  }, [dialog?.id]);

  if (!key || !dialog) return null;
  const cancel = () => void respond(key, dialog.id, { cancelled: true });

  return (
    <Sheet open onOpenChange={(o) => !o && cancel()} title={dialog.title} width={dialog.method === "editor" ? 640 : 440}>
      {dialog.method === "select" && (
        <div className="flex flex-col gap-1">
          {dialog.options.map((o) => (
            <button
              key={o}
              onClick={() => void respond(key, dialog.id, { value: o })}
              className="rounded-md border border-border px-3 py-2 text-left text-[14px] transition-colors hover:bg-hover"
            >
              {o}
            </button>
          ))}
          <Button variant="ghost" className="mt-2 self-end" onClick={cancel}>
            Cancel
          </Button>
        </div>
      )}
      {dialog.method === "confirm" && (
        <div>
          {dialog.message && <p className="selectable mb-4 whitespace-pre-wrap text-[14px] text-fg-muted">{dialog.message}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => void respond(key, dialog.id, { confirmed: false })}>
              No
            </Button>
            <Button variant="primary" autoFocus onClick={() => void respond(key, dialog.id, { confirmed: true })}>
              Yes
            </Button>
          </div>
        </div>
      )}
      {(dialog.method === "input" || dialog.method === "editor") && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void respond(key, dialog.id, { value: text });
          }}
        >
          {dialog.method === "input" ? (
            <input
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={dialog.placeholder}
              className="h-9 w-full rounded-md border border-border-strong bg-bg-sunken px-2.5 text-[14px] text-fg placeholder:text-fg-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
            />
          ) : (
            <textarea
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={14}
              className="w-full resize-y rounded-md border border-border-strong bg-bg-sunken p-2.5 font-mono text-[13px] text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
            />
          )}
          <div className="mt-3 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={cancel}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Submit
            </Button>
          </div>
        </form>
      )}
    </Sheet>
  );
}
