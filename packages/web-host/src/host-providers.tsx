// packages/web-host/src/host-providers.tsx
import { useMemo, useSyncExternalStore, type ReactNode } from "react";
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import {
  LocaleProvider,
  RouterAdapterProvider,
  type RouterAdapter,
  // SessionProvider,
} from "@avuny/web-features/core";
import { getLocale, setLocale, subscribeLocale } from "./locale-store";

type HostProvidersProps = {
  router: RouterAdapter;
  queryClient: QueryClient;
  children: ReactNode;
};

/** Everything web-features expects from its host, in one place. */
export const HostProviders = ({
  router,
  queryClient,
  children,
}: HostProvidersProps) => {
  const locale = useSyncExternalStore(subscribeLocale, getLocale);
  const localeState = useMemo(() => ({ locale, setLocale }), [locale]);

  return (
    <RouterAdapterProvider adapter={router}>
      <LocaleProvider value={localeState}>
        <QueryClientProvider client={queryClient}>
          {/* <SessionProvider> */}
          {children}
          {/* </SessionProvider> */}
        </QueryClientProvider>
      </LocaleProvider>
    </RouterAdapterProvider>
  );
};
