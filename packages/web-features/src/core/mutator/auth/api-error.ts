import { AxiosError } from "axios"

export type DomainErrorBody = {
  success?: false
  code?: string
  message?: string
  type?: string
}

export function getApiErrorBody(err: unknown): DomainErrorBody | undefined {
  if (!isAxiosError(err)) return undefined
  const data = err.response?.data
  if (!data || typeof data !== "object") return undefined
  return data as DomainErrorBody
}

export function getApiErrorCode(err: unknown): string | undefined {
  return getApiErrorBody(err)?.code
}

export function getApiErrorMessage(err: unknown): string | undefined {
  return getApiErrorBody(err)?.message
}

export function isAxiosError(err: unknown): err is AxiosError<DomainErrorBody> {
  return err instanceof AxiosError
}

/** CR6: 5xx and network errors must never purge the session. */
export function isRetriableTransportError(err: unknown): boolean {
  if (!isAxiosError(err)) return true
  if (!err.response) return true
  return err.response.status >= 500
}

export function isRefreshUrl(url: string | undefined): boolean {
  return typeof url === "string" && url.includes("/auth/refresh")
}
