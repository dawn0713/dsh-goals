# dsh-goals: long-term goals and condition tracking in one place

[中文](README.md) | **English**

[![Release](https://img.shields.io/github/v/release/dawn0713/dsh-goals?label=release)](https://github.com/dawn0713/dsh-goals/releases)
[![DSH](https://img.shields.io/badge/DSH-0.2.1--rc.2-4b6bfb)](https://github.com/deepseek-ai/deepseek-harness)

A personal goals and condition-tracking plugin for DeepSeek Harness (DSH). It keeps two kinds of long-running work together:

- **Goals**: things you move forward step by step, such as an 8-week fitness plan.
- **Tracking**: things you watch over time, such as concert ticket sales, flight prices, or a stock threshold.

You do not start by choosing a feature or filling a parameter form. Describe what you want to move forward or watch; the agent asks one open question first, then follows your answer.

![Goals page: the red box marks the first click](https://raw.githubusercontent.com/dawn0713/dsh-goals/main/docs/images/goal-step-1.png)

## Walkthrough: an 8-week fitness goal

The red box in each image marks what to click.

**Step 1: click “Health & fitness”**

![Step 1: click Health & fitness](https://raw.githubusercontent.com/dawn0713/dsh-goals/main/docs/images/goal-step-1.png)

**Step 2: answer one question**

The agent does not dump a full questionnaire. It asks one question first. If it finds a similar existing plan, it asks how this request relates to that plan instead of duplicating it.

![Step 2: answer one question](https://raw.githubusercontent.com/dawn0713/dsh-goals/main/docs/images/goal-step-2.png)

Choose “Continue the existing plan and restart W1 this week” and submit. With no existing plan, this becomes an open “what do you want to move forward?” question, and later questions follow the answer.

**Step 3: open the goal and review its steps**

![Step 3: select the goal and review steps](https://raw.githubusercontent.com/dawn0713/dsh-goals/main/docs/images/goal-step-3.png)

Select the goal on the left (box 3); the right panel shows the definition of done, every step, and pause, resume, complete, archive, and delete actions (box 4). The example is an 8-week fat-loss starter plan: 2–3 hours per week at home, from baseline measurements and brisk-walk adaptation to strength work and a final review.

## Walkthrough: G.E.M. tour tracking

**Step 1: click “Condition tracking”**

![Step 1: click Condition tracking](https://raw.githubusercontent.com/dawn0713/dsh-goals/main/docs/images/tracking-step-1.png)

**Step 2: say what to watch**

The agent asks one open question: what do you want to watch, and what change should trigger a notification? It does not start with cadence and expiry.

![Step 2: say what to watch](https://raw.githubusercontent.com/dawn0713/dsh-goals/main/docs/images/tracking-step-2.png)

Enter “G.E.M. next tour announcement and ticket sales; weekly; expire 2027-12-31; preferred sources Damai, Fenwandao, Maoyan, Weibo” and submit.

**Step 3: open the tracking detail**

![Step 3: select the tracking and review history](https://raw.githubusercontent.com/dawn0713/dsh-goals/main/docs/images/tracking-step-3.png)

Select it under “Active tracking” (box 3); the detail shows the condition, cadence, preferred sources, last observation, and observation history (box 4). The first check runs immediately after creation, not one cadence later; source failures are recorded in the history.

## Example: China Mobile stock price

![China Mobile stock tracking steps](https://raw.githubusercontent.com/dawn0713/dsh-goals/main/docs/images/tracking-stock-steps.png)

This tracking uses a numeric threshold:

- Subject: China Mobile A-shares (600941).
- Condition: closing price below CNY 100.
- Cadence: daily.
- Observation: CNY 99.14, already below the threshold, so the monitor is triggered.

A trigger pauses scheduled checks by default to avoid repeated noise. The detail view offers **Keep watching** (resume after a cooldown), **Mark handled**, and **Stop monitoring**. Every summary, value, source, and failure is kept in the observation history.

## How intake works

1. Start with one open question: what do you want to move forward or watch?
2. Choose each next question from that answer; do not run a fixed questionnaire.
3. For tracking, establish the subject and what counts as a change before asking about cadence, expiry, and sources.
4. For goals, ask only for the missing current-state and planning details before proposing steps.
5. Do not ask the user to choose “goal vs tracking” before the first answer makes the need clear.

You can say “watch Beijing–Tokyo flights and tell me when round trips drop below CNY 3000”, or simply “I want to do something” and let the agent start.

## Install

Supports **DSH 0.2.1-rc.2 Web**; the package also retains alpha.1 / alpha.2 compatibility declarations. Requires Node.js `^22.19.0 || >=24.0.0` and a configured model for conversational planning.

Paste this URL into DSH **Plugins → Add plugin**, or use the CLI:

```sh
dsh plugin --profile web add "https://github.com/dawn0713/dsh-goals/releases/latest/download/dsh-goals.tgz"
```

Restart `dsh web` and refresh the page. A **个人目标** entry appears in the sidebar. The release includes Zod and precompiled code; no build is needed. Host dependencies are supplied by DSH. The npm package name remains `dsh-personal-goals`.

## Ideas integration

Companion plugin: [dsh-ideas](https://github.com/dawn0713/dsh-ideas).

![Ideas recommendations based on goals](https://raw.githubusercontent.com/dawn0713/dsh-goals/main/docs/images/ideas-link.png)

```text
Goals unfinished steps → Ideas cards → execute and verify in chat
        ↑                                      │
        └──── mark the matching step done ─────┘
```

Ideas reads Goals progress and turns unfinished steps into concrete suggestions. When the user confirms completion, Ideas writes back only the matching step; it never completes the whole goal or backfills historical completions. A failed synchronization keeps the completion record, shows the reason, and supports retry.

```sh
dsh plugin --profile web add "https://github.com/dawn0713/dsh-ideas/releases/latest/download/dsh-ideas.tgz"
```

Goals works independently. Only Ideas linked to a Goals step write back.

## Data and maintenance

Data is stored in `$DSH_HOME/storages/personal_goals.json`, normally `~/.dsh/storages/personal_goals.json`. Disabling or uninstalling the plugin does not delete the storage file. The UI refreshes about every five seconds. Weekly reviews and tracking checks are delivered into the original conversation and require DSH to be running. Planning and observations use the model configured in DSH. Overall goal completion, archiving, and deletion require user confirmation in the UI.

## Limitations

- Tracking observes only during scheduled conversation turns; there is no background polling between turns, and nothing runs while DSH is stopped.
- There is no external push channel; notifications return to the original conversation.
- The plugin never buys, books, pays, or performs an irreversible action.
- Some ticket and market pages are JS-rendered or require login. The plugin records those failures and uses search evidence where possible; confirm any match on the official channel.

## Repository

This repository distributes the compiled Goals implementation and installation packaging. It does not include the upstream TypeScript build project. See [verification](docs/VERIFICATION.md), [release instructions](docs/RELEASING.md), and [changelog](CHANGELOG.md).

## License

[MIT](LICENSE). Bundled Zod retains its own license.