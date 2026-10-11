---
trigger: model_decision
description: "Apply when about to copy and rename an existing file or folder, create the third similar module, screen, route or provider, or hand-maintain a file that mirrors another source. Decides between refactor, Turborepo generator, or script."
---

# Repetition: refactor, generate or script

Noticing repetition is part of the job. Don't just do the third copy by hand.

## Signals
- About to create the **third** similar file, module, screen, route, schema or provider.
- Copying a feature folder and renaming things.
- 10+ lines of structural boilerplate repeating with only names changed.
- A file kept in sync with another source by hand (barrels, locale key types, `.env.example` skeleton, route lists, API client types).

## Decide
| The repetition is... | Do this |
|---|---|
| The same **logic** in 2+ places | Refactor into shared code. Not a generator. |
| The same **structure**, different names | **Turborepo generator** (`turbo gen`); use the `add-generator` skill. |
| A **derived** file that must match a source of truth | A **script** run as a Turborepo task, plus a check that fails when stale. |
| A one-off bulk change | A throwaway script or codemod; don't commit unless reusable. |

## Before creating anything
1. Look for an existing generator in `turbo/generators/` (root or workspace). If one fits, run it non-interactively: `turbo gen <name> --args <answers>`.
2. If none fits but the signals are present, finish the current task, then build the generator or script in a **separate commit** (ideally a separate PR).
3. Say it in the PR: "Repetition found: <what>, <how many times>, <decision>".
4. Ask first if the change alters conventions or touches more than a handful of existing files.

## Generator rules
- Generate **structure, not business logic**; mark hot spots `TODO(gen)`.
- Output passes every gate untouched (typecheck, lint, tests, env and i18n checks), including stub locale keys, schema, wiring and registry entries.
- Refuse to overwrite existing files; safe to run twice.
- Templates come from real, reviewed instances; update them when conventions change.
- Custom generators can't use ESM-only dependencies; stick to Plop helpers and Node built-ins.

## Script rules (derived files)
- Header comment names the source of truth: `Generated from <source> by <script>. Do not edit.`
- Declare inputs and outputs in `turbo.json` for correct caching.
- A check regenerates and fails on any diff; CI runs it. Prefer deriving over hand-syncing.
