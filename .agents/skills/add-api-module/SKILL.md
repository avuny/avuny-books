---
name: add-api-module
description: Scaffold a new domain module in packages/api (src/modules/<name>) with core, shell, routes, tests and an i18n namespace. Use when asked to add a new module, domain or feature area to the API.
---

# Add an API module

Follow `packages/api/AGENTS.md`. Use `src/modules/auth` as the reference implementation.

## Steps

1. Create `packages/api/src/modules/<name>/` with:
   - `index.ts`: public API only (export services and the route group, nothing internal)
   - `core/errors/index.ts` and `core/errors/errors-http-map.ts`
   - `core/<topic>.rules.ts` for pure business rules (no I/O)
   - `shell/` for `*.repo.ts`, `*.service.ts` and adapters (all I/O)
   - `hono-routes/` with one file per route and an `index.ts` that exports `<Module>Routes`
   - `__tests__/core/` and `__tests__/integration/`
2. Put input and response schemas in `@avuny/contracts`, not in `api`.
3. Add the i18n namespace:
   - create `src/intl/locales/<name>/en.json` and `ar.json` with identical keys, starting as `{ "errors": {} }`
   - register both files in `src/intl/i18next.ts` (`resources` for `en` and `ar`, and `ns`)
   - add the type in `src/intl/i18next.d.ts`
4. Mount the module in `src/routes.ts`: `app.route("/<plural-name>", <Module>Routes)`.
5. Keep dependencies one-way: routes -> shell -> core. Other modules import this one only through its `index.ts`.
6. Add each endpoint with the `add-api-route` skill, then run `regenerate-api-clients`.

## Done when

- Folder structure matches the reference module.
- The namespace is registered in all three i18n places (resources, `ns`, types).
- The module is mounted in `src/routes.ts`.
