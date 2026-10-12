import React, { forwardRef } from 'react';
import { View, Pressable } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Check, ArrowUp, ArrowDown } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import {
  RoleSortField,
  RoleSortOption,
  SortDirection,
} from '@/features/role/list/hooks/use-role-list';
import { AppModal } from '@/components/avuny/modal';

interface RoleFilterSortModalProps {
  currentSort: RoleSortOption;
  onSortChange: (sort: RoleSortOption) => void;
  onClose: () => void;
}

export const RoleFilterSortModal = forwardRef<BottomSheetModal, RoleFilterSortModalProps>(
  ({ currentSort, onSortChange, onClose }, ref) => {
    const { t } = useTranslation('common');

    const sortOptions: { label: string; field: RoleSortField }[] = [
      { label: 'Date Created', field: 'createdAt' },
      { label: 'Last Updated', field: 'updatedAt' },
      { label: 'Role Name', field: 'name' },
      { label: 'Priority', field: 'priority' },
    ];

    const handleSortFieldSelect = (field: RoleSortField) => {
      if (currentSort.field === field) {
        onSortChange({
          field,
          direction: currentSort.direction === 'asc' ? 'desc' : 'asc',
        });
      } else {
        const defaultDirection: SortDirection = field.includes('At') ? 'desc' : 'asc';
        onSortChange({ field, direction: defaultDirection });
      }
    };

    const footer = (
      <Button onPress={onClose} className="w-full">
        <Text>Done</Text>
      </Button>
    );

    return (
      <AppModal
        ref={ref}
        title="Sort Roles"
        description="Select a field to sort the role list by."
        snapPoints={['50%', '65%']}
        footer={footer}
        scrollable={true}>
        <View className="gap-2">
          {sortOptions.map((option) => {
            const isActive = currentSort.field === option.field;

            return (
              <Pressable
                key={option.field}
                onPress={() => handleSortFieldSelect(option.field)}
                className={cn(
                  'flex-row items-center justify-between rounded-xl border p-4',
                  isActive ? 'bg-primary/10 border-primary' : 'bg-card border-border'
                )}>
                <Text
                  className={cn(
                    'text-base font-medium',
                    isActive ? 'text-primary' : 'text-foreground'
                  )}>
                  {option.label}
                </Text>

                {isActive && (
                  <View className="flex-row items-center gap-2">
                    <Icon
                      as={currentSort.direction === 'asc' ? ArrowUp : ArrowDown}
                      size={18}
                      className="text-primary"
                    />
                    <Icon as={Check} size={20} className="text-primary" />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </AppModal>
    );
  }
);

RoleFilterSortModal.displayName = 'RoleFilterSortModal';
