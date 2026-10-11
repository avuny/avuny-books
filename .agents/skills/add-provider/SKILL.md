---
name: add-provider
description: Adds a new implementation of a pluggable capability using the provider/strategy pattern: a social login provider, an OTP delivery channel (email, SMS, WhatsApp), a vendor behind a channel, or a platform adapter. Use when asked to add or swap one of these.
---

# Add a provider

Read the `provider-strategy-pattern` and `env-and-config` rules first.

## Decide first
1. Only data differs (URL, client id, template)? Add configuration and stop.
2. No interface and registry yet? Extract them from the existing implementation first, in a separate commit. Don't add another `if` branch.
3. Otherwise continue.

## Steps
1. **Contracts:** add the id to the shared provider enum.
2. **Env:** add the vendor's keys to the env schema, every `.env.example` and `turbo.json` if needed. A provider is enabled only when its keys are present.
3. **Implement** the interface in `providers/<vendor>.provider.ts`: map vendor payloads to the normalized type and vendor failures to domain errors (error codes plus messages in every locale).
4. **Register** it in the module container, keyed by the enum id.
5. **Test** with the shared provider contract tests and a fake HTTP layer; never the real network.
6. **Clients:** if user-facing, add an entry to the shared provider UI config (icon, label key) and a per-platform launcher if needed. Render only providers the capabilities endpoint returns.
7. **i18n:** add keys to every locale.
8. **Docs:** update the provider table (where to get credentials, redirect URIs, env keys).
9. **Gates:** typecheck, lint, test.

## Never
- Branch on provider id inside the orchestrator.
- Let vendor-shaped objects cross the provider boundary.
- Trust client-reported profile data; verify tokens server-side.
