// CR5: after a 401 on an authenticated request, refresh once (single-flight) and retry.
// CR6: purge only when the session is gone — never on 5xx or network errors.

import { AxiosError } from "axios"
import { refreshAccessTokenSingleFlight } from "../auth/refresh-token"
import { refreshQueue } from "../auth/refresh-queue"
import { purge } from "../auth/purge"
import {
  getApiErrorCode,
  isRefreshUrl,
  isRetriableTransportError,
} from "../auth/api-error"
import { API_CONFIG } from "../config"
import { tokenStorage } from "../auth/token-storage"

type RetryableRequest = AxiosError["config"] & { _retry?: boolean }

export async function responseErrorInterceptor(error: AxiosError<unknown>) {
  const originalRequest = error.config as RetryableRequest | undefined
  const url = `${originalRequest?.baseURL ?? ""}${originalRequest?.url ?? ""}`

  if (isRefreshUrl(url)) {
    return Promise.reject(error)
  }

  if (!shouldAttemptRefresh(error, originalRequest)) {
    return Promise.reject(error)
  }

  if (originalRequest?._retry) {
    purge.run()
    return Promise.reject(error)
  }

  originalRequest._retry = true

  if (refreshQueue.isRefreshing()) {
    return enqueueRequest(originalRequest)
  }

  refreshQueue.startRefreshing()

  try {
    const newAccessToken = await refreshAccessTokenSingleFlight()
    refreshQueue.process(null, newAccessToken)

    if (originalRequest.headers) {
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
    }

    return retryRequest(originalRequest)
  } catch (refreshError) {
    refreshQueue.process(refreshError)
    if (!isRetriableTransportError(refreshError)) {
      const code = getApiErrorCode(refreshError)
      if (
        !code ||
        API_CONFIG.auth.sessionGoneCodes.includes(code) ||
        (refreshError instanceof AxiosError && refreshError.response?.status === 401)
      ) {
        purge.run()
      }
    }
    return Promise.reject(error)
  } finally {
    refreshQueue.stopRefreshing()
  }
}

function shouldAttemptRefresh(
  error: AxiosError<unknown>,
  originalRequest: RetryableRequest | undefined
): originalRequest is RetryableRequest {
  if (!originalRequest) return false
  if (error.response?.status !== API_CONFIG.auth.refreshStatusCode) return false
  if (!tokenStorage.getAccessToken()) return false
  return true
}

function enqueueRequest(originalRequest: RetryableRequest) {
  return new Promise((resolve, reject) => {
    refreshQueue.enqueue({
      resolve: (token: string) => {
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`
        }
        resolve(retryRequest(originalRequest))
      },
      reject,
    })
  })
}

async function retryRequest(request: RetryableRequest) {
  const { AXIOS_INSTANCE } = await import("../axios-instance")
  return AXIOS_INSTANCE(request)
}
