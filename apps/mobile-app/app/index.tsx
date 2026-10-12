import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '@/context/AuthContext';
import { LoadingScreen } from '@/components/avuny/loading-screen';

export default function Index() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return <Redirect href={user ? '/(app)' : '/(auth)'} />;
}
