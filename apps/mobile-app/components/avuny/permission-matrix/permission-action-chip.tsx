import { Platform, Pressable, View } from 'react-native';
import { Check } from 'lucide-react-native';

import { cn } from '@/lib/utils';

import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

type Props = {
  checked: boolean;
  label: string;
  onPress: () => void;
};

export function PermissionActionChip({ checked, label, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'min-h-12 flex-row items-center rounded-xl border px-4 py-3 active:opacity-70',
        checked ? 'border-primary bg-primary/10' : 'border-border bg-card'
      )}>
      <View className="flex flex-row items-center gap-3">
        <Checkbox id="terms" checked={checked} onCheckedChange={onPress} />
        <Label onPress={Platform.select({ native: onPress })} htmlFor="terms">
          {label}
        </Label>
      </View>
    </Pressable>
  );
}
