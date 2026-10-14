// packages/web-features/src/core/mutator/auth/token-storage.ts
// CR3: the access token lives in memory ONLY — never localStorage, sessionStorage or a cookie.

let _accessToken: string | null = null
let _accessTokenExpiresAt: string | null = null

export const tokenStorage = {
  getAccessToken(): string | null {
    return _accessToken
  },

  getAccessTokenExpiresAt(): string | null {
    return _accessTokenExpiresAt
  },

  setAccessToken(token: string, expiresAt: string): void {
    _accessToken = token
    _accessTokenExpiresAt = expiresAt
  },

  removeAccessToken(): void {
    _accessToken = null
    _accessTokenExpiresAt = null
  },

  /** CR5: true when the access token expires within ~60 s. */
  isNearExpiry(): boolean {
    if (!_accessToken || !_accessTokenExpiresAt) return true
    const expiresMs = new Date(_accessTokenExpiresAt).getTime()
    return Date.now() >= expiresMs - 60_000
  },
}
