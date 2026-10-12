import { AxiosError, AxiosRequestConfig } from "axios"

import { AXIOS_INSTANCE } from "./axios-instance"

type CancelablePromise<T> = Promise<T> & {
  cancel?: () => void
}

export function customInstance<T>(
  urlOrConfig: string | AxiosRequestConfig,
  options?: AxiosRequestConfig
): CancelablePromise<T> {
  const controller = new AbortController();

  const config: AxiosRequestConfig =
    typeof urlOrConfig === 'string'
      ? { url: urlOrConfig, ...options }
      : { ...urlOrConfig, ...options };

  const promise = AXIOS_INSTANCE({
    ...config,
    signal: controller.signal,
  }).then((response) => response.data) as CancelablePromise<T>;

  promise.cancel = () => {
    controller.abort();
  };

  return promise;
}

// In some case with react-query and swr you want to be able to override the return error type so you can also do it here like this
export type ErrorType<Error> = AxiosError<Error>
