// packages/web-features/src/core/host.tsx
// The contract between web-features and whatever app hosts it.
// Features import routing and locale ONLY from here, never from
// next/*, react-router or a host package. Hosts implement and provide it.
import {
  createContext,
  useContext,
  type AnchorHTMLAttributes,
  type ComponentType,
  type ReactNode,
} from "react";
import { getMessages, type Locale, type Messages } from "@avuny/i18n";

/* ---------- Router ---------- */

export type NavigateOptions = { replace?: boolean };

export type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  to: string;
  replace?: boolean;
};

export type SetSearchParams = (
  next: URLSearchParams | Record<string, string>,
  options?: NavigateOptions,
) => void;

/** What a host must implement. Keep it small: this is the whole routing contract. */
export interface RouterAdapter {
  Link: ComponentType<LinkProps>;
  useNavigate: () => (to: string, options?: NavigateOptions) => void;
  useParams: () => Readonly<Record<string, string | undefined>>;
  useSearchParams: () => readonly [URLSearchParams, SetSearchParams];
  usePathname: () => string;
}

const RouterContext = createContext<RouterAdapter | null>(null);

export const RouterAdapterProvider = ({
  adapter,
  children,
}: {
  adapter: RouterAdapter;
  children: ReactNode;
}) => <RouterContext.Provider value={adapter}>{children}</RouterContext.Provider>;

const useAdapter = (): RouterAdapter => {
  const adapter = useContext(RouterContext);
  if (!adapter) {
    throw new Error("Missing RouterAdapterProvider. Wrap the app in <HostProviders>.");
  }
  return adapter;
};

// What features actually import:
export const Link = (props: LinkProps) => {
  const { Link: AdapterLink } = useAdapter();
  return <AdapterLink {...props} />;
};
export const useNavigate = () => useAdapter().useNavigate();
export const useParams = () => useAdapter().useParams();
export const useSearchParams = () => useAdapter().useSearchParams();
export const usePathname = () => useAdapter().usePathname();

/* ---------- Locale ---------- */

export type LocaleState = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleState | null>(null);

export const LocaleProvider = ({
  value,
  children,
}: {
  value: LocaleState;
  children: ReactNode;
}) => <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;

export const useLocale = (): LocaleState => {
  const state = useContext(LocaleContext);
  if (!state) {
    throw new Error("Missing LocaleProvider. Wrap the app in <HostProviders>.");
  }
  return state;
};

/** Shared strings for the current locale, e.g. useMessages().common.save */
export const useMessages = (): Messages => getMessages(useLocale().locale);
