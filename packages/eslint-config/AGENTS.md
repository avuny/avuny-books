# AGENTS.md (@avuny/eslint-config)

Shared lint presets, import-boundary rules, and code quality configurations across the repository.

## Rules

- Provides base, React, Next, and import-boundary ESLint presets.
- Import boundary layers enforced across packages:
  - L0: `contracts`, `utils`, `i18n`, `theme`, `zod`
  - L1: `web-mobile-shared`
  - L2: `ui` | `mobile-ui`
  - L3: `web-features` | `mobile-features`
  - L4: `apps` (`web-app`, `admin-app`, `mobile-app`, `hono-*`)
- Isolation boundaries:
  - `ui`, `web-features`, `web-host`: never import `react-native*` or `@avuny/mobile-*`.
  - `mobile-ui`, `mobile-features`: never import `react-dom`, `@avuny/ui`, or `@avuny/web-*`. Never import `db` or `hono`; `api` only as `import type`.
  - `web-mobile-shared`: no DOM and no `react-native`. Never imports `ui`, `mobile-ui`, or any features package.
  - `theme`: runtime-agnostic: no React, DOM, or `react-native`.
- `no-literal-string`: enforces that user-facing string literals are not hard-coded in UI components.
- How packages opt in:
  - Import the appropriate preset (e.g. `import { config as baseConfig } from "@avuny/eslint-config/base"`) in `eslint.config.js`.
  - Packages and apps apply layer-specific restriction configs or extended presets provided by this package.
