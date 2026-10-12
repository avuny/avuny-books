import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';

import { getIsAuthenticatedQueryKey, useSignOut } from '@/api';
import { tokenStorage } from '@/mutator/auth/token-storage';

export function useSignOutHandler() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useSignOut({
    mutation: {
      onSuccess: async () => {
        queryClient.invalidateQueries({
          queryKey: getIsAuthenticatedQueryKey(),
        });

        queryClient.removeQueries({
          queryKey: getIsAuthenticatedQueryKey(),
        });

        queryClient.clear();
        await tokenStorage.removeAccessToken();

        router.replace('/(auth)/sign-in');
      },
    },
  });

  const signOut = async () => {
    await mutateAsync({
      data: {},
    });
  };

  return {
    signOut,
    isSigningOut: isPending,
  };
}
