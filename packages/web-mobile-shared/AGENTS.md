# AGENTS.md (packages/web-mobile-shared)

Client API client, TanStack Query hooks, formatters, and shared frontend domain logic.

## Rules

- Compiled without the DOM library: no `window`, `document`, `localStorage`, `react-dom`, or `react-native`.
- Never import `@avuny/db` or `@avuny/hono`. Import `@avuny/api` only as `import type` (e.g. `AppType`).
- Contains the generated Orval API client and TanStack Query hooks. Never hand-edit generated files; use the `regenerate-api-clients` skill.
- Platform differences (token storage, navigation, locale detection) are injected through small interfaces that each app implements.
