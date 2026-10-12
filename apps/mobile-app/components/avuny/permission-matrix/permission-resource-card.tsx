import { View } from 'react-native';

import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';

import { Action, Permission, Resource } from './permission-matrix';
import { PermissionActionChip } from './permission-action-chip';

type Props = {
  resource: Resource;
  actions: Action[];
  permissions: Permission[];
  selected: Set<string>;
  onToggle: (permissionId: string) => void;
};

export function PermissionResourceCard({
  resource,
  actions,
  permissions,
  selected,
  onToggle,
}: Props) {
  return (
    <Card className="gap-4 rounded-2xl p-4">
      <Text className="text-foreground text-base font-semibold">{resource.label}</Text>

      <View className="-m-1 flex-row flex-wrap">
        {actions.map((action) => {
          const permission = permissions.find(
            (p) => p.resourceId === resource.id && p.actionId === action.id
          );

          if (!permission) return null;

          return (
            <View key={permission.id} className="w-1/2 p-3">
              <PermissionActionChip
                checked={selected.has(permission.id)}
                label={action.label}
                onPress={() => onToggle(permission.id)}
              />
            </View>
          );
        })}
      </View>
    </Card>
  );
}
