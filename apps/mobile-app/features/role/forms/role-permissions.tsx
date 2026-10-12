'use client';

import { GetRoleByIdResponse } from '@/lib/schemas';

import { useGetPermissionsMatrix } from '@/api';
import { LoadingScreen } from '@/components/avuny/loading-screen';
import { PermissionMatrix } from '@/components/avuny/permission-matrix/permission-matrix';
import { Text } from '@/components/ui/text';

interface RolePermissionsProps {
  selectedPermissions: GetRoleByIdResponse['rolePermissions'];
  setPermissions: (permissions: GetRoleByIdResponse['rolePermissions']) => void;
}

export default function RolePermissions({
  selectedPermissions,
  setPermissions,
}: RolePermissionsProps) {
  const { data, isPending, isError } = useGetPermissionsMatrix();

  if (isPending) {
    return <LoadingScreen />;
  }

  if (isError || !data) {
    return <Text className="p-4 text-muted-foreground">Failed to load permissions.</Text>;
  }

  return (
    <PermissionMatrix
      resources={data.data.resources}
      actions={data.data.actions}
      permissions={data.data.permissions}
      selectedPermissions={selectedPermissions}
      onChange={setPermissions}
    />
  );
}
