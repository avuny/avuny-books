import React from 'react';
import { Drawer } from 'expo-router/drawer';

export default function WorkspaceDrawerLayout() {
  return (
    <Drawer screenOptions={{ headerShown: true }}>
      <Drawer.Screen name="index" options={{ title: 'Dashboard' }} />
    </Drawer>
  );
}
