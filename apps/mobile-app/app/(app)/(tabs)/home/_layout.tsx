import { useRef } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';

import { useResolveClassNames, useCSSVariable } from 'uniwind';
import { Text } from '@/components/ui/text';
import { useAppHeader } from '@/features/layout/use-app-header';

export default function SalesStackLayout() {
  // const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // const handleOpenSheet = () => {
  //   bottomSheetModalRef.current?.present();
  // };
  // // 1. Resolves a complete style object (e.g., { backgroundColor: '#...' })
  // const headerBgStyle = useResolveClassNames('bg-background');

  // // 2. Extracts a raw string value for props that don't accept objects
  // // Make sure this variable matches what you set in your global.css @theme
  // const headerTintColor = useCSSVariable('--color-foreground');

  // // (Fallback: If you don't use CSS variables for colors, you can do:
  // // const headerTintColor = useResolveClassNames('text-foreground').color )
  const header = useAppHeader();
  return (
    <>
      <Stack screenOptions={header}>
        {/* Hub Screen: Custom Header with Org Switcher */}
        <Stack.Screen name="index" options={{ title: 'Home' }} />

        {/* Nested Screen: Default Header with Native Back Button */}
        <Stack.Screen
          name="users"
          options={{
            title: 'Manage Users',
          }}
        />
        <Stack.Screen
          name="roles"
          options={{
            title: 'Manage Roles',
          }}
        />
      </Stack>
    </>
  );
}
