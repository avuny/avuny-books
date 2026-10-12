import { Redirect, Stack } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { usePreferences } from '../../context/PreferencesContext';
import { HeaderActionButton } from '@/components/header-action-button';
import { ThemeToggle } from '@/components/toggle-theme';
import { useAuthenticatedHandler } from '@/features/auth';
import { LoadingScreen } from '@/components/avuny/loading-screen';

export default function AuthLayout() {
  const { colors, isDark, toggleTheme, changeLanguage } = usePreferences();

  const { i18n } = useTranslation();
  const { data, error, isPending } = useAuthenticatedHandler();

  if (isPending) {
    return <LoadingScreen />;
  }
  if (!error) {
    return <Redirect href={'/(app)'} />;
  }

  return (
    <Stack
      screenOptions={{
        // headerShown: true,
        // headerBackTitle: 'Back',

        // headerStyle: {
        //   backgroundColor: colors.background,
        // },

        // headerShadowVisible: false,

        // headerTintColor: colors.text,

        // headerTitleStyle: {
        //   color: colors.text,
        // },

        // contentStyle: {
        //   backgroundColor: colors.background,
        // },

        headerRight: () => (
          <View
            style={{
              flexDirection: 'row',
              gap: 8,
              alignItems: 'center',
            }}>
            <HeaderActionButton
              icon="language"
              isDark={isDark}
              onPress={() => changeLanguage(i18n.language === 'ar' ? 'en' : 'ar')}
            />

            <ThemeToggle />
          </View>
        ),
      }}>
      <Stack.Screen
        name="index"
        options={{
          headerBackVisible: false,
          title: '',
        }}
      />

      <Stack.Screen
        name="sign-in"
        options={{
          title: 'Sign In',
        }}
      />

      <Stack.Screen
        name="sign-up"
        options={{
          title: 'Sign Up',
        }}
      />
    </Stack>
  );
}
