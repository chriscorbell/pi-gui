# Agreed but not done

Decisions from the 2026-09-08 design session that are still open. Delete lines as they land.

## Verified 2026-09-09

Everything in the original "built but never exercised" list was run against the dev app and passed: extension dialogs (select, confirm, input, editor) with the needs-input state, image paste and send, `@` file mentions, ArrowUp history, queue remove and promote, light theme, unread clearing on focus, the crash banner and Restart, extension widgets and status text, composer prefill from an extension, rename, Trash, and Compact. Sounds and the Dock badge were confirmed by Chris. Also verified: reopen of an app-started session after a restart.

Shipped alongside: Stop retrying button, Compact with optional instructions, split/unified toggle in the Changes panel, a plain login shell per session in the Terminal tab, and the current branch shown in the header.

## Agreed for later

- [ ] Git actions beyond the branch indicator: nothing planned for now
- [ ] Session tree: fork from a message, branch navigation, labels
- [ ] Command palette (Cmd+K) and Cmd+1..9 session switching
- [ ] Remote pi host over a socket transport, same contract, UI unchanged

## Decided against

Tool approval gate, project trust dialog, code signing, sidebar row height change.

## Open questions

- [ ] Per-turn diff checkpoints: still to be explained and decided
- [ ] Agent shell isolation from the interactive zsh setup (the eza `ls` alias): recommendation pending Chris's call
