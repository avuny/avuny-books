# AGENTS.md (packages/ui)

Web UI primitives built with shadcn/ui and Tailwind CSS.

## Rules

- Web only. Mobile must never import `@avuny/ui`.
- Logical CSS only: use start/end, ps/pe, ms/me. Never left/right physical directional classes.
- Theme tokens: use semantic tokens (`bg-background`, `text-foreground`, `bg-primary`). No hard-coded colors or raw hex codes.
- Every component must support light, dark, and custom themes via `data-theme`.
