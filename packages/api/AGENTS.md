# AGENTS.md (packages/api)

Rules for the `api` package: modules, services, repositories and Hono routes. The root `AGENTS.md` still applies. This file only adds what is specific to `api`.

## Module structure

Every domain lives in `src/modules/<name>/`:

```text
src/modules/<name>/
├── index.ts            Public API only. Other modules import from here, never from inside
├── core/               Pure code. No I/O: no db, network, env, or clock
│   ├── errors/         index.ts (codes) and errors-http-map.ts (status + message)
│   └── *.rules.ts      Business rules (login.rules.ts, password.rules.ts, ...)
├── shell/              All I/O
│   ├── *.repo.ts       Repositories (Drizzle)
│   ├── *.service.ts    Services: run core rules + repos, return a Result
│   └── *.crypto.ts     Crypto and other external adapters
├── hono-routes/        One file per route (sign-in.route.ts, sign-up.route.ts, ...)
└── __tests__/
    ├── core/           Unit tests for pure code
    └── integration/    Service and route tests
```

- Dependencies point one way: `hono-routes` -> `shell` -> `core`. `core` never imports `shell` or routes.
- Routes hold no business logic. Services orchestrate. Rules decide.
- Cross-module imports go through the other module's `index.ts` only.
- New modules go in `src/modules/`. Do not add new top-level module folders in `src/`.

## Errors

- Codes: an `as const` object plus a derived union type, grouped by flow (`AuthLoginErrorCode`, `AuthSignUpErrorCode`), plus one merged `<Module>ErrorCode`.
- Naming: `<MODULE>_<FLOW>_<REASON>` in UPPER_SNAKE, e.g. `AUTH_LOGIN_INCORRECT_CREDENTIALS`.
- Error map: `{ statusCode, responseMessage }` per code, written `as const satisfies Record<Code, ErrorMeta>` so a missing code fails the build.
- A new code is not done until all four exist: the code, its error-map entry, its `en.json` and `ar.json` translation, and the route's documented response.

## Services

- Return a Result (`ok` / `fail` from `@avuny/utils`). Never throw for expected failures.
  - Success: `{ success: true, data, msg, meta }`
  - Failure: `{ success: false, error: <ErrorCode>, msg, meta }`
- `meta` carries context for logs (e.g. `{ identifier }`). Never put passwords, tokens or secrets in `msg` or `meta`.
- Throw only for unexpected failures. `onError` turns them into a 500 `SERVER_ERROR`.

## Routes

- One route per file in `hono-routes/`, built with `createOpenAPIRouter()` and `createRoute`.
- Every route has: a unique camelCase `operationId` (it names the generated client function), `tags` (the module), request schemas from `@avuny/contracts`, a success response with `createResponseSchema(...)`, one response per domain error status with `createDomainErrorResponseSchema([...codes])`, and `...globalErrorResponses`.
- Handler shape: read the language, build `errorTrans = trans({ lang })`, call the service, then `return handleResult({ c, result, successStatus, errorMap, errorTrans, moduleName })`.
- Side effects that need the Hono context (setting cookies) go in `handleResult`'s `onSuccess`.
- Mount new routes in `src/routes.ts` with `app.route(...)`. Keep the middleware order: language, request id, structured logger, routes, `onError`.

## Server i18n (i18next)

- Files: `src/intl/locales/<module>/{en,ar}.json`. Error text lives under `errors.<ERROR_CODE>`.
- New module checklist: add `en.json` and `ar.json` with identical keys, register them in `src/intl/i18next.ts` (resources and `ns`), and add their types to `src/intl/i18next.d.ts`.
- Always translate with `trans({ lang })` (`getFixedT`). Never call `i18n.changeLanguage` on the server: it is global and races between concurrent requests.
- Zod validation messages come from the `@avuny/zod` locale resolver, not i18next.

## Config and logging

- Read env only in `src/config.ts`. No `process.env` anywhere else.
- Never give secrets a default value. A missing secret must stop startup, not become an empty string.
- Log through the request logger and `logHttpRequest` (`@avuny/logger`). No `console.*`.

## Tests

- `core/` tests are pure unit tests with no mocks.
- `integration/` tests cover services and routes.
- Add or update tests for the module you change and run them before finishing.

## API client workflow

After changing a route or a contract, from the repo root:

1. Run `openapi:generate` to produce the OpenAPI spec for the server apps.
2. Run `api:generate` to generate the Orval React / TanStack Query clients.
3. Never hand-edit generated files. Fix the route or contract and regenerate.

<!-- TODO(confirm): where Orval output lives (must be a package, not an app, so web-features can import it), and whether generated files are committed. -->
<!-- TODO(confirm): how a route declares auth and permissions, and how tenant (organization) scoping is enforced in repositories. -->
<!-- TODO(confirm): request language access (`c.get("lang")` here vs `locale` in the hono package) and whether `@avuny/i18n` messages stay. -->
<!-- TODO(confirm): test runner and package manager commands. -->