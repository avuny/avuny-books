# AGENTS.md (apps/mobile-app)

Mobile client application (Expo / React Native).

## Rules

- Must NEVER import `@avuny/ui` (which is web-only). Native UI primitives and screens live here.
- Consumes shared API clients, TanStack Query hooks, formatters, and types from `@avuny/web-mobile-shared`.
- Never import `@avuny/db` or `@avuny/hono`.
- Use logical layout properties where applicable (`start`/`end`, not left/right).
