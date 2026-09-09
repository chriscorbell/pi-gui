# Drive pi as an RPC subprocess, not through its SDK

pi ships a Node SDK that could run the agent inside the Electron main process, and it also ships `pi --mode rpc`, a JSON-lines protocol over stdio. The app spawns the globally installed `pi` binary in RPC mode, one process per open Session, and never imports the SDK.

## Considered options

- **SDK in-process.** Typed API, no line framing, no process pool. Rejected because a crashing Extension would take the app down with it, because the app would have to bundle a specific pi version and keep Electron's Node compatible with it, and because upgrading pi would then mean cutting an app release.
- **RPC subprocess.** Process isolation, the exact pi version validated against llm-server, pi upgrades independent of the app, and the same wire contract a remote host would speak later. Costs an LF-only line splitter, reassembling streamed messages from deltas, and answering Extension dialog requests over stdin.

## Consequences

The app depends on the RPC protocol of whichever pi is on PATH. Anything the RPC surface does not expose, such as in-place tree navigation, waits until pi exposes it rather than being reached through the SDK.
