import { AxiosError, type AxiosRequestConfig } from "axios"

import { AXIOS_INSTANCE } from "./axios-instance"

type CancelablePromise<T> = Promise<T> & {
  cancel?: () => void
}

export function customInstance<T>(
  urlOrConfig: string | AxiosRequestConfig,
  options?: AxiosRequestConfig
): CancelablePromise<T> {
  const controller = new AbortController()

  const config: AxiosRequestConfig =
    typeof urlOrConfig === "string"
      ? { url: urlOrConfig, ...options }
      : { ...urlOrConfig, ...options }

  const promise = AXIOS_INSTANCE({
    ...config,
    signal: controller.signal,
  }).then((response) => response.data) as CancelablePromise<T>

  promise.cancel = () => {
    controller.abort()
  }

  return promise
}

export type ErrorType<Error> = AxiosError<Error>
