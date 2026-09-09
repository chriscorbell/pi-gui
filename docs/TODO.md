# Agreed but not done

Decisions from the 2026-09-08 design session that are still open, grouped by state. Delete lines as they land.

## Agreed for v1, built, never exercised

These exist in the code but no run has triggered them yet. Each needs one real check.

- [ ] Extension dialogs (select, confirm, input, editor) rendered as a sheet, and the needs-input sidebar state they set
- [ ] Image paste and the attach button in the composer, sent as prompt images
- [ ] `@` file mention popup inserting a project-relative path
- [ ] ArrowUp prompt history recall in an empty composer
- [ ] Follow-up queue: remove an item, promote an item to steering
- [ ] Light theme, and the system/light/dark switch in settings
- [ ] Sounds: chime on an unseen turn end after 15 seconds, ping when an Extension dialog opens unseen, mute toggle
- [ ] Dock badge counting Unread plus Needs input sessions
- [ ] Unread clearing when the Session is selected in a focused window
- [ ] Crash banner with the Restart button when a pi process exits
- [ ] Extension widgets (`setWidget`) rendered above the composer
- [ ] Session rename, Trash, and Compact from the header menu

## Agreed for v1, missing or partial

- [ ] Auto-retry status line needs an "Abort retry" action (round 3, failure handling)
- [ ] Compact action should accept optional instructions (round 3, compaction)
- [ ] Split/unified toggle belongs in the Changes panel header, not only in settings (round 3, diff presentation)
- [ ] Reopen the last Session on launch when it was started in the app that run (path is now persisted; verify after a restart)

## Agreed for later

Explicitly pushed past v1 during the grilling, in rough priority order.

- [ ] Embedded terminal in the right panel (replaces the `!` shell prefix we chose not to build)
- [ ] Git actions: stage, commit, branch, worktree per Session
- [ ] Per-turn diff checkpoints using hidden git refs
- [ ] Session tree: fork from a message, branch navigation, labels
- [ ] Command palette (Cmd+K) and Cmd+1..9 session switching
- [ ] Tool approval gate as a bundled Extension with a permission-mode picker
- [ ] Remote pi host over a socket transport, same contract, UI unchanged
- [ ] Project trust dialog instead of always passing `--approve`, if the app is ever published
- [ ] Code signing and notarization for the DMG

## Open questions never decided

- [ ] Sidebar rows are 28px tall after the type bump; loosen to 32px?
- [ ] In llm-server, `opencode.jsonc`, `scripts/bench.py`, `eval/vision_check.py`, and `.pi/prompts/bench.md` still read `LLM_SERVER_API_KEY` from the environment, which no longer exists in new shells
- [ ] pi's `shellCommandPrefix` pulls the `ls` alias to eza, which prints nothing for `ls` with no path in a non-TTY; affects the TUI too
