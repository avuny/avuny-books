---
trigger: model_decision
description: "Apply whenever code needs a secret, URL, TTL, limit, feature toggle or other configurable value, and whenever an environment variable is added, renamed or removed."
---

# Environment and configuration

- Never hard-code secrets, URLs, TTLs, limits, provider ids or toggles. Read config only through a validated env module (schema parsed at startup, fail fast with a clear message). No `process.env` or `import.meta.env` elsewhere.
- **Any env change updates, in the same commit:** the env schema; the matching `.env.example` (commented, safe placeholder or default); `turbo.json` `env`/`globalEnv` when it affects build output; docs when behavior changes. A check script (`check:env`) compares the schema with every `.env.example`.
- `.env.example` files are committed and complete; real `.env*` files are git-ignored. No real secrets in examples, docs, tests or logs.
- One `.env.example` per app that reads env.
- Naming: UPPER_SNAKE_CASE grouped by area (`ACCESS_TOKEN_*`, `OTP_*`). Durations as strings (`15m`, `30d`) parsed by one helper. Booleans as `true` or `false`.
- Client-exposed variables use the framework's public prefix and are never secrets.
- Environments differ by values, never by code branches.
