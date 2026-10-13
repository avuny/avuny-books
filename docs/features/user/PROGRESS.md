# User Module — Implementation Progress

## Status Summary

- **Current State:** Slice 4a backend complete (`PATCH /users/me` name update). Slices 1–3 and Slice 6 backends are in place. First-admin seed missing. Client screens (Slices 1–4) not yet built.
- **Next item:** Slice 1 web client — HTTP layer, session restore, route guards, sign-up/sign-in/home screens in `web-features`. Blocked on Q13/Q14 defaults (recorded in GAP.md) — proceed with defaults if not confirmed.
- **Failing Checks:**
  - `pnpm turbo run typecheck`: passes (11 packages).
  - `pnpm --filter @avuny/api test`: passes (9 files, 61 tests). `pnpm turbo run test` still fails at root because `@avuny/zod` and `@avuny/i18n` have a `test` script and no test files.
  - Passing: `pnpm --filter @avuny/api lint` (0 errors, 5 undeclared-env warnings in `generate-openapi.ts`), `pnpm openapi:generate`, `pnpm api:generate`.
- **Built Differently from Spec:**
  - `sessions.revokedReason`: individual revoke uses `"sign_out"` (DB enum), not `"user_revoked"`.
  - Admin avatar URLs are `null` until Slice 4b FileStorage.
  - Mobile legacy auth: `accessToken` in SecureStore (CR3) and 1-step sign-up without OTP.
  - `audit.repo.ts` still casts drizzle `inet` inserts as `as unknown as undefined`. Tests now pass a string/`null`.
  - Slice 4a: `updateUserProfile` does two sequential DB writes (UPDATE users + INSERT audit_event) rather than a single transaction, because no other table is involved and a partial audit failure is acceptable for a profile name change.
- **Blocking Open Questions (§10):**
  - Q17: First-admin seed identifier and password source (and bcrypt in `@avuny/db`) — blocks the seed script.
  - Q13 / Q14: defaults recorded in GAP.md (server messages; web `/`; mobile `/(app)`). Confirm before client UX.
  - Q15: admin-app UI architecture — blocks Slice 6 UI (`apps/admin-app` is a stub).
  - Q16: no UI test tooling; use manual checks.
  - Q3: storage provider — blocks Slice 4b.

---

## Phase 0 — Reconcile and foundations (horizontal)

### Inventory & Reconciliation
- [x] Inventory existing otp, users, auth code and record gap list starting from §11 (`docs/features/user/GAP.md`)
- [x] Inventory each client app (screens, navigation, design system, form library, secure-storage library, test tools, home route) (`docs/features/user/GAP.md`)
- [x] Check Q9–Q11 against real code and record findings in §10 (`docs/features/user/SPEC.md`; Q17 added for first-admin seed)

### Configuration & Infrastructure
- [x] Add config keys (§7) with Zod validation and fail-fast rules (`packages/api/src/config.ts:32-136`)
- [x] Database schema tables and enums (§5) (`packages/db/src/schema/user/`)
- [x] Database migration applied (`packages/db/drizzle/0000_good_lilith.sql`)
- [ ] First-admin seed script (`packages/db/src/seed/` not created; blocked on Q17)
- [x] Shared constants and validation schemas in contracts (`packages/contracts/src/user-module.constants.ts`, `packages/contracts/src/user-module.schemas.ts`)
- [x] Error codes and error map definitions (`packages/contracts/src/user-module.errors.ts`, `packages/api/src/modules/*/core/*.errors.ts`)
- [x] API i18n translations in en and ar (`packages/api/src/intl/locales/{otp,auth,users,admin}/{en,ar}.json`)
- [x] Audit write API (`packages/api/src/modules/audit/shell/audit.repo.ts`)
- [x] BackgroundRunner port and adapters (`packages/api/src/background-runner.ts`)

### Done When
- [ ] Migrations apply to empty DB and copy of dev DB (no record of verification)
- [~] typecheck, lint, and tests pass (`turbo typecheck` passes; `api lint` 0 errors; `api test` passes; root `turbo test` fails on empty `@avuny/zod` / `@avuny/i18n` suites)
- [~] openapi:generate and api:generate run and generated client compiles in all three apps (`openapi:generate` & `api:generate` pass; Orval only in `apps/mobile-app/api`; web-app has no generator; admin-app and `web-mobile-shared` are stubs)

---

## Slice 1 — Walking skeleton: sign-up, sign-in, session, sign-out

### Backend
- [x] `identifier.rules.ts` (classify, normalize, validate) (`packages/api/src/modules/users/core/identifier.rules.ts`)
- [x] Identifier rules unit tests (`packages/api/src/modules/users/__tests__/core/identifier.rules.test.ts`)
- [x] `otp` module: issue with close-pending-first, verify, proof, consume (`packages/api/src/modules/otp/shell/otp.service.ts`)
- [x] OTP crypto and tests (`packages/api/src/modules/otp/core/otp.crypto.ts`, `packages/api/src/modules/otp/__tests__/core/otp.crypto.test.ts`)
- [x] Messaging module with ConsoleMessageSender adapter (`packages/api/src/modules/messaging/shell/messaging.service.ts`)
- [x] BackgroundRunner integration on public send endpoints (D9) (`packages/api/src/modules/auth/hono-routes/send-otp.route.ts`)
- [x] User repository: create user with first identifier in single transaction, uniqueness, primary (`packages/api/src/modules/users/shell/users.repo.ts`)
- [x] Session repository: sessions replacing refresh_tokens (§11 R1) (`packages/api/src/modules/auth/shell/auth.repo.ts`)
- [x] Auth crypto helpers: bcrypt, HMAC SHA-256, timingSafeEqual (`packages/api/src/modules/auth/core/auth.crypto.ts`, `packages/api/src/modules/auth/__tests__/core/auth.crypto.test.ts`)
- [x] Routes:
  - [x] `POST /auth/sign-up/send-otp` (`packages/api/src/modules/auth/hono-routes/send-otp.route.ts`)
  - [x] `POST /otp/verify` (`packages/api/src/modules/otp/hono-routes/verify-otp.route.ts`)
  - [x] `POST /auth/sign-up` (`packages/api/src/modules/auth/hono-routes/sign-up.route.ts`)
  - [x] `POST /auth/sign-in` (`packages/api/src/modules/auth/hono-routes/sign-in.route.ts`)
  - [x] `POST /auth/refresh` (`packages/api/src/modules/auth/hono-routes/refresh.route.ts`)
  - [x] `POST /auth/sign-out` (`packages/api/src/modules/auth/hono-routes/sign-out.route.ts`)
  - [x] `GET /users/me` (`packages/api/src/modules/users/hono-routes/me.route.ts`)
- [x] Token issuing, session management, sliding expiry, and absolute lifetime cap (D4) (`packages/api/src/modules/auth/shell/auth.service.ts`)
- [x] Refresh token rotation and reuse detection (D4) (`packages/api/src/modules/auth/shell/auth.service.ts`)
- [x] `requireAuth` middleware loading session and user by sid (D3) (`packages/api/src/modules/auth/shell/require-auth.middleware.ts`)
- [x] Dual token delivery: Web HttpOnly cookie + `x-requested-with`, Mobile body token + `x-client-platform` (D5) (`packages/api/src/modules/auth/hono-routes/*.route.ts`)
- [x] Postgres audit-backed throttling for sign-in and OTP sends (D10) (`packages/api/src/modules/auth/shell/auth.service.ts`)
- [x] Backend security tests (`packages/api/src/modules/auth/__tests__/shell/auth.service.security.test.ts` — 9 tests; typecheck passes)

### Web (web-features)
- [ ] Sign up screen (3 steps: identifier -> code + countdown -> name and password)
- [ ] Sign in screen (single identifier field + password)
- [ ] Home screen (name, primary identifier, Sign out)
- [ ] Neutral wording on public endpoints (CR9)
- [ ] CR8 error handling (INVALID_CREDENTIALS, TOO_MANY_ATTEMPTS, ACCOUNT_SUSPENDED)
- [ ] HTTP layer, session restore on load, single-flight refresh, purge, route guards (CR2–CR7)

### Mobile (mobile-app)
- [~] Sign up screen (`apps/mobile-app/app/(auth)/sign-up.tsx` exists but is legacy 1-step form without OTP verification or verificationToken)
- [~] Sign in screen (`apps/mobile-app/app/(auth)/sign-in.tsx` exists, calls API, but lacks full CR8 error handling and single-flight refresh)
- [ ] Home screen showing name, primary identifier, and proper sign out
- [~] Tokens in secure storage (`SecureStore` used in `apps/mobile-app/features/auth`, but stores `accessToken` violating CR3 memory-only rule)
- [ ] Cold start session restore and foreground expiry check (CR4, CR5)
- [ ] Request headers: `x-client-platform: mobile` and `x-device-name` on all requests (CR2)

### Manual Checks
- [ ] Web: sign up, reload -> still signed in; delete cookie -> redirect to sign-in; sign out then back button -> no protected data
- [ ] Mobile: sign up, kill app, reopen -> still signed in; sign out -> secure storage empty
- [ ] Both: replay used refresh token -> session revoked; 6 wrong passwords -> TOO_MANY_ATTEMPTS countdown; full flow in Arabic

### Done When
- [ ] Sign-up -> sign-in -> refresh -> reuse -> sign-out works end-to-end on web and mobile; client implementations and manual checks incomplete

---

## Slice 2 — Security: password and sessions

### Backend
- [x] `PATCH /auth/password` (verify current, revoke other sessions with `password_changed`, audit `auth.password_changed`) (`packages/api/src/modules/auth/hono-routes/password.route.ts`)
- [x] `POST /auth/sign-out-all` (revoke all sessions with `sign_out_all`, audit) (`packages/api/src/modules/auth/hono-routes/sign-out-all.route.ts`)
- [x] `GET /auth/sessions` (list sessions, mark current device) (`packages/api/src/modules/auth/hono-routes/sessions.route.ts`)
- [x] `DELETE /auth/sessions/{id}` (revoke specific session, own sessions only, audit) (`packages/api/src/modules/auth/hono-routes/sessions.route.ts`)
- [x] Backend tests for session revocation and password change (`packages/api/src/modules/auth/__tests__/shell/auth.service.security.test.ts`)
- [x] 72-byte password limit tests (`packages/api/src/modules/users/__tests__/core/password.rules.test.ts`)

### Web
- [ ] Security screen: Change password form with current, new, and confirm fields
- [ ] Inline handling for `WEAK_PASSWORD` and `INVALID_CURRENT_PASSWORD`
- [ ] Active sessions list showing platform, device, IP, created, last used, and "This device" badge
- [ ] Revoke buttons on other sessions with confirmation; Sign out all devices button with purge (CR6)
- [ ] List reload after revocation

### Mobile
- [ ] Account security screen under settings (change password, sessions list)
- [ ] Native confirmation dialogs for revoking sessions and sign-out-all
- [ ] Pull-to-refresh on sessions list

### Manual Checks
- [ ] Change password on one device -> other device signed out on next request
- [ ] Revoke remote device from session list -> remote device signed out
- [ ] Sign-out-all ends both devices

### Done When
- [ ] Behavior verified end-to-end on both clients; client screens not yet built

---

## Slice 3 — Forgot password

### Backend
- [x] `POST /auth/forgot-password/send-otp` (D9 neutral response, resolves primary verified email/phone for usernames) (`packages/api/src/modules/auth/hono-routes/forgot-password-send-otp.route.ts`)
- [x] `POST /auth/forgot-password/reset` (verificationToken + new password, revoke all sessions with `password_reset`, audit) (`packages/api/src/modules/auth/hono-routes/forgot-password-reset.route.ts`, `packages/api/src/modules/auth/shell/auth.service.ts`)
- [x] D9 timing and suppressed send rate-limiting tests (`packages/api/src/modules/auth/__tests__/shell/forgot-password.test.ts`)

### Web
- [ ] Forgot password link on Sign-in screen
- [ ] 3-step reset flow (identifier -> OTP code -> new password)
- [ ] Return to sign-in with success message after reset (no auto sign-in)

### Mobile
- [ ] Same forgot password flow and screens on mobile

### Manual Checks
- [ ] Reset known account -> old sessions revoked, new password works
- [ ] Reset unknown identifier -> identical timing and neutral message
- [ ] Wrong code attempts until OTP_ATTEMPTS_EXCEEDED -> code invalidated
- [ ] Repeat in Arabic

### Done When
- [ ] End-to-end flow verified on web and mobile with suppressed send tests passing

---

## Slice 4 — Profile: name and avatar

### Slice 4a — Name
- [x] Backend: `PATCH /users/me` `{ name }` (1–100 chars, trimmed, audit `user.name_changed`) (`packages/api/src/modules/users/hono-routes/update-me.route.ts`, `packages/api/src/modules/users/shell/users.service.ts:updateUserProfile`, `packages/contracts/src/user-module.schemas.ts:UpdateProfileBodySchema`)
- [ ] Web: Profile screen with name field and Save action
- [ ] Mobile: Profile screen with name field and Save action
- [ ] Manual check: change name and observe update across screens

### Slice 4b — Avatar (Waits on Q3 storage decision)
- [ ] Backend: FileStorage port and adapters (S3-compatible and local dev)
- [ ] Backend: `PUT /users/me/avatar` (multipart, max 2 MB, magic-byte check, audit `user.avatar_changed`)
- [ ] Backend: `DELETE /users/me/avatar` (best-effort storage delete, audit `user.avatar_removed`)
- [ ] Web: Avatar upload, change, remove with initials fallback
- [ ] Web: `AVATAR_TOO_LARGE` (413) and `AVATAR_INVALID_TYPE` (415) error handling
- [ ] Mobile: Photo picker with client-side compression
- [ ] Manual checks: upload, replace, delete avatar; test oversized file and invalid MIME type

### Done When
- [ ] Both clients support name and avatar, and FileStorage adapters pass tests

---

## Slice 5 — Identifiers

### Slice 5a — Add, Primary, Delete
- [ ] Backend: `POST /users/me/identifiers/send-otp`
- [ ] Backend: `POST /users/me/identifiers` (currentPassword, caller-bound token, max 4 check under row lock)
- [ ] Backend: `PUT /users/me/primary-identifier` (enforce single primary)
- [ ] Backend: `DELETE /users/me/identifiers/{id}` (prevent deleting primary or last recovery identifier)
- [ ] Backend integration tests: concurrent adds, row lock enforcement, proof reuse prevention

### Slice 5b — Update
- [ ] Backend: `POST /users/me/identifiers/{id}/send-otp`
- [ ] Backend: `PUT /users/me/identifiers/{id}` (same type only, preserves primary flag, sends notice to old value)

### Web
- [ ] Sign-in methods screen listing all identifiers with type, value, and Primary badge
- [ ] Add identifier modal/flow (type selector -> OTP verification for email/phone -> password step-up)
- [ ] Make primary action
- [ ] Edit identifier flow (same type only, OTP to new value, password step-up)
- [ ] Delete identifier with confirmation; disabled states with tooltips for primary and last recovery
- [ ] Handle error codes: `IDENTIFIER_ALREADY_EXISTS`, `IDENTIFIER_LIMIT_REACHED`, `CANNOT_DELETE_PRIMARY_IDENTIFIER`, etc.

### Mobile
- [ ] Sign-in methods screen and matching flows with type-specific keyboard

### Manual Checks
- [ ] Add email, phone, and username; change primary; delete secondary; attempt forbidden deletes
- [ ] Max 4 identifiers cap disables Add action
- [ ] Update email and observe notification sent to old email

### Done When
- [ ] Integration tests and client manual checks pass on web and mobile

---

## Slice 6 — Admin (admin-app only)

### Backend
- [x] Role authorization middleware: `support` (read-only) and `admin` (`packages/api/src/modules/admin/shell/require-role.middleware.ts`)
- [ ] First-admin seed script in `packages/db`
- [x] `GET /admin/users` (AD-1 search, filters, sorting, offset pagination) (`packages/api/src/modules/admin/hono-routes/list-users.route.ts`)
- [x] `GET /admin/users/{id}` (AD-2 detail, active sessions, audits `admin.user_viewed`) (`packages/api/src/modules/admin/hono-routes/get-user.route.ts`)
- [x] `POST /admin/users/{id}/suspend` (AD-3 require reason, revokes sessions, audits `admin.user_suspended`) (`packages/api/src/modules/admin/hono-routes/user-actions.route.ts`)
- [x] `POST /admin/users/{id}/reactivate` (AD-3 audits `admin.user_reactivated`) (`packages/api/src/modules/admin/hono-routes/user-actions.route.ts`)
- [x] `POST /admin/users/{id}/revoke-sessions` (AD-3 audits `admin.sessions_revoked`) (`packages/api/src/modules/admin/hono-routes/user-actions.route.ts`)
- [x] AD-3 guardrails: cannot suspend self, cannot suspend admin, already/not suspended (`packages/api/src/modules/admin/shell/admin.service.ts`)
- [x] `GET /admin/activity` (AD-4 filterable event log, server-paginated) (`packages/api/src/modules/admin/hono-routes/activity.route.ts`)
- [x] `GET /admin/metrics/overview` (AD-5 7d/30d/90d ranges, user and sign-in metrics) (`packages/api/src/modules/admin/hono-routes/metrics.route.ts`)
- [x] Admin unit tests covering guardrails and permissions (`packages/api/src/modules/admin/__tests__/shell/admin.service.test.ts`)

### Admin-App Screens (Waits on Q15 admin UI decision)
- [ ] Users list table (search, filters by status/type/date, sorting, pagination)
- [ ] User detail view (profile, identifiers, active sessions, recent activity)
- [ ] Admin action dialogs (Suspend with reason, Reactivate, Revoke sessions)
- [ ] Read-only view for `support` role (actions hidden or disabled)
- [ ] Activity log screen (filters by user, event, outcome, date, IP)
- [ ] Metrics overview screen (cards for counts, DAU/WAU/MAU, 7d/30d/90d ranges)
- [ ] Access guard: non-admin/support users redirected to unauthorized screen
- [ ] HTTP layer and session management per CR2–CR7

### Manual Checks
- [ ] Sign in as `support`: write actions hidden, direct API calls return 403
- [ ] Sign in as `admin`: suspend user -> user gets 401 immediately and sign-in blocked with `ACCOUNT_SUSPENDED`
- [ ] Reactivate user -> sign-in restored
- [ ] Verify audit log records user detail views (AD-6) and all admin actions without exposing credentials

### Done When
- [ ] Support users cannot mutate state, every action is audited, AD-6 credential masking holds, and screens are verified

---

## Phase 7 — Hardening (horizontal)

- [ ] Background cleanup job (retention cleanup for audit_events, expired otps, expired/revoked sessions)
- [ ] Performance indexes (e.g. pg_trgm for search, last_active_at, last_sign_in_at)
- [ ] Security audit against binding decisions D3–D13
- [ ] Environment variable review and configuration audit with human
- [ ] Client compliance review against CR1–CR14 across all three apps
- [ ] Record final module architectural conventions in root and package `AGENTS.md`
