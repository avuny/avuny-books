// CR2: every web request gets Bearer, x-requested-with, and Accept-Language.
// CR5: refresh when the access token is within ~60s of expiry (single-flight).

import { type InternalAxiosRequestConfig } from "axios"
import { tokenStorage } from "../auth/token-storage"
import { refreshAccessTokenSingleFlight } from "../auth/refresh-token"
import { isRefreshUrl } from "../auth/api-error"
import { API_CONFIG } from "../config"

let _currentLocale = "en"

export function setRequestLocale(locale: string) {
  _currentLocale = locale
}

export async function requestInterceptor(config: InternalAxiosRequestConfig) {
  if (API_CONFIG.baseURL && !config.baseURL) {
    config.baseURL = API_CONFIG.baseURL
  }

  const url = `${config.baseURL ?? ""}${config.url ?? ""}`
  if (!isRefreshUrl(url) && tokenStorage.getAccessToken() && tokenStorage.isNearExpiry()) {
    try {
      await refreshAccessTokenSingleFlight()
    } catch {
      // CR6: keep the token on transport failure; the request may 401 next.
    }
  }

  attachAccessToken(config)
  attachXRequestedWith(config)
  attachLanguage(config)
  attachOrganizationId(config)
  return config
}

function attachAccessToken(config: InternalAxiosRequestConfig) {
  const alreadyHasBearer =
    typeof config.headers.Authorization === "string" &&
    config.headers.Authorization.toLowerCase().startsWith("bearer")

  if (alreadyHasBearer) return

  const token = tokenStorage.getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
}

function attachXRequestedWith(config: InternalAxiosRequestConfig) {
  config.headers[API_CONFIG.headers.xRequestedWith] =
    API_CONFIG.headers.xRequestedWithValue
}

function attachLanguage(config: InternalAxiosRequestConfig) {
  config.headers[API_CONFIG.headers.language] = _currentLocale
}

function attachOrganizationId(config: InternalAxiosRequestConfig) {
  const organizationId =
    typeof sessionStorage !== "undefined"
      ? sessionStorage.getItem("selectedOrganizationId")
      : null
  if (organizationId) {
    config.headers[API_CONFIG.headers.organizationId] = organizationId
  }
}
