---
trigger: model_decision
description: "Apply when creating or changing request/response shapes, form validation, API routes, enums or anything in the shared contracts package."
---

# Shared contracts and validation

- **Single source of truth:** Zod schemas live in `@avuny/contracts`, organized by domain/feature and re-exported from the package index. Types are inferred with `z.infer`.
- **Import `z` only from `@avuny/zod`:** Contracts never import `zod` directly.
- **Dual validation:** The same schema validates the form (client) and the API route (server). With Hono OpenAPI, define routes with `createRoute` using these schemas; never redefine a payload shape inline.
- **No human-readable text in contracts:** Validation issues use message keys that client and server translate.
- **Runtime-agnostic:** Contracts are pure and lightweight: no React, DOM, DB or Node-only APIs.
- **Normalization lives in the schema** (trim and lower-case email, phone to E.164), ensuring client and server agreement.
- **Standardized envelopes:** Responses follow consistent schemas (`createResponseSchema` for success, domain error response schemas for expected errors with typed error codes from the domain error enum).
- **Backward compatible:** Mobile builds lag the server. Add optional fields, never repurpose existing ones, and deprecate before removing.
- **List queries:** Lists (pagination, sort, filter) reuse shared list-query schemas. Data lists use page-offset pagination; dropdowns use cursor pagination.
