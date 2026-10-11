# AGENTS.md (apps/hono-node-server)

Node.js server entrypoint for VPC/Railway/Docker.

## Rules

- Thin host only: loads validated environment variables, mounts `@avuny/api`, serves HTTP, and handles graceful shutdown.
- No business logic or domain rules live here. Domain logic belongs in `@avuny/api`.
