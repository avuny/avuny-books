# Implementation plan: shared web + mobile structure

For an AI coding agent. Run one phase at a time, one branch/PR per phase. Stop after each phase and report.

## Agent operating rules
1. Read the `.agent` rules and every relevant AGENTS.md before starting.
2. Phase 0 changes nothing. Every later phase starts by re-checking that the Phase 0 findings still hold.
3. Never guess versions or setup steps. Read the official docs and pin exact versions. Do not add dependencies without asking: Phase 0 produces the full dependency list (with versions) for approval, and anything beyond it needs a new approval.
4. Keep diffs scoped to the phase. No unrelated refactors or renames.
5. Add tests only per the repo's testing guidelines (risk-based, not coverage-driven).
6. A phase is done only when its acceptance checks pass and lint, typecheck and build pass for the affected packages.
7. Report assumptions, deviations and open questions in the PR description. If a rule blocks you, say so and propose the change instead of working around it.
8. Create new packages only with `pnpm turbo gen workspace --type package --name @avuny/<name> --copy @avuny/contracts --destination packages/<name>` and follow the "Creating a new package or app" steps in the root AGENTS.md. Don't change the template's tooling; if it must change, say so and get approval.
9. Before finishing a phase, run the `definition-of-done` skill, and add changesets per the root AGENTS.md versioning rules where a package release is affected.

## Decisions (inputs, do not re-debate)
- Separate `@avuny/mobile-ui` and `@avuny/mobile-features`, mirroring `ui` and `web-features`.
- Mobile styling: Uniwind (Tailwind v4) with Reusables-style owned components.
- New `@avuny/theme` is the single source of design tokens.
- Shared strings live in `web-mobile-shared`; `@avuny/i18n` stays pure helpers.
- Apps are thin hosts. Admin stays a `web-features/admin` entrypoint.
- Assumed, verify in Phase 0: Expo Router is used; web `ui` is on Tailwind v4.
- The root AGENTS.md is the single source of truth for the package map and dependency rules. Rules live in `.agents/rules/`, skills in `.agents/skills/`. The exact edits are in `agents-md-updates.md`.

## Phase 0: Audit (no code changes)
Tasks: record the turbo tasks; Tailwind major version in web; Expo SDK, React Native version and New Architecture status; Expo Router vs React Navigation; where `useMessages` and the feature strings live today; existing module names; the current ESLint setup.
Acceptance: a short report in the PR description listing each finding and any mismatch with the assumptions above, with a proposed adjustment, plus the full list of new dependencies (name, exact version, target package) that later phases need. Stop for review and approval.

## Phase 1: Rules and guardrails
Tasks:
- Apply `agents-md-updates.md`: update the root AGENTS.md, edit the `shared-code-first` and `ui-i18n-rtl-theming` rules, add the `mobile-and-theme` rule to `.agents/rules/` and to the rules list in AGENTS.md, and update the existing nested AGENTS.md files. The new nested AGENTS.md files are created with their packages in Phases 2, 4, 5 and 6.
- Extend the existing import-boundary rules in `@avuny/eslint-config` with the new layers, and add the no-literal-string rule.
Acceptance: a deliberate violation of each boundary fails lint (add it, confirm the failure, remove it); the existing codebase passes or the pre-existing violations are listed.

## Phase 2: `@avuny/theme`
Tasks:
- Generate the package with `turbo gen` (copy of `@avuny/contracts`) and use its AGENTS.md text from `agents-md-updates.md`: typed token data for every theme x mode, and a generator for the web CSS variables.
- Switch `@avuny/ui` and the web hosts to the generated CSS with no visual change.
Acceptance: web and admin look identical in light/dark and every theme; removing one token from one theme fails typecheck.

## Phase 3: Shared messages
Tasks:
- Move `useMessages`, the provider and the shared catalogs into `web-mobile-shared/src/modules/<m>/messages`.
- Re-export `useMessages` from `web-features/core` so call sites don't change.
- Add the check that `ar` matches the shape of `en`, and that every domain error code has a message in every locale.
Acceptance: web and admin build and behave as before; no key exists in both shared and feature messages.

## Phase 4: `@avuny/mobile-ui`
Tasks:
- Generate the package with `turbo gen` and use its AGENTS.md text from `agents-md-updates.md`. Set up Uniwind from the official docs (https://docs.uniwind.dev/llms.txt, Monorepos page); add the generator output for the native theme to `@avuny/theme`.
- Check whether the package must export source instead of dist so Metro and Tailwind class scanning can see it. If so, raise it as a template deviation for approval; do not change the template silently.
- Add primitives with the same names and variants as `ui`: Text, Button, Input, Label, Card.
- Add a sandbox screen in `mobile-app` that shows them in light/dark, every theme, LTR and RTL.
Acceptance: the sandbox renders correctly in all combinations; a parity list (ui vs mobile-ui) is in the package's AGENTS.md.

## Phase 5: `@avuny/mobile-features` skeleton and first vertical slice
Tasks:
- Generate the package with `turbo gen`, then create `core` with the adapters (`Link`, `useNavigate`, `useParams`, `useLocale`, `useMessages`).
- Pick the first module a mobile screen needs (likely auth/OTP). Extract its hooks and forms from `web-features` into `web-mobile-shared/src/modules/<m>` if they are not shared yet, then build the mobile screens on them.
Acceptance: the web flow still works; the mobile flow works against the API; no logic is duplicated between the two feature packages.

## Phase 6: `apps/mobile-app` as a thin host
Tasks: `app/**` files re-export screens from `mobile-features`; providers, env, and the locale-change flow with the RTL reload; add `apps/mobile-app/AGENTS.md` from `agents-md-updates.md`.
Acceptance: the app contains no components, hooks or strings, only wiring.

## Phase 7: Remaining modules (repeat per module)
Recipe: (1) shared hooks, forms and messages; (2) web screens; (3) mobile screens; (4) parity check against `ui` and `mobile-ui`. One PR per module.

## Phase 8: Hardening
Tasks: CI runs lint, typecheck, build and test across the monorepo; add the light/dark x themes x LTR/RTL checklist to the PR template; update the AGENTS.md files.
Acceptance: CI is green from a clean checkout.

## Kickoff prompt
"Read the root and nested AGENTS.md, `.agents/rules` and `IMPLEMENTATION_PLAN.md`. Do Phase N only, following the operating rules. Stop and report when its acceptance checks pass."
