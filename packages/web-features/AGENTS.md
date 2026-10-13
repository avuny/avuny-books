# AGENTS.md (packages/web-features)

Framework-agnostic web features split into `core`, `web`, and `admin` entrypoints (`@avuny/web-features/core`, `web`, `admin`).

## Layout

Modules mirror across layers:
```text
src/modules/<m>/
  screens/
  components/
  paths.ts
  messages.ts
```

## Rules

- Never import `@avuny/db` or `@avuny/hono`. Import `@avuny/api` only as `import type` (e.g. `AppType`).
- Never import `react-native*` or `@avuny/mobile-*`.
- No `next/*` and no direct router library imports.
- Routing and locale come strictly from `@avuny/web-features/core` (`Link`, `useNavigate`, `useParams`, `useSearchParams`, `usePathname`, `useLocale`, `useMessages`).
- `core` re-exports `useMessages` from `@avuny/web-mobile-shared`.
- Strings: shared strings come from `@avuny/web-mobile-shared`; only web-specific strings stay next to the feature in `messages.ts` (`en` is the shape, other locales typed as `typeof en`). A key never exists in both.
- Path constants live with the feature. Both links and host route tables use them.
- Tables use TanStack Table.
