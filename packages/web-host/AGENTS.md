# AGENTS.md (packages/web-host)

Vite host glue for web apps: router adapter, locale store, and HostProviders.

## Rules

- Bridges host-specific routing and environment setup to `@avuny/web-features`.
- Consumed by Vite host apps (`apps/web-app`, `apps/admin-app`).
- Host-specific router adapters and providers live here.
