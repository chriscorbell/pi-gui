# pi session files are the only persistence

The app stores no conversation, Project, or Session state of its own. pi's JSONL session files under `~/.pi/agent/sessions` are the single source of truth. Projects are derived from the session directories that still exist on disk, Session titles come from pi's own session-name entries or the first user message, and the open Session's transcript is read from the live pi process. Only GUI preferences, such as panel widths and the thinking-block default, live in `~/.pi/gui/settings.json`.

## Why

A Session started in the GUI must resume with `pi -c` in a terminal and the other way round. A second store would drift from the TUI the first time either side changed a session out of band, and every feature that wants its own table, from per-turn checkpoints to a curated Project list, would pull the app toward owning data it cannot keep consistent.

## Consequences

The sidebar listing parses session file headers directly and is coupled to pi's session format version. Cleaning the sidebar means deleting session directories, not hiding them. Per-turn diff checkpoints, if ever added, must live in git refs, not in an app database.
