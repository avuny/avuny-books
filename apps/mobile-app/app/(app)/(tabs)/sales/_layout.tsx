import { useRef } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';

import { useResolveClassNames, useCSSVariable } from 'uniwind';
import { Text } from '@/components/ui/text';

export default function SalesStackLayout() {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const handleOpenSheet = () => {
    bottomSheetModalRef.current?.present();
  };
  // 1. Resolves a complete style object (e.g., { backgroundColor: '#...' })
  const headerBgStyle = useResolveClassNames('bg-background');

  // 2. Extracts a raw string value for props that don't accept objects
  // Make sure this variable matches what you set in your global.css @theme
  const headerTintColor = useCSSVariable('--color-foreground');

  // (Fallback: If you don't use CSS variables for colors, you can do:
  // const headerTintColor = useResolveClassNames('text-foreground').color )

  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: headerBgStyle,
          headerTintColor: headerTintColor as string,
          headerShadowVisible: false,
        }}>
        {/* Hub Screen: Custom Header with Org Switcher */}
        <Stack.Screen
          name="index"
          options={{
            headerTitle: '',
            headerLeft: () => (
              <View className="ml-2 flex-row items-center gap-2">
                <Ionicons
                  name="triangle"
                  size={20}
                  // color={colorScheme.primary}
                  style={{ transform: [{ rotate: '90deg' }] }}
                />
                <Text variant="large">Avuny IMS</Text>
              </View>
            ),
            headerRight: () => (
              <View className="mr-2 flex-row items-center gap-3">
                <TouchableOpacity
                  onPress={handleOpenSheet}
                  className="bg-muted flex-row items-center gap-1.5 rounded-full px-3 py-1.5">
                  <Text variant="small">Avuny Main</Text>
                  <Ionicons
                    name="chevron-down"
                    size={14}
                    // color={colorScheme.text}
                  />
                </TouchableOpacity>
                <View className="bg-primary h-8 w-8 items-center justify-center rounded-full">
                  <Text className="text-primary-foreground text-sm font-bold">K</Text>
                </View>
              </View>
            ),
          }}
        />

        {/* Nested Screen: Default Header with Native Back Button */}
        <Stack.Screen
          name="customers"
          options={{
            title: 'Manage Customers',
          }}
        />
      </Stack>
    </>
  );
}
