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
  mobile-app/           Expo / React Native
packages/
  api/                  Modules: repositories, services, Hono routes. Has its own AGENTS.md
  db/                   Drizzle schema, migrations, client. Only `api` imports it
  hono/                 Shared Hono middleware, createOpenAPIRouter, handleResult, request language
  logger/               Shared logger
  i18n/                 Locale type, default locale, ltr/rtl direction, resolveLocale
  zod/                  The only source of `z`, plus locale helpers
  contracts/            Zod schemas and shared types for api, web and mobile
  utils/                Runtime-agnostic helpers (including the ok/fail Result)
  ui/                   shadcn/ui components. Web only
  web-features/         Framework-agnostic web features split into core, web, admin (`@avuny/web-features/core`, `web`, `admin`)
  web-host/             Vite host glue: router adapter, locale store, HostProviders
  web-mobile-shared/    API client, query hooks, formatting. No DOM
  eslint-config/        Shared lint presets and import-boundary rules
  typescript-config/    Base tsconfigs
```

## Dependency rules

- Apps import packages. Packages never import apps.
- `i18n`, `utils`, `zod`, `contracts`: runtime-agnostic. No Node, DOM or db imports.
- `web-features` and `web-mobile-shared`: never import `db` or `hono`. Import `api` only as `import type` (e.g. `AppType`).
- `web-features`: no `next/*` and no router library. Routing and locale come only from `@avuny/web-features/core` (or `@avuny/web-features/host`).
- `web-mobile-shared`: no DOM. It is compiled without the DOM lib.
- `ui` is web only. Mobile must not import it.
- Import `z` only from `@avuny/zod`. Import the `Locale` type only from `@avuny/i18n`.
- Only `hono` uses `node:async_hooks`.

## Backend conventions

- Modules, services, routes, errors and server translations: follow `packages/api/AGENTS.md`.
- Tenant isolation: every tenant-owned query is scoped by organization.
- Lists: data lists support filtering, sorting and offset pagination (page number). Dropdown lists use cursor pagination.
- Schema changes go in `packages/db`. Generate migrations with drizzle-kit and never hand-edit an applied migration.
- Request language: `resolveRequestLanguageMiddleware` sets it once per request. Zod messages follow it through `installRequestLanguage()`, called once at startup. The server never calls `setZodLocale` or `i18n.changeLanguage`: both are global and race between concurrent requests.

## Frontend conventions

- Apps are thin hosts: route table, QueryClient, env, guards and layouts. Pages and logic live in `web-features`.
- Features import routing and locale only from `@avuny/web-features/core` (or `@avuny/web-features/host`) (`Link`, `useNavigate`, `useParams`, `useSearchParams`, `usePathname`, `useLocale`, `useMessages`).
- Path constants live with the feature. Links and the host's route table both use them.
- API calls go only through the Orval-generated clients and TanStack Query hooks. Never hand-write fetch code for an API endpoint. Regenerate with the `regenerate-api-clients` skill.
- Tables use TanStack Table.
- RTL and themes: use logical CSS properties (start/end, not left/right). Use theme tokens for color (light, dark and multiple themes), never hard-coded colors.
- Strings: `Locale`, direction and `resolveLocale` come from `@avuny/i18n`. Server error text lives in `api` (i18next). Feature UI strings live next to the feature, with `en` as the shape and other locales typed as `typeof en`.

## Commands

Run from the repo root. Tasks run through Turborepo.

- Dev: `turbo run dev --filter=<app>`
- Build: `turbo run build`
- Lint: `turbo run lint`
- Typecheck: `turbo run typecheck`
- Test: `turbo run test --filter=<package>`
- API clients: `openapi:generate`, then `api:generate` (root scripts)

<!-- TODO(confirm): package manager, install command, and the exact task names in turbo.json. -->

## Agent setup

- `AGENTS.md` files are the single source of truth. Nested ones add package rules.
- `CLAUDE.md` files only contain `@AGENTS.md`. Do not put shared rules in `CLAUDE.md` or `GEMINI.md`, only tool-specific ones.
- Skills live in `.agents/skills/` (symlinked into `.claude/skills/` for Claude Code). Prefer them for adding modules, routes and error codes, and for regenerating clients: `add-api-module`, `add-api-route`, `add-error-code`, `regenerate-api-clients`.

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
