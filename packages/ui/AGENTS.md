# AGENTS.md (packages/ui)

Web UI primitives built with shadcn/ui and Tailwind CSS. Twin of `@avuny/mobile-ui`.

## Rules

- Web only. Mobile must never import `@avuny/ui`. Never import `react-native*` or `@avuny/mobile-*`.
- Every new primitive needs a counterpart in `@avuny/mobile-ui` (same component names, props, and variants), or is listed under "Platform-only (web-only)" below.
- Logical CSS only: use start/end, ps/pe, ms/me. Never left/right physical directional classes. Direction-bearing icons flip in RTL.
- Theme tokens: colors come from the `@avuny/theme` generated CSS variables. No raw hex/rgb or hard-coded colors.
- Every component must support light, dark, and custom themes via `data-theme`.

## Platform-only (web-only)
- (none yet)
