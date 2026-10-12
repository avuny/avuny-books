import { View } from 'react-native';

import { Text } from '@/components/ui/text';

export default function CustomersScreen() {
  return (
    <View className="bg-background flex-1 p-4">
      {/* Customer Card 1 */}
      <View className="bg-card border-border mb-3 rounded-xl border p-4 shadow-sm">
        <Text variant="large">Acme Corp</Text>
        <Text variant="muted" className="mt-1">
          Total Spend: $12,450
        </Text>
      </View>

      {/* Customer Card 2 */}
      <View className="bg-card border-border mb-3 rounded-xl border p-4 shadow-sm">
        <Text variant="large">Global Industries</Text>
        <Text variant="muted" className="mt-1">
          Total Spend: $8,200
        </Text>
      </View>
    </View>
  );
}
