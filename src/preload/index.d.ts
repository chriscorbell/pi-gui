export interface PiBridge {
  invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
  on: (channel: string, listener: (payload: unknown) => void) => () => void;
  platform: string;
}

declare global {
  interface Window {
    pi: PiBridge;
  }
}
