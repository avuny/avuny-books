import { Redirect, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { HeaderActionButton } from '@/components/header-action-button';
import i18n from '@/i18n/i18n';
import { ThemeToggle } from '@/components/toggle-theme';
import { usePreferences } from '@/context/PreferencesContext';

import { OrganizationComboBox } from '@/features/organization/organization-combo-box';
import { signOut, useGetSidebar, useOrganizationList } from '@/api';
import { useAuthenticatedHandler } from '@/features/auth';
import { LoadingScreen } from '@/components/avuny/loading-screen';
import { UserPopover } from '@/components/avuny/user-popover';
import { useState } from 'react';
import { useSignOutHandler } from '@/features/auth/hooks/use-sign-out-handler';
import { UserAvatarButton } from '@/components/avuny/user-popover/user-avatat-button';
import { useAppHeader } from '@/features/layout/use-app-header';
import { useSelectedOrganizationContext } from '@/context/selected-org-provider';
export const APP_TABS = [
  {
    key: 'users',
    title: 'Users',
    icon: 'people',
  },
  {
    key: 'purchases',
    title: 'Purchases',
    icon: 'bag',
  },
  {
    key: 'inventory',
    title: 'Inventory',
    icon: 'cube',
  },
  {
    key: 'sales',
    title: 'Sales',
    icon: 'cash',
  },
] as const;
export default function TabsLayout() {
  const { data: sidebarData = [] } = useGetSidebar();
  const { data: userData, error, isPending } = useAuthenticatedHandler();
  const { selectedOrganizationId } = useSelectedOrganizationContext();
  const header = useAppHeader();

  if (isPending) {
    return <LoadingScreen />;
  }
  if (!userData?.data) {
    return <Redirect href={'/(auth)'} />;
  }

  const { id, identifier, name } = userData.data;
  const sidebarMap = new Map(sidebarData.map((item) => [item.name, item]));
  return (
    <View style={{ flex: 1 }}>
      {/** key={selectedOrganizationId} to make tabs rerender when organization change */}
      <Tabs key={selectedOrganizationId}>
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            headerShown: false,
            tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
          }}
        />

        {APP_TABS.map((tab) => {
          const serverTab = sidebarMap.get(tab.key);

          return (
            <Tabs.Screen
              key={tab.key}
              name={tab.key}
              options={{
                href: serverTab ? undefined : null,
                title: serverTab?.name ?? tab.title,
                headerShown: false,
                tabBarIcon: ({ color, size }) => (
                  <Ionicons
                    name={tab.icon as keyof typeof Ionicons.glyphMap}
                    size={size}
                    color={color}
                  />
                ),
              }}
            />
          );
        })}
      </Tabs>
    </View>
  );
}
