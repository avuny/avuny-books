# AGENTS.md — `apps/mobile-app`

## Purpose

Expo host application using Expo Router. This application is responsible for wiring, runtime configuration, and platform integration. Feature implementations belong in `@avuny/mobile-features`.

## 1. Host Responsibilities

The `apps/mobile-app` application owns:

- Expo Router route files and layout composition.
- Application providers and initialization.
- Environment configuration and `app.config.ts`.
- Platform-specific implementations of interfaces defined in `@avuny/web-mobile-shared`, including token storage, navigation, and locale detection.
- Application-level configuration and native integration.

Keep the host thin.

- Files under `app/` should re-export screens from `@avuny/mobile-features`.
- Layouts should compose navigators and required providers without implementing feature workflows.
- Do not implement feature screens, forms, tables, reusable feature hooks, validation schemas, strings, or business logic in this application.
- If a file grows beyond host wiring, move the implementation into the appropriate package.
- Follow existing Expo Router conventions and preserve the current route structure.

## 2. Frontend Stack

Use the existing project dependencies and conventions:

- React Native + Expo + TypeScript.
- Expo Router for navigation.
- `@tanstack/react-query` for server state, caching, queries, mutations, and invalidation.
- React Hook Form for form state and submission.
- Zod for validation.
- The existing Avuny mobile UI package for reusable native components.
- Uniwind for styling.
- `@avuny/contracts` for application schemas and shared contracts.
- The existing Orval-generated API client and hooks.

Do not introduce duplicate libraries or alternative infrastructure when the existing stack already provides the required functionality.

## 3. Package Responsibilities

Respect the following boundaries:

- `apps/mobile-app`: Host wiring, runtime configuration, providers, and platform implementations.
- `@avuny/mobile-features`: Mobile feature screens, forms, lists, feature hooks, and UI orchestration.
- `@avuny/contracts`: All Zod schemas and shared application contracts.
- Existing API package: Orval-generated operations, hooks, types, and query-key helpers.
- Existing mobile UI package: Reusable React Native components styled with Uniwind.
- `@avuny/web-mobile-shared`: Shared strings and platform-independent functionality according to its existing responsibilities.

Inspect the actual repository and package exports before adding or moving files. Do not create duplicate packages or abstractions.

## 4. Feature-Based Organization

Organize mobile implementations by business feature inside `@avuny/mobile-features`.

Example structure:

```text
packages/mobile-features/
  src/
    user/
      screens/
      components/
      forms/
      list/
      details/
      hooks/
      index.ts

    inventory/
      screens/
      components/
      forms/
      list/
      details/
      hooks/
      index.ts
```

This is an illustrative structure. Preserve the actual package's established layout and naming conventions.

- `screens/`: Feature screens exported to the host.
- `components/`: Feature-specific reusable UI.
- `forms/`: Create, update, and other feature forms.
- `list/`: Native lists, filters, pagination, and related UI.
- `details/`: Detail screens and related components.
- `hooks/`: Feature-specific queries, mutations, and orchestration hooks.
- `index.ts`: Public feature exports where appropriate.

Do not create unused directories merely to match the example.

## 5. Contracts and Validation

All Zod schemas and shared application contracts belong in `@avuny/contracts`.

- Never define Zod schemas inside mobile screens, forms, components, or hooks.
- Import canonical schemas and inferred types from `@avuny/contracts`.
- Reuse the same validation rules across mobile and web when their semantics are shared.
- Keep platform-specific validation presentation and error rendering in mobile features.
- Do not duplicate Orval-generated API types.
- Do not introduce mobile-specific copies of shared schemas.

Do not add React Native, Expo, or UI dependencies to the contracts package.

## 6. API Integration and Orval

Use the existing Orval-generated API client, hooks, types, and query-key helpers.

- Do not manually edit generated files.
- Do not duplicate API endpoint definitions or generated request/response types.
- Do not bypass the generated API layer with ad hoc HTTP calls when a generated operation exists.
- Preserve the established authentication and token-refresh behavior.
- Use the existing configured API client and mutator rather than creating a second Axios instance or API client.
- Inspect the actual generated signatures before composing hooks.

Use feature-specific hooks in `@avuny/mobile-features` to encapsulate mobile feature behavior. Screens and forms should not duplicate request orchestration.

## 7. TanStack Query and Mutation Wrappers

Use `@tanstack/react-query` for server state and caching.

Build on the existing API and query infrastructure rather than creating a parallel implementation.

Where the repository already provides reusable query or mutation wrappers, reuse them. Otherwise, introduce an abstraction only when it provides genuine reusable behavior and fits the established architecture.

Feature hooks should:

- Compose the appropriate generated operations.
- Preserve TypeScript inference and supported query/mutation options.
- Handle feature-specific success and error behavior.
- Configure the correct query invalidation targets.
- Expose pending, error, and success state to consuming components.

Keep the wrappers compatible with React Native and free of web UI dependencies.

### Query invalidation

Every mutation must explicitly consider which cached queries it affects.

- Use generated query-key helpers or existing centralized helpers.
- Invalidate affected lists, filtered lists, detail queries, and aggregates as appropriate.
- Use targeted invalidation rather than clearing the entire cache unnecessarily.
- Do not manually reconstruct generated query keys.
- Avoid duplicating invalidation logic across forms.
- Await invalidation when the intended mutation completion behavior requires it.

For example, creating a user may invalidate user lists, while updating a user may invalidate both the relevant detail query and affected lists.

Determine the actual invalidation targets from the mutation's data dependencies.

Query invalidation applies to the current mobile application's `QueryClient`. It does not automatically refresh the web application or another device.

## 8. Forms

Use React Hook Form for form state and submission, Zod for validation, and existing Avuny mobile UI components for presentation.

- Import validation schemas and inferred types from `@avuny/contracts`.
- Use feature-specific mutation hooks.
- Do not implement API requests or cache invalidation directly inside presentation components.
- Prevent duplicate submissions and expose pending states.
- Handle field validation, API errors, success, and appropriate form reset behavior.
- Use native inputs, keyboard behavior, focus handling, and accessibility conventions.
- Respect safe areas, platform layouts, and mobile interaction patterns.
- Reuse existing mobile UI components instead of creating duplicates.

Do not force web form components or shadcn UI into React Native.

## 9. Lists and Data Display

Use native React Native components and the existing Avuny mobile UI package.

- Use TanStack Query for server data.
- Support loading, error, empty, and populated states.
- Implement pagination or infinite scrolling according to the API contract and feature specification.
- Reuse shared filter and pagination logic where appropriate.
- Keep rendering and interaction native to mobile.

Do not use `@tanstack/react-table` as the rendering solution for mobile screens. Web tables belong in the web feature implementation.

## 10. Shared Strings and Localization

- Use shared strings from `@avuny/web-mobile-shared`.
- Do not duplicate shared translation keys in mobile features.
- Use existing localization abstractions and platform interfaces.
- Do not hardcode user-facing strings when the localization system applies.
- Preserve right-to-left layout and locale-specific behavior.

When a locale change changes the text direction, the existing locale-change flow must reload the application. Preserve this behavior rather than implementing a separate locale-reload mechanism inside individual features.

## 11. Navigation and Routing

- Use Expo Router for route definitions and navigation at the host level.
- Feature screens must remain in `@avuny/mobile-features`.
- Export screens through the established package exports and re-export them from the appropriate `app/` route files.
- Keep route files thin.
- Use existing navigation and platform interfaces where required by reusable feature logic.
- Do not introduce a second navigation library or couple shared feature logic directly to host internals.

## 12. Authentication and Runtime Integration

- Use the existing authentication and token-storage infrastructure.
- Keep secure token storage in the host's established platform implementation.
- Do not store sensitive authentication tokens in ordinary, unencrypted storage.
- Reuse the configured API client and its authentication interceptors.
- Preserve the existing token-refresh and session-expiration behavior.
- Do not duplicate authentication logic in individual screens or feature hooks.

Any changes to shared authentication behavior must remain compatible with the existing API infrastructure and the host's platform interfaces.

## 13. Implementation Workflow

Before implementing a feature:

1. Read the feature specification and acceptance criteria.
2. Inspect the existing mobile feature package, API operations, generated query keys, contracts, and UI components.
3. Identify which work belongs in the host, mobile features, contracts, and API packages.
4. Implement all required mobile screens, forms, lists, and feature hooks.
5. Verify form validation, loading/error/empty states, mutation behavior, and cache invalidation.
6. Verify authentication, localization, and navigation integration where relevant.
7. Run applicable type checks, linting, tests, and builds.
8. Report what was implemented and any remaining work or failed checks.

Do not mark a feature complete merely because the backend or generated API operations exist when mobile implementation is also required.

## 14. General Constraints

- Preserve TypeScript strictness and existing repository conventions.
- Avoid `any`, duplicated schemas, duplicate API clients, and unnecessary dependencies.
- Do not introduce web-only dependencies into mobile packages.
- Do not add feature business logic to `apps/mobile-app`.
- Do not modify generated files manually.
- Prefer existing package exports and abstractions.
- Make the smallest justified architectural change consistent with the feature specification.