import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { HeaderBackButton } from 'expo-router/react-navigation';
import type { NativeStackNavigationOptions } from 'expo-router';

// Assuming you use i18next. Adjust the import path if your setup differs.
import i18n from 'i18next';

import { usePreferences } from '@/context/PreferencesContext';
import { useAuthenticatedHandler } from '@/features/auth';
import { useOrganizationList } from '@/api';
import { useSignOutHandler } from '@/features/auth/hooks/use-sign-out-handler';

import { OrganizationComboBox } from '@/features/organization/organization-combo-box';
import { UserAvatarButton } from '@/components/avuny/user-popover/user-avatat-button';
import { UserPopover } from '@/components/avuny/user-popover';
import { HeaderActionButton } from '@/components/header-action-button';
import { ThemeToggle } from '@/components/toggle-theme';

// 1. Strictly type the props that React Navigation injects into headerLeft
export interface HeaderLeftProps {
  canGoBack?: boolean;
  tintColor?: string;
  label?: string;
  onPress?: () => void;
}

// 2. Ensure the hook guarantees a NativeStackNavigationOptions return type
export function useAppHeader(): NativeStackNavigationOptions {
  const { isDark, changeLanguage } = usePreferences();

  const { data: organizations } = useOrganizationList();
  const { data: user } = useAuthenticatedHandler();
  const { signOut } = useSignOutHandler();

  // Strictly type the state
  const [open, setOpen] = useState<boolean>(false);
  const router = useRouter();

  return {
    headerLeft: (props) => {
      // Show back button on nested screens
      if (props.canGoBack) {
        return <HeaderBackButton tintColor={props.tintColor} onPress={() => router.back()} />;
      }

      // Fallback: Show organization switcher on root screens
      // Using safe navigation operator just in case `data` is undefined
      return <OrganizationComboBox organizations={organizations?.data?.list ?? []} />;
    },

    headerRight: () => (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <UserAvatarButton onPress={() => setOpen(true)} />

        <UserPopover
          visible={open}
          onClose={() => setOpen(false)}
          name={user?.data?.name ?? ''}
          email={user?.data?.identifier ?? ''}
          onSignOut={signOut}
          language={
            <HeaderActionButton
              icon="language"
              isDark={isDark}
              onPress={() => changeLanguage(i18n.language === 'ar' ? 'en' : 'ar')}
            />
          }
          appearance={<ThemeToggle />}
        />
      </View>
    ),
  };
}
