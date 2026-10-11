# AGENTS.md (apps/admin-app)

Internal admin dashboard web application (Vite).

## Rules

- Thin host only: route table, QueryClient, env setup, guards, and top-level layouts.
- Pages, screens, and UI logic live in `@avuny/web-features` (`@avuny/web-features/admin`). Do not write page components directly in this app.
- Never import `@avuny/db` or `@avuny/hono`. Import `@avuny/api` only as `import type`.
- Uses `@avuny/web-host` for host providers and routing glue.
