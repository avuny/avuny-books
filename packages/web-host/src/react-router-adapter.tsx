// packages/web-host/src/react-router-adapter.tsx
// React Router v7 implementation of the RouterAdapter contract.
// On react-router-dom v6? Change the import below to "react-router-dom".
// On TanStack Router? This is the only file that changes.
import { useCallback } from "react";
import {
  Link as RouterLink,
  useLocation,
  useNavigate as useRouterNavigate,
  useParams as useRouterParams,
  useSearchParams as useRouterSearchParams,
} from "react-router";
import type {
  LinkProps,
  NavigateOptions,
  RouterAdapter,
} from "@avuny/web-features/core";

const Link = ({ to, replace, ...rest }: LinkProps) => (
  <RouterLink to={to} replace={replace} {...rest} />
);

const useNavigate = () => {
  const navigate = useRouterNavigate();
  return useCallback(
    (to: string, options?: NavigateOptions) =>
      navigate(to, { replace: options?.replace }),
    [navigate],
  );
};

const useSearchParams = () => {
  const [params, setParams] = useRouterSearchParams();
  const setSearchParams = useCallback(
    (
      next: URLSearchParams | Record<string, string>,
      options?: NavigateOptions,
    ) => setParams(next, { replace: options?.replace }),
    [setParams],
  );
  return [params, setSearchParams] as const;
};

const usePathname = () => useLocation().pathname;

export const reactRouterAdapter: RouterAdapter = {
  Link,
  useNavigate,
  useParams: useRouterParams,
  useSearchParams,
  usePathname,
};
