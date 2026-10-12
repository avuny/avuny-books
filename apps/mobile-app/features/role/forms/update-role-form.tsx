import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { GetRoleByIdResponse, mutateRoleSchema as schema } from '@/lib/schemas';
import { z } from '@avuny/zod';

import {
  getGetRolesQueryKey,
  getRoleListQueryKey,
  useUpdateRole, // <-- use the correct mutation
} from '@/api';

import { Form } from '@/components/avuny/form';
import { FormInput } from '@/components/avuny/FormInput';
import { FormTextarea } from '@/components/avuny/FormTextArea';

import { PermissionsModal } from '@/features/role/forms/role-permissions-modal';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

type FormValues = z.infer<typeof schema>;

interface UpdateRoleFormProps {
  role: GetRoleByIdResponse;
  onSuccess?: () => void | Promise<void>;
  dismissSheet?: {
    ref: React.RefObject<BottomSheetModal>;
  };
}

export function UpdateRoleForm({ role, onSuccess, dismissSheet }: UpdateRoleFormProps) {
  const { mutateAsync, isPending, error } = useUpdateRole();

  const [permissions, setPermissions] = useState<GetRoleByIdResponse['rolePermissions']>(
    role.rolePermissions ?? []
  );

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      description: '',
      permissions: [],
      customPermissions: [],
    },
  });

  useEffect(() => {
    methods.reset({
      ...role,
      permissions: role.rolePermissions ?? [],
    });

    setPermissions(role.rolePermissions ?? []);
  }, [role, methods]);

  useEffect(() => {
    methods.setValue('permissions', permissions, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [permissions, methods]);

  const onSubmit = async (data: FormValues) => {
    await mutateAsync({
      id: role.id,
      data,
    });
    await onSuccess?.();
  };

  return (
    <Form
      methods={methods}
      onSubmit={onSubmit}
      isPending={isPending}
      actionName="update"
      resourceName="role"
      error={{ message: (error as any)?.response?.data?.message ?? error?.message }}
      title="Update Role"
      loadingTitle="Updating..."
      queryInvalidateKey={getGetRolesQueryKey()}
      dismissSheet={dismissSheet}>
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
