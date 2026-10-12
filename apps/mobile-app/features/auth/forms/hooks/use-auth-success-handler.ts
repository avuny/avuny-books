import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';

import { AuthResponse } from '@/api/model';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner-native';
import { getIsAuthenticatedQueryKey } from '@/api';
import { useQueryClient } from '@tanstack/react-query';
type AuthSuccessOptions = {
  redirectTo?: string;
};

export function useAuthSuccessHandler() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const queryClient = useQueryClient();

  return async (data: { data: AuthResponse }, options?: AuthSuccessOptions) => {
    const { tokens, user } = data.data;
    queryClient.invalidateQueries({
      queryKey: getIsAuthenticatedQueryKey(),
    });
    queryClient.removeQueries({
      queryKey: getIsAuthenticatedQueryKey(),
    });
    // Store access token securely
    await SecureStore.setItemAsync('accessToken', tokens.accessToken);

    // Store refresh token securely
    await SecureStore.setItemAsync('refreshToken', tokens.refreshToken);

    // Show toast
    toast.success(
      t('msgs.welcome', {
        thing: user.name,
      })
    );

    // // Navigate
    // if (options?.redirectTo) {
    //   router.replace(options.redirectTo);
    // } else {
    router.replace('/(app)');
    // }
  };
}
