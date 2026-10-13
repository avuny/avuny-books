# User Module — Agent-Ready Spec

Draft v3 · October 12, 2026 · users, auth, OTP, sessions, avatar and platform-admin user management · reconciled with the existing Drizzle schemas (§11 lists every change and why) · delivered as end-to-end slices (§8)

**Changes in v3** (since v2)

- §8 is now end-to-end slices. Each slice delivers backend, web and mobile together (admin-app for slice 6). Phase 0 (foundations) and Phase 7 (hardening) stay horizontal. The old Phase 6 (clients) is gone; client work moved into the slices.
- §8.1 is new: client rules shared by web, mobile and admin-app. Every slice also lists screens, flows and error behavior per client.
- Decided by the human: web app and API are same-site (Q5); mobile gets the refresh token in the body (Q6); background OTP sending (Q12a), an absolute session lifetime (Q12b) and a per-IP OTP send limit (Q12c) are in; no reuse leeway in v1 (Q12d). See D4, D5, D9, D10.
- §7: values that may change are env keys (new: `SESSION_ABSOLUTE_TTL`, the sign-in throttle limits, the per-IP OTP limit, `BACKGROUND_RUNNER`). Values the clients also validate are shared constants in packages/contracts, not env.
- Added for the human to confirm: the absolute lifetime needs no new column (derived from sessions.created\_at, D4); `POST /auth/refresh` from web always requires `x-requested-with` (D5); new open questions Q13–Q16 (§10).

## 1. How agents use this document

- Read §1–§7 before planning, and §8.1 before any client work. §3 Decisions are binding. Items in §10 Open questions go to the human; never guess them. The same goes for any user-facing behavior this document does not describe: ask.
- Some otp, users and auth code may already exist. Inventory it, write a gap list against this spec, then extend. Do not duplicate or rewrite working code. §11 records the conflicts between this spec and the existing schemas that are already decided, and which existing code they touch; start the gap list from it.
- The Drizzle schema files in packages/db are the source of truth for column, index and constraint names. §5 summarizes them. If code and §5 disagree, fix the code and report it.
- Follow root AGENTS.md and the §2 conventions. On any conflict, AGENTS.md wins and you report it.
- Work one slice at a time (§8). A slice is done only when backend, web and mobile all work. After any API change run openapi:generate, then api:generate, from the repo root.
- On clients, copy the closest existing screen and use the app's existing design system instead of inventing new patterns.
- Tags: (orig #n) = original requirement number; Added = new; Refined = original made stricter or more precise; Reconciled = changed to resolve a conflict with the existing schemas (§11); Decided = settled by the human after v2.
- Tests are requirements: never delete or weaken one to get green; add a regression test for every real bug you fix.

## 2. Scope and architecture

**Goal.** One identity system for web, mobile and the admin app: sign up and sign in with email, phone or username; manage identifiers, password, profile and avatar; keep sessions across devices; let platform admins list, support and monitor users. Users are platform-level, not tenant-scoped.

**Out of scope (v1).** MFA, social login, passkeys, passwordless (OTP-only) sign-in, self-service account deletion or export, admin impersonation, image resizing, org membership, and org/plan/billing panels in admin. Managed users from the PRD (username + password, created by an org) will come from the orgs module; the data model only has to allow a user whose sole identifier is a username.

**Deployment (Decided, Q5).** The web app and the API share a main domain (same-site), for example `app.<domain>` and `api.<domain>`. They may be different origins; if so, CORS with credentials applies (`CORS_ORIGINS` allowlist, never a wildcard).

**Where code goes (existing conventions)**

- packages/db: Drizzle schema and migrations. Cross-module table relations live in the shared relations file, which may import any table (module code still talks only through index.ts).
- packages/contracts: Zod schemas, types and shared constants (errors via createDomainErrorResponseSchema, shared ones via globalErrorResponses). Import Zod from @avuny/zod.
- `packages/api/src/modules/<name>/`: index.ts (public API only), core/ (pure: error codes as as const, error maps satisfies Record\<Code, ErrorMeta>, \*.rules.ts), shell/ (all I/O: repositories, services, crypto, adapters), hono-routes/ (one file per route), **tests**/.
- Services return the ok/fail result from @avuny/utils; routes use handleResult from @avuny/hono with the module error map, errorTrans and moduleName. Messages live in src/intl (en, ar; codes under errors). Env is read only in src/config.ts.
- Clients use the Orval output: web-features (web screens), admin-app (admin screens; shared admin components wait on the pending admin-web-features decision, Q15), mobile-app (React Native).

**Modules** (talk only through each other's index.ts; no cycles)

- otp: issue and verify codes, verification tokens; uses messaging.
- messaging: MessageSender port with email and WhatsApp adapters (reuse existing sending code). The BackgroundRunner port (D9) sits next to it.
- users: user, identifiers (aggregated under the user repository), profile, avatar, status; owns password\_hash (verifyPassword, setPassword); uses otp, storage, audit, messaging.
- auth: sign-up/in, tokens, sessions, forgot-password; uses users, otp, messaging, audit.
- audit: write and read audit events. storage: FileStorage port with adapters.
- admin: platform-admin routes; uses users, auth, audit.

Tables owned elsewhere: organization\_users (orgs module; relation memberships) is never imported by this module. user\_providers exists but is not used by v1 code (§10 Q9).

## 3. Decisions (binding defaults)

**D1 Identifiers.** classify(input): valid E.164 phone (e.g. libphonenumber-js; clients send international format) → phone; else valid email with a dotted domain → email; else username. Normalize: email trim + lowercase, phone E.164, username trim + lowercase. Self-chosen usernames: 3–32 chars of `[a-z0-9._-]`, no @ (name@orgslug is reserved for managed users; org slugs must not contain dots, so it never classifies as email). No input may classify as two types. The database mirrors this with CHECK constraints (user\_identifiers\_type\_value\_chk, otps\_identifier\_deliverable\_chk), so a bug in classify() cannot store a value under the wrong type. (Reconciled)

**D2 Uniqueness.** UNIQUE(type, value) platform-wide. One primary per user (partial unique index). Max 4 identifiers per user, any mix, same-type duplicates allowed; enforced in a transaction that locks the user row. The limit is the shared constant `MAX_IDENTIFIERS_PER_USER` in packages/contracts.

**D3 Access token.** JWT via jose (HS256) with sub, sid (= sessions.id), iat, exp. Middleware verifies it, then loads session and user in one query and rejects revoked or expired sessions and non-active users, so sign-out and suspension take effect immediately. Role always comes from the DB.

**D4 Refresh token.** Opaque 32-byte random value (base64url), stored only as a lowercase-hex SHA-256 hash in sessions.refresh\_token\_hash, not bcrypt: it is high-entropy, needs an indexed lookup, and bcrypt truncates at 72 bytes. Rotated on every refresh as one atomic `UPDATE sessions … WHERE refresh_token_hash = $presented AND revoked_at IS NULL AND expires_at > now() RETURNING`, which moves the old hash into previous\_refresh\_token\_hash, so two concurrent refreshes cannot both win. A token that matches no current hash is looked up in previous\_refresh\_token\_hash: a match is reuse, so revoke the session (reason reuse\_detected) and audit it; anything else is REFRESH\_TOKEN\_INVALID. Clients must serialize refresh calls. One row per sign-in: sessions replaces the old refresh\_tokens table (its family\_id is now sessions.id). (orig #11, Refined, Reconciled)

Absolute lifetime (Decided, Q12b). A session never outlives sessions.created\_at + `SESSION_ABSOLUTE_TTL` (90d by default), on top of the sliding `REFRESH_TOKEN_TTL`. There is no extra column: created\_at is the sign-in time and never changes. Sign-in and every rotation set expires\_at = LEAST(now() + REFRESH\_TOKEN\_TTL, created\_at + SESSION\_ABSOLUTE\_TTL), and the rotation UPDATE also requires created\_at + SESSION\_ABSOLUTE\_TTL > now(). A changed env value therefore applies to existing sessions at their next refresh. At the cap the refresh fails as REFRESH\_TOKEN\_INVALID and the user signs in again.

No reuse leeway (Decided, Q12d). A refresh token that was already rotated is always treated as reuse. A mobile client that loses a refresh response and then gets REFRESH\_TOKEN\_REUSED signs in again.

**D5 Token delivery.** Access token always in the body. Web: refresh token only in cookie `refresh_token` (HttpOnly; Secure; SameSite=Lax; Path=/api/auth, attributes from config). Mobile (header `x-client-platform: mobile`): refresh token in the body, no cookie. (orig #9, Refined: keeps the long-lived token out of web JavaScript)

Decided. Q5: the web app and the API are same-site, so `COOKIE_SAMESITE` stays `lax`. Q6: mobile gets the refresh token in the body because mobile has no cookies; web never gets it in the body. When `POST /auth/refresh` reads the refresh token from the cookie, it also requires the header `x-requested-with: XMLHttpRequest`, whatever SameSite is set to (Added, defence in depth; the web client sends it on every request); without it the request is rejected with the shared 403. CORS allows credentials only for origins in `CORS_ORIGINS`, never a wildcard. The choice between cookie and body lives in one function in hono-routes, so it is cheap to change.

**D6 Passwords.** bcryptjs async, cost from config (12; 4 in tests; tune so sign-in p95 stays under \~500 ms). Min 8 characters, max 72 UTF-8 bytes (reject, never truncate); no composition rules; both limits are shared constants in packages/contracts. Run a dummy compare for unknown identifiers so timing does not reveal existence. Compare secrets and hashes with timingSafeEqual.

**D7 OTP.** 6 digits via crypto.randomInt, stored as hex HMAC-SHA256 of otps.id + code with OTP\_SECRET (otps.otp\_hash). TTL 10 min; 5 wrong attempts kill the code (increment attempts atomically, then compare); 60 s resend cooldown; max 5 sends per hour per identifier and purpose (suppressed sends count, see D9; the per-IP limit is in D10). One pending code per identifier and purpose: issuing a code first closes any pending one (sets consumed\_at) in the same transaction, and a partial unique index makes a race fail instead of creating two (map that failure to OTP\_RESEND\_TOO\_SOON). Purposes: SIGN\_UP, ADD\_IDENTIFIER, UPDATE\_IDENTIFIER, FORGET\_PASSWORD (the old LOGIN purpose is dropped, §11 R2). otps.identifier is the normalized identifier the requester submitted: for SIGN\_UP, ADD\_IDENTIFIER and UPDATE\_IDENTIFIER it is always the email or phone the code goes to; for FORGET\_PASSWORD it may be a username, and delivery goes to that user's primary verified email or phone. Email codes go by email, phone codes by WhatsApp message. Messages are localized (en, ar; RTL-safe). (Reconciled)

**D8 Verification proof.** Send endpoints return 202 `{ challengeId, expiresAt, resendAvailableAt }` (challengeId = otps.id). `POST /otp/verify { challengeId, code }` sets verified\_at and returns a verificationToken (signed JWT, 15 min, own secret) with claims jti (= otps.id), purpose, identifier, and sub (the user id) for authenticated purposes only. The action endpoint checks that purpose and identifier match the request, then consumes the proof exactly once (`UPDATE otps SET consumed_at = now() WHERE id = $jti AND verified_at IS NOT NULL AND consumed_at IS NULL RETURNING`) in the same transaction as the action. otps.expires\_at limits code entry only; after verification the token's own expiry governs. ADD\_IDENTIFIER and UPDATE\_IDENTIFIER rows carry the caller's user\_id (the database requires it), and the action rejects a token whose sub is not the caller. (Reconciled)

**D9 No enumeration on public endpoints.** sign-up/send-otp and forgot-password/send-otp answer identically for any input: always create the OTP row and apply the same limits, skipping only the provider call when the identifier is already registered (sign-up) or unknown (forgot-password). Because otps.identifier holds the submitted identifier, these suppressed rows are ordinary rows with the same cooldown and hourly limits. Sign-in returns INVALID\_CREDENTIALS for an unknown identifier or wrong password, and ACCOUNT\_SUSPENDED only after a correct password.

Decided (Q12a). On the public send endpoints the provider call runs after the response is sent, through a BackgroundRunner port (adapters: `waituntil` for serverless, `node` for fire-and-forget, `inline` for tests only; chosen by `BACKGROUND_RUNNER`). Those endpoints never return OTP\_DELIVERY\_FAILED: a failed delivery is logged and audited, nothing more. Authenticated send endpoints (identifiers/send-otp) are unchanged: the provider call stays inline and may return OTP\_DELIVERY\_FAILED. Suppressed sends count toward every limit exactly like real ones (D7, D10).

**D10 Throttling.** (Added) Postgres-backed; no in-memory counters (serverless-safe) and no Redis assumed. Sign-in: `SIGNIN_MAX_FAILURES_PER_IDENTIFIER` (5) failures per identifier and `SIGNIN_MAX_FAILURES_PER_IP` (20) per IP within `SIGNIN_THROTTLE_WINDOW` (15 min) → TOO\_MANY\_ATTEMPTS with retryAfter. Count from audit\_events (failures keyed by identifier\_hmac and ip\_address) and otps. identifier\_hmac = hex HMAC-SHA256(AUDIT\_HMAC\_SECRET, normalized submitted identifier), written on every auth event including those for unknown identifiers, so the limit applies identically to known and unknown accounts; otherwise TOO\_MANY\_ATTEMPTS would reveal which accounts exist. Client IP comes from a configured trusted-proxy header. (Reconciled)

OTP sends per IP (Decided, Q12c). At most `OTP_MAX_SENDS_PER_IP_PER_HOUR` (20, a starting value to tune) accepted send requests per IP per hour across all purposes, in addition to the per-identifier limits in D7. Every accepted send request, real or suppressed, writes one otp.sent audit event with ip\_address in the same transaction; the count reads those events, so suppressed sends count exactly like real ones. Beyond the limit: OTP\_RATE\_LIMITED. A failed background delivery writes a separate otp.sent event with outcome failure, which the count ignores.

**D11 Avatar.** `PUT /users/me/avatar` multipart (file), max 2 MB, jpeg/png/webp verified by magic bytes, stored through FileStorage at `avatars/{userId}/{uuid}.{ext}` (new key per upload). Update avatar\_key, then best-effort delete the old object. Multipart through the API keeps v1 simple and fits serverless body limits.

**D12 Roles.** users.platform\_role: user | support | admin; support is read-only. Only a seed script grants roles. Admin routes live under `/api/admin/*`.

**D13 Audit and logging.** Every state change and auth outcome writes an audit\_events row in the same transaction as the change (failures standalone); multi-table writes such as sign-up and reset are single transactions. Never log or store passwords, codes or tokens, or the raw identifier of an unknown user; mask identifiers (`a***@mail.com`, `+20******12`) in metadata for display and use identifier\_hmac for throttling and correlation. audit\_events has no foreign keys on purpose: its rows must outlive users and sessions. (Refined)

**D14 Module communication.** Synchronous public-API calls when the caller needs the result (verify → create user; suspend → revoke sessions). In-process events only for fire-and-forget side effects (security notices). If existing code has otp notifying users/auth by events, replace that with D8 unless the human decides otherwise (§10, Q4).

## 4. Requirements

**Identifiers**

- ID-1 Identifier types are email, phone, username (D1). (orig #1)
- ID-2 Public sign-up accepts only an email or phone as the first identifier; it is stored verified and primary. (orig #2, #7)
- ID-3 A signed-in user can add identifiers up to 4 in total. Email/phone need an ADD\_IDENTIFIER OTP sent to the new value; a username needs none. Requires currentPassword. (orig #3; password step-up Added)
- ID-4 Exactly one identifier is primary, and the user can change which. (orig #3)
- ID-5 A user can delete an identifier except the primary one (change primary first) and the last remaining email/phone (recovery needs one). (orig #4, Refined)
- ID-6 A user can replace an identifier's value, same type only. Email/phone: UPDATE\_IDENTIFIER OTP sent to the new value. Keeps id and primary flag; requires currentPassword; best-effort notice to the old value. (orig #5, Refined)

**Sign-up, sign-in, sessions**

- AU-1 Sign-up requires identifier, name, password and a valid SIGN\_UP verificationToken for that identifier. Guests verify first: email by email, phone by WhatsApp message. (orig #7, #12)
- AU-2 Sign-in accepts any identifier type plus password. (orig #6)
- AU-3 Sign-up and sign-in return AuthResponse (§6) and deliver the refresh token per D5. (orig #9)
- AU-4 Passwords use bcryptjs (D6); token TTLs come from env through config.ts; refresh tokens are stored hashed (D4). (orig #8, #10, #11)
- AU-5 POST /auth/refresh rotates the refresh token and slides the session expiry, capped by the absolute lifetime (D4). (Added; needed for orig #19)
- AU-6 Sign-out revokes the current session on the server and clears the cookie (same attributes, Max-Age=0); clients also purge tokens, cached queries and local state. Sign-out-all revokes every session. (orig #16; sign-out-all Added)
- AU-7 Sessions persist per device on web and mobile; users can list and revoke their own. (orig #19; list/revoke Added)

**Account**

- AC-1 Users can edit their name (1–100 chars, trimmed). (orig #13)
- AC-2 Users can change their password with currentPassword; all other sessions are then revoked. (orig #14; revocation Added)
- AC-3 Forgot password: send a FORGET\_PASSWORD OTP to a verified email/phone (for a username, use the user's primary verified email/phone; if none, do nothing). Reset with verificationToken + new password, revoke all sessions, send a security notice. (orig #15)
- AC-4 Users can upload, replace and remove an avatar (D11). (orig #17, #18)

**Admin (platform manager)** (orig #20, expanded to SaaS-management practice)

- AD-1 Users list: server-side page-number pagination (page, pageSize ≤ 100); search q over name and identifiers; filters: status, identifier type, created range, last-active range; sort by createdAt, lastSignInAt, name.
- AD-2 User detail: profile, identifiers, active sessions (platform, device, IP, last used), recent activity.
- AD-3 admin-only actions with a required reason, all audited: suspend, reactivate, revoke all sessions. A suspended user cannot sign in or refresh and loses all sessions at once. Admins cannot suspend themselves or another admin.
- AD-4 Activity log: filter by user, event type, outcome, date range, IP; newest first; server-paginated.
- AD-5 Overview for 7/30/90 days: total, new, active (DAU/WAU/MAU) and suspended users; sign-in success vs failure; sign-ups per day.
- AD-6 Admins never see password hashes, OTP codes or tokens; opening a user's detail is audited.

**Clients (§8.1)** (Added)

- CL-1 Web and mobile implement every user-facing requirement above with the same behavior; admin screens live in admin-app.
- CL-2 Clients restore the session on start and refresh the access token with a single in-flight refresh.
- CL-3 Sign-out, a revoked session and a failed refresh purge all client state.
- CL-4 Every client string exists in en and ar, and layouts mirror in RTL.

## 5. Data model (Drizzle, packages/db)

The schema files are the source of truth (users.ts, user-identifiers.ts, sessions.ts, otps.ts, audit-events.ts, identifier-patterns.ts, relations.ts); this section summarizes them. (Reconciled)

**Conventions.** pk() uuid ids. timestamps() adds created\_at and updated\_at to every table except audit\_events, which is append-only and has occurred\_at. All instants are timestamptz; IP addresses are inet; hashes are lowercase hex. Enum values are lower\_snake except OTP purposes (UPPER\_SNAKE, as before). Normalized text columns carry the isNormalized check. Constraint suffixes: \_chk, \_idx, \_uidx. Relative imports use the .js extension.

**Enums.** user\_status (active | suspended), platform\_role (user | support | admin), identifier\_type (email | phone | username), session\_platform (web | mobile), session\_revoked\_reason (sign\_out | sign\_out\_all | password\_changed | password\_reset | admin | suspended | reuse\_detected), otp\_purpose (SIGN\_UP | ADD\_IDENTIFIER | UPDATE\_IDENTIFIER | FORGET\_PASSWORD), audit\_outcome (success | failure).

**users:** id; name (1–100 chars, no leading or trailing spaces); password\_hash (not null: every v1 user has a password); status (default active); platform\_role (default user); avatar\_key; suspended\_at and suspended\_reason (both set exactly when status is suspended, both null when active); last\_sign\_in\_at; last\_active\_at (updated on sign-in and refresh only); timestamps. Indexes: status, created\_at.

**user\_identifiers:** id; user\_id FK → users (cascade); type; value (normalized, 3–254 chars); is\_primary (default false); verified\_at (required for email and phone; null for usernames); timestamps. UNIQUE(type, value); partial UNIQUE(user\_id) WHERE is\_primary; index user\_id. user\_identifiers\_type\_value\_chk mirrors D1: an email must look like an email (one @, dotted domain), a phone must be E.164, a username must be neither; the 3–32 self-chosen username rule stays in the application because managed usernames (name@orgslug) are longer. The repository enforces max 4 and the delete rules inside a transaction that locks the user row (FOR UPDATE).

**sessions** (replaces refresh\_tokens): id (the access token's sid); user\_id FK → users (cascade); refresh\_token\_hash UNIQUE; previous\_refresh\_token\_hash (partial index where not null; never equal to the current hash); platform; ip\_address; user\_agent; device\_name (header x-device-name or parsed user agent); expires\_at (sliding and capped: LEAST(now() + REFRESH\_TOKEN\_TTL, created\_at + SESSION\_ABSOLUTE\_TTL) on sign-in and on every rotation, D4; indexed for cleanup); last\_used\_at (sign-in and refresh only); revoked\_at and revoked\_reason (both set or both null); timestamps. Index user\_id. A session is active when revoked\_at IS NULL AND expires\_at > now(). There is no absolute\_expires\_at column: the absolute lifetime is derived from created\_at (D4).

**otps:** id (= challengeId); purpose; identifier (normalized, 3–254 chars, as submitted; no FK because SIGN\_UP happens before the user exists); user\_id FK → users, nullable (cascade; set exactly for ADD\_IDENTIFIER and UPDATE\_IDENTIFIER); otp\_hash; attempts (≥ 0); expires\_at; verified\_at; consumed\_at; timestamps. States: pending (verified\_at and consumed\_at null) → verified (verified\_at set, proof issued) → closed (consumed\_at set: spent by its action, superseded by a newer code, or killed by too many attempts). Indexes: (identifier, purpose, created\_at) for cooldown and hourly counts; partial UNIQUE (identifier, purpose) WHERE verified\_at IS NULL AND consumed\_at IS NULL (one pending code); partial (user\_id) WHERE user\_id IS NOT NULL; (expires\_at) for cleanup. otps\_identifier\_deliverable\_chk: unless the purpose is FORGET\_PASSWORD, identifier is an email or an E.164 phone.

**audit\_events:** id; occurred\_at; event\_type (text, `<area>.<action>`, format-checked; the closed list lives in packages/contracts); outcome; actor\_user\_id, subject\_user\_id, session\_id (plain uuids, no FKs); identifier\_hmac (D10); ip\_address; user\_agent; request\_id; metadata jsonb (default {}). Indexes (ascending; Postgres scans them backwards for newest-first): (subject\_user\_id, occurred\_at), (event\_type, occurred\_at), (occurred\_at), partial (ip\_address, occurred\_at), partial (identifier\_hmac, occurred\_at).

**Relations (relations.ts):** users → identifiers, sessions, memberships (orgs); user\_identifiers → user, providers; user\_providers → identifier; sessions → user; otps → user; audit\_events → actor, subject.

**Event types** (`<area>.<action>`): auth (sign\_up, sign\_in, sign\_out, refresh\_reuse\_detected, password\_changed, password\_reset\_requested, password\_reset\_completed), session (revoked), user (name\_changed, avatar\_changed, avatar\_removed), identifier (added, updated, removed, primary\_changed), otp (sent, verify\_failed), admin (user\_viewed, user\_suspended, user\_reactivated, sessions\_revoked). The otp.sent metadata records the delivery channel (email or whatsapp). Every accepted send request writes one otp.sent event (D10); a failed background delivery writes one with outcome failure.

## 6. API contracts (prefix /api)

Access levels: public, user (Bearer access token), support (read-only admin), admin. Requests and responses are Zod schemas in @avuny/contracts; 401, 403, validation and 500 come from globalErrorResponses.

```
AuthResponse = {
  user: { id, name, identifier, identifierType, avatarUrl: string | null, platformRole },
  tokens: { accessToken, accessTokenExpiresAt, refreshToken? } // refreshToken: mobile only
}
```

identifier and identifierType are the user's primary identifier.

**Headers** (Added). All clients: `Authorization: Bearer <accessToken>` on authenticated calls, and `Accept-Language` (en or ar, Q13). Mobile: `x-client-platform: mobile` and `x-device-name` on every request. Web: `x-requested-with: XMLHttpRequest` on every request (required by `POST /auth/refresh`, D5), with credentials included.

**Flows.** Sign-up: sign-up/send-otp → otp/verify → sign-up. Add identifier: identifiers/send-otp → otp/verify → POST identifiers. Update: identifiers/{id}/send-otp → otp/verify → PUT identifiers/{id}. Forgot password: forgot-password/send-otp → otp/verify → forgot-password/reset. Resend = call the same send endpoint again (cooldown applies).

**otp**

- `POST /otp/verify`: public (user if the challenge has a user) · {challengeId, code} → {verificationToken, expiresAt}

**auth**

- `POST /auth/sign-up/send-otp`: public · {identifier} (email/phone only) → 202
- `POST /auth/sign-up`: public · {identifier, name, password, verificationToken} → 201 AuthResponse
- `POST /auth/sign-in`: public · {identifier, password} → AuthResponse
- `POST /auth/refresh`: cookie (web) or {refreshToken} (mobile) → {tokens}; web also gets a fresh cookie
- `POST /auth/sign-out`, `POST /auth/sign-out-all`: user → 204
- `GET /auth/sessions`: user → \[{id, platform, deviceName, ip, createdAt, lastUsedAt, current}\]
- `DELETE /auth/sessions/{id}`: user → 204
- `PATCH /auth/password`: user · {currentPassword, newPassword} → 204
- `POST /auth/forgot-password/send-otp`: public · {identifier} → 202
- `POST /auth/forgot-password/reset`: public · {identifier, verificationToken, newPassword} → 204

**users** (all require user)

- `GET /users/me` → profile, identifiers, avatarUrl; `PATCH /users/me` {name} → profile
- `PUT /users/me/avatar`: multipart file → {avatarUrl}; `DELETE /users/me/avatar` → 204
- `POST /users/me/identifiers/send-otp`: {type, identifier} (email/phone) → 202
- `POST /users/me/identifiers`: {type, identifier, currentPassword, verificationToken?} (token required for email/phone) → 201
- `POST /users/me/identifiers/{id}/send-otp`: {identifier} → 202
- `PUT /users/me/identifiers/{id}`: {identifier, currentPassword, verificationToken?} → 200
- `PUT /users/me/primary-identifier`: {identifierId} → 200
- `DELETE /users/me/identifiers/{id}` → 204

**admin**

- `GET /admin/users` (support, AD-1 query) · `GET /admin/users/{id}` (support)
- `POST /admin/users/{id}/suspend` (admin, {reason}) · `POST /admin/users/{id}/reactivate` (admin) · `POST /admin/users/{id}/revoke-sessions` (admin)
- `GET /admin/activity` (support, AD-4 query) · `GET /admin/metrics/overview?range=7d|30d|90d` (support)

**Error codes** (CODE status; each needs en and ar text in src/intl)

- otp: OTP\_INVALID 400, OTP\_EXPIRED 400, OTP\_ATTEMPTS\_EXCEEDED 429, OTP\_RESEND\_TOO\_SOON 429, OTP\_RATE\_LIMITED 429, OTP\_DELIVERY\_FAILED 502, VERIFICATION\_TOKEN\_INVALID 400
- auth: INVALID\_CREDENTIALS 401, ACCOUNT\_SUSPENDED 403, TOO\_MANY\_ATTEMPTS 429, REFRESH\_TOKEN\_INVALID 401, REFRESH\_TOKEN\_REUSED 401, SESSION\_NOT\_FOUND 404, WEAK\_PASSWORD 422, INVALID\_CURRENT\_PASSWORD 403, INVALID\_IDENTIFIER\_TYPE 422
- users: IDENTIFIER\_ALREADY\_EXISTS 409, IDENTIFIER\_LIMIT\_REACHED 409, IDENTIFIER\_NOT\_FOUND 404, IDENTIFIER\_TYPE\_MISMATCH 422, CANNOT\_DELETE\_PRIMARY\_IDENTIFIER 409, CANNOT\_DELETE\_LAST\_RECOVERY\_IDENTIFIER 409, AVATAR\_TOO\_LARGE 413, AVATAR\_INVALID\_TYPE 415
- admin: CANNOT\_SUSPEND\_SELF 409, CANNOT\_SUSPEND\_ADMIN 409, USER\_ALREADY\_SUSPENDED 409, USER\_NOT\_SUSPENDED 409

## 7. Config (src/config.ts, Zod-validated, fail fast)

Durations are strings (`15m`, `30d`) parsed to seconds. Values that may change are env keys, read only in src/config.ts and applied on the next start or deploy. Values the clients also validate are not env, because only the API can read env: they are constants in packages/contracts (`PASSWORD_MIN_LENGTH` 8, `PASSWORD_MAX_BYTES` 72, `MAX_IDENTIFIERS_PER_USER` 4, name length 1–100, the username rules).

- Tokens and sessions: `ACCESS_TOKEN_SECRET`, `ACCESS_TOKEN_TTL`=15m, `REFRESH_TOKEN_TTL`=30d, `SESSION_ABSOLUTE_TTL`=90d (Added, Decided Q12b), `VERIFICATION_TOKEN_SECRET`, `VERIFICATION_TOKEN_TTL`=15m
- Passwords and OTP: `BCRYPT_ROUNDS`=12, `OTP_SECRET`, `OTP_TTL`=10m, `OTP_MAX_ATTEMPTS`=5, `OTP_RESEND_COOLDOWN`=60s, `OTP_MAX_SENDS_PER_HOUR`=5, `OTP_MAX_SENDS_PER_IP_PER_HOUR`=20 (Added, Decided Q12c; a starting value to tune)
- Sign-in throttling (Added): `SIGNIN_MAX_FAILURES_PER_IDENTIFIER`=5, `SIGNIN_MAX_FAILURES_PER_IP`=20, `SIGNIN_THROTTLE_WINDOW`=15m
- Web: `COOKIE_SAMESITE`=lax, `COOKIE_DOMAIN` (optional), `CORS_ORIGINS` (allowlist), `TRUSTED_PROXY_IP_HEADER`
- Background work (Added, Decided Q12a): `BACKGROUND_RUNNER`=waituntil | node | inline
- Avatar and storage: `AVATAR_MAX_BYTES`=2097152, `STORAGE_*` (endpoint, bucket, credentials, public base URL)
- Delivery and audit: `EMAIL_*`, `WHATSAPP_*`, `AUDIT_RETENTION_DAYS`=365, `AUDIT_HMAC_SECRET` (Added, D10)

Fail-fast rules (Added): `SESSION_ABSOLUTE_TTL` must be at least `REFRESH_TOKEN_TTL`; `BACKGROUND_RUNNER=inline` and the console message adapters are refused when NODE\_ENV is production (inline brings back the D9 timing leak, console adapters print codes); `COOKIE_SAMESITE=none` requires an explicit `CORS_ORIGINS` list.

## 8. Implementation: end-to-end slices

Phase 0 and Phase 7 are horizontal. Everything between them is a slice: one user-visible capability, delivered end to end on every client it touches.

**How a slice runs**

1. Contracts first: Zod schemas, error codes with their en and ar text, shared constants in packages/contracts.
2. Backend with its tests, audit events, throttling and no-enumeration behavior for every endpoint in the slice.
3. openapi:generate, then api:generate, from the repo root.
4. Web and mobile (admin-app in slice 6), which can run in parallel once the contract is merged. Follow §8.1 and the slice's client sections.
5. Run the slice's manual checks on a real browser and on a device or simulator, and report what was checked.

**A slice is done only when** typecheck, lint, tests, openapi:generate and api:generate pass; every new error code has en and ar text, and so does every new client string; every new state change writes an audit event; web and mobile both complete the slice's flows; and the slice's manual checks pass. Invisible work (throttling, no-enumeration, audit rows, translations) is part of the slice and is never deferred.

Both clients ship in the same slice. Only the human can allow mobile to trail by one slice, and never in slice 1. Anything a slice needs that this document does not say goes to §10, not into a guess.

### 8.1 Client rules (web-features, mobile-app, admin-app)

**API access**

- CR1 All API calls go through the Orval-generated client. No hand-written fetch to API routes.
- CR2 One HTTP layer per app (shared between apps where the repo allows) that: sends `Authorization: Bearer <accessToken>`; sends `Accept-Language` with the current UI language (en or ar); on web sends `x-requested-with: XMLHttpRequest` and includes credentials; on mobile sends `x-client-platform: mobile` and `x-device-name` (device model). It never logs tokens, passwords or codes.

**Tokens and session**

- CR3 The access token lives in memory only (never localStorage, AsyncStorage or a URL). Web: the refresh token exists only in the HttpOnly cookie. Mobile: the refresh token is kept in secure storage (iOS Keychain, Android Keystore, through the library the repo already uses) and sent in the body of `POST /auth/refresh`.
- CR4 App start restores the session before any guarded screen shows: web calls `POST /auth/refresh` (cookie); mobile calls it with the stored refresh token. Show a loading screen meanwhile. REFRESH\_TOKEN\_INVALID or REFRESH\_TOKEN\_REUSED → purge and go to sign-in. A network error → a retry screen; keep the stored token.
- CR5 Refresh is single-flight: at most one refresh in flight, and every other request waits for it. Refresh when the access token is within about 60 seconds of accessTokenExpiresAt, or after a 401, then retry the failed request once. If the retry still returns 401, the session was revoked: purge and go to sign-in. Mobile also checks expiry when the app returns to the foreground.
- CR6 Purge means: clear the access token, the refresh token (secure storage on mobile), the query cache and all in-memory and persisted user state, cancel in-flight requests, then go to sign-in. Purge on sign-out (even when the API call fails), sign-out-all, password reset, a revoked session, REFRESH\_TOKEN\_INVALID and REFRESH\_TOKEN\_REUSED. A 5xx or a network error never purges.
- CR7 Route guard: signed-out users reach only the public screens (sign-up, sign-in, forgot password); signed-in users who open them are sent to the home screen (Q14).

**Errors and wording**

- CR8 Behavior is keyed by error code. Text comes from the server's translated message (Q13); validation errors show inline under their field. By code:
  - OTP\_INVALID: inline error on the code field, keep the screen, clear the input.
  - OTP\_EXPIRED, OTP\_ATTEMPTS\_EXCEEDED: the code is dead; show the message, disable Verify, offer a new code.
  - OTP\_RESEND\_TOO\_SOON: keep the resend countdown running (from resendAvailableAt).
  - OTP\_RATE\_LIMITED: show the message; no automatic retry.
  - TOO\_MANY\_ATTEMPTS: disable submit and show a countdown from retryAfter.
  - INVALID\_CREDENTIALS: one generic message under the form; never say which field is wrong.
  - ACCOUNT\_SUSPENDED: show the message; no retry.
  - VERIFICATION\_TOKEN\_INVALID: go back to the first step of the flow to get a new code.
  - WEAK\_PASSWORD: inline under the new password field. INVALID\_CURRENT\_PASSWORD: inline under the current password field.
  - OTP\_DELIVERY\_FAILED (authenticated send endpoints only): say the code could not be sent, keep the form, allow retry.
  - 5xx or network error: a generic retry message; never purge.
- CR9 Neutral wording on public screens (D9). After any 202 from a public send endpoint show the same message for every input, for example: If this can be used, a code is on its way. Never write a message that says a code was sent to the entered identifier, and never reveal whether an identifier or username exists (sign-up, forgot password, sign-in).
- CR10 Submit buttons show a loading state and are disabled while the request runs (no double submit; codes are single-use and sends are rate-limited).
- CR11 Code field: numeric, 6 digits, accepts paste, autofill hints (web autocomplete one-time-code; iOS textContentType oneTimeCode), digits stay left-to-right in RTL. The resend button stays disabled until resendAvailableAt and shows the seconds left.
- CR12 Client-side checks use the shared constants from packages/contracts (password length and the 72-byte limit, name length, username rules, MAX\_IDENTIFIERS\_PER\_USER); the server stays authoritative. Phones are entered in international format (country picker or leading +). Use the autocomplete values username, current-password and new-password on web and the matching hints on mobile.
- CR13 i18n and RTL: every client string exists in en and ar, layouts mirror in RTL, and each new screen is checked in Arabic.
- CR14 Reuse: copy the closest existing screen; use each app's design system, form library, navigation and test tools. Do not add a library without asking (Q16).

### Phase 0 — Reconcile and foundations (horizontal)

Inventory the existing otp, users and auth code and record the gap list, starting from §11 (including the code-impact list). Inventory each client app too (web-features, mobile-app, admin-app): screens, navigation, design system, form library, secure-storage library, test tools and the home route; record it with the gap list. Check Q9–Q11 against the real code and record what you find in §10. Then add the config keys (§7), apply the §5 schema (the §11 migration notes say how), and add the contract skeletons and shared constants, the error-code and error-map files, API i18n scaffolding, the audit write API and the BackgroundRunner port.

**Done when:** migrations apply to an empty DB and to a copy of the current dev DB; typecheck, lint and tests pass; openapi:generate and api:generate run and the generated client compiles in all three apps.

### Slice 1 — Walking skeleton: sign-up, sign-in, session, sign-out

**Goal.** A new user signs up with an email or phone (OTP), signs in, stays signed in across reloads and restarts, sees their name and primary identifier, and signs out, on web and mobile. This slice proves the whole token path (D3–D5) and the OTP path (D7–D9), so do not thin it out.

**Backend**

- identifier.rules.ts (classify, normalize, validate). otp and messaging modules: issue with close-pending-first, verify, proof, consume; console adapters for dev only. The BackgroundRunner on the public send endpoints (D9).
- User and identifier repositories: create a user with its first identifier in one transaction, uniqueness, one primary. (The add, delete and update invariants and the row lock come in slice 5.)
- Routes: `POST /auth/sign-up/send-otp`, `POST /otp/verify`, `POST /auth/sign-up`, `POST /auth/sign-in`, `POST /auth/refresh`, `POST /auth/sign-out`, `GET /users/me`.
- Token issuing, requireAuth middleware (loads session and user by sid), refresh rotation with reuse detection and the absolute cap (D4), web and mobile delivery (D5), throttling (D10).
- Move any code written against refresh\_tokens to sessions (§11 R1).

**Web (web-features)**

- Screens: Sign up (step 1 email or phone; step 2 code; step 3 name and password), Sign in (one identifier field of any type, and password), Home (name, primary identifier, Sign out).
- Sign-up flow: step 1 → neutral message and the code field with the resend countdown (CR9, CR11) → verify → the verificationToken stays in memory only, so a reload restarts the flow → step 3 → on success the user is signed in and lands on Home (Q14).
- Sign-in errors per CR8: INVALID\_CREDENTIALS, TOO\_MANY\_ATTEMPTS, ACCOUNT\_SUSPENDED.
- HTTP layer, session restore, single-flight refresh, purge and route guard per CR2–CR7.

**Mobile (mobile-app)**

- The same screens and flow. Keyboard: email-address or phone-pad depending on the step 1 choice; code field per CR11.
- Differences: refresh token in secure storage and in the request body; `x-client-platform` and `x-device-name` on every request; no cookies; session restore on cold start and an expiry check on foreground (CR4, CR5).

**Manual checks**

- Web: sign up, reload → still signed in; delete the cookie → the next refresh sends you to sign-in; sign out, then press back → no signed-in data shows.
- Mobile: sign up, kill the app, reopen → still signed in; sign out → secure storage is empty.
- Both: replay an already-used refresh token with a REST client → the session is revoked and the client returns to sign-in on its next request; six wrong passwords in a row → TOO\_MANY\_ATTEMPTS with a countdown; repeat the flow in Arabic.

**Done when:** sign-up → sign-in → refresh → reuse → sign-out works end to end on web and mobile; a revoked session is rejected immediately; rule and invariant tests pass, including concurrent sends and proof reuse; the manual checks pass.

### Slice 2 — Security: password and sessions

**Goal.** A signed-in user changes their password and sees and ends their sessions.

**Backend**

- `PATCH /auth/password` (verify currentPassword; revoke every other session with reason password\_changed; audit auth.password\_changed), `POST /auth/sign-out-all`, `GET /auth/sessions` (marks the current one), `DELETE /auth/sessions/{id}` (own sessions only, otherwise SESSION\_NOT\_FOUND; audit session.revoked).

**Web**

- Security screen, two parts. Change password: current, new and confirm fields (confirm is checked on the client). On success show a success message; this device stays signed in. WEAK\_PASSWORD and INVALID\_CURRENT\_PASSWORD show inline.
- Sessions list: platform, device name, IP, created, last used, and a This device label on the current one. Revoke on the other rows (confirm first), none on the current row (Sign out is for that). Sign out of all devices (confirm), then purge (CR6), because it ends this session too.
- The list reloads after every revoke.

**Mobile**

- The same two parts under account settings; native confirmation dialogs; pull to refresh on the list.

**Manual checks**

- Sign in on web and mobile. Change the password on one → the other is signed out on its next request. Revoke the other device from the list → same result. Sign-out-all ends both.

**Done when:** those behaviors work on both clients, and the backend tests for revocation and the 72-byte password limit pass.

### Slice 3 — Forgot password

**Backend**

- `POST /auth/forgot-password/send-otp` (D9: identical for any input; delivery goes to the user's primary verified email or phone, also when a username is submitted; nothing happens if there is none) and `POST /auth/forgot-password/reset` (verificationToken + new password; revoke all sessions with reason password\_reset; security notice; audit auth.password\_reset\_requested and auth.password\_reset\_completed).

**Web**

- A Forgot password link on Sign in → step 1 identifier of any type → neutral message and code field (reuse the OTP component from slice 1) → step 3 new password and confirm → success: go to Sign in with a Password updated, sign in notice. No auto sign-in: reset returns 204 and no tokens. Purge any stale local state.

**Mobile**

- The same flow and component.

**Manual checks**

- Reset a known account → its old sessions end and the new password works. Use an unknown identifier → the same screens and wording, and a similar response time. Enter wrong codes until OTP\_ATTEMPTS\_EXCEEDED → a new code is required. Repeat in Arabic.

**Done when:** the flow works on both clients and the D9 tests pass (a suppressed send is rate-limited like a real one; the public endpoint answers before the provider call).

### Slice 4 — Profile: name and avatar

Order: name first (4a), avatar second (4b). 4b waits for Q3 (storage provider).

**Backend**

- 4a `PATCH /users/me` {name} (1–100 chars, trimmed; audit user.name\_changed).
- 4b storage module (S3-compatible adapter plus a local dev adapter), `PUT /users/me/avatar` and `DELETE /users/me/avatar` per D11 (audit user.avatar\_changed, user.avatar\_removed).

**Web**

- Profile screen: avatar (avatarUrl, or initials when null), Change photo (file picker limited to jpeg, png and webp), Remove photo (confirm), and a name field with Save. After each change reload `GET /users/me` so every screen updates.
- AVATAR\_TOO\_LARGE and AVATAR\_INVALID\_TYPE show their messages and keep the old photo.

**Mobile**

- The same screen. Change photo opens the photo picker; use the picker's compression so typical photos stay well under the 2 MB limit; show the server message if it is still rejected.

**Manual checks**

- Upload, replace (the old object is deleted best-effort) and remove; try a 5 MB file and a PDF renamed to .png → rejected with the right message; change the name and see it update on Home.

**Done when:** both clients cover name and avatar, and the storage adapters pass their tests.

### Slice 5 — Identifiers

Order: 5a add, primary, delete; 5b update.

**Backend**

- 5a `POST /users/me/identifiers/send-otp`, `POST /users/me/identifiers`, `PUT /users/me/primary-identifier`, `DELETE /users/me/identifiers/{id}`; the D2 invariants under the user-row lock (max 4, one primary, delete rules); ADD\_IDENTIFIER proofs bound to the caller (D8).
- 5b `POST /users/me/identifiers/{id}/send-otp`, `PUT /users/me/identifiers/{id}` (same type only; keeps id and primary flag; best-effort notice to the old value).

**Web**

- Sign-in methods screen listing identifiers (type, value, a Primary badge). Actions:
  - Add: choose the type (email, phone, username) → value → for email or phone, the code step (OTP component) → current password → done. A username skips the code step.
  - Make primary. Edit (same type only; code step to the new value; current password). Delete (confirm).
- Hide or disable what the rules forbid and say why: delete on the primary identifier, delete of the last email or phone, Add at 4 identifiers. Still handle the server codes IDENTIFIER\_ALREADY\_EXISTS, IDENTIFIER\_LIMIT\_REACHED, CANNOT\_DELETE\_PRIMARY\_IDENTIFIER, CANNOT\_DELETE\_LAST\_RECOVERY\_IDENTIFIER, IDENTIFIER\_TYPE\_MISMATCH, INVALID\_CURRENT\_PASSWORD and OTP\_DELIVERY\_FAILED.
- After every change reload `GET /users/me`; when the primary changes, the primary identifier in app state changes too.

**Mobile**

- The same flows; the keyboard type follows the identifier type.

**Manual checks**

- Add each type; set primary; delete a non-primary; try to delete the primary and the last email or phone; reach 4 and see Add disabled; update an email and see the notice arrive at the old value (console adapter in dev).

**Done when:** the concurrent-add and proof-reuse integration tests pass and the manual checks pass on both clients.

### Slice 6 — Admin (admin-app only)

Admin users sign in with the normal sign-in screen (slice 1). The UI work waits for Q15; the backend can start earlier.

**Backend**

- 6a Role middleware (support is read-only, admin), first-admin seed script, `GET /admin/users` (AD-1), `GET /admin/users/{id}` (AD-2; writes admin.user\_viewed, AD-6).
- 6b `POST /admin/users/{id}/suspend` (reason required), `/reactivate`, `/revoke-sessions`, with the AD-3 guardrails (CANNOT\_SUSPEND\_SELF, CANNOT\_SUSPEND\_ADMIN, USER\_ALREADY\_SUSPENDED, USER\_NOT\_SUSPENDED); suspension revokes all sessions at once.
- 6c `GET /admin/activity` (AD-4). 6d `GET /admin/metrics/overview?range=7d|30d|90d` (AD-5).

**Admin-app screens**

- Users: table with search (q), filters (status, identifier type, created range, last-active range), sort (createdAt, lastSignInAt, name) and page-number pagination (pageSize up to 100). A row opens User detail.
- User detail: profile, identifiers, active sessions (platform, device, IP, last used) and recent activity. Support sees no write buttons. Admin sees Suspend (dialog with a required reason), Reactivate and Revoke all sessions, each with a confirm dialog and a result message. Suspend is hidden on the admin's own page and on other admins (the server enforces it anyway).
- Activity: filters (user, event type, outcome, date range, IP), newest first, server pagination.
- Overview: a 7d / 30d / 90d switch; cards for total, new, active (DAU, WAU, MAU) and suspended users; sign-in success vs failure; sign-ups per day.
- Access: a signed-in user whose platformRole is user sees a no-access screen; a 403 from an admin route shows the same screen.
- HTTP layer and token rules as in CR2–CR7.

**Manual checks**

- As support: no write buttons, and direct write calls return 403. As admin: suspend a user → their open session gets 401 immediately and they cannot sign in (ACCOUNT\_SUSPENDED after a correct password); reactivate; every action and every opened detail appears in Activity.

**Done when:** a support user cannot call write actions, every action is audited, and AD-6 holds (no password hash, OTP code or token in any response).

### Phase 7 — Hardening (horizontal)

Cleanup job (audit retention, expired otps, expired or revoked sessions); pg\_trgm search index and last\_active\_at / last\_sign\_in\_at indexes if lists slow down; security review against D3–D13; review every env value and default with the human (the D10 limits, OTP\_MAX\_SENDS\_PER\_IP\_PER\_HOUR, SESSION\_ABSOLUTE\_TTL); review all three apps against §8.1; record these conventions in AGENTS.md.

## 9. Required tests (risk-based, per AGENTS.md)

**Rules (unit):** classification is disjoint; normalization; username rules; password 72-byte limit; identifier invariants (max 4, one primary, delete rules).

**Services (boundaries mocked):** sign-up with valid, wrong-target, reused and expired proofs; unknown identifier and wrong password give the same error; suspended account; refresh rotation and reuse revoking the session; refresh fails at the absolute cap, and a changed SESSION\_ABSOLUTE\_TTL applies to existing sessions; password change/reset revoking sessions; OTP attempts, cooldown and expiry; a suppressed OTP is rate-limited like a real one, including the per-IP limit; public send endpoints answer before the provider call (use the inline runner in tests to assert delivery) and never return OTP\_DELIVERY\_FAILED; admin guardrails.

**Integration (real DB):** unique (type, value); single primary; max 4 under concurrent adds; proof consumed once under concurrency; revoked session rejected immediately by the middleware; audit row rolls back with its transaction. Schema invariants (Reconciled): user\_identifiers rejects an email stored as username or phone, a username that looks like an email or E.164 phone, and an unverified email or phone; otps allows one pending code per identifier and purpose under concurrent sends, rejects a non-deliverable identifier for SIGN\_UP, and enforces the user binding for ADD\_IDENTIFIER and UPDATE\_IDENTIFIER; two concurrent refreshes with the same token yield exactly one winner; sessions rejects revoked\_at without revoked\_reason and the reverse; users rejects a suspended row without reason and an active row with suspension fields.

**Routes (thin):** validation, 401/403 wiring, status codes, error mapping, web cookie flags vs mobile body token; refresh from web without x-requested-with is rejected.

**Clients (per slice):** a single-flight refresh unit test (several concurrent 401s cause exactly one refresh call); sign-out purges tokens, secure storage and the query cache; each CR8 error-code behavior the slice uses; the slice's happy path through the repo's existing UI test tooling. Where no UI test tooling exists (Q16), run the slice's manual checks and report them.

## 10. Open questions

Record each answer here once resolved. Resolved items are marked Decided. Items marked (Phase 0) are checked by the agent against the real code and reported in the gap list.

- Q1 Are same-type duplicates allowed (two emails)? Default: yes, 4 identifiers in total. (Open)
- Q2 Which email and WhatsApp providers? Build behind MessageSender with a console adapter until decided. (Open)
- Q3 Which storage provider for avatars? S3-compatible assumed. (Open; blocks the avatar part of slice 4)
- Q4 Events vs sync (D14): keep the default, or keep the earlier OTP-event design? (Open)
- Q5 Decided: the web app and the API are same-site (shared main domain), so SameSite=Lax stays and the SameSite=None fallback is not needed. Confirm the admin-app is also served under the same main domain (see Q7).
- Q6 Decided: the refresh token goes in the body for mobile only, because mobile has no cookies; web keeps the HttpOnly cookie (D5).
- Q7 Admin hardening: require MFA for admin in v2? Serve admin-app from a separate domain? If the admin-app moves to a different main domain, the Q5 same-site assumption no longer holds for it. (Open)
- Q8 Confirm managed (username-only) users are created only by the orgs module. (Open)
- Q9 Decided (Phase 0): `user_providers` does not exist in `packages/db`. `password_hash` is directly on `users`.
- Q10 Decided (Phase 0): No OTP-only (LOGIN) sign-in route is in use. The `otpPurposeEnum` only has `SIGN_UP`, `ADD_IDENTIFIER`, `UPDATE_IDENTIFIER`, and `FORGET_PASSWORD`.
- Q11 Decided (Phase 0): The delivered `users.ts` and `user-identifiers.ts` in `packages/db/src/schema/user/` already match §5 with all required constraints and indexes. No columns dropped.
- Q12 Decided (hardening changes that touched binding decisions):
  - a. D9 timing: yes. Send after responding through the BackgroundRunner and never return OTP\_DELIVERY\_FAILED from public send endpoints (D9).
  - b. Absolute session lifetime: yes. `SESSION_ABSOLUTE_TTL`=90d, derived from sessions.created\_at, no new column (D4).
  - c. Per-IP limit on OTP sends: yes. `OTP_MAX_SENDS_PER_IP_PER_HOUR`=20 as a starting value to tune (D10).
  - d. Reuse leeway: no in v1. Mobile signs in again on REFRESH\_TOKEN\_REUSED (D4).
- Q13 (New) Client error text: show the server's translated message (the client sends Accept-Language) or keep client-side strings per error code? Default: the server's message; client strings only for text that exists only in the UI. (Open)
- Q14 (New) Where does a user land after sign-up, sign-in and password reset on each client? Default: the app's existing home route from the Phase 0 client inventory; if there is none, the Home screen from slice 1. (Open)
- Q15 (New) Admin-app shared components wait on the admin-web-features decision (§2). Resolve it before the slice 6 UI work. (Open)
- Q16 (New) UI test tooling for web and mobile. Default: use what the repo already has; where there is none, run and report each slice's manual checks. (Open)

## 11. Reconciliation log (v1 spec vs existing schemas)

Reviewed: otps, refresh\_tokens and the user relations. The existing users, user\_identifiers, user\_providers and organization\_users definitions were not part of what was reviewed (R9, R10).

**Rule used.** Names that differ but mean the same thing follow the existing schema (least churn); a name that misleads is changed. Where the spec is stricter on security or correctness, the schema changes. Where the schema is safer or more precise, the spec changes.

- R1. Session model: schema changed. Spec: sessions, one row per sign-in, with the current and previous refresh hash and sid in the access token. Schema: refresh\_tokens, one row per token chained by family\_id. Decision: refresh\_tokens is replaced by sessions; the old family\_id is now sessions.id. Why: immediate revocation by sid (D3), per-device list and revoke (AU-7), the admin session view (AD-2) and revoke reasons all need a first-class session row; one row per device avoids a new row for every refresh of every active device; current plus previous hash covers theft in practice, because an attacker's token is still current or just rotated when first used. Trade-off: a token two or more rotations old is rejected as REFRESH\_TOKEN\_INVALID without a reuse alert. If you later want full chain history or a reuse grace window, add a child refresh\_tokens table keyed by session id. Kept from the old table: inet IP, user\_agent, hash-only storage, unique hash index, expires\_at index, cascade on user delete, timestamps().
- R2. OTP purposes: schema changed. Spec: SIGN\_UP, ADD\_IDENTIFIER, UPDATE\_IDENTIFIER, FORGET\_PASSWORD. Schema: SIGN\_UP, LOGIN, FORGET\_PASSWORD. Decision: add the two identifier purposes, drop LOGIN. Why: v1 sign-in is identifier + password (AU-2). A code-only sign-in over WhatsApp or email is a weaker credential (SIM swap, recycled numbers) and has no throttle design (D10 covers password sign-in). If wanted later, reintroduce it deliberately with its own limits (§10 Q10).
- R3. Naming: mixed. type becomes purpose (schema renamed: type collides with the identifier type used throughout the API). identifier is kept (spec's target dropped: the column holds the identifier as submitted, see D7). otp\_hash is kept (spec's code\_hash dropped). ip becomes ip\_address in the spec, matching the existing column. New session columns keep the spec's names (refresh\_token\_hash, previous\_refresh\_token\_hash).
- R4. OTP binding and state: schema changed. Added user\_id (nullable FK, required exactly for ADD\_IDENTIFIER and UPDATE\_IDENTIFIER, so a proof cannot be handed to another user) and verified\_at (D8 has two steps: verify, then consume). consumed\_at now means “closed”: spent, superseded or killed.
- R5. One live code: schema changed, spec refined. The spec required one live code per target and purpose but nothing enforced it. Schema gains a partial unique index on pending rows; D7 gains the close-pending-first step. Pending-only on purpose: a new send never invalidates a code that was already verified, so someone spamming a victim's address cannot kill an in-flight sign-up or reset.
- R6. OTP channel: spec changed. The spec stored it; the schema has no such column. Dropped: it follows from the identifier type, and for suppressed FORGET\_PASSWORD rows (D9) it has no truthful value. The otp.sent audit metadata records the channel.
- R7. OTP indexes and timestamps: spec changed. The spec had (target, purpose, created\_at desc); the schema has an ascending composite plus an expires\_at index. Kept: Postgres scans btrees backwards, and expires\_at serves cleanup. The timestamps() convention is kept, so otps has updated\_at too.
- R8. Relations: schema changed. usersRelations.refreshTokens becomes sessions; added otps → user and audit\_events → actor and subject. The orgs memberships and the identifier → providers relations are untouched.
- R9. user\_providers: left alone. It exists in the schema (identifier → providers) and is absent from the spec; social login is out of v1. Not dropped, not used by v1 code; its role is §10 Q9.
- R10. users and user\_identifiers: spec wins by default. Their current definitions were not available, so users.ts and user-identifiers.ts are written from §5 and must be diffed against the existing files. password\_hash is NOT NULL because every v1 user has a password; enum casing follows §5.
- R11. audit\_events: new table. No foreign keys, so rows outlive users and sessions and an erasure never rewrites history. event\_type is text with a format check rather than a pg enum, because the list grows. Added identifier\_hmac (D10) and indexes for the IP filter (AD-4) and the throttle counts.
- R12. Database invariants added so the rules do not rest on application code alone. D1 disjointness (user\_identifiers\_type\_value\_chk), verified\_at required for email and phone, deliverable identifiers for OTPs, OTP user binding, the revoked\_at/revoked\_reason pair, suspension consistency, name length, and lengths on identifier values. All are looser than the application validators, so they never reject a value the application accepts.

**Migration notes**

- otps: codes live 10 minutes, so nothing of value is lost. In the migration drop table otps and type otp\_type, then create the new ones. If drizzle-kit asks, answer “create”, not “rename”.
- refresh\_tokens to sessions: simplest is to drop refresh\_tokens and let everyone sign in again. To keep live sign-ins, run this after creating sessions and before dropping refresh\_tokens; it is valid only if the stored hashes are lowercase-hex SHA-256 (D4). The platform of old rows is unknown; 'web' is a placeholder, because the delivery mode is decided per request by x-client-platform.

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

- Migrated sessions get created\_at = the time of their latest refresh\_tokens row, so their absolute lifetime (D4) starts then. That is acceptable.
- users and user\_identifiers: diff against the existing definitions and keep any extra columns. password\_hash NOT NULL needs every existing user to have a hash. Existing user\_identifiers rows must satisfy the new checks: look for unverified emails or phones and for usernames that look like an email or phone before applying.
- Do not drop user\_providers or organization\_users.

**Code impact (start of the gap list)**

- otp repository and services: rename type to purpose; remove LOGIN branches; set verified\_at on verify and require it on consume; set user\_id for ADD\_IDENTIFIER and UPDATE\_IDENTIFIER; close the pending code before inserting; hash id + code.
- Refresh, sign-in, sign-up and sign-out code written against refresh\_tokens: move to sessions; the middleware loads session and user by sid.
- packages/contracts: OtpType becomes OtpPurpose with the new values; session and audit schemas follow §5.
- relations.ts and the schema barrel: export the new tables and enums, remove refresh-tokens, apply relations.user-module.ts.
- Tests and fixtures that insert otps or refresh\_tokens rows.
- v3 additions: the §7 config keys and the shared constants (`PASSWORD_MIN_LENGTH`, `PASSWORD_MAX_BYTES`, `MAX_IDENTIFIERS_PER_USER`); the BackgroundRunner port; the absolute cap in the refresh and sign-in code (D4); the x-requested-with check on web refresh (D5).
