// hooks/use-authenticated-user.ts

import { getIsAuthenticatedQueryKey, useIsAuthenticated } from '@/api';

export const useAuthenticatedHandler = () => {
  return useIsAuthenticated({
    query: {
      queryKey: getIsAuthenticatedQueryKey(),
      retry: 1,

      // Cache settings
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (cache retention)
    },
  });
};
