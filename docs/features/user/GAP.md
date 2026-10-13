# User module — Phase 0 gap list

Recorded against SPEC v3 §11 (code-impact list) and the live tree. Do not duplicate working code; extend from here.

## §11 reconciliation vs current code

| Item | Spec / §11 | Current | Gap |
|---|---|---|---|
| R1 sessions | `sessions` replaces `refresh_tokens` | `packages/db/src/schema/user/sessions.ts`; auth uses `auth.repo.ts` | None. No `refresh_tokens` table or leftover queries. |
| R2 OTP purposes | SIGN_UP, ADD_IDENTIFIER, UPDATE_IDENTIFIER, FORGET_PASSWORD; no LOGIN | `otpPurposeEnum` matches | None. |
| R3 naming | `purpose`, `identifier`, `otp_hash`, `ip_address` | Schema and services use these names | None. |
| R4 OTP binding | `user_id`, `verified_at`, consume requires verified | `otp.repo.ts` / `otp.service.ts` | None for implemented send/verify. ADD/UPDATE identifier send endpoints not built (slice 5). |
| R5 one live code | close-pending-first + partial unique index | `closePendingOtps` then insert | None on issue path. |
| R6 no OTP channel column | channel derived from identifier type | No channel column | None. |
| R7 indexes | existing btree + expires_at | `otps.ts` | None. |
| R8 relations | sessions; otps→user; audit actor/subject | `relations.user-module.ts` | None. |
| R9 `user_providers` | leave alone if present | **Does not exist** in `packages/db` | Confirmed Q9. Social login remains out of v1. |
| R10 users / identifiers | §5 | `users.ts`, `user-identifiers.ts` | Confirmed Q11. No extra columns to keep. |
| R11 audit_events | new table, hmac, no FKs | `audit-events.ts` + `writeAuditEvent` | Insert uses `ipAddress as unknown as undefined` for drizzle `inet` types (`audit.repo.ts`). Select/session rows type as `string \| null`. |
| R12 CHECKs | D1 disjointness, suspension pair, etc. | Present on tables | None. |
| Config / constants | §7 + contracts | `packages/api/src/config.ts`, `user-module.constants.ts` | None for keys. |
| BackgroundRunner | D9 | `packages/api/src/background-runner.ts`; used on public send-otp | None for slice 1 send. |
| Absolute session cap | D4 | `auth.service.ts` refresh/sign-in | None. |
| Web refresh header | D5 `x-requested-with` | `refresh.route.ts` | None. |

Q9–Q11 findings are also in SPEC §10.

## Backend inventory (otp, users, auth, admin, messaging, audit)

**Present**

- Modules: `otp`, `users`, `auth`, `admin`, `audit`, `messaging`.
- Routes mounted in `packages/api/src/routes.ts`: `/otp`, `/auth`, `/users`, `/admin`.
- Auth: sign-up send-otp, sign-up, sign-in, refresh, sign-out, sign-out-all, password, sessions list/revoke.
- OTP: `POST /otp/verify`.
- Users: `GET /users/me` only.
- Admin: list, get, suspend, reactivate, revoke-sessions, activity, metrics.
- Throttling lives in `auth.service.ts` / `otp.service.ts` (no separate `auth.throttle.ts`). Session persistence is `auth.repo.ts` (no `sessions.repo.ts`). Middleware: `require-auth.middleware.ts`, `require-role.middleware.ts`.
- Tests: identifier/password rules, otp crypto, auth crypto, auth.service security (slice 2), admin.service guardrails. API suite: 8 files / 47 tests (as of last run).

**Missing vs §6 (backend)**

- Slice 3: `POST /auth/forgot-password/send-otp`, `POST /auth/forgot-password/reset` (no contracts schemas either).
- Slice 4a: `PATCH /users/me`.
- Slice 4b: FileStorage port/adapters; `PUT/DELETE /users/me/avatar`.
- Slice 5: identifier send-otp, add, update, primary, delete.
- Phase 0/6: first-admin seed (`packages/db/src/seed/` does not exist). Credential source not specified (SPEC Q17).
- Phase 7: retention cleanup job, extra indexes (pg_trgm, etc.).
- Route-level tests (AGENTS.md) for auth/otp/users/admin endpoints.
- WhatsApp/email adapters (Q2): `ConsoleMessageSender` only.

**Behavioral / convention gaps**

- D1 phone: spec cites libphonenumber-js; code classifies with `E164_RE` only (`identifier.rules.ts`). Non-E.164 international input classifies as username.
- D1 username charset `[a-z0-9._-]`, no `@`: length/space/email/phone checks only; `@` and other characters are not rejected.
- D13: `ConsoleMessageSender` logs the OTP `code` (`messaging.service.ts`). Config refuses console adapters in production, but any non-prod log still stores codes.
- Individual session revoke reason is `"sign_out"` (DB enum), not spec wording `"user_revoked"` — keep DB enum.
- Admin routes import `requireAuth` from `auth/shell/require-auth.middleware.js`, not `auth/index.ts` (module boundary).
- Admin avatar URLs are `null` until FileStorage (slice 4b).
- drizzle `inet` insert typing still uses `as unknown as undefined` in `audit.repo.ts`.

## Client inventory

### web-app (`apps/web-app`) + web-features

- Host: Vite. Entry `src/main.tsx` (not `App.tsx`). `App.tsx` is an unused shadcn stub.
- Navigation: React Router 7 via `@avuny/web-host` (`createBrowserRouter`).
- Screens today: `DashboardPage` (`/`), `ProductsPage` (`/products`), `ProductDetailsPage` (`/products/:id`) in `packages/web-features/src/web/index.tsx`. No auth, profile, or security screens.
- **Home route (Q14 default):** `/` (`DashboardPage`).
- Design system: `@avuny/ui` (shadcn/Tailwind v4). Only `Button` exists under `packages/ui/src/components`.
- Form library: none on web (no react-hook-form in web-app / web-features).
- HTTP / Orval: no `api:generate` in web-app or web-features. CR1–CR7 HTTP layer not started.
- Session: no cookie refresh, guards, or in-memory access token.
- Tests: no UI test runner in web-app (Q16 default: manual checks).
- i18n: `useMessages` in web-features still reads catalogs from `@avuny/i18n` (`packages/i18n/src/messages.ts`), not `web-mobile-shared`.

### admin-app (`apps/admin-app`)

- Package is a stub: `package.json` + AGENTS.md only. No `src`, Vite config, or screens.
- Target: `@avuny/web-features/admin` (currently a placeholder export). Q15 still open.
- **Home route:** none.

### mobile-app (`apps/mobile-app`)

- Expo SDK 56, Expo Router, React Native 0.85, Uniwind-style `components/ui` (Reusables), react-hook-form, i18next, TanStack Query, axios, Orval (`apps/mobile-app/orval.config.ts` → `apps/mobile-app/api`).
- Secure storage: `expo-secure-store`. Access **and** refresh tokens both stored (`use-auth-success-handler.ts`, `token-storage.ts`). Violates CR3 (access token must be memory-only).
- Auth screens: `(auth)/sign-in.tsx`, `(auth)/sign-up.tsx`. Sign-up is one step (identifier, name, password) with no OTP / `verificationToken`. Sign-in exists; CR8 codes not fully handled.
- **Home route (Q14 default):** `router.replace('/(app)')` after auth; tab home is `(app)/(tabs)/home` (legacy org dashboard, hardcoded “Karim”, not name + primary identifier + sign-out).
- HTTP: request interceptor sets Bearer + language; does **not** send `x-client-platform: mobile` or `x-device-name` (CR2). Refresh posts `{ refreshToken }` (`refresh-token.ts`).
- Host is not thin: features live in `apps/mobile-app/features` and `components`. `@avuny/mobile-features` and `@avuny/mobile-ui` packages do not exist yet (`docs/features/web-mobile-structure/SPEC.md` phases 4–6).
- Tests: no Jest/Vitest/Maestro scripts in `apps/mobile-app/package.json` (Q16: manual).

### web-mobile-shared (`packages/web-mobile-shared`)

- Stub package (`package.json` + AGENTS.md). No `src`, no generated Orval client. AGENTS.md says Orval output belongs here; only mobile currently generates clients into the app.

## Client work implications

Slice 1 web/mobile screens should not be invented inside apps. They need:

1. A real `@avuny/web-mobile-shared` (Orval client, session HTTP layer CR2–CR7, shared forms/messages).
2. `web-features` module `users`/`auth` screens copied from the closest existing page (today: dashboard stub).
3. Mobile: either keep legacy `apps/mobile-app` screens as a temporary host (violates mobile AGENTS.md) or wait on `mobile-features` from the web-mobile-structure plan.

Q13 default until decided: show server `message` with `Accept-Language`.
Q14 defaults from this inventory: web `/`; mobile `/(app)`.
Q16: no UI test tooling; slice Done-when uses manual checks.

## Next unblocked backend work

1. First-admin seed after Q17 (and bcrypt hashing in `packages/db` — would need a `bcryptjs` dependency or a documented hash strategy).
2. Slice 3 forgot-password endpoints (no client dependency).
3. Then Slice 1 clients once shared HTTP/package shape is agreed (or explicitly allowed to live in apps until web-mobile-structure lands).
