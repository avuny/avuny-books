# AGENTS.md (apps/hono-vercel-server)

Vercel serverless entrypoint for `@avuny/api`.

## Rules

- Thin host only: serverless handler mounting `@avuny/api`.
- No business logic or domain rules live here. Domain logic belongs in `@avuny/api`.
