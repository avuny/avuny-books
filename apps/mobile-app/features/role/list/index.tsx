import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner-native';

import {
  getGetRoleByIdQueryKey,
  getRoleListCursorQueryKey,
  useDeleteRole,
  useGetRoleById,
} from '@/api';
import { MobileDataList } from '@/components/avuny/data-list';
import { Text } from '@/components/ui/text';
import { RoleFormModal } from '@/features/role/forms/role-form-modal';
import { RoleFilterSortModal } from '@/features/role/list/role-filter-sort-modal';
import { RoleCard } from '@/features/role/list/card';
import { Role } from '@/features/role/list/types';
import { useRolesList } from '@/features/role/list/hooks/use-role-list';

// Constants typically stored in a `constants.ts` file
const ROLE_FILTER_OPTIONS = [
  { label: 'All Roles', value: 'all' },
  { label: 'System Roles', value: 'system' },
  { label: 'Custom Roles', value: 'custom' },
];

export function RoleList() {
  const formModalRef = useRef<BottomSheetModal>(null);
  const filterModalRef = useRef<BottomSheetModal>(null);

  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);

  const { data: roleResponse, isFetching: isFetchingRole } = useGetRoleById(editingRoleId ?? '', {
    query: { enabled: !!editingRoleId, queryKey: getGetRoleByIdQueryKey(editingRoleId || '') },
  });
  const role = roleResponse?.data;

  const { mutateAsync: deleteRole } = useDeleteRole();
  const queryClient = useQueryClient();
  const { t: tCommon } = useTranslation('common');

  // Using our refactored hook
  const {
    roles,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    searchQuery,
    setSearchQuery,
    activeFilterChip,
    setActiveFilterChip,
    sort,
    setSort,
    error,
  } = useRolesList();

  const successToast = tCommon('msgs.delete', { thing: tCommon('entities.role') });

  // Modal Triggers
  const openFormModal = useCallback(
    () => requestAnimationFrame(() => formModalRef.current?.present()),
    []
  );
  const openFilterModal = useCallback(
    () => requestAnimationFrame(() => filterModalRef.current?.present()),
    []
  );
  const closeFilterModal = useCallback(
    () => requestAnimationFrame(() => filterModalRef.current?.dismiss()),
    []
  );

  const handleCreateRole = useCallback(() => {
    setIsCreateMode(true);
    setEditingRoleId(null);
    openFormModal();
  }, [openFormModal]);

  const handleEditRole = useCallback((role: Role) => {
    setIsCreateMode(false);
    setEditingRoleId(role.id);
  }, []);

  useEffect(() => {
    if (!isCreateMode && editingRoleId && role && !isFetchingRole) {
      openFormModal();
    }
  }, [editingRoleId, role, isFetchingRole, isCreateMode, openFormModal]);

  const handleDeleteRole = useCallback(
    async (role: Role) => {
      await deleteRole({ id: role.id });
      toast.success(successToast);

      // Re-fetch using Orval generated Key
      queryClient.invalidateQueries({
        queryKey: getRoleListCursorQueryKey(),
      });
    },
    [deleteRole, successToast, queryClient]
  );

  const handleModalSuccess = useCallback(() => {
    setEditingRoleId(null);
    setIsCreateMode(false);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Role }) => (
      <RoleCard role={item} onEdit={handleEditRole} onDelete={handleDeleteRole} />
    ),
    [handleEditRole, handleDeleteRole]
  );

  return (
    <View className="bg-background flex-1">
      <MobileDataList
        data={roles}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
        refetch={async () => {
          await refetch();
        }}

        showSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search roles..."

        filterOptions={ROLE_FILTER_OPTIONS}
        activeFilter={activeFilterChip}
        onFilterChange={setActiveFilterChip}

        onFilterMenuClick={openFilterModal}
        onAddClick={handleCreateRole}

        emptyTitle="No roles found"
        emptyDescription="Try changing your search or filters."
        renderItem={renderItem}
      />

      <RoleFormModal ref={formModalRef} role={role} onSuccess={handleModalSuccess} />

      <RoleFilterSortModal
        ref={filterModalRef}
        currentSort={sort}
        onSortChange={setSort}
        onClose={closeFilterModal}
      />

      {error && <Text className="text-destructive p-4">{(error as Error).message}</Text>}
    </View>
  );
}
