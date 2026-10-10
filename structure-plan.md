apps/
  hono-node-server/     Node entry for VPC/Railway/Docker: env, mount `api`, serve, shutdown
  hono-vercel-server/   Vercel entry for the same `api` app
  web-app/              Public app (Vite). Host only: routes, guards, layouts, providers
  admin-app/            Internal admin dashboard (Vite). Host only, same rule
  mobile-app/           Expo / React Native
packages/
  api/                  Modules: repositories, services, Hono routes. Has its own AGENTS.md
  db/                   Drizzle schema, migrations, client. Only `api` imports it
  hono/                 Shared Hono middleware, createOpenAPIRouter, handleResult, request language
  logger/               Shared logger
  i18n/                 Locale type, default locale, ltr/rtl direction, resolveLocale
  zod/                  The only source of `z`, plus locale helpers
  contracts/            Zod schemas and shared types for api, web and mobile
  utils/                Runtime-agnostic helpers 
  ui/                   shadcn/ui components. Web only
  web-features/         Framework-agnostic web features + host contract (`@avuny/web-features/host`)
  web-host/             Vite host glue: router adapter, locale store, HostProviders
  web-mobile-shared/    API client, query hooks, formatting. No DOM
  eslint-config/        Shared lint presets and import-boundary rules
  typescript-config/    Base tsconfigs