# Pier

Pier is a macOS desktop client for the pi coding agent. It drives the real pi program, so everything pi already knows (sessions, extensions, models, commands) is the source of truth; the app adds a graphical way to see and steer it.

## Language

**Pier**:
This app. The place a pi Session docks. Never called Pi, which is the agent.
_Avoid_: pi-gui, the GUI, the client

**Pi**:
The coding agent program Pier drives, installed separately as `@earendil-works/pi-coding-agent`.
_Avoid_: agent, backend, CLI

**Project**:
A directory on disk that pi runs in. Pi's working directory is the only thing that defines it.
_Avoid_: workspace, repo, folder

**Session**:
One conversation with pi in a Project, stored by pi as a single file. The app never owns a second copy of it.
_Avoid_: thread, chat, conversation

**Extension**:
A pi plugin that adds tools, commands, or dialogs. The app runs pi's extension system unchanged and renders whatever an Extension asks for.
_Avoid_: plugin, add-on

**Command**:
A slash-prefixed action typed into the composer, supplied by pi: an Extension command, a prompt template, or a skill.
_Avoid_: slash command, action

**Turn**:
One user prompt and everything pi does in response until it settles and waits for input. The unit the diff panel and status bar refresh on.
_Avoid_: run, request, round

**Queue**:
The ordered list of messages waiting to be delivered to pi while a Turn is in progress. Holds Follow-ups and Steering messages.
_Avoid_: pending messages, backlog

**Follow-up**:
A queued message delivered after the current Turn ends. The default for anything sent while pi is working.
_Avoid_: queued prompt, next message

**Steering**:
A queued message delivered mid-Turn, after pi's current tool calls finish and before its next model call. A Follow-up becomes Steering by explicit promotion.
_Avoid_: interrupt, inject, redirect

## Session status

**Working**:
A Turn is in progress in the Session, including time spent waiting on the model.

**Needs input**:
An Extension dialog is open in the Session and pi is blocked until it is answered.

**Unread**:
A Turn ended while the Session was not selected in a focused window. Clears the moment the Session is selected in a focused window.
_Avoid_: new, finished, done

**Idle**:
No Turn in progress and nothing unread.
