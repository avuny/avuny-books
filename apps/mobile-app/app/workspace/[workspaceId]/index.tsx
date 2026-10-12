import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { usePreferences } from '@/context/PreferencesContext';

export default function WorkspaceDashboardCorePage() {
  const { workspaceId } = useLocalSearchParams<{ workspaceId: string }>();
  const { colors } = usePreferences();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.text, { color: colors.text }]}>Workspace Loaded Successfully</Text>

      <Text style={[styles.subText, { color: colors.subtle }]}>
        Active Context ID: {workspaceId}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  text: {
    fontSize: 22,
    fontWeight: '700',
  },
  subText: {
    fontSize: 14,
    marginTop: 8,
  },
});
