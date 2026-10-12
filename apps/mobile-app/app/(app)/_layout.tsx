import { Redirect, Stack } from 'expo-router';

import { useAuthenticatedHandler } from '@/features/auth';
import { LoadingScreen } from '@/components/avuny/loading-screen';
import SelectedOrganizationContextProvider from '@/context/selected-org-provider';

export default function AppLayout() {
  const { data, error, isPending } = useAuthenticatedHandler();

  if (isPending) {
    return <LoadingScreen />;
  }
  if (error) {
    return <Redirect href={'/(auth)'} />;
  }

  return (
    <SelectedOrganizationContextProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </SelectedOrganizationContextProvider>
  );
}
