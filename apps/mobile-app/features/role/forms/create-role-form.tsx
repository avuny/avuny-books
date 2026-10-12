import { ForwardedRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { GetRoleByIdResponse, mutateRoleSchema as schema } from '@/lib/schemas';
import { z } from '@avuny/zod';

import { getGetRolesQueryKey, getRoleListQueryKey, useCreateRole } from '@/api';
import { FormInput } from '@/components/avuny/FormInput';
import { FormTextarea } from '@/components/avuny/FormTextArea';

import { Form } from '@/components/avuny/form';

import { PermissionsModal } from '@/features/role/forms/role-permissions-modal';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

type FormValues = z.infer<typeof schema>;

export function CreateRoleForm({
  onSuccess,
  dismissSheet,
}: {
  onSuccess?: () => void | Promise<void>;
  dismissSheet?: {
    ref: React.RefObject<BottomSheetModal>;
  };
}) {
  const { isPending, error, mutateAsync } = useCreateRole();
  const [permissions, setPermissions] = useState<GetRoleByIdResponse['rolePermissions']>([]);

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      customPermissions: [],
      permissions: [],
    },
  });

  const onSubmit = async (data: FormValues) => {
    await mutateAsync({ data: { ...data, permissions } });
    await onSuccess?.();
  };

  return (
    <Form
      dismissSheet={dismissSheet}
      methods={methods}
      onSubmit={onSubmit}
      isPending={isPending}
      actionName="create"
      resourceName="role"
      error={{ message: (error as any)?.response?.data?.message ?? error?.message }}
      title="Create Role"
      loadingTitle="Creating..."
      queryInvalidateKey={getGetRolesQueryKey()}>
      <FormInput control={methods.control} name="name" label="Role Name" placeholder="Role Name" />

      <FormTextarea
        control={methods.control}
        name="description"
        label="Description"
        placeholder="Description"
      />

      <PermissionsModal permissions={permissions} setPermissions={setPermissions} />
    </Form>
  );
}
