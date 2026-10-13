# AGENTS.md

Guidance for AI coding agents working in this repo. Keep changes small, follow the rules below, and ask before breaking one. Package-specific rules live in the nearest nested `AGENTS.md` (for example `packages/api/AGENTS.md`).

## Project

A multi-tenant SaaS for small and medium businesses (SMBs): one integrated system to run inventory, sales, purchasing and cash, and to see where the business stands financially. The central bet is closing the gap between day-to-day operations (stock, orders, purchases) and their financial consequences (receivables, payables, cost of goods, cash).

## Layout

Turborepo monorepo, package scope `@avuny/*`.

```text
apps/
  hono-node-server/     Node entry for VPC/Railway/Docker: env, mount `api`, serve, shutdown
  hono-vercel-server/   Vercel entry for the same `api` app
  web-app/              Public app (Vite). Host only: routes, guards, layouts, providers
  admin-app/            Internal admin dashboard (Vite). Host only, same rule
  mobile-app/           Expo (Router). Host only: app/ files re-export screens, layouts, providers
packages/
  api/                  Modules: repositories, services, Hono routes. Has its own AGENTS.md
  db/                   Drizzle schema, migrations, client. Only `api` imports it
  hono/                 Shared Hono middleware, createOpenAPIRouter, handleResult, request language
  logger/               Shared logger
  i18n/                 Locale type, default locale, ltr/rtl direction, resolveLocale
  zod/                  The only source of `z`, plus locale helpers
  contracts/            Zod schemas and shared types for api, web and mobile
  utils/                Runtime-agnostic helpers (including the ok/fail Result)
  theme/                Design tokens (typed data) and generated web CSS / native theme. Runtime-agnostic
  ui/                   shadcn/ui components. Web only
  mobile-ui/            Native primitives (Uniwind). Twin of `ui`. Native only
  web-features/         Framework-agnostic web features split into core, web, admin (`@avuny/web-features/core`, `web`, `admin`)
  mobile-features/      Native features split by module (`core`, `modules/<m>`). Twin of `web-features`
  web-host/             Vite host glue: router adapter, locale store, HostProviders
  web-mobile-shared/    API client, query hooks, session, form logic, formatters, shared messages. No DOM, no react-native
  eslint-config/        Shared lint presets and import-boundary rules
  typescript-config/    Base tsconfigs
```

## Dependency rules

- Apps import packages. Packages never import apps.
- `i18n`, `utils`, `zod`, `contracts`: runtime-agnostic. No Node, DOM or db imports.
- `web-features` and `web-mobile-shared`: never import `db` or `hono`. Import `api` only as `import type` (e.g. `AppType`).
- `web-features`: no `next/*` and no router library. Routing and locale come only from `@avuny/web-features/core` (or `@avuny/web-features/host`).
- `web-mobile-shared`: no DOM. It is compiled without the DOM lib.
- `ui` is web only. Mobile must not import it. `mobile-ui` is native only. Web must not import it.
- Import `z` only from `@avuny/zod`. Import the `Locale` type only from `@avuny/i18n`.
- Only `hono` uses `node:async_hooks`.

Layers: a package imports only from lower layers, and never across web and mobile.
  L0 contracts, utils, i18n, theme, zod
  L1 web-mobile-shared
  L2 ui | mobile-ui
  L3 web-features | mobile-features
  L4 apps (web-host is host glue, used only by the Vite apps)
ui, web-features, web-host: never import react-native* or @avuny/mobile-*.
mobile-ui, mobile-features: never import react-dom, @avuny/ui or @avuny/web-*. Never import db or hono; api only as import type.
web-mobile-shared: no DOM and no react-native. Never imports ui or any features package.
theme: runtime-agnostic: no React, DOM or react-native.
These are enforced by lint in @avuny/eslint-config. Do not disable them.

## Backend conventions

- Modules, services, routes, errors and server translations: follow `packages/api/AGENTS.md`.
- Tenant isolation: every tenant-owned query is scoped by organization.
- Lists: data lists support filtering, sorting and offset pagination (page number). Dropdown lists use cursor pagination.
- Schema changes go in `packages/db`. Generate migrations with drizzle-kit and never hand-edit an applied migration.
- Request language: `resolveRequestLanguageMiddleware` sets it once per request. Zod messages follow it through `installRequestLanguage()`, called once at startup. The server never calls `setZodLocale` or `i18n.changeLanguage`: both are global and race between concurrent requests.

## Frontend conventions

- Apps are thin hosts: route table, QueryClient, env, guards and layouts. Pages and logic live in `web-features` (web) or `mobile-features` (mobile).
- Features import routing and locale only from `@avuny/web-features/core` (or `@avuny/web-features/host`) (`Link`, `useNavigate`, `useParams`, `useSearchParams`, `usePathname`, `useLocale`, `useMessages`).
- Path constants live with the feature. Links and the host's route table both use them.
- API calls go only through the Orval-generated clients and TanStack Query hooks. Never hand-write fetch code for an API endpoint. Regenerate with the `regenerate-api-clients` skill.
- Tables use TanStack Table.
- RTL and themes: use logical CSS properties (start/end, not left/right). Use theme tokens for color (light, dark and multiple themes), never hard-coded colors.
- Strings: `Locale`, direction and `resolveLocale` come from `@avuny/i18n` (helpers only, no catalogs). Strings used by both web and mobile live in `web-mobile-shared/src/modules/<module>/messages` (`en` is the shape, other locales typed as `typeof en`). Platform-only strings live next to the feature in `web-features` or `mobile-features`. A key never exists in both. `useMessages` lives in `web-mobile-shared` and is re-exported from each features package's core. Server error text lives in `api` (i18next).
- Modules mirror across layers, with the same names:
  ```text
  web-mobile-shared/src/modules/<m>/{api,hooks,forms,messages}
  web-features/src/modules/<m>/{screens,components,paths.ts,messages.ts}
  mobile-features/src/modules/<m>/{screens,components,messages.ts}
  ```
- Hooks return data, status and actions (no JSX, styling or navigation). Logic needed by both platforms goes in `web-mobile-shared` in the same change; copying it between `web-features` and `mobile-features` is a defect. Create a mobile module only when a mobile screen needs it.
- Mobile: `apps/mobile-app` only re-exports screens from `mobile-features` (Expo Router `app/` files), plus layouts and providers. Native UI comes from `mobile-ui`, which mirrors `ui` (same names, props, variants). See the `mobile-and-theme` rule.
- Tokens: colors, radius, spacing and type scale come from `@avuny/theme`. Never hand-edit its generated files.

## Commands

Run from the repo root. Tasks run through Turborepo.

- Dev: `turbo run dev --filter=<app>`
- Build: `turbo run build`
- Lint: `turbo run lint`
- Typecheck: `turbo run typecheck`
- Test: `turbo run test --filter=<package>`
- API clients: `openapi:generate`, then `api:generate` (root scripts)

## Agent setup

- `AGENTS.md` files are the single source of truth. Nested ones add package rules.
- `CLAUDE.md` files only contain `@AGENTS.md`. Do not put shared rules in `CLAUDE.md` or `GEMINI.md`, only tool-specific ones.
- Rules live in `.agents/rules/` (`env-and-config`, `mobile-and-theme`, `provider-strategy-pattern`, `repetition-and-codegen`, `shared-code-first`, `shared-contracts-and-validation`, `ui-i18n-rtl-theming`).
- Skills live in `.agents/skills/`:
  - `add-feature`: build a vertical slice across contracts, db, api, shared hooks, UI and tests (when a mobile counterpart is needed, also cover shared messages and the `mobile-features` screens)
  - `add-api-module`: scaffold a domain module in `packages/api`
  - `add-api-route`: add an HTTP endpoint with OpenAPI and typed domain errors
  - `add-error-code`: add domain error codes, HTTP status mapping, and translations
  - `add-provider`: implement pluggable integrations with the provider/strategy pattern
  - `add-generator`: scaffold repetitive code via `turbo gen` or derived scripts
  - `regenerate-api-clients`: regenerate OpenAPI spec and TanStack Query clients
  - `definition-of-done`: final verification checklist before completing a task or PR (for UI changes, check light/dark x themes x LTR/RTL, and `ui` / `mobile-ui` parity)
  - `add-ui-primitive` (optional later skill): adds a primitive to `ui` and `mobile-ui` together

## Working rules for agents

- Check the dependency rules before adding an import or a package.
- Keep diffs small. Do not refactor unrelated code.
- Do not add dependencies without asking.
- Do not edit generated files or applied migrations.
- After changing an API route, contract or error response, run the `regenerate-api-clients` skill.
- Before finishing, run lint and typecheck for the packages you touched.
- Never commit secrets or `.env` files.


## Git Commit Message Guidelines

When asked to review Git changes or suggest a commit message:

1. Inspect `git status`, `git diff`, and `git diff --cached` to understand the working tree and staged changes. Inspect relevant untracked files when necessary.
2. Understand the actual changes before describing them. Never guess the purpose or claim behavior that is not supported by the code.
3. Use Conventional Commits when appropriate: `feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `build`, `ci`, or `chore`.
4. Write a concise subject, ideally under 72 characters, using the imperative mood.
5. Add a moderately detailed body that explains the main changes and important implementation details. Use 3–6 bullets when multiple points warrant explanation; do not force bullets for simple changes.
6. Group related changes logically instead of listing every modified file. Mention important architectural, behavioral, or configuration changes when relevant.
7. Keep the message informative but concise. Avoid repetition, vague descriptions, and unnecessary implementation details.
8. If the changes contain unrelated logical changes, recommend splitting them into separate commits.
9. Do not modify files, stage changes, create commits, or run destructive Git commands when only asked to suggest a message.

Output only the proposed commit message in a Markdown code block, ready to copy into Git.


## Versioning and Changelog Rules

- Use Changesets for package release metadata.
- Never manually edit package versions or generated
  changelogs when Changesets should manage them.
- After implementing a change, inspect the Git diff
  and identify affected workspaces and public APIs.
- Create a changeset for every change that requires
  a package release.
- Use patch for backward-compatible bug fixes,
  minor for backward-compatible features, and major
  for breaking public API changes.
- Do not bump versions for formatting, internal
  refactoring, or documentation-only changes unless
  the release policy requires it.
- Do not assume every dependent app needs a version
  bump merely because a shared package changed.
- Do not create a changeset for every commit; group
  related work into meaningful release changes.
- Never run a release or publish command unless
  explicitly authorized.
- Run the repository's actual scripts, not assumed
  commands. Check each workspace's package.json and
  the root task configuration.
- Report affected workspaces, proposed bumps,
  tests executed, and any unresolved release risks.


## Base node package
`packages/contracts` is the reference. Every library package has this shape:

packages/<name>/
  src/index.ts           the only public entrypoint
  src/*.test.ts          vitest, next to the code
  package.json           name @avuny/<name>, private, exports point to dist
  tsconfig.json          extends @avuny/typescript-config/base.json
  tsconfig.build.json    emits to dist/, tests excluded
  eslint.config.js       spreads @avuny/eslint-config/base
  AGENTS.md              package purpose and package-specific rules
  CLAUDE.md              only `@AGENTS.md`

Keep the template's script names (dev, build, lint, typecheck, test, ...)
so `turbo run <task>` works everywhere.

## Creating a new package or app
- Never hand-write or hand-copy package files. Generate them:
  `pnpm turbo gen workspace --type package --name @avuny/<name> --copy @avuny/contracts --destination packages/<name>`
- For an app, copy the closest existing app of the same kind instead
  (Vite: apps/web-app, Hono server: apps/hono-node-server, Expo: apps/mobile-app),
  with `--type app --destination apps/<name>`.
- After generating: delete any copied `dist/`, `.turbo/`, `node_modules/`; write the
  purpose line in the new AGENTS.md; run `pnpm install`; then
  `pnpm turbo run build lint typecheck test --filter=@avuny/<name>`.
  Don't report done until all four pass.
- Internal dependencies use `workspace:*`. Don't change the template's tooling
  (test runner, tsconfig base, scripts) in a new package. If you think the
  template should change, say so instead.
- theme, mobile-ui and mobile-features: generate from `@avuny/contracts` like any package, then add their dependencies (ask first). If the template must change for them (for example exporting source instead of dist so Metro and Tailwind class scanning can see it), say so and get approval instead of changing it silently, and record the deviation in the package's AGENTS.md.


  ## Testing (Vitest)

Tests are executable behavioral contracts: write them to protect behavior that must survive refactoring, not to raise coverage. Aim for risk-based coverage, not 100%. Before adding a test, ask: would it matter if this behavior silently broke, and would the test survive a behavior-preserving refactor? If not, skip or rewrite it.

### What to test
- Business rules, domain logic, validation, important edge cases
- Authentication, authorization, security, tenant/data isolation
- Error handling and `Result` behavior
- State changes, data integrity, transactions, critical workflows
- API status codes, response shapes, cookies, error mapping
- Regression tests for bugs that actually occurred

Always cover important negative paths, not just success.

### What not to test
- Trivial getters/setters, simple pass-through delegation, framework behavior
- Implementation details (private helpers, internal call order) and trivial helpers like `ok()` / `fail()`
- Branches that exist only for coverage, or the same behavior at several layers

### By layer
| Layer | Verify | Notes |
|---|---|---|
| Service / use case | Business rules, success and failure paths, security invariants, side effects, state transitions, edge cases | Main coverage lives here |
| Route | Request validation, auth wiring, use-case call, status codes, serialization, cookies/headers, error→HTTP mapping | Keep thin; don't repeat service logic |
| Integration | DB queries, transactions, repositories, tenant isolation, critical end-to-end flows | Real infrastructure, test database only |

Unit tests mock only I/O boundaries (repositories, external APIs, token providers, password hashing, email/SMS) and use real pure functions when they are cheap. Tenant isolation tests create two tenants and assert A can never read or change B's data.

### Writing tests
- Arrange → Act → Assert. Name tests by observable behavior: `returns an error when the password is incorrect`.
- Assert on returned values and state changes. For negative paths, also assert that forbidden side effects did not happen: invalid OTP → user not created; invalid credentials → no tokens generated; failed refresh verification → old token not deleted.
- Use small, typed mock factories (e.g. `createUserRepoMock(overrides?)`), not large global mocks. Fresh mocks per test, no shared state.
- No `any`; narrow type assertions are fine for test doubles.
- Keep tests deterministic: control time and randomness (`vi.useFakeTimers()`, injected clocks), no real network.
- Co-locate as `src/*.test.ts` and import `describe`, `it`, `expect`, `vi` from `"vitest"` (no globals).

### Rules for AI agents
Tests are part of the project contract. When changing code:
1. Read the relevant tests first. Treat passing tests as requirements unless the requirement intentionally changed; if it did, update them in the same change and say why.
2. Run focused tests first (`pnpm --filter @avuny/<pkg> exec vitest run <path>`), then the package suite (`pnpm --filter @avuny/<pkg> test`).
3. If a test fails, decide whether the code or the requirement is wrong before touching the test.
4. Never delete, skip (`it.skip`), or weaken a test just to get green, and never leave `it.only` behind.
5. When fixing a real bug, add a regression test if practical, ideally one that fails before the fix.
6. Prefer a few high-value tests over large repetitive suites.

## Database seeding
- Follow the `database-seeding` skill when creating, modifying, or debugging database seed files.
- Keep database infrastructure and reusable seed logic in `packages/db`, not `packages/api`.
- Never run destructive database operations or seed production without explicit authorization.