import { contextBridge, ipcRenderer } from "electron";

const api = {
  invoke: (channel: string, ...args: unknown[]) => ipcRenderer.invoke(channel, ...args),
  on: (channel: string, listener: (payload: unknown) => void) => {
    const wrapped = (_e: Electron.IpcRendererEvent, payload: unknown) => listener(payload);
    ipcRenderer.on(channel, wrapped);
    return () => ipcRenderer.removeListener(channel, wrapped);
  },
  platform: process.platform,
};

contextBridge.exposeInMainWorld("pi", api);

export type PiBridge = typeof api;
