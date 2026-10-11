# AGENTS.md (packages/web-features)

Framework-agnostic web features split into `core`, `web`, and `admin` entrypoints (`@avuny/web-features/core`, `web`, `admin`).

## Rules

- Never import `@avuny/db` or `@avuny/hono`. Import `@avuny/api` only as `import type` (e.g. `AppType`).
- No `next/*` and no direct router library imports.
- Routing and locale come strictly from `@avuny/web-features/core` (`Link`, `useNavigate`, `useParams`, `useSearchParams`, `usePathname`, `useLocale`, `useMessages`).
- Path constants live with the feature. Both links and host route tables use them.
- Tables use TanStack Table.
- Feature UI strings live next to the feature, with `en` as the shape and other locales typed as `typeof en`.
