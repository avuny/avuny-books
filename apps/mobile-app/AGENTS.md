# apps/mobile-app
Expo host (Expo Router). Wiring only.

## Rules
- app/ files only re-export screens from @avuny/mobile-features (export { default } from '...'). Layouts only compose navigators.
- Providers, env and app.config.ts live here, along with the implementations of the platform interfaces from web-mobile-shared (token storage, navigation, locale detection).
- The locale-change flow reloads the app when the text direction changes.
- No components, hooks, strings or business logic here. If a file grows beyond wiring, move the logic into the right package.
