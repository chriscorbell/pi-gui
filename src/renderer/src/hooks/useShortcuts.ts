import { useEffect } from "react";
import { useApp } from "@/store/app";

export function useShortcuts(): void {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const app = useApp.getState();
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === ",") {
        e.preventDefault();
        app.setSettingsOpen(true);
        return;
      }
      if (mod && e.key.toLowerCase() === "b") {
        e.preventDefault();
        void app.updateSettings({ sidebarCollapsed: !app.settings.sidebarCollapsed });
        return;
      }
      if (mod && e.key.toLowerCase() === "j") {
        e.preventDefault();
        void app.updateSettings({ panelCollapsed: !app.settings.panelCollapsed });
        return;
      }
      if (mod && e.key.toLowerCase() === "n") {
        e.preventDefault();
        const cwd = app.selectedKey ? app.sessions[app.selectedKey]?.cwd : app.projects[0]?.cwd;
        if (cwd) void app.openSession(cwd, null);
        return;
      }
      if (mod && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
        e.preventDefault();
        const rows = app.projects.flatMap((p) => p.sessions.map((s) => ({ cwd: p.cwd, path: s.path })));
        if (!rows.length) return;
        const currentPath = app.selectedKey ? app.sessions[app.selectedKey]?.path : null;
        const idx = rows.findIndex((r) => r.path === currentPath);
        const next = e.key === "ArrowUp" ? Math.max(0, idx - 1) : Math.min(rows.length - 1, idx + 1);
        const row = rows[next];
        if (row && row.path !== currentPath) void app.openSession(row.cwd, row.path);
        return;
      }
      if (e.key === "Escape" && app.selectedKey) {
        const s = app.sessions[app.selectedKey];
        const live = app.live[app.selectedKey];
        if (s && s.dialogs.length === 0 && live?.status === "working") {
          e.preventDefault();
          void app.abort(app.selectedKey);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
