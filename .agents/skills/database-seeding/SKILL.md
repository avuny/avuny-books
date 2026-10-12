---
name: database-seeding
description: Create or modify reusable database seed files in packages/db, add or update package.json seed scripts, and verify seeded data. Use when adding development fixtures, reference data, demo organizations, or repeatable database setup.
---

# Database seeding

## Location
- Store reusable seed logic in `packages/db/src/seed/`.
- Use `packages/db/src/seed/index.ts` as the entry point.
- Define seed commands in `packages/db/package.json`.
- Do not put database seeding infrastructure in `packages/api`.

## Instructions
1. Inspect the existing database schema, relations, client, package scripts, and project conventions before making changes.
2. Create modular, reusable seed functions rather than putting all logic into one large script.
3. Reuse the existing database client, ORM, and TypeScript tooling.
4. Respect foreign keys, unique constraints, tenant isolation, and required relationships.
5. Make seed operations idempotent where appropriate.
6. Use transactions when appropriate to prevent partially seeded scenarios.
7. Keep reference data separate from development/demo fixtures when their lifecycles differ.
8. Add or update the appropriate seed scripts in `packages/db/package.json`.
9. Ensure seed execution does not require starting the API server unless the existing architecture explicitly requires it.

## Safety
- Never target production implicitly.
- Never delete existing data by default.
- Validate the target database before performing writes.
- Do not hardcode secrets or credentials.

## Verification
- Run the appropriate seed command against a development or test database.
- Verify the expected records and relationships.
- Run the relevant type checks and tests using scripts that actually exist in the affected packages.
- Report the files changed, commands executed, and verification results.

## Scope
Implement only the requested seeding functionality. Follow existing project conventions and avoid unnecessary dependencies or unrelated schema changes.