import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { useState } from 'react';
import { GetRoleByIdResponse } from '@/lib/schemas';
import RolePermissions from '@/features/role/forms/role-permissions';
import { CreateRoleForm } from '@/features/role';

export default function UsersScreen() {
  const [permissions, setPermissions] = useState<GetRoleByIdResponse['rolePermissions']>([]);

  return <CreateRoleForm />;
}
