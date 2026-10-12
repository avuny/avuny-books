import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import atomic design system primitives (@/components/ui)
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MenuLinks } from '@/components/avuny/menu-links';
import { Group, User, UserRoundIcon } from 'lucide-react-native';
import { useGetSidebar } from '@/api';
import { mapSidebarOptionsToMenuLinks } from '@/features/layout/map-sidebar';
import { GetSidebar200ItemOptionsItemName } from '@/api/model';

export default function RestrictedHomeDashboard() {
  // Use React Native's native color scheme hook with Uniwind
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { data: sidebarData = [] } = useGetSidebar();
  const sidebarMap = new Map(sidebarData.map((item) => [item.name, item]));
  const userSidebarItem = sidebarMap.get('users');
  const USER_MENU_CONFIG = {
    user: {
      href: '/(app)/(tabs)/home/users/users',
      icon: User,
      description: 'Users of Organization',
      metric: 218,
    },
    role: {
      href: '/(app)/(tabs)/home/users/roles',
      icon: Group,
      description: 'Roles of Organization',
      metric: 42,
    },
  } as const;
  const userLinks = mapSidebarOptionsToMenuLinks(userSidebarItem, USER_MENU_CONFIG);

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <ScrollView
      className="flex-1 bg-slate-50 dark:bg-slate-950"
      contentContainerStyle={{ padding: 16 }}>
      <View className="flex-1">
        <MenuLinks
          header={userSidebarItem?.label ?? 'Users'}
          subHeader="Manage users and roles"
          links={userLinks}
        />
      </View>
      {/* 1. Personalized Header */}
      <View className="mt-3 mb-6 flex-row items-center justify-between">
        <View>
          <Text className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Good morning, Karim
          </Text>
          <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">{currentDate}</Text>
        </View>
        <Avatar className="h-12 w-12 bg-blue-600 dark:bg-blue-500" alt={''}>
          <AvatarFallback className="text-lg font-bold text-white">K</AvatarFallback>
        </Avatar>
      </View>

      {/* 2. Shift & Status Card */}
      <Card className="mb-8 border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <CardContent className="flex-row items-center justify-between p-5">
          <View className="flex-row items-center">
            <Ionicons name="time" size={24} color={isDark ? '#60a5fa' : '#2563eb'} />
            <View className="ml-3">
              <Text className="text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                Current Shift
              </Text>
              <Text className="mt-0.5 text-base font-bold text-slate-900 dark:text-slate-50">
                09:00 AM - 05:00 PM
              </Text>
            </View>
          </View>
          <Button variant="destructive" size="sm" className="bg-red-100 dark:bg-red-950/40">
            <Text className="text-sm font-semibold text-red-600 dark:text-red-400">Clock Out</Text>
          </Button>
        </CardContent>
      </Card>

      {/* 3. Daily Actionable Tasks */}
      <Text className="mb-3 text-lg font-bold text-slate-900 dark:text-slate-50">
        Today's Tasks
      </Text>
      <Card className="mb-8 border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <CardContent className="p-2">
          {/* Task Row 1 */}
          <TouchableOpacity className="flex-row items-center border-b border-slate-100 p-3 dark:border-slate-800">
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/40">
              <Ionicons name="warning" size={18} color={isDark ? '#fbbf24' : '#d97706'} />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                Follow up: Quote #1042
              </Text>
              <Text className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Global Industries • Due in 2 hrs
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={isDark ? '#475569' : '#94a3b8'} />
          </TouchableOpacity>

          {/* Task Row 2 */}
          <TouchableOpacity className="flex-row items-center p-3">
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/40">
              <Ionicons name="cube" size={18} color={isDark ? '#34d399' : '#16a34a'} />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                Verify Return RM-99
              </Text>
              <Text className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Warehouse A • Pending inspection
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={isDark ? '#475569' : '#94a3b8'} />
          </TouchableOpacity>
        </CardContent>
      </Card>

      {/* 4. Recent Personal Activity */}
      <Text className="mb-3 text-lg font-bold text-slate-900 dark:text-slate-50">
        My Recent Activity
      </Text>
      <View className="px-2 pb-10">
        {/* Timeline Row 1 */}
        <View className="min-h-15 flex-row">
          <View className="w-6 items-center">
            <View className="mt-1.5 h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            <View className="mt-1 w-0.5 flex-1 bg-slate-200 dark:bg-slate-800" />
          </View>
          <View className="flex-1 pb-5 pl-3">
            <Text className="text-sm text-slate-700 dark:text-slate-300">
              Created Sales Order{' '}
              <Text className="font-bold text-slate-900 dark:text-slate-50">SO-2023</Text>
            </Text>
            <Text className="mt-1 text-xs text-slate-400 dark:text-slate-500">10:14 AM</Text>
          </View>
        </View>

        {/* Timeline Row 2 */}
        <View className="min-h-15 flex-row">
          <View className="w-6 items-center">
            <View className="mt-1.5 h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
          </View>
          <View className="flex-1 pb-5 pl-3">
            <Text className="dark:text-accent-foreground text-sm text-slate-700">
              Logged in to Avuny IMS
            </Text>
            <Text className="mt-1 text-xs text-slate-400 dark:text-slate-500">08:55 AM</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
