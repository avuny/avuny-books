# AGENTS.md (apps/web-app)

Public web client application (Vite).

## Rules

- Thin host only: @tanstack/react-router
, env setup, guards, and top-level layouts.
- Pages, screens,Forms , Tables and UI logic live in `@avuny/web-features`. Do not write page components directly in this app.
- Never import `@avuny/db` or `@avuny/hono`. Import `@avuny/api` only as `import type`.
- Uses `@avuny/web-host` for host providers and routing glue.
