# User Module — Agent-Ready Spec

Draft v2 · October 12, 2026 · users, auth, OTP, sessions, avatar and platform-admin user management · reconciled with the existing Drizzle schemas (§11 lists every change and why)

## 1. How agents use this document

- Read §1–§7 before planning. §3 Decisions are binding. Items in §10 Open questions go to the human; never guess them.
- Some otp, users and auth code may already exist. Inventory it, write a gap list against this spec, then extend. Do not duplicate or rewrite working code. §11 records the conflicts between this spec and the existing schemas that are already decided, and which existing code they touch; start the gap list from it.
- The Drizzle schema files in packages/db are the source of truth for column, index and constraint names. §5 summarizes them. If code and §5 disagree, fix the code and report it.
- Follow root AGENTS.md and the §2 conventions. On any conflict, AGENTS.md wins and you report it.
- Work one phase at a time (§8). After any API change run openapi:generate, then api:generate, from the repo root.
- Tags: (orig #n) = original requirement number; Added = new; Refined = original made stricter or more precise; Reconciled = changed to resolve a conflict with the existing schemas (§11).
- Tests are requirements: never delete or weaken one to get green; add a regression test for every real bug you fix.

## 2. Scope and architecture

**Goal.** One identity system for web, mobile and the admin app: sign up and sign in with email, phone or username; manage identifiers, password, profile and avatar; keep sessions across devices; let platform admins list, support and monitor users. Users are platform-level, not tenant-scoped.

**Out of scope (v1).** MFA, social login, passkeys, passwordless (OTP-only) sign-in, self-service account deletion or export, admin impersonation, image resizing, org membership, and org/plan/billing panels in admin. Managed users from the PRD (username + password, created by an org) will come from the orgs module; the data model only has to allow a user whose sole identifier is a username.

**Where code goes (existing conventions)**

- packages/db: Drizzle schema and migrations. Cross-module table relations live in the shared relations file, which may import any table (module code still talks only through index.ts). packages/contracts: Zod schemas and types (errors via createDomainErrorResponseSchema, shared ones via globalErrorResponses). Import Zod from @avuny/zod.
- packages/api/src/modules/&lt;name&gt;/: index.ts (public API only), core/ (pure: error codes as as const, error maps satisfies Record&lt;Code, ErrorMeta&gt;, \*.rules.ts), shell/ (all I/O: repositories, services, crypto, adapters), hono-routes/ (one file per route), \_\_tests\_\_/.
- Services return the ok/fail result from @avuny/utils; routes use handleResult from @avuny/hono with the module error map, errorTrans and moduleName. Messages live in src/intl (en, ar; codes under errors). Env is read only in src/config.ts.
- Clients use the Orval output: web-features (web screens), admin-app (admin screens; shared admin components wait on the pending admin-web-features decision), mobile-app.

**Modules (talk only through each other's index.ts; no cycles)**

- otp: issue and verify codes, verification tokens; uses messaging.
- messaging: MessageSender port with email and WhatsApp adapters (reuse existing sending code).
- users: user, identifiers (aggregated under the user repository), profile, avatar, status; owns password_hash (verifyPassword, setPassword); uses otp, storage, audit, messaging.
- auth: sign-up/in, tokens, sessions, forgot-password; uses users, otp, messaging, audit.
- audit: write and read audit events. storage: FileStorage port with adapters.
- admin: platform-admin routes; uses users, auth, audit.
- Tables owned elsewhere: organization_users (orgs module; relation `memberships`) is never imported by this module. user_providers exists but is not used by v1 code (§10 Q9).

## 3. Decisions (binding defaults)

- **D1 Identifiers.** classify(input): valid E.164 phone (e.g. libphonenumber-js; clients send international format) → phone; else valid email with a dotted domain → email; else username. Normalize: email trim + lowercase, phone E.164, username trim + lowercase. Self-chosen usernames: 3–32 chars of [a-z0-9._-], no @ (name@orgslug is reserved for managed users; org slugs must not contain dots, so it never classifies as email). No input may classify as two types. The database mirrors this with CHECK constraints (user_identifiers_type_value_chk, otps_identifier_deliverable_chk), so a bug in classify() cannot store a value under the wrong type. (Reconciled)
- **D2 Uniqueness.** UNIQUE(type, value) platform-wide. One primary per user (partial unique index). Max 4 identifiers per user, any mix, same-type duplicates allowed; enforced in a transaction that locks the user row.
- **D3 Access token.** JWT via jose (HS256) with sub, sid (= sessions.id), iat, exp. Middleware verifies it, then loads session and user in one query and rejects revoked or expired sessions and non-active users, so sign-out and suspension take effect immediately. Role always comes from the DB.
- **D4 Refresh token.** Opaque 32-byte random value (base64url), stored only as a lowercase-hex SHA-256 hash in sessions.refresh_token_hash, not bcrypt: it is high-entropy, needs an indexed lookup, and bcrypt truncates at 72 bytes. Rotated on every refresh as one atomic `UPDATE sessions … WHERE refresh_token_hash = $presented AND revoked_at IS NULL AND expires_at > now() RETURNING`, which moves the old hash into previous_refresh_token_hash, so two concurrent refreshes cannot both win. A token that matches no current hash is looked up in previous_refresh_token_hash: a match is reuse, so revoke the session (reason reuse_detected) and audit it; anything else is REFRESH_TOKEN_INVALID. Clients must serialize refresh calls. One row per sign-in: sessions replaces the old refresh_tokens table (its family_id is now sessions.id). (orig #11, Refined, Reconciled)
- **D5 Token delivery.** Access token always in the body. Web: refresh token only in cookie refresh_token (HttpOnly; Secure; SameSite=Lax; Path=/api/auth, attributes from config). Mobile (header x-client-platform: mobile): refresh token in the body, no cookie. (orig #9, Refined: keeps the long-lived token out of web JavaScript)
- **D6 Passwords.** bcryptjs async, cost from config (12; 4 in tests; tune so sign-in p95 stays under ~500 ms). Min 8 characters, max 72 UTF-8 bytes (reject, never truncate); no composition rules. Run a dummy compare for unknown identifiers so timing does not reveal existence. Compare secrets and hashes with timingSafeEqual.
- **D7 OTP.** 6 digits via crypto.randomInt, stored as hex HMAC-SHA256 of otps.id + code with OTP_SECRET (otps.otp_hash). TTL 10 min; 5 wrong attempts kill the code (increment attempts atomically, then compare); 60 s resend cooldown; max 5 sends per hour per identifier and purpose (suppressed sends count, see D9). One pending code per identifier and purpose: issuing a code first closes any pending one (sets consumed_at) in the same transaction, and a partial unique index makes a race fail instead of creating two (map that failure to OTP_RESEND_TOO_SOON). Purposes: SIGN_UP, ADD_IDENTIFIER, UPDATE_IDENTIFIER, FORGET_PASSWORD (the old LOGIN purpose is dropped, §11 R2). otps.identifier is the normalized identifier the requester submitted: for SIGN_UP, ADD_IDENTIFIER and UPDATE_IDENTIFIER it is always the email or phone the code goes to; for FORGET_PASSWORD it may be a username, and delivery goes to that user's primary verified email or phone. Email codes go by email, phone codes by WhatsApp message. Messages are localized (en, ar; RTL-safe). (Reconciled)
- **D8 Verification proof.** Send endpoints return 202 { challengeId, expiresAt, resendAvailableAt } (challengeId = otps.id). POST /otp/verify { challengeId, code } sets verified_at and returns a verificationToken (signed JWT, 15 min, own secret) with claims jti (= otps.id), purpose, identifier, and sub (the user id) for authenticated purposes only. The action endpoint checks that purpose and identifier match the request, then consumes the proof exactly once (`UPDATE otps SET consumed_at = now() WHERE id = $jti AND verified_at IS NOT NULL AND consumed_at IS NULL RETURNING`) in the same transaction as the action. otps.expires_at limits code entry only; after verification the token's own expiry governs. ADD_IDENTIFIER and UPDATE_IDENTIFIER rows carry the caller's user_id (the database requires it), and the action rejects a token whose sub is not the caller. (Reconciled)
- **D9 No enumeration on public endpoints.** sign-up/send-otp and forgot-password/send-otp answer identically for any input: always create the OTP row and apply the same limits, skipping only the provider call when the identifier is already registered (sign-up) or unknown (forgot-password). Because otps.identifier holds the submitted identifier, these suppressed rows are ordinary rows with the same cooldown and hourly limits. Sign-in returns INVALID_CREDENTIALS for an unknown identifier or wrong password, and ACCOUNT_SUSPENDED only after a correct password. (Timing of the provider call: §10 Q12a.)
- **D10 Throttling.** (Added) Postgres-backed; no in-memory counters (serverless-safe) and no Redis assumed. Sign-in: 5 failures per identifier and 20 per IP per 15 min → TOO_MANY_ATTEMPTS with retryAfter. Count from audit_events (failures keyed by identifier_hmac and ip_address) and otps. identifier_hmac = hex HMAC-SHA256(AUDIT_HMAC_SECRET, normalized submitted identifier), written on every auth event including those for unknown identifiers, so the limit applies identically to known and unknown accounts; otherwise TOO_MANY_ATTEMPTS would reveal which accounts exist. Client IP comes from a configured trusted-proxy header. (Reconciled)
- **D11 Avatar.** PUT /users/me/avatar multipart (file), max 2 MB, jpeg/png/webp verified by magic bytes, stored through FileStorage at avatars/{userId}/{uuid}.{ext} (new key per upload). Update avatar_key, then best-effort delete the old object. Multipart through the API keeps v1 simple and fits serverless body limits.
- **D12 Roles.** users.platform_role: user | support | admin; support is read-only. Only a seed script grants roles. Admin routes live under /api/admin/\*.
- **D13 Audit and logging.** Every state change and auth outcome writes an audit_events row in the same transaction as the change (failures standalone); multi-table writes such as sign-up and reset are single transactions. Never log or store passwords, codes or tokens, or the raw identifier of an unknown user; mask identifiers (a\*\*\*@mail.com, +20\*\*\*\*\*\*12) in metadata for display and use identifier_hmac for throttling and correlation. audit_events has no foreign keys on purpose: its rows must outlive users and sessions. (Refined)
- **D14 Module communication.** Synchronous public-API calls when the caller needs the result (verify → create user; suspend → revoke sessions). In-process events only for fire-and-forget side effects (security notices). If existing code has otp notifying users/auth by events, replace that with D8 unless the human decides otherwise (§10).

## 4. Requirements

**Identifiers**

- ID-1 Identifier types are email, phone, username (D1). (orig #1)
- ID-2 Public sign-up accepts only an email or phone as the first identifier; it is stored verified and primary. (orig #2, #7)
- ID-3 A signed-in user can add identifiers up to 4 in total. Email/phone need an ADD_IDENTIFIER OTP sent to the new value; a username needs none. Requires currentPassword. (orig #3; password step-up Added)
- ID-4 Exactly one identifier is primary, and the user can change which. (orig #3)
- ID-5 A user can delete an identifier except the primary one (change primary first) and the last remaining email/phone (recovery needs one). (orig #4, Refined)
- ID-6 A user can replace an identifier's value, same type only. Email/phone: UPDATE_IDENTIFIER OTP sent to the new value. Keeps id and primary flag; requires currentPassword; best-effort notice to the old value. (orig #5, Refined)

**Sign-up, sign-in, sessions**

- AU-1 Sign-up requires identifier, name, password and a valid SIGN_UP verificationToken for that identifier. Guests verify first: email by email, phone by WhatsApp message. (orig #7, #12)
- AU-2 Sign-in accepts any identifier type plus password. (orig #6)
- AU-3 Sign-up and sign-in return AuthResponse (§6) and deliver the refresh token per D5. (orig #9)
- AU-4 Passwords use bcryptjs (D6); token TTLs come from env through config.ts; refresh tokens are stored hashed (D4). (orig #8, #10, #11)
- AU-5 POST /auth/refresh rotates the refresh token and slides the session expiry. (Added; needed for orig #19)
- AU-6 Sign-out revokes the current session on the server and clears the cookie (same attributes, Max-Age=0); clients also purge tokens, cached queries and local state. Sign-out-all revokes every session. (orig #16; sign-out-all Added)
- AU-7 Sessions persist per device on web and mobile; users can list and revoke their own. (orig #19; list/revoke Added)

**Account**

- AC-1 Users can edit their name (1–100 chars, trimmed). (orig #13)
- AC-2 Users can change their password with currentPassword; all other sessions are then revoked. (orig #14; revocation Added)
- AC-3 Forgot password: send a FORGET_PASSWORD OTP to a verified email/phone (for a username, use the user's primary verified email/phone; if none, do nothing). Reset with verificationToken + new password, revoke all sessions, send a security notice. (orig #15)
- AC-4 Users can upload, replace and remove an avatar (D11). (orig #17, #18)

**Admin (platform manager)** (orig #20, expanded to SaaS-management practice)

- AD-1 Users list: server-side page-number pagination (page, pageSize ≤ 100); search q over name and identifiers; filters: status, identifier type, created range, last-active range; sort by createdAt, lastSignInAt, name.
- AD-2 User detail: profile, identifiers, active sessions (platform, device, IP, last used), recent activity.
- AD-3 admin-only actions with a required reason, all audited: suspend, reactivate, revoke all sessions. A suspended user cannot sign in or refresh and loses all sessions at once. Admins cannot suspend themselves or another admin.
- AD-4 Activity log: filter by user, event type, outcome, date range, IP; newest first; server-paginated.
- AD-5 Overview for 7/30/90 days: total, new, active (DAU/WAU/MAU) and suspended users; sign-in success vs failure; sign-ups per day.
- AD-6 Admins never see password hashes, OTP codes or tokens; opening a user's detail is audited.

## 5. Data model (Drizzle, packages/db)

The schema files are the source of truth (users.ts, user-identifiers.ts, sessions.ts, otps.ts, audit-events.ts, identifier-patterns.ts, relations.ts); this section summarizes them. (Reconciled)

**Conventions.** pk() uuid ids. timestamps() adds created_at and updated_at to every table except audit_events, which is append-only and has occurred_at. All instants are timestamptz; IP addresses are inet; hashes are lowercase hex. Enum values are lower_snake except OTP purposes (UPPER_SNAKE, as before). Normalized text columns carry the isNormalized check. Constraint suffixes: \_chk, \_idx, \_uidx. Relative imports use the .js extension.

**Enums.** user_status (active | suspended), platform_role (user | support | admin), identifier_type (email | phone | username), session_platform (web | mobile), session_revoked_reason (sign_out | sign_out_all | password_changed | password_reset | admin | suspended | reuse_detected), otp_purpose (SIGN_UP | ADD_IDENTIFIER | UPDATE_IDENTIFIER | FORGET_PASSWORD), audit_outcome (success | failure).

- **users**: id; name (1–100 chars, no leading or trailing spaces); password_hash (not null: every v1 user has a password); status (default active); platform_role (default user); avatar_key; suspended_at and suspended_reason (both set exactly when status is suspended, both null when active); last_sign_in_at; last_active_at (updated on sign-in and refresh only); timestamps. Indexes: status, created_at.
- **user_identifiers**: id; user_id FK → users (cascade); type; value (normalized, 3–254 chars); is_primary (default false); verified_at (required for email and phone; null for usernames); timestamps. UNIQUE(type, value); partial UNIQUE(user_id) WHERE is_primary; index user_id. user_identifiers_type_value_chk mirrors D1: an email must look like an email (one @, dotted domain), a phone must be E.164, a username must be neither; the 3–32 self-chosen username rule stays in the application because managed usernames (name@orgslug) are longer. The repository enforces max 4 and the delete rules inside a transaction that locks the user row (FOR UPDATE).
- **sessions** (replaces refresh_tokens): id (the access token's sid); user_id FK → users (cascade); refresh_token_hash UNIQUE; previous_refresh_token_hash (partial index where not null; never equal to the current hash); platform; ip_address; user_agent; device_name (header x-device-name or parsed user agent); expires_at (sliding: now() + REFRESH_TOKEN_TTL on every rotation; indexed for cleanup); last_used_at (sign-in and refresh only); revoked_at and revoked_reason (both set or both null); timestamps. Index user_id. A session is active when revoked_at IS NULL AND expires_at > now().
- **otps**: id (= challengeId); purpose; identifier (normalized, 3–254 chars, as submitted; no FK because SIGN_UP happens before the user exists); user_id FK → users, nullable (cascade; set exactly for ADD_IDENTIFIER and UPDATE_IDENTIFIER); otp_hash; attempts (≥ 0); expires_at; verified_at; consumed_at; timestamps. States: pending (verified_at and consumed_at null) → verified (verified_at set, proof issued) → closed (consumed_at set: spent by its action, superseded by a newer code, or killed by too many attempts). Indexes: (identifier, purpose, created_at) for cooldown and hourly counts; partial UNIQUE (identifier, purpose) WHERE verified_at IS NULL AND consumed_at IS NULL (one pending code); partial (user_id) WHERE user_id IS NOT NULL; (expires_at) for cleanup. otps_identifier_deliverable_chk: unless the purpose is FORGET_PASSWORD, identifier is an email or an E.164 phone.
- **audit_events**: id; occurred_at; event_type (text, `<area>.<action>`, format-checked; the closed list lives in packages/contracts); outcome; actor_user_id, subject_user_id, session_id (plain uuids, no FKs); identifier_hmac (D10); ip_address; user_agent; request_id; metadata jsonb (default `{}`). Indexes (ascending; Postgres scans them backwards for newest-first): (subject_user_id, occurred_at), (event_type, occurred_at), (occurred_at), partial (ip_address, occurred_at), partial (identifier_hmac, occurred_at).
- **Relations (relations.ts)**: users → identifiers, sessions, memberships (orgs); user_identifiers → user, providers; user_providers → identifier; sessions → user; otps → user; audit_events → actor, subject.
- Event types (&lt;area&gt;.&lt;action&gt;): auth (sign_up, sign_in, sign_out, refresh_reuse_detected, password_changed, password_reset_requested, password_reset_completed), session (revoked), user (name_changed, avatar_changed, avatar_removed), identifier (added, updated, removed, primary_changed), otp (sent, verify_failed), admin (user_viewed, user_suspended, user_reactivated, sessions_revoked). The otp.sent metadata records the delivery channel (email or whatsapp).

## 6. API contracts (prefix /api)

Access levels: public, user (Bearer access token), support (read-only admin), admin. Requests and responses are Zod schemas in @avuny/contracts; 401, 403, validation and 500 come from globalErrorResponses.

```
AuthResponse = {
  user: { id, name, identifier, identifierType, avatarUrl: string | null, platformRole },
  tokens: { accessToken, accessTokenExpiresAt, refreshToken? } // refreshToken: mobile only
}
```

identifier and identifierType are the user's primary identifier.

**Flows.** Sign-up: sign-up/send-otp → otp/verify → sign-up. Add identifier: identifiers/send-otp → otp/verify → POST identifiers. Update: identifiers/{id}/send-otp → otp/verify → PUT identifiers/{id}. Forgot password: forgot-password/send-otp → otp/verify → forgot-password/reset. Resend = call the same send endpoint again (cooldown applies).

**otp**

- POST /otp/verify: public (user if the challenge has a user) · {challengeId, code} → {verificationToken, expiresAt}

**auth**

- POST /auth/sign-up/send-otp: public · {identifier} (email/phone only) → 202
- POST /auth/sign-up: public · {identifier, name, password, verificationToken} → 201 AuthResponse
- POST /auth/sign-in: public · {identifier, password} → AuthResponse
- POST /auth/refresh: cookie (web) or {refreshToken} (mobile) → {tokens}; web also gets a fresh cookie
- POST /auth/sign-out, POST /auth/sign-out-all: user → 204
- GET /auth/sessions: user → [{id, platform, deviceName, ip, createdAt, lastUsedAt, current}]
- DELETE /auth/sessions/{id}: user → 204
- PATCH /auth/password: user · {currentPassword, newPassword} → 204
- POST /auth/forgot-password/send-otp: public · {identifier} → 202
- POST /auth/forgot-password/reset: public · {identifier, verificationToken, newPassword} → 204

**users** (all require user)

- GET /users/me → profile, identifiers, avatarUrl; PATCH /users/me {name} → profile
- PUT /users/me/avatar: multipart file → {avatarUrl}; DELETE /users/me/avatar → 204
- POST /users/me/identifiers/send-otp: {type, identifier} (email/phone) → 202
- POST /users/me/identifiers: {type, identifier, currentPassword, verificationToken?} (token required for email/phone) → 201
- POST /users/me/identifiers/{id}/send-otp: {identifier} → 202
- PUT /users/me/identifiers/{id}: {identifier, currentPassword, verificationToken?} → 200
- PUT /users/me/primary-identifier: {identifierId} → 200
- DELETE /users/me/identifiers/{id} → 204

**admin**

- GET /admin/users (support, AD-1 query) · GET /admin/users/{id} (support)
- POST /admin/users/{id}/suspend (admin, {reason}) · POST /admin/users/{id}/reactivate (admin) · POST /admin/users/{id}/revoke-sessions (admin)
- GET /admin/activity (support, AD-4 query) · GET /admin/metrics/overview?range=7d|30d|90d (support)

**Error codes** (CODE status; each needs en and ar text in src/intl)

- otp: OTP_INVALID 400, OTP_EXPIRED 400, OTP_ATTEMPTS_EXCEEDED 429, OTP_RESEND_TOO_SOON 429, OTP_RATE_LIMITED 429, OTP_DELIVERY_FAILED 502, VERIFICATION_TOKEN_INVALID 400
- auth: INVALID_CREDENTIALS 401, ACCOUNT_SUSPENDED 403, TOO_MANY_ATTEMPTS 429, REFRESH_TOKEN_INVALID 401, REFRESH_TOKEN_REUSED 401, SESSION_NOT_FOUND 404, WEAK_PASSWORD 422, INVALID_CURRENT_PASSWORD 403, INVALID_IDENTIFIER_TYPE 422
- users: IDENTIFIER_ALREADY_EXISTS 409, IDENTIFIER_LIMIT_REACHED 409, IDENTIFIER_NOT_FOUND 404, IDENTIFIER_TYPE_MISMATCH 422, CANNOT_DELETE_PRIMARY_IDENTIFIER 409, CANNOT_DELETE_LAST_RECOVERY_IDENTIFIER 409, AVATAR_TOO_LARGE 413, AVATAR_INVALID_TYPE 415
- admin: CANNOT_SUSPEND_SELF 409, CANNOT_SUSPEND_ADMIN 409, USER_ALREADY_SUSPENDED 409, USER_NOT_SUSPENDED 409

## 7. Config (src/config.ts, Zod-validated, fail fast)

Durations are strings (15m, 30d) parsed to seconds.

- Tokens: ACCESS_TOKEN_SECRET, ACCESS_TOKEN_TTL=15m, REFRESH_TOKEN_TTL=30d, VERIFICATION_TOKEN_SECRET, VERIFICATION_TOKEN_TTL=15m
- Passwords and OTP: BCRYPT_ROUNDS=12, OTP_SECRET, OTP_TTL=10m, OTP_MAX_ATTEMPTS=5, OTP_RESEND_COOLDOWN=60s, OTP_MAX_SENDS_PER_HOUR=5
- Web: COOKIE_SAMESITE=lax, COOKIE_DOMAIN (optional), CORS_ORIGINS (allowlist), TRUSTED_PROXY_IP_HEADER
- Avatar and storage: AVATAR_MAX_BYTES=2097152, STORAGE_\* (endpoint, bucket, credentials, public base URL)
- Delivery and audit: EMAIL_\*, WHATSAPP_\*, AUDIT_RETENTION_DAYS=365, AUDIT_HMAC_SECRET (Added, D10)

## 8. Implementation phases

A phase is done only when typecheck, lint, tests, openapi:generate and api:generate pass, every new error code has en and ar text, and every new state change writes an audit event.

- **Phase 0, reconcile and foundations.** Inventory existing otp/users/auth code and record the gap list, starting from §11 (including the code-impact list). Add config keys, apply the §5 schema (the §11 migration notes say how), contract skeletons, error-code and error-map files, i18n scaffolding, and the audit write API. Done when migrations apply to an empty DB and to a copy of the current dev DB.
- **Phase 1, identifiers and OTP.** identifier.rules.ts (classify, normalize, validate); otp and messaging modules (issue with close-pending-first, verify, proof, consume; console adapters for dev); user and identifier repositories with every invariant. Done when rule and invariant tests pass, including concurrent adds, concurrent sends and proof reuse.
- **Phase 2, sign-up, sign-in, sessions.** Auth services, token issuing, requireAuth middleware, refresh rotation on sessions and reuse detection, web/mobile delivery (D5), throttling (D10), sign-out(-all), session list/revoke. Done when sign-up → sign-in → refresh → reuse → sign-out works end to end and a revoked session is rejected immediately.
- **Phase 3, account management.** Name, change password, forgot/reset, identifier add/update/delete/primary, security notices.
- **Phase 4, avatar.** storage module (S3-compatible adapter plus local dev adapter), avatar routes.
- **Phase 5, admin backend.** Role middleware, users list/detail, actions, activity log, metrics, first-admin seed script. Done when a support user cannot call write actions and every action is audited.
- **Phase 6, clients.** Shared HTTP client (attach token, single-flight refresh on 401, purge everything on sign-out); web screens (sign-up/in, forgot password, profile, identifiers, sessions, avatar); mobile secure token storage; admin-app screens (Users, User detail, Activity, Overview).
- **Phase 7, hardening.** Cleanup job (audit retention, expired otps, expired or revoked sessions), pg_trgm search index and last_active_at / last_sign_in_at indexes if lists slow down, security review against D3–D13, record these conventions in AGENTS.md.

## 9. Required tests (risk-based, per AGENTS.md)

- **Rules (unit):** classification is disjoint; normalization; username rules; password 72-byte limit; identifier invariants (max 4, one primary, delete rules).
- **Services (boundaries mocked):** sign-up with valid, wrong-target, reused and expired proofs; unknown identifier and wrong password give the same error; suspended account; refresh rotation and reuse revoking the session; password change/reset revoking sessions; OTP attempts, cooldown and expiry; a suppressed OTP is rate-limited like a real one; admin guardrails.
- **Integration (real DB):** unique (type, value); single primary; max 4 under concurrent adds; proof consumed once under concurrency; revoked session rejected immediately by the middleware; audit row rolls back with its transaction. Schema invariants (Reconciled): user_identifiers rejects an email stored as username or phone, a username that looks like an email or E.164 phone, and an unverified email or phone; otps allows one pending code per identifier and purpose under concurrent sends, rejects a non-deliverable identifier for SIGN_UP, and enforces the user binding for ADD_IDENTIFIER and UPDATE_IDENTIFIER; two concurrent refreshes with the same token yield exactly one winner; sessions rejects revoked_at without revoked_reason and the reverse; users rejects a suspended row without reason and an active row with suspension fields.
- **Routes (thin):** validation, 401/403 wiring, status codes, error mapping, web cookie flags vs mobile body token.

## 10. Open questions

Record each answer here once resolved.

1. Are same-type duplicates allowed (two emails)? Default: yes, 4 identifiers in total.
2. Which email and WhatsApp providers? Build behind MessageSender with a console adapter until decided.
3. Which storage provider for avatars? S3-compatible assumed.
4. Events vs sync (D14): keep the default, or keep the earlier OTP-event design?
5. Are web-app and API same-site? If not, use SameSite=None; Secure plus a custom header (x-requested-with) on cookie endpoints.
6. Refresh token in the body for mobile only (D5): confirm this deviation from original #9.
7. Admin hardening: require MFA for admin in v2? Serve admin-app from a separate domain?
8. Confirm managed (username-only) users are created only by the orgs module.
9. user_providers is an existing table linked to user_identifiers with no v1 requirement. What does it hold today (social login, credentials, something else)? Default: leave it and its relation untouched and unused by v1 code. If it currently stores password credentials, move them into users.password_hash before Phase 2.
10. Is any OTP-only (LOGIN) sign-in route in use? Default: no. The LOGIN purpose is removed (§11 R2) and any such route is deleted, because v1 sign-in is identifier + password.
11. Confirm the delivered users.ts and user-identifiers.ts do not drop columns that exist today. Default: the delivered files win, and any extra existing column is kept and listed in the gap list.
12. Hardening changes that touch binding decisions and are therefore not applied. Defaults are the recommendation:
    - a. D9 timing: send after responding (waitUntil or a queue) and never return OTP_DELIVERY_FAILED from public send endpoints; otherwise latency or a 502 reveals which identifiers are unregistered. Default: yes.
    - b. Absolute session lifetime (for example 90d, via a sessions.absolute_expires_at column) on top of the sliding 30d. Default: yes, before launch.
    - c. Per-IP limit on OTP sends against email and WhatsApp pumping, counted from audit_events (the index exists). Default: yes, with a value chosen by the human.
    - d. Short reuse leeway (about 10 s) so a lost refresh response on mobile is not treated as theft. Default: no in v1; mobile signs in again on REFRESH_TOKEN_REUSED.

## 11. Reconciliation log (v1 spec vs existing schemas)

Reviewed: otps, refresh_tokens and the user relations. The existing users, user_identifiers, user_providers and organization_users definitions were not part of what was reviewed (R9, R10).

**Rule used.** Names that differ but mean the same thing follow the existing schema (least churn); a name that misleads is changed. Where the spec is stricter on security or correctness, the schema changes. Where the schema is safer or more precise, the spec changes.

- **R1. Session model: schema changed.** Spec: sessions, one row per sign-in, with the current and previous refresh hash and `sid` in the access token. Schema: refresh_tokens, one row per token chained by family_id. Decision: refresh_tokens is replaced by sessions; the old family_id is now sessions.id. Why: immediate revocation by sid (D3), per-device list and revoke (AU-7), the admin session view (AD-2) and revoke reasons all need a first-class session row; one row per device avoids a new row for every refresh of every active device; current plus previous hash covers theft in practice, because an attacker's token is still current or just rotated when first used. Trade-off: a token two or more rotations old is rejected as REFRESH_TOKEN_INVALID without a reuse alert. If you later want full chain history or a reuse grace window, add a child refresh_tokens table keyed by session id. Kept from the old table: inet IP, user_agent, hash-only storage, unique hash index, expires_at index, cascade on user delete, timestamps().
- **R2. OTP purposes: schema changed.** Spec: SIGN_UP, ADD_IDENTIFIER, UPDATE_IDENTIFIER, FORGET_PASSWORD. Schema: SIGN_UP, LOGIN, FORGET_PASSWORD. Decision: add the two identifier purposes, drop LOGIN. Why: v1 sign-in is identifier + password (AU-2). A code-only sign-in over WhatsApp or email is a weaker credential (SIM swap, recycled numbers) and has no throttle design (D10 covers password sign-in). If wanted later, reintroduce it deliberately with its own limits (§10 Q10).
- **R3. Naming: mixed.** `type` becomes `purpose` (schema renamed: `type` collides with the identifier type used throughout the API). `identifier` is kept (spec's `target` dropped: the column holds the identifier as submitted, see D7). `otp_hash` is kept (spec's `code_hash` dropped). `ip` becomes `ip_address` in the spec, matching the existing column. New session columns keep the spec's names (`refresh_token_hash`, `previous_refresh_token_hash`).
- **R4. OTP binding and state: schema changed.** Added `user_id` (nullable FK, required exactly for ADD_IDENTIFIER and UPDATE_IDENTIFIER, so a proof cannot be handed to another user) and `verified_at` (D8 has two steps: verify, then consume). `consumed_at` now means "closed": spent, superseded or killed.
- **R5. One live code: schema changed, spec refined.** The spec required one live code per target and purpose but nothing enforced it. Schema gains a partial unique index on pending rows; D7 gains the close-pending-first step. Pending-only on purpose: a new send never invalidates a code that was already verified, so someone spamming a victim's address cannot kill an in-flight sign-up or reset.
- **R6. OTP `channel`: spec changed.** The spec stored it; the schema has no such column. Dropped: it follows from the identifier type, and for suppressed FORGET_PASSWORD rows (D9) it has no truthful value. The otp.sent audit metadata records the channel.
- **R7. OTP indexes and timestamps: spec changed.** The spec had (target, purpose, created_at desc); the schema has an ascending composite plus an expires_at index. Kept: Postgres scans btrees backwards, and expires_at serves cleanup. The timestamps() convention is kept, so otps has updated_at too.
- **R8. Relations: schema changed.** usersRelations.refreshTokens becomes sessions; added otps → user and audit_events → actor and subject. The orgs `memberships` and the identifier → providers relations are untouched.
- **R9. user_providers: left alone.** It exists in the schema (identifier → providers) and is absent from the spec; social login is out of v1. Not dropped, not used by v1 code; its role is §10 Q9.
- **R10. users and user_identifiers: spec wins by default.** Their current definitions were not available, so users.ts and user-identifiers.ts are written from §5 and must be diffed against the existing files. password_hash is NOT NULL because every v1 user has a password; enum casing follows §5.
- **R11. audit_events: new table.** No foreign keys, so rows outlive users and sessions and an erasure never rewrites history. event_type is text with a format check rather than a pg enum, because the list grows. Added identifier_hmac (D10) and indexes for the IP filter (AD-4) and the throttle counts.
- **R12. Database invariants added so the rules do not rest on application code alone.** D1 disjointness (user_identifiers_type_value_chk), verified_at required for email and phone, deliverable identifiers for OTPs, OTP user binding, the revoked_at/revoked_reason pair, suspension consistency, name length, and lengths on identifier values. All are looser than the application validators, so they never reject a value the application accepts.

**Migration notes**

1. otps: codes live 10 minutes, so nothing of value is lost. In the migration drop table otps and type otp_type, then create the new ones. If drizzle-kit asks, answer "create", not "rename".
2. refresh_tokens to sessions: simplest is to drop refresh_tokens and let everyone sign in again. To keep live sign-ins, run this after creating sessions and before dropping refresh_tokens; it is valid only if the stored hashes are lowercase-hex SHA-256 (D4). The platform of old rows is unknown; 'web' is a placeholder, because the delivery mode is decided per request by x-client-platform.

   ```sql
   INSERT INTO sessions (id, user_id, refresh_token_hash, platform, ip_address, user_agent,
                         expires_at, last_used_at, created_at, updated_at)
   SELECT DISTINCT ON (family_id)
          family_id, user_id, token_hash, 'web'::session_platform, ip_address, user_agent,
          expires_at, created_at, created_at, now()
   FROM refresh_tokens
   WHERE revoked_at IS NULL AND expires_at > now()
   ORDER BY family_id, created_at DESC;
   ```

3. users and user_identifiers: diff against the existing definitions and keep any extra columns. password_hash NOT NULL needs every existing user to have a hash. Existing user_identifiers rows must satisfy the new checks: look for unverified emails or phones and for usernames that look like an email or phone before applying.
4. Do not drop user_providers or organization_users.

**Code impact (start of the gap list)**

- otp repository and services: rename type to purpose; remove LOGIN branches; set verified_at on verify and require it on consume; set user_id for ADD_IDENTIFIER and UPDATE_IDENTIFIER; close the pending code before inserting; hash id + code.
- Refresh, sign-in, sign-up and sign-out code written against refresh_tokens: move to sessions; the middleware loads session and user by sid.
- packages/contracts: OtpType becomes OtpPurpose with the new values; session and audit schemas follow §5.
- relations.ts and the schema barrel: export the new tables and enums, remove refresh-tokens, apply relations.user-module.ts.
- Tests and fixtures that insert otps or refresh_tokens rows.
