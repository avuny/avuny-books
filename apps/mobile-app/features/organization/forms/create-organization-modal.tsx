import React, { forwardRef } from 'react';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { AppModal } from '@/components/avuny/modal';
import { CreateOrganizationForm } from '@/features/organization';

interface CreateOrganizationModalProps {
  onSuccess?: () => void;
}

export const CreateOrganizationModal = forwardRef<BottomSheetModal, CreateOrganizationModalProps>(
  ({ onSuccess }, ref) => {
    return (
      <AppModal
        ref={ref}
        title="Create Organization"
        description="Create a new organization."
        snapPoints={['85%', '100%']}>
        <CreateOrganizationForm onSuccess={onSuccess} />
      </AppModal>
    );
  }
);
