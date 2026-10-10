---
name: add-error-code
description: Add a domain error code to a packages/api module, including its HTTP mapping and en/ar translations. Use when a service needs a new failure case.
---

# Add an error code

Follow `packages/api/AGENTS.md`. A code is not done until all four parts exist.

## Steps

1. Add the code to its flow group in `core/errors/index.ts`. Name it `<MODULE>_<FLOW>_<REASON>` in UPPER_SNAKE:

   ```ts
   export const AuthLoginErrorCode = {
     AUTH_LOGIN_INCORRECT_CREDENTIALS: "AUTH_LOGIN_INCORRECT_CREDENTIALS",
   } as const
   export type AuthLoginErrorCode =
     (typeof AuthLoginErrorCode)[keyof typeof AuthLoginErrorCode]
   ```

   If you created a new flow group, also add it to the merged `<Module>ErrorCode` object and type.

2. Add the HTTP mapping in `core/errors/errors-http-map.ts`. The `satisfies Record<Code, ErrorMeta>` makes a missing entry fail the build:

   ```ts
   [AuthLoginErrorCode.AUTH_LOGIN_USER_PASSWORD_NOT_SET]: {
     statusCode: 400,
     responseMessage: "User password is not set",
   },
   ```

   Typical statuses: 400 invalid request, 401 unauthenticated or bad credentials, 403 forbidden, 404 not found, 409 conflict.

3. Add the translation under `errors.<CODE>` in both `src/intl/locales/<module>/en.json` and `ar.json`. Keys must match exactly. Write a real Arabic translation, never a copy of the English text.

4. Return it from the service as a failure Result: `error: <Code>`, a short `msg`, and `meta` for log context (never secrets).

5. Document it on every route that can return it (`createDomainErrorResponseSchema([...])`) and add a test that triggers it.

6. Run the `regenerate-api-clients` skill.
