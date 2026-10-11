---
name: add-feature
description: Builds a new feature end-to-end as a vertical slice: contracts, database, server module, shared hooks, web UI, mobile screens, i18n, tests and docs. Use when asked to implement a module, screen set or user-facing capability that spans server and clients.
---

# Add a feature (vertical slice)

## 0. Anchor
Find the requirement IDs and work package (PRD, plan). If missing, write them first or ask. Check for a generator (`turbo/generators/`) and run it with `turbo gen <name> --args ...` before scaffolding by hand. If you catch yourself copying a feature folder, follow the `repetition-and-codegen` rule.

## 1. Order of work
1. **Contracts (`@avuny/contracts`):** schemas, enums, error codes, message keys only. Import `z` from `@avuny/zod`.
2. **DB (`@avuny/db`):** table(s) and a generated migration via drizzle-kit; never edit an applied migration. Scoped by organization.
3. **Server module (`@avuny/api`):** repositories, services, errors (plus errors map), intl messages (`en.json`, `ar.json`), routes built from contracts, mount in `src/routes.ts`.
4. **Config:** new env variable? Follow the env rule.
5. **Shared client (`@avuny/web-mobile-shared`):** typed API calls, query keys, hooks, form hooks, platform adapters (no DOM lib). Regenerate with `regenerate-api-clients`.
6. **Web UI (`@avuny/web-features` & `@avuny/ui`):** feature components using UI primitives, then thin routes in each web app (`apps/web-app`, `apps/admin-app`).
7. **Mobile UI (`apps/mobile-app`):** screens calling the same hooks.
8. **i18n:** keys in every locale; check RTL (`isRtl`) and dark mode / themes.
9. **Tests:** service unit tests beside the service, route test per endpoint, UI tests where practical.
10. **Docs:** module doc and plan status.
11. **Gates:** typecheck, lint, test.

## 2. Decision tree
- Server-only: skip 5 to 8.
- Admin-only: web UI in the admin area; skip 7.
- A step varies by vendor, channel or platform: use the provider/strategy pattern.
- Every app listed for the requirement must have it before "done", or record the gap in the plan.
