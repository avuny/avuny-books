---
name: add-api-route
description: Add or change an HTTP endpoint in a packages/api module, with OpenAPI docs, typed domain errors and translations. Use when adding, editing or documenting an API route.
---

# Add an API route

Follow `packages/api/AGENTS.md`.

## Steps

1. Make sure the service exists in `shell/` and returns a Result. If it needs new error codes, use the `add-error-code` skill first.
2. Put the request and response schemas in `@avuny/contracts`. Wrap the success payload with `createResponseSchema(...)`.
3. Create `hono-routes/<action>.route.ts`. Copy the structure of `src/modules/auth/hono-routes/sign-in.route.ts`. Every route needs:
   - `createOpenAPIRouter()` and `createRoute`
   - a unique camelCase `operationId` (it names the generated client function) and `tags: ["<module>"]`
   - request schemas from `@avuny/contracts`
   - a success response using `createResponseSchema(...)`
   - one response per distinct domain error status, using `createDomainErrorResponseSchema([...codes])` and the `statusCode` from the error map (never a hard-coded number)
   - `...globalErrorResponses`
4. Handler shape: read the language, `const errorTrans = trans({ lang })`, call the service, then `return handleResult({ c, result, successStatus, errorMap, errorTrans, moduleName })`. Cookies or other context side effects go in `onSuccess`.
5. Export the route from the module's `hono-routes/index.ts`.
6. Tests: integration tests for success and for each domain error. Unit tests for any new rules in `core/`.
7. Run the `regenerate-api-clients` skill.

## Done when

- Every error code the service can return is documented as a response and has en and ar translations.
- `operationId` is unique across the API.
- The route appears in the generated OpenAPI spec.
