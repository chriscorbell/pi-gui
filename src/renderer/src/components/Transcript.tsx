import { memo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChevronRight, Image as ImageIcon, Layers, Terminal } from "lucide-react";
import type { ContentBlock } from "@shared/contract";
import type { PartialMessage, ToolRun } from "@/store/app";
import { useApp } from "@/store/app";
import type { AssistantMsg, ToolResultMsg, TranscriptItem } from "@/lib/transcript";
import { ToolCallRow } from "@/components/ToolCallRow";
import { Spinner } from "@/components/ui";
import { cn } from "@/lib/utils";

const Markdown = memo(function Markdown({ text }: { text: string }) {
  return (
    <div className="prose-pi text-[14.5px] leading-[1.6]">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
    </div>
  );
});

function Thinking({ text, streaming }: { text: string; streaming: boolean }) {
  const defaultExpanded = useApp((s) => s.settings.thinkingExpanded);
  const [open, setOpen] = useState<boolean | null>(null);
  const expanded = open ?? defaultExpanded;
  if (!expanded) {
    return (
      <button onClick={() => setOpen(true)} className="flex items-center gap-2 py-1 text-[13px] text-fg-muted transition-colors hover:text-fg">
        {streaming ? <Spinner /> : <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />}
        <span>{streaming ? "Thinking" : "Thought"}</span>
        {!streaming && text && <span className="max-w-[420px] truncate text-fg-faint">{text.replace(/\s+/g, " ").slice(0, 120)}</span>}
      </button>
    );
  }
  return (
    <div onClick={() => setOpen(false)} className="cursor-pointer rounded-md border border-border bg-bg-sunken px-3 py-2 text-[13.5px] leading-relaxed text-fg-muted">
      <div className="mb-1 flex items-center gap-2 text-[12.5px] text-fg-faint">
        {streaming ? <Spinner /> : <ChevronRight className="h-3.5 w-3.5 rotate-90" strokeWidth={2} />}
        {streaming ? "Thinking" : "Thought"}
      </div>
      <div className={cn("selectable whitespace-pre-wrap", streaming && "caret")}>{text}</div>
    </div>
  );
}

function AssistantBlocks({
  content,
  results,
  toolRuns,
  streaming,
  toolArgs,
}: {
  content: ContentBlock[];
  results: Record<string, ToolResultMsg>;
  toolRuns: Record<string, ToolRun>;
  streaming: boolean;
  toolArgs?: Record<number, string>;
}) {
  const lastIndex = content.length - 1;
  return (
    <div className="flex flex-col gap-2">
      {content.map((b, i) => {
        if (b.type === "thinking") return <Thinking key={i} text={b.thinking} streaming={streaming && i === lastIndex} />;
        if (b.type === "text") {
          if (!b.text.trim()) return null;
          return (
            <div key={i} className={cn(streaming && i === lastIndex && "caret")}>
              <Markdown text={b.text} />
            </div>
          );
        }
        if (b.type === "toolCall") {
          const pendingArgs = toolArgs?.[i];
          return <ToolCallRow key={b.id} call={b} result={results[b.id]} run={toolRuns[b.id]} pendingArgs={pendingArgs} />;
        }
        return null;
      })}
    </div>
  );
}

function AssistantItem({ message, results, toolRuns }: { message: AssistantMsg; results: Record<string, ToolResultMsg>; toolRuns: Record<string, ToolRun> }) {
  return (
    <div className="py-2">
      <AssistantBlocks content={message.content} results={results} toolRuns={toolRuns} streaming={false} />
      {message.stopReason === "error" && (
        <div className="selectable mt-2 rounded-md border border-danger/30 bg-danger-soft px-3 py-2 text-[13.5px] text-danger">
          {message.errorMessage ?? "The model returned an error."}
        </div>
      )}
      {message.stopReason === "aborted" && <div className="mt-1 text-[12.5px] text-fg-faint">Aborted</div>}
    </div>
  );
}

function UserItem({ text, images }: { text: string; images: number }) {
  return (
    <div className="flex justify-end py-2">
      <div className="selectable max-w-[85%] rounded-lg bg-surface-raised border border-border px-3.5 py-2 text-[14.5px] leading-[1.55] whitespace-pre-wrap break-words">
        {text}
        {images > 0 && (
          <div className="mt-1.5 flex items-center gap-1 text-[12.5px] text-fg-muted">
            <ImageIcon className="h-3.5 w-3.5" strokeWidth={1.75} /> {images} image{images > 1 ? "s" : ""}
          </div>
        )}
      </div>
    </div>
  );
}

function BashItem({ command, output, exitCode }: { command: string; output: string; exitCode?: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="my-1 rounded-md border border-border bg-bg-sunken font-mono text-[13px]">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-2 px-3 py-1.5 text-left">
        <Terminal className="h-3.5 w-3.5 shrink-0 text-fg-muted" strokeWidth={1.75} />
        <span className="min-w-0 flex-1 truncate">{command}</span>
        {exitCode !== undefined && exitCode !== 0 && <span className="text-danger">exit {exitCode}</span>}
      </button>
      {open && <pre className="selectable max-h-72 overflow-auto border-t border-border px-3 py-2 whitespace-pre-wrap text-fg-muted">{output}</pre>}
    </div>
  );
}

function CompactionItem({ summary, tokensBefore }: { summary: string; tokensBefore: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="my-3">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-2 text-[12.5px] text-fg-faint">
        <span className="h-px flex-1 bg-border" />
        <Layers className="h-3.5 w-3.5" strokeWidth={1.75} />
        <span>Context compacted from {Math.round(tokensBefore / 1000)}K tokens</span>
        <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-90")} strokeWidth={2} />
        <span className="h-px flex-1 bg-border" />
      </button>
      {open && (
        <div className="mt-2 rounded-md border border-border bg-bg-sunken px-3 py-2">
          <Markdown text={summary} />
        </div>
      )}
    </div>
  );
}

export function Transcript({
  items,
  partial,
  toolRuns,
  working,
}: {
  sessionKey: string;
  items: TranscriptItem[];
  partial: PartialMessage | null;
  toolRuns: Record<string, ToolRun>;
  working: boolean;
}) {
  if (items.length === 0 && !partial) {
    return <div className="py-16 text-center text-[13.5px] text-fg-faint">Send a message to start.</div>;
  }
  return (
    <div className="flex flex-col">
      {items.map((item) => {
        switch (item.kind) {
          case "user":
            return <UserItem key={item.id} text={item.text} images={item.images} />;
          case "assistant":
            return <AssistantItem key={item.id} message={item.message} results={item.results} toolRuns={toolRuns} />;
          case "bash":
            return <BashItem key={item.id} command={item.command} output={item.output} exitCode={item.exitCode} />;
          case "compaction":
            return <CompactionItem key={item.id} summary={item.summary} tokensBefore={item.tokensBefore} />;
          case "custom":
            return (
              <div key={item.id} className="my-1 rounded-md border border-border bg-bg-sunken px-3 py-2 text-[13.5px]">
                <div className="mb-0.5 text-[11.5px] uppercase tracking-wide text-fg-faint">{item.customType}</div>
                <Markdown text={item.text} />
              </div>
            );
          case "note":
            return (
              <div key={item.id} className="py-1 text-center text-[12px] text-fg-faint">
                {item.text}
              </div>
            );
        }
      })}
      {partial && (
        <div className="py-2">
          <AssistantBlocks content={partial.content} results={{}} toolRuns={toolRuns} streaming toolArgs={partial.toolArgs} />
        </div>
      )}
      {working && !partial && (
        <div className="flex items-center gap-2 py-3 text-[13px] text-fg-muted">
          <Spinner /> Waiting for the model
        </div>
      )}
    </div>
  );
}
