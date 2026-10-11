# AGENTS.md (packages/db)

Database schema (Drizzle ORM), migrations, and database client.

## Rules

- Only `@avuny/api` imports `@avuny/db`. No client apps or other packages may import it.
- Schema changes: generate migrations with `drizzle-kit`. Never hand-edit an applied migration.
- Tenant isolation: every tenant-owned table and query must include organization/tenant scoping.
