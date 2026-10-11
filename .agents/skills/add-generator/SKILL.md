---
name: add-generator
description: Creates or extends a Turborepo code generator (turbo gen) or a derived-file script when repetitive scaffolding is found. Use after the repetition rule says "generate", when asked to add a generator, or when copying a feature, provider or screen set by hand for the third time.
---

# Add a generator

Read the `repetition-and-codegen` rule first. Work in a separate commit from feature work.

## Decide
- Same logic repeated? Refactor; stop here.
- Same structure, different names? Generator (below).
- A file that must mirror a source of truth? Script (end of this skill).

## Steps (generator)
1. **Collect 2 or 3 real instances** and diff them. Identical parts become the template; differences become prompts.
2. **Set up once** if missing: `@turbo/gen` as a root devDependency, `turbo/generators/config.ts`, a root script `"gen": "turbo gen"`. Cross-package generators live at the root; package-specific ones can live in that workspace.
3. **Write templates** in `turbo/generators/templates/` as Handlebars (`.hbs`) using Plop case helpers (`pascalCase`, `camelCase`, `kebabCase`, `constantCase`). Mirror the real layout, including specs and stub locale keys.
4. **Define the generator** with `plop.setGenerator(...)`: validated prompts (kebab-case names, reject existing paths), `add` actions for new files, `append` or `modify` actions for registries and barrels using marker comments (for example `// gen:exports`).
5. **Make it non-interactive friendly:** every prompt answerable with `turbo gen <name> --args <answers>`.
6. **Verify:** run with a throwaway name, then run all gates. Fix the template until it passes untouched. Delete the throwaway output.
7. **Align drifted instances** in their own commit.
8. **Record it** in the project's generators list and in `add-feature` if it replaces a manual step.

## Steps (derived-file script)
1. Script under `scripts/`, exposed as `gen:<thing>` plus a check variant that fails on diff.
2. Turborepo task with explicit `inputs` and `outputs`.
3. Header comment naming the source of truth; wire the check into CI.

## Never
- Generate business logic, secrets or real credentials.
- Write outside the declared folders.
- Leave a generator whose output fails the gates.
