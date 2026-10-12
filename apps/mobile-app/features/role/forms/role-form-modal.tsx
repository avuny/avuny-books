import React, { forwardRef } from 'react';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { AppModal } from '@/components/avuny/modal';
import { CreateRoleForm, UpdateRoleForm } from '@/features/role';
import { GetRoleByIdResponse } from '@/lib/schemas';

interface RoleFormModalProps {
  onSuccess?: () => void;
  role?: GetRoleByIdResponse;
}

export const RoleFormModal = forwardRef<BottomSheetModal, RoleFormModalProps>(
  ({ onSuccess, role }, ref) => {
    const isEdit = !!role;

    return (
      <AppModal
        ref={ref}
        // title={isEdit ? 'Update Role' : 'Create Role'}
        // description={isEdit ? 'Update an existing role.' : 'Create a new role.'}
        snapPoints={['85%', '100%']}>
        {isEdit ? (
          <UpdateRoleForm
            dismissSheet={{
              ref: ref as React.RefObject<BottomSheetModal>,
            }}
            role={role}
            onSuccess={onSuccess}
          />
        ) : (
          <CreateRoleForm
            onSuccess={onSuccess}
            dismissSheet={{
              ref: ref as React.RefObject<BottomSheetModal>,
            }}
          />
        )}
      </AppModal>
    );
  }
);
