---
trigger: model_decision
description: "Apply when doing UI, styling, i18n, RTL layout or theming work on web or mobile: logical properties, no hard-coded text, light/dark and color themes through design tokens."
---

# UI rules: text, RTL, appearance

## Text: never hard-coded
- **No user-visible string literals in code:** labels, placeholders, `aria-*`, `alt`, `title`, button text, page titles, toasts, empty/loading/error states, validation messages, displayed server errors.
- **Frontend strings:** Feature UI strings live next to the feature in `@avuny/web-features` (with `en` as the shape and other locales typed as `typeof en`). Components access strings via `useMessages()` from `@avuny/web-features/core` (or `@avuny/web-features/host`).
- **Server strings:** Error messages and server responses live in `@avuny/api` (under `src/intl/locales/<module>/{en,ar}.json`), translated with `trans({ lang })`.
- **Locale and direction:** `Locale` type, `isRtl`, and `resolveLocale` come strictly from `@avuny/i18n`.
- **Dates, numbers, currency:** Use shared `Intl`-based formatters from `@avuny/web-mobile-shared`.
- **Server errors in UI:** Display server errors by error `code` mapped to localized messages; the server `message` is only a fallback.
- **Allowed literals:** CSS classes, route paths, keys, enum values, test IDs, developer logs.

## RTL
- **Logical utilities only:** Use CSS logical properties (`ms-* me-* ps-* pe-* start-* end-* text-start text-end border-s border-e rounded-s rounded-e`). Never physical directions (`ml-* mr-* pl-* pr-* left-* right-* text-left text-right border-l border-r rounded-l rounded-r`).
- **shadcn components:** After adding a shadcn component into `@avuny/ui`, convert any physical direction classes to logical ones.
- **Icons:** Direction-bearing icons (arrows, chevrons, back/next, progress) flip in RTL (`rtl:-scale-x-100`); neutral icons do not.
- **`<html lang dir>`:** Direction comes from the active locale (`isRtl(locale)`). Do not set `dir` on individual elements except for mixed-language content.
- **Always-LTR fields:** Email, phone, OTP code, URL, and password inputs must use `dir="ltr"` with start-aligned text.
- **Native (Expo):** Use `start`/`end` style properties, never left/right.

## Appearance
- **Design tokens:** Colors, radius, spacing, and typography come from semantic tokens (`bg-background`, `text-foreground`, `bg-primary`). No raw hex/rgb, no `bg-white`/`text-black`, no one-off `dark:` color overrides.
- **Independent axes:** Theme mode (`light`, `dark`, `system`) and color theme (`data-theme`). Every theme defines every token for both modes.
- **Storage & Paint:** Apply the stored mode and theme before first paint on web (inline head script).
- **Native:** Mobile consumes matching semantic token names mapped to a native theme object.
- **Verification:** A component is done when it looks correct in light and dark, every theme, LTR and RTL.
