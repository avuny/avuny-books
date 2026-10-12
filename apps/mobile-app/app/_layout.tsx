import 'react-native-gesture-handler';
import 'react-native-reanimated';

import '@/global.css';
import '@/i18n/i18n';

import { useState } from 'react';
import { Slot, ErrorBoundary } from 'expo-router';
import { ThemeProvider } from 'expo-router/react-navigation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { PortalHost } from '@rn-primitives/portal';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useUniwind } from 'uniwind';

import { AuthProvider } from '@/context/AuthContext';
import { PreferencesProvider } from '@/context/PreferencesContext';
import { NAV_THEME } from '@/lib/theme';
import { Toaster } from 'sonner-native';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

export { ErrorBoundary };

export default function RootLayout() {
  const { theme } = useUniwind();

  const [queryClient] = useState(() => new QueryClient());

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <BottomSheetModalProvider>
          <PreferencesProvider>
            <AuthProvider>
              <ThemeProvider value={NAV_THEME[theme ?? 'light']}>
                <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />

                <Slot />

                <PortalHost />

                <Toaster />
              </ThemeProvider>
            </AuthProvider>
          </PreferencesProvider>
        </BottomSheetModalProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
