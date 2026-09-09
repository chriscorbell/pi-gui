import {
  IPC,
  type ChangedFile,
  type ExtensionUiResponse,
  type GuiSettings,
  type PiCommandResult,
  type PiEvent,
  type ProjectSummary,
  type SessionLiveState,
} from "@shared/contract";

const { invoke, on } = window.pi;

export const bridge = {
  settings: {
    get: () => invoke(IPC.settingsGet) as Promise<GuiSettings>,
    set: (patch: Partial<GuiSettings>) => invoke(IPC.settingsSet, patch) as Promise<GuiSettings>,
  },
  projects: {
    list: () => invoke(IPC.projectsList) as Promise<ProjectSummary[]>,
    openFolder: () => invoke(IPC.projectOpenFolder) as Promise<string | null>,
    files: (cwd: string) => invoke(IPC.projectFiles, cwd) as Promise<string[]>,
  },
  session: {
    open: (cwd: string, path: string) => invoke(IPC.sessionOpen, cwd, path) as Promise<SessionLiveState>,
    create: (cwd: string) => invoke(IPC.sessionNew, cwd) as Promise<SessionLiveState>,
    close: (key: string) => invoke(IPC.sessionClose, key) as Promise<void>,
    trash: (key: string, path: string) => invoke(IPC.sessionTrash, key, path) as Promise<void>,
    select: (key: string | null, cwd: string | null) => invoke(IPC.sessionSelect, key, cwd) as Promise<void>,
    live: () => invoke(IPC.sessionLive) as Promise<SessionLiveState[]>,
    restart: (key: string) => invoke(IPC.sessionRestart, key) as Promise<SessionLiveState | null>,
  },
  pi: {
    command: <T = unknown>(key: string, command: Record<string, unknown>) =>
      invoke(IPC.piCommand, key, command) as Promise<PiCommandResult<T>>,
    respond: (key: string, id: string, response: ExtensionUiResponse) =>
      invoke(IPC.piUiRespond, key, id, response) as Promise<void>,
    locate: () => invoke(IPC.piLocate) as Promise<string | null>,
  },
  git: {
    changes: (cwd: string) => invoke(IPC.gitChanges, cwd) as Promise<ChangedFile[]>,
    patch: (cwd: string, file: ChangedFile) => invoke(IPC.gitPatch, cwd, file) as Promise<string>,
  },
  events: {
    onPiEvent: (cb: (p: { key: string; event: PiEvent }) => void) => on(IPC.piEvent, cb as (p: unknown) => void),
    onLive: (cb: (s: SessionLiveState) => void) => on(IPC.sessionLiveChanged, cb as (p: unknown) => void),
    onProjectsChanged: (cb: () => void) => on(IPC.projectsChanged, cb),
    onGitChanged: (cb: (cwd: string) => void) => on(IPC.gitChanged, cb as (p: unknown) => void),
    onWindowFocus: (cb: (focused: boolean) => void) => on(IPC.windowFocus, cb as (p: unknown) => void),
  },
};
