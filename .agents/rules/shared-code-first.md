---
trigger: model_decision
description: "Apply when adding or changing hooks, API calls, validation, formatting, state or business logic that more than one app (web, admin, mobile) may need. Decides which package it belongs in and keeps import direction clean."
---

# Share first, specialise last

Follow package boundaries and import directions. Search before writing: look in shared packages for an existing schema, hook, helper or service. Extend it; do not duplicate it.

## Where new code goes (first match wins)

| If it... | Put it in | Notes |
|---|---|---|
| is a request/response shape, enum or validation rule | `@avuny/contracts` | Runtime-agnostic, import `z` only from `@avuny/zod` |
| is a pure helper or Result type | `@avuny/utils` | Runtime-agnostic |
| touches the DB, migrations, or Drizzle schema | `@avuny/db` | Only `@avuny/api` imports it |
| is backend services, domain rules, or Hono routes | `@avuny/api` | Scoped by tenant/org |
| is logic web and mobile both need (API client, query hooks, session, form logic, formatters) | `@avuny/web-mobile-shared` | Platform-agnostic, no DOM lib |
| is a web UI primitive | `@avuny/ui` | Web only (shadcn/ui), logical CSS, theme tokens |
| is a web screen or feature component | `@avuny/web-features` | Core, web, admin entrypoints; thin host contract |
| is Vite host glue, router adapter, or providers | `@avuny/web-host` | Vite host apps only |
| is native-only UI or glue | `apps/mobile-app` | Expo / React Native |
| is routing, server entry, or host setup | the relevant app | `apps/*` (thin hosts) |

## Principles

1. **`@avuny/web-mobile-shared` is platform-agnostic:** no `react-dom`, `react-native`, framework router, `window`, `document` or `localStorage`. Platform differences are injected through small interfaces (token storage, navigation, locale detection) that each host implements.
2. **Hooks hold logic, screens hold pixels.** Hooks return data, status and actions; no JSX, styling or navigation.
3. **Copy-paste between web and mobile is a defect.** Extract shared logic into `@avuny/web-mobile-shared` in the same change.
4. **Apps stay thin:** routes, wiring and env only.
5. **Enforce import direction:** Apps import packages. Packages never import apps. `web-features` and `web-mobile-shared` never import `db` or `hono`.
6. If a rule blocks you, say so in the PR and propose the change; do not work around it.
