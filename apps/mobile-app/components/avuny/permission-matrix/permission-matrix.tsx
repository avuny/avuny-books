import { ScrollView, View } from 'react-native';
import { randomUUID } from 'expo-crypto';

import { PermissionResourceCard } from './permission-resource-card';

export type Action = {
  id: string;
  label: string;
};

export type Resource = {
  id: string;
  label: string;
};

export type Permission = {
  id: string;
  actionId: string;
  resourceId: string;
};

export type SelectedPermission = {
  id: string;
  permissionId: string;
};

type Props<T extends SelectedPermission> = {
  resources: Resource[];
  actions: Action[];
  permissions: Permission[];
  selectedPermissions: T[];
  onChange: (next: T[]) => void;
};

export function PermissionMatrix<T extends SelectedPermission>({
  resources,
  actions,
  permissions,
  selectedPermissions,
  onChange,
}: Props<T>) {
  const selected = new Set(selectedPermissions.map((x) => x.permissionId));

  function toggle(permissionId: string) {
    if (selected.has(permissionId)) {
      onChange(selectedPermissions.filter((x) => x.permissionId !== permissionId));
      return;
    }

    onChange([
      ...selectedPermissions,
      {
        id: randomUUID(),
        permissionId,
      } as T,
    ]);
  }

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="gap-4 p-4"
      showsVerticalScrollIndicator={false}>
      {resources.map((resource) => (
        <PermissionResourceCard
          key={resource.id}
          resource={resource}
          actions={actions}
          permissions={permissions}
          selected={selected}
          onToggle={toggle}
        />
      ))}
    </ScrollView>
  );
}
