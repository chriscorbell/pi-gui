import type { AgentMessage, ContentBlock, SessionEntry } from "@shared/contract";

export type ToolResultMsg = Extract<AgentMessage, { role: "toolResult" }>;
export type AssistantMsg = Extract<AgentMessage, { role: "assistant" }>;

export type TranscriptItem =
  | { kind: "user"; id: string; text: string; images: number; timestamp: number }
  | { kind: "assistant"; id: string; message: AssistantMsg; results: Record<string, ToolResultMsg> }
  | { kind: "bash"; id: string; command: string; output: string; exitCode?: number }
  | { kind: "compaction"; id: string; summary: string; tokensBefore: number }
  | { kind: "custom"; id: string; customType: string; text: string }
  | { kind: "note"; id: string; text: string };

export function textOf(content: string | ContentBlock[] | undefined): string {
  if (!content) return "";
  if (typeof content === "string") return content;
  return content
    .filter((b): b is Extract<ContentBlock, { type: "text" }> => b.type === "text")
    .map((b) => b.text)
    .join("");
}

/** Walk the active branch (leaf to root) and turn it into renderable items in order. */
export function buildTranscript(entries: SessionEntry[], leafId: string | null): TranscriptItem[] {
  if (!entries.length) return [];
  const byId = new Map<string, SessionEntry>();
  for (const e of entries) byId.set(e.id, e);
  const path: SessionEntry[] = [];
  let cur = leafId ? byId.get(leafId) : entries[entries.length - 1];
  const seen = new Set<string>();
  while (cur && !seen.has(cur.id)) {
    seen.add(cur.id);
    path.push(cur);
    cur = cur.parentId ? byId.get(cur.parentId) : undefined;
  }
  path.reverse();

  const items: TranscriptItem[] = [];
  const pendingResults = new Map<string, ToolResultMsg>();
  let lastAssistant: Extract<TranscriptItem, { kind: "assistant" }> | null = null;

  for (const e of path) {
    if (e.type === "message" && e.message) {
      const m = e.message;
      switch (m.role) {
        case "user": {
          const images = typeof m.content === "string" ? 0 : m.content.filter((b) => b.type === "image").length;
          items.push({ kind: "user", id: e.id, text: textOf(m.content), images, timestamp: m.timestamp });
          lastAssistant = null;
          break;
        }
        case "assistant": {
          const item: Extract<TranscriptItem, { kind: "assistant" }> = { kind: "assistant", id: e.id, message: m, results: {} };
          for (const b of m.content) {
            if (b.type === "toolCall") {
              const r = pendingResults.get(b.id);
              if (r) {
                item.results[b.id] = r;
                pendingResults.delete(b.id);
              }
            }
          }
          items.push(item);
          lastAssistant = item;
          break;
        }
        case "toolResult": {
          if (lastAssistant && lastAssistant.message.content.some((b) => b.type === "toolCall" && b.id === m.toolCallId)) {
            lastAssistant.results[m.toolCallId] = m;
          } else {
            pendingResults.set(m.toolCallId, m);
          }
          break;
        }
        case "bashExecution":
          items.push({ kind: "bash", id: e.id, command: m.command, output: m.output, exitCode: m.exitCode });
          break;
        case "compactionSummary":
          items.push({ kind: "compaction", id: e.id, summary: m.summary, tokensBefore: m.tokensBefore });
          break;
        case "branchSummary":
          items.push({ kind: "note", id: e.id, text: "Branch summary: " + m.summary.slice(0, 200) });
          break;
        case "custom":
          if (m.display) items.push({ kind: "custom", id: e.id, customType: m.customType, text: textOf(m.content) });
          break;
      }
      continue;
    }
    switch (e.type) {
      case "compaction":
        items.push({ kind: "compaction", id: e.id, summary: e.summary ?? "", tokensBefore: e.tokensBefore ?? 0 });
        break;
      case "model_change":
        items.push({ kind: "note", id: e.id, text: `Model set to ${e.provider}/${e.modelId}` });
        break;
      case "thinking_level_change":
        items.push({ kind: "note", id: e.id, text: `Thinking level set to ${e.thinkingLevel}` });
        break;
      case "custom_message":
        if (e.display) items.push({ kind: "custom", id: e.id, customType: e.customType ?? "extension", text: textOf(e.content) });
        break;
    }
  }
  return items;
}

/** User prompts on the active branch, oldest first, for ArrowUp recall. */
export function promptHistory(items: TranscriptItem[]): string[] {
  return items.filter((i): i is Extract<TranscriptItem, { kind: "user" }> => i.kind === "user").map((i) => i.text);
}
