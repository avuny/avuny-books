// Host apps call configureApiClient() at startup with a validated base URL.
// Empty baseURL means same-origin requests (Vite /api proxy).

export const API_CONFIG = {
  baseURL: "",

  refreshTokenUrl: "/api/auth/refresh",

  auth: {
    refreshStatusCode: 401,
    sessionGoneCodes: ["REFRESH_TOKEN_INVALID", "REFRESH_TOKEN_REUSED"],
  },

  headers: {
    xRequestedWith: "x-requested-with",
    xRequestedWithValue: "XMLHttpRequest",
    language: "Accept-Language",
    organizationId: "x-organization-id",
  },
}

export function configureApiClient(options: { baseURL: string }) {
  const baseURL = options.baseURL.replace(/\/$/, "")
  API_CONFIG.baseURL = baseURL
  API_CONFIG.refreshTokenUrl = `${baseURL}/api/auth/refresh`
}
