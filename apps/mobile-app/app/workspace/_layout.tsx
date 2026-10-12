import React, { useEffect } from 'react';
import { Slot, useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useIsAuthenticated } from '@/api';
import { usePreferences } from '@/context/PreferencesContext';

export default function AuthGuardLayout() {
  const { data: authData, isLoading } = useIsAuthenticated();
  const router = useRouter();
  const { colors } = usePreferences();

  useEffect(() => {
    if (!isLoading && (!authData || !authData.success)) {
      router.replace('/(auth)/sign-in');
    }
  }, [authData, isLoading]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
        }}>
        <ActivityIndicator />
      </View>
    );
  }

  return <Slot />;
}
