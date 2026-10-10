---
name: regenerate-api-clients
description: Regenerate the OpenAPI spec and the Orval React / TanStack Query clients after any change to API routes, contracts or error responses. Use after editing anything in packages/api routes or packages/contracts.
---

# Regenerate API clients

## Steps

1. From the repo root, run `openapi:generate`, then `api:generate` (root scripts, run with the repo's package manager). Order matters: the spec first, then the clients.
2. Check the diff. Only the generated files you expect should change.
3. If generation fails, fix the cause in the route or contract (missing `operationId`, duplicate `operationId`, schema not exported) and run both commands again. Never patch generated output by hand.
4. Typecheck every app and package that consumes the generated clients and fix broken call sites.
5. Report which operations were added, changed or removed.

## Rules

- Generated files are never hand-edited.
- Run this after every change to a route, a contract or a documented error response.
