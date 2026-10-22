# dsh-goals

[中文](README.md) | **English**

A personal goals and condition-tracking plugin for DeepSeek Harness (DSH). Plan through conversation, keep ordered steps across sessions, review progress, and connect execution to [Ideas](https://github.com/dawn0713/dsh-ideas).

## Install

Supports DSH **0.2.1-alpha.1 and 0.2.1-alpha.2 Web** with one package. Requires Node.js `^22.19.0 || >=24.0.0` and a configured model for conversational planning.

Paste this URL into DSH **Plugins → Add plugin**, or use the CLI:

```sh
dsh plugin --profile web add "https://github.com/dawn0713/dsh-goals/releases/latest/download/dsh-goals.tgz"
```

Restart `dsh web` and refresh the page. A **个人目标** entry appears in the sidebar. The release includes Zod and precompiled code; no build is needed. Host dependencies are supplied by DSH. The npm package name remains `dsh-personal-goals`.

## Features

- Guided planning across health, relationships, finance, career, interests, productivity, and other directions.
- Ordered steps, progress tracking, pause/resume, archiving, and weekly check-ins in the original conversation.
- Condition tracking at 6/12-hour, daily, or weekly intervals, with observation history and pause on a match. Checks run in scheduled conversation turns while DSH is running.
- Ideas reads unfinished steps and returns completion to the matching step after execution is verified or explicitly confirmed. Failed synchronization remains visible and can be retried. Completing one step does not complete the entire goal.

Goals works independently. Install [Ideas](https://github.com/dawn0713/dsh-ideas) separately to enable the round trip.

## Data and maintenance

Data is stored in `$DSH_HOME/storages/personal_goals.json`, normally `~/.dsh/storages/personal_goals.json`. Planning and observations use the model configured in DSH. The UI refreshes about every five seconds. Overall goal completion, archiving, and deletion require user confirmation in the UI.

This repository distributes the compiled Goals 0.2.0 implementation with dual-version packaging. It does not include the original upstream TypeScript build project. Runtime code is unchanged.

See [verification](docs/VERIFICATION.md), [release instructions](docs/RELEASING.md), and [changelog](CHANGELOG.md).

## License

[MIT](LICENSE). Bundled Zod retains its own license.
