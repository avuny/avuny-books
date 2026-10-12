import React, { useRef } from 'react';
import { View, Keyboard } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Combobox } from '@/components/avuny/bottom-sheet';
import { useSelectedOrganizationContext } from '@/context/selected-org-provider';
import { CreateOrganizationModal } from '@/features/organization/forms/create-organization-modal';

export interface Organization {
  id: string;
  name: string;
}

interface OrganizationComboBoxProps {
  organizations: Organization[];
  onCreateOrganization?: (name: string) => void;
}

const CREATE_ACTION_ID = 'CREATE_NEW_ORG_TRIGGER';

export function OrganizationComboBox({
  organizations,
  onCreateOrganization,
}: OrganizationComboBoxProps) {
  const { selectedOrganizationId, setSelectedOrganizationId } = useSelectedOrganizationContext();

  // 1. Create a native ref for the Create Organization modal
  const createModalRef = useRef<BottomSheetModal>(null);

  const extendedOrganizations = [
    ...organizations,
    { id: CREATE_ACTION_ID, name: '＋ Create New Organization' },
  ];

  const handleSelect = (id: string) => {
    if (id === CREATE_ACTION_ID) {
      Keyboard.dismiss();

      // 2. Open it imperatively with a tiny delay so the Combobox can close smoothly
      setTimeout(() => {
        createModalRef.current?.present();
      }, 150);
    } else {
      setSelectedOrganizationId(id);
    }
  };

  return (
    <View>
      <View className="pr-4">
        <Combobox
          variant="ghost"
          options={extendedOrganizations}
          value={selectedOrganizationId ?? ''}
          onSelect={handleSelect}
          placeholder="Select organization..."
          searchPlaceholder="Search organizations..."
        />
      </View>

      {/* 3. Attach the ref, no more boolean state! */}
      <CreateOrganizationModal
        ref={createModalRef}
        onSuccess={() => createModalRef.current?.dismiss()}
      />
    </View>
  );
}
