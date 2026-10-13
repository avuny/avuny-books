# AGENTS.md (packages/web-mobile-shared)

Client API client, TanStack Query hooks, formatters, shared messages, and shared frontend domain logic.

## Layout

Modules mirror across layers:
```text
src/modules/<m>/
  api/
  hooks/
  forms/
  messages/
```

## Rules

- Compiled without the DOM library: no `window`, `document`, `localStorage`, `react-dom`, or `react-native`.
- Never import `@avuny/ui`, `@avuny/mobile-ui`, or any features package (`@avuny/web-features`, `@avuny/mobile-features`).
- Never import `@avuny/db` or `@avuny/hono`. Import `@avuny/api` only as `import type` (e.g. `AppType`).
- Shared messages and `useMessages` / provider live here: `src/modules/<m>/messages` (`en` is the shape, other locales typed as `typeof en`).
- Contains the generated Orval API client and TanStack Query hooks. Never hand-edit generated files; use the `regenerate-api-clients` skill.
- Platform differences (token storage, navigation, locale detection) are injected through small interfaces that the hosts implement.
