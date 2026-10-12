import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useOrganizationList } from '@/api';

export default function AppIndex() {
  const { data, isLoading } = useOrganizationList();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const hasOrganization = (data?.data.list?.length ?? 0) > 0;

  return (
    <Redirect
      href={hasOrganization ? '/(app)/(tabs)/home' : '/(app)/(onboarding)/create-organization'}
    />
  );
}
