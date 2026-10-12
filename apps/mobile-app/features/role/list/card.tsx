import React, { useMemo } from 'react';
import { View } from 'react-native';
import { ShieldAlert, Edit2, Trash2 } from 'lucide-react-native';

import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { DataListCard } from '@/components/avuny/data-list/card';
import { Role } from '@/features/role/list/types';

interface RoleCardProps {
  role: Role;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
}

export const RoleCard = React.memo(function RoleCard({ role, onEdit, onDelete }: RoleCardProps) {
  const menuActions = useMemo(() => {
    if (role.isSystem) return [];

    return [
      {
        id: 'edit',
        label: 'Edit Role',
        icon: Edit2,
        onPress: () => onEdit(role),
      },
      {
        id: 'delete',
        label: 'Delete Role',
        icon: Trash2,
        isDestructive: true,
        onPress: () => onDelete(role),
      },
    ];
  }, [role, onEdit, onDelete]);

  return (
    <View className="px-4 pt-2">
      <DataListCard
        title={role.name}
        description={role.description || 'No description provided'}
        actions={menuActions}
        rightSlot={
          <View className="flex-row items-center gap-2">
            {role.isSystem && <Icon as={ShieldAlert} className="text-destructive size-3.5" />}

            <Badge
              variant={role.isSystem ? 'secondary' : 'default'}
              className="rounded-full px-3 py-1">
              <Text className="text-xs">{role.isSystem ? 'System' : 'Custom'}</Text>
            </Badge>
          </View>
        }
      />
    </View>
  );
});
