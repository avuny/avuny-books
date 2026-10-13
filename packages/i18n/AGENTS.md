# AGENTS.md (packages/i18n)

Shared locale types, default locale, text direction (LTR/RTL), and `resolveLocale`.

## Rules

- Runtime-agnostic: pure helpers only. No Node, DOM, or DB imports.
- No catalogs; shared messages live in `web-mobile-shared`.
- Import the `Locale` type, `isRtl` direction helper, and `resolveLocale` only from `@avuny/i18n`.
- Pure locale resolution and direction helpers used across api, web, admin, and mobile.
