import React, { useRef } from 'react';
import { Keyboard, View } from 'react-native';
import { ChevronDown, ShieldCheck } from 'lucide-react-native';

import { AppModal } from '@/components/avuny/modal';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';

import { GetRoleByIdResponse } from '@/lib/schemas';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import RolePermissions from '@/features/role/forms/role-permissions';

export type PermissionSelectorProps = {
  permissions: GetRoleByIdResponse['rolePermissions'];
  setPermissions: React.Dispatch<React.SetStateAction<GetRoleByIdResponse['rolePermissions']>>;
};

export function PermissionsModal({ permissions, setPermissions }: PermissionSelectorProps) {
  const modalRef = useRef<BottomSheetModal>(null);

  const openModal = () => {
    Keyboard.dismiss();

    setTimeout(() => {
      modalRef.current?.present();
    }, 150);
  };

  return (
    <>
      <Button variant="outline" className="h-12 justify-between rounded-lg" onPress={openModal}>
        <View className="flex-row items-center gap-3">
          <Icon as={ShieldCheck} />
          <Text className="text-foreground">
            {permissions.length > 0
              ? `${permissions.length} permission${permissions.length > 1 ? 's' : ''} selected`
              : 'Select permissions'}
          </Text>
        </View>

        <Icon as={ChevronDown} />
      </Button>

      <AppModal ref={modalRef} scrollable title="Select Permissions" snapPoints={['85%', '100%']}>
        <RolePermissions selectedPermissions={permissions} setPermissions={setPermissions} />
      </AppModal>
    </>
  );
}
