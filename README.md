<p align="center"><img src="assets/logo.svg" width="96" alt="Pi"></p>

# Pi

A macOS desktop client for the [pi](https://github.com/earendil-works/pi-mono) coding agent, laid out like T3 Code: projects and sessions on the left, the conversation in the middle, working-tree changes on the right.

The app drives the `pi` you already have installed. It spawns `pi --mode rpc` per open session, so your models, settings, extensions, and slash commands work unchanged, and a session started here resumes with `pi -c` in a terminal.

## Installing the DMG

The app is ad-hoc signed, not notarized, so the first launch of a downloaded copy shows a Gatekeeper prompt. Open System Settings, Privacy & Security, and click Open Anyway, or clear the quarantine flag once:

```bash
xattr -dr com.apple.quarantine /Applications/Pi.app
```

Updates the app installs itself never carry the flag, so this is a one-time step.

## Requirements

- macOS on Apple silicon
- `pi` 0.85 or newer on PATH (`npm install -g @earendil-works/pi-coding-agent`)
- Node 22 and pnpm for development

## Run it

```bash
pnpm install
pnpm dev
```

`pnpm dist` builds an unsigned DMG and zip into `release/`. Tagged pushes (`v*`) build both in GitHub Actions and attach them to a release. The installed app checks GitHub Releases on launch and every six hours, and updates itself from the zip when you click Install; Check for Updates in the Pi menu does the same on demand. Unsigned apps cannot use Squirrel, so the update swaps the bundle in place and relaunches, which needs the app to live in a folder you own, such as `/Applications` or `~/Applications`.

## What it does

- Lists every project pi has run in, derived from `~/.pi/agent/sessions`, with the sessions under each
- Streams the transcript: markdown, collapsed thinking, tool calls with live output, edit diffs inline
- Composer with `/` commands from pi, `@` file mentions, image paste, and ArrowUp history
- Follow-up queue while a turn runs, with promotion to steering
- Model and thinking-level pickers, a context meter, and the status text your extensions publish
- Read-only diff of the project's working tree against HEAD, refreshed as files change, plus a login shell in the project directory
- Current git branch in the header
- Extension dialogs (select, confirm, input, editor) rendered as sheets, notifications as toasts
- Unread and needs-input markers in the sidebar and a Dock badge

App-only preferences live in `~/.pi/gui/settings.json`. Everything else stays in pi's own configuration.

See [CONTEXT.md](CONTEXT.md) for the vocabulary and [docs/adr](docs/adr) for the two decisions that shape the code.
