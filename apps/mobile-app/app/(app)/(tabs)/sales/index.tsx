import { View, TouchableOpacity } from 'react-native';
import { Link, useTheme } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Text } from '@/components/ui/text';

export default function SalesHub() {
  const { colors } = useTheme();

  return (
    <View className="bg-background flex-1 p-4">
      <Text variant="h3" className="mt-3">
        Sales Hub
      </Text>
      <Text variant="muted" className="mb-6">
        Manage orders, customers, and receipts
      </Text>

      <Link href="/(app)/(tabs)/sales/customers" asChild>
        <TouchableOpacity className="bg-card border-border rounded-2xl border p-5 shadow-sm">
          <View className="mb-3 flex-row items-center justify-between">
            <Ionicons name="people" size={24} color={colors.primary} />
            <Text variant="small" className="text-muted-foreground">
              Customers &gt;
            </Text>
          </View>
          {/* Using text-4xl from your h1 variant but keeping it as default so it stays inline with standard text tags */}
          <Text className="text-foreground text-4xl font-extrabold">218</Text>
          <Text variant="muted" className="mt-1">
            Total Clients
          </Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
