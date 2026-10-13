---
trigger: model_decision
description: Apply when creating or changing @avuny/theme, @avuny/mobile-ui, @avuny/mobile-features, apps/mobile-app, or any native styling, theming or RTL work.
---
# Mobile, theme tokens and native UI

## Tokens (`@avuny/theme`)
- Single source of truth for colors, radius, spacing and type scale, as typed TS data. The types require every theme x mode (light/dark) to define every token, so a missing token is a compile error.
- Token names are the semantic shadcn names (`background`, `foreground`, `primary`, ...).
- Generated outputs: web CSS variables (Tailwind v4 `@theme`, consumed by `@avuny/ui` and the web hosts) and the native theme (consumed by Uniwind). Never hand-edit generated files.
- No raw hex/rgb or one-off colors in ui, mobile-ui, features or apps. The existing appearance rules still apply.
- Web switches theme via mode + `data-theme`; native via Uniwind's theme API. Both read the same token data.

## `@avuny/mobile-ui`
- Native twin of `@avuny/ui`: owned, copy-in components in the style of React Native Reusables, styled with Uniwind (Tailwind v4). No domain knowledge.
- Same component names, props and variants as `@avuny/ui`. Adding a primitive to either package means adding its counterpart in the same change, or listing it as platform-only in that package's AGENTS.md.
- Add components on demand, driven by screens, not in bulk.
- Same design = same tokens and component API. Layouts follow platform idioms (sheets instead of dialogs, tab bar instead of sidebar).
- Uniwind setup comes from the official docs (https://docs.uniwind.dev/llms.txt index, its Monorepos page and Skills page), never from memory. Pin exact versions.
- Uniwind differences to remember: rem is 16px; classNames are not auto-deduplicated (use `cn()`); animations use Reanimated, not animated classes; one font family per style (no fallbacks).
- Direction: use logical utilities or `start`/`end` style props, never left/right. Where Uniwind lacks a logical utility, use the style prop. Direction-bearing icons flip in RTL.

## `@avuny/mobile-features`
- Mirrors `web-features`: `core/` plus `modules/<m>/` (see the root AGENTS.md).
- `core` exports the same names as `web-features/core` (`Link`, `useNavigate`, `useParams`, `useLocale`, `useMessages`) as thin adapters over the router and the shared messages.
- Platform differences are injected by the host through the small interfaces defined in `web-mobile-shared` (token storage, navigation, locale detection).
- Switching to or from RTL needs an app reload on native. The host's locale-change flow handles it; features never do.
- A screen is done when it looks correct in light and dark, every theme, LTR and RTL.
