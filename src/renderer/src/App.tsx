import { useEffect, useRef, useState } from "react";
import { useApp } from "@/store/app";
import { useTheme } from "@/hooks/useTheme";
import { useShortcuts } from "@/hooks/useShortcuts";
import { TooltipProvider } from "@/components/ui";
import { Sidebar } from "@/components/Sidebar";
import { Thread } from "@/components/Thread";
import { RightPanel } from "@/components/RightPanel";
import { Toasts } from "@/components/Toasts";
import { SettingsSheet } from "@/components/SettingsSheet";
import { DialogSheet } from "@/components/DialogSheet";
import { SessionActionSheets } from "@/components/SessionActions";
import { cn } from "@/lib/utils";

function ResizeHandle({ side, onStart, onResize, onDone }: { side: "left" | "right"; onStart: () => void; onResize: (dx: number) => void; onDone: () => void }) {
  const dragging = useRef(false);
  return (
    <div
      onMouseDown={(e) => {
        e.preventDefault();
        dragging.current = true;
        onStart();
        let last = e.clientX;
        const move = (ev: MouseEvent) => {
          const dx = ev.clientX - last;
          last = ev.clientX;
          onResize(side === "left" ? dx : -dx);
        };
        const up = () => {
          dragging.current = false;
          window.removeEventListener("mousemove", move);
          window.removeEventListener("mouseup", up);
          document.body.style.cursor = "";
          onDone();
        };
        document.body.style.cursor = "col-resize";
        window.addEventListener("mousemove", move);
        window.addEventListener("mouseup", up);
      }}
      className={cn(
        "no-drag group relative z-10 w-0 shrink-0 cursor-col-resize",
        side === "left" ? "-mr-[1px]" : "-ml-[1px]",
      )}
    >
      <div className="absolute inset-y-0 -left-1 w-2 transition-colors group-hover:bg-accent/40 group-active:bg-accent/60" />
    </div>
  );
}

export function App() {
  const ready = useApp((s) => s.ready);
  const init = useApp((s) => s.init);
  const settings = useApp((s) => s.settings);
  const updateSettings = useApp((s) => s.updateSettings);
  useTheme();
  useShortcuts();

  useEffect(() => {
    void init();
  }, [init]);

  // Live width during drag, persisted on release.
  const sidebarRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const widths = useRef({ sidebar: settings.sidebarWidth, panel: settings.panelWidth });
  const [dragging, setDragging] = useState(false);
  useEffect(() => {
    widths.current = { sidebar: settings.sidebarWidth, panel: settings.panelWidth };
  }, [settings.sidebarWidth, settings.panelWidth]);

  if (!ready) return <div className="h-full bg-bg" />;

  return (
    <TooltipProvider>
      <div className="flex h-full flex-col bg-bg text-fg">
        <div className="flex min-h-0 flex-1">
          <div
            ref={sidebarRef}
            data-collapsed={settings.sidebarCollapsed}
            data-dragging={dragging}
            style={{ width: settings.sidebarCollapsed ? 0 : settings.sidebarWidth }}
            className="panel-col shrink-0 overflow-hidden border-r border-border bg-bg-sunken"
          >
            <div className="panel-inner h-full" style={{ width: settings.sidebarWidth }} inert={settings.sidebarCollapsed}>
              <Sidebar />
            </div>
          </div>
          {!settings.sidebarCollapsed && (
            <ResizeHandle
              side="left"
              onStart={() => setDragging(true)}
              onResize={(dx) => {
                widths.current.sidebar = Math.min(480, Math.max(200, widths.current.sidebar + dx));
                if (sidebarRef.current) {
                  sidebarRef.current.style.width = `${widths.current.sidebar}px`;
                  (sidebarRef.current.firstElementChild as HTMLElement).style.width = `${widths.current.sidebar}px`;
                }
              }}
              onDone={() => {
                setDragging(false);
                void updateSettings({ sidebarWidth: widths.current.sidebar });
              }}
            />
          )}
          <main className="flex min-w-0 flex-1 flex-col">
            <Thread />
          </main>
          {!settings.panelCollapsed && (
            <ResizeHandle
              side="right"
              onStart={() => setDragging(true)}
              onResize={(dx) => {
                widths.current.panel = Math.min(900, Math.max(280, widths.current.panel + dx));
                if (panelRef.current) {
                  panelRef.current.style.width = `${widths.current.panel}px`;
                  (panelRef.current.firstElementChild as HTMLElement).style.width = `${widths.current.panel}px`;
                }
              }}
              onDone={() => {
                setDragging(false);
                void updateSettings({ panelWidth: widths.current.panel });
              }}
            />
          )}
          <div
            ref={panelRef}
            data-collapsed={settings.panelCollapsed}
            data-dragging={dragging}
            style={{ width: settings.panelCollapsed ? 0 : settings.panelWidth }}
            className="panel-col shrink-0 overflow-hidden border-l border-border bg-bg-sunken"
          >
            <div className="panel-inner h-full" style={{ width: settings.panelWidth }} inert={settings.panelCollapsed}>
              <RightPanel />
            </div>
          </div>
        </div>
        <Toasts />
        <SettingsSheet />
        <DialogSheet />
        <SessionActionSheets />
      </div>
    </TooltipProvider>
  );
}
