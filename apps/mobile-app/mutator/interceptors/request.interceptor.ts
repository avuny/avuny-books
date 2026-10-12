import { InternalAxiosRequestConfig } from "axios"

import { tokenStorage } from "../auth/token-storage"
import { appStorage } from "../storage/app-storage"
import { API_CONFIG } from "../config"

export async function requestInterceptor(
  config: InternalAxiosRequestConfig
) {
  await attachAccessToken(config)

  await attachOrganizationId(config)

  await attachLanguage(config)

  return config
}

async function attachAccessToken(
  config: InternalAxiosRequestConfig
) {
  const hasAuthorizationHeader =
    typeof config.headers.Authorization ===
      "string" &&
    config.headers.Authorization
      .toLowerCase()
      .startsWith("bearer")

  if (hasAuthorizationHeader) {
    return
  }

  const token =
    await tokenStorage.getAccessToken()

  if (token) {
    config.headers.Authorization =
      `Bearer ${token}`
  }
}

async function attachOrganizationId(
  config: InternalAxiosRequestConfig
) {
  const organizationId =
    await appStorage.getOrganizationId()

  if (!organizationId) {
    return
  }

  config.headers[
    API_CONFIG.headers.organizationId
  ] = organizationId
}

async function attachLanguage(
  config: InternalAxiosRequestConfig
) {
  const language =
    (await appStorage.getLanguage()) || "en"

  config.headers[
    API_CONFIG.headers.language
  ] = language
}
