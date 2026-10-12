import { useAppHeader } from '@/features/layout/use-app-header';
import { Stack } from 'expo-router';

export default function Layout() {
  const header = useAppHeader();
  return <Stack screenOptions={header} />;
}
