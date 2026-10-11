# AGENTS.md (packages/logger)

Shared structured logger for backend services and server entrypoints.

## Rules

- Provides structured JSON logging and HTTP request loggers (`logHttpRequest`).
- Never log passwords, tokens, secrets, or sensitive customer data.
- Server packages import and use `@avuny/logger`; no raw `console.*` in production code.
