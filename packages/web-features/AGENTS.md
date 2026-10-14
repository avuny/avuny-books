# AGENTS.md — `packages/web-features`

## Purpose

Framework-agnostic web feature package split into three public entrypoints:

- `@avuny/web-features/core`
- `@avuny/web-features/web`
- `@avuny/web-features/admin`

This package owns shared web infrastructure and web/admin feature implementations. Host applications provide runtime configuration and platform integrations but must not contain feature business logic.

## 1. Existing Architecture

Preserve the existing package structure and public exports. Do not introduce duplicate infrastructure or alternative architectural patterns.

```text
packages/web-features/
  src/
    core/
      api/                 # Orval-generated API code
      host.tsx             # Host integration
      index.ts
      mutator/
        auth/
        interceptors/
        axios-instance.ts
        custom-instance.ts
        config.ts

    web/
      modules/
        <module>/
          screens/
          components/
          forms/
          list/
          details/
          hooks/
          paths.ts
          messages.ts

    admin/
      modules/
        <module>/
          screens/
          components/
          forms/
          list/
          details/
          hooks/
          paths.ts
          messages.ts
```

The tree illustrates the intended organization; preserve existing filenames, exports, and directory conventions where they already exist. Create directories only when needed.

## 2. Package Boundaries

### `core`

Owns shared web infrastructure used by both `web` and `admin`, including:

- Orval-generated API operations and query hooks under `core/api/`.
- Axios instances, custom mutator, authentication integration, interceptors, and configuration under `core/mutator/`.
- Shared query and mutation wrappers built on TanStack Query.
- Routing and locale abstractions.
- Shared web infrastructure and utilities.
- The existing `host.tsx` integration and public exports.

Do not place feature-specific screens, forms, tables, or business workflows in `core`.

The existing generated API and mutator are infrastructure, not feature code. Preserve their generation and configuration conventions.

### `web`

Owns features specific to the public web application.

### `admin`

Owns features specific to the administration application.

Both entrypoints may reuse `core`, `contracts`, shared strings, and existing UI packages. Keep admin-only workflows and public-web workflows in their respective entrypoints.

Extract reusable logic into `core` only when it is genuinely shared web infrastructure or application-independent web logic. Do not turn `core` into a general dumping ground.

## 3. Framework and Dependency Rules

- Never import `@avuny/db` or `@avuny/hono`.
- Import `@avuny/api` only with `import type`, such as `AppType`, when required by existing conventions.
- Never import `react-native*` or `@avuny/mobile-*`.
- Do not import `next/*`.
- Do not import router libraries directly in feature modules.
- Do not couple feature implementations to Vite, Expo, or a particular host application.
- Use existing package exports rather than importing through internal paths of other packages.
- Avoid circular dependencies between `core`, `web`, and `admin`.
- Preserve strict TypeScript typing. Avoid `any` and unnecessary type assertions.

## 4. Routing and Locale

Routing and locale APIs must come through `@avuny/web-features/core`.

Use the existing abstractions:

- `Link`
- `useNavigate`
- `useParams`
- `useSearchParams`
- `usePathname`
- `useLocale`
- `useMessages`

Do not import TanStack Router or another router directly into feature modules.

The host application supplies the routing integration through the established host interfaces. Do not implement host-specific navigation inside a feature.

`core` re-exports `useMessages` from `@avuny/web-mobile-shared`. Preserve this existing integration.

## 5. Contracts and Validation

All Zod schemas and shared application contracts belong in `@avuny/contracts`.

This includes:

- Form validation schemas.
- Shared input and output types not already generated from the API contract.
- Reusable enums and validation rules.
- Shared filter and query-parameter schemas where appropriate.

Rules:

- Never define Zod schemas inside forms, screens, tables, or feature hooks.
- Import schemas and inferred types from `@avuny/contracts`.
- Reuse canonical schemas across public web, admin, and mobile when their validation semantics are the same.
- Keep platform-specific presentation and error rendering in the relevant feature implementation.
- Do not duplicate Orval-generated API types.
- Do not create redundant schemas that merely wrap existing schemas without a meaningful purpose.
- Avoid circular dependencies between contracts and frontend packages.

## 6. API and Orval

The existing `core/api/` directory contains Orval-generated API code. The `core/mutator/` directory contains the associated request infrastructure.

Treat generated files as machine-generated artifacts.

- Do not manually edit generated files.
- Modify the source OpenAPI contract or Orval configuration and regenerate when necessary.
- Reuse generated API operations, hooks, types, and query-key helpers.
- Do not manually recreate API endpoint definitions or duplicate generated request/response types.
- Preserve the existing Axios instances, custom mutator, auth integration, interceptors, and configuration.
- Do not bypass the generated API layer with ad hoc HTTP requests when an appropriate generated operation exists.
- Keep API transport and authentication concerns in `core`, not individual feature components.

Before changing the API layer, inspect the actual Orval configuration and generated output. Confirm how query hooks, mutation hooks, query keys, and the custom mutator are generated rather than assuming a particular naming convention.

## 7. TanStack Query and Reusable Wrappers

Use `@tanstack/react-query` for server state, caching, queries, mutations, and invalidation.

Implement shared query/mutation wrappers in `core` when they provide reusable behavior across web and admin.

Use three layers:

1. **Generated API layer:** Orval-generated operations, hooks, and query keys.
2. **Core query layer:** Reusable wrappers and cross-feature policies.
3. **Feature layer:** Feature-specific hooks that configure queries and mutations for the relevant business operation.

Wrappers should:

- Preserve TypeScript inference for data, variables, errors, and options.
- Allow appropriate TanStack Query options and callbacks to be passed through.
- Standardize shared error handling where appropriate.
- Support targeted query invalidation after successful mutations.
- Remain small and composable.
- Avoid hiding essential TanStack Query behavior or preventing feature-specific customization.

Do not build a second API client or duplicate Orval's functionality.

### Query keys and invalidation

Every mutation must explicitly consider which cached queries it affects.

- Prefer generated Orval query-key helpers or existing centralized helpers.
- Invalidate affected list, filtered-list, detail, and aggregate queries as appropriate.
- Include affected pagination and filter variants when required.
- Use targeted invalidation instead of invalidating the entire cache without justification.
- Never manually reconstruct a generated query key when a suitable helper exists.
- Do not duplicate invalidation logic across forms that use the same feature mutation hook.
- Await invalidation when the intended mutation completion behavior requires it.
- Do not invalidate unrelated queries without a clear reason.

Examples:

- Creating a user may invalidate user lists.
- Updating a user may invalidate the relevant user detail and affected lists.
- Deleting a user may invalidate affected lists, details, and aggregates.

These are examples, not universal invalidation rules. Determine the actual affected queries from the operation's data dependencies.

If generated mutation hooks already provide the required behavior, compose with that behavior instead of implementing duplicate invalidation.

Query invalidation only affects the current application's `QueryClient`. Do not assume it automatically refreshes another browser application or the mobile app.

## 8. Feature Organization

Organize code by business module under the appropriate entrypoint.

For example:

```text
web/modules/user/
  screens/
  components/
  forms/
  list/
  details/
  hooks/
  paths.ts
  messages.ts

admin/modules/user/
  screens/
  components/
  forms/
  list/
  details/
  hooks/
  paths.ts
  messages.ts
```

Each module owns its feature-specific presentation and orchestration.

- `screens/`: Feature screens and page-level composition.
- `components/`: Reusable components specific to that feature.
- `forms/`: Create, update, edit, and other feature forms.
- `list/`: Tables, filters, sorting, pagination, and list-specific UI.
- `details/`: Detail views and related UI, when needed.
- `hooks/`: Feature-specific query, mutation, and orchestration hooks.
- `paths.ts`: Feature route/path constants.
- `messages.ts`: Web-specific translations.

Use the existing structure when a feature does not need all these directories. Do not create empty directories merely to match the example.

### Feature implementation rules

- Screens compose feature components and hooks.
- Forms use React Hook Form and schemas from `@avuny/contracts`.
- Forms call feature-specific mutation hooks instead of implementing API and cache logic themselves.
- Tables use `@tanstack/react-table` and the existing Avuny web UI components.
- Lists use TanStack Query for server data.
- Feature hooks compose generated operations and shared core wrappers.
- Keep business workflows near the feature that owns them.
- Reuse shared logic instead of duplicating entire implementations across `web` and `admin`.

## 9. Forms and UI States

Use React Hook Form for form state and submission, Zod for validation, and existing Avuny UI components for presentation.

Forms must handle applicable states:

- Initial and field validation.
- Pending submission and duplicate-submission prevention.
- API errors and field-level errors where supported.
- Successful completion.
- Appropriate reset, dialog-close, or navigation behavior.

Tables and lists must handle applicable loading, error, empty, and populated states.

Do not duplicate validation schemas, API operations, mutation logic, or invalidation logic inside individual forms.

Use the existing shadcn-based UI package. Do not introduce an alternative component library without an explicit requirement.

## 10. Localization and Strings

- Shared strings come from `@avuny/web-mobile-shared`.
- Only web-specific strings belong in the feature's `messages.ts`.
- English (`en`) defines the message shape.
- Other locales must be typed as `typeof en`.
- A translation key must not exist in both shared strings and feature-local messages.
- Access translations through the existing `useMessages` abstraction.
- Do not hardcode user-facing strings when the established localization system applies.

## 11. Paths and Public Exports

- Keep path constants next to the feature in `paths.ts`.
- Use those same constants for feature links and host route tables.
- Do not duplicate route strings in links, navigation, and host configuration.
- Export feature APIs through established entrypoints and package exports.
- Avoid unnecessary barrel files and deep imports that bypass the public API.

## 12. Host Application Responsibilities

The `apps/web-app` and `apps/mobile-app` directories are hosts, not feature implementation packages.

For web:

- Use TanStack Router only in the web host and existing routing integration.
- Keep environment setup, guards, providers, and top-level layouts in their designated host locations.
- Implement pages, forms, tables, and UI logic in `@avuny/web-features`.

For mobile:

- Expo Router files should re-export screens from `@avuny/mobile-features`.
- Layouts should compose navigators.
- Providers, environment setup, app configuration, and platform-interface implementations belong in the host.
- Do not put feature business logic in the host.

Do not move existing responsibilities between packages without a demonstrated need.

## 13. Implementation Workflow

Before implementing a feature:

1. Read the relevant feature specification and acceptance criteria.
2. Inspect the existing module structure, generated API operations, query keys, contracts, and UI components.
3. Identify which work belongs in `contracts`, `core`, `web`, `admin`, and the relevant host.
4. Implement the required screens, forms, tables, hooks, and mutation behavior.
5. Verify all affected query keys and invalidation behavior.
6. Verify localization and shared-string conventions.
7. Run relevant type checks, linting, tests, and builds.
8. Report completion separately for public web and admin, including remaining work and failed checks.

Follow the specified implementation phases. Do not mark a feature complete merely because the backend or generated API operations exist when the specification also requires frontend work.

Do not introduce new packages, dependencies, or architectural abstractions without a demonstrated need. Prefer the smallest change consistent with the existing architecture and feature specification.