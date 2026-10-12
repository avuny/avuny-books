import { useMemo, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';

import { getRoleListCursorQueryKey, roleListCursor, useRoleListCursor } from '@/api';
import { useSelectedOrganizationContext } from '@/context/selected-org-provider';
import { ROLES_PAGE_SIZE } from '../constants';
import { RoleListCursor200 } from '@/api/model';

export type RoleSortField = 'name' | 'priority' | 'createdAt' | 'updatedAt';

export type SortDirection = 'asc' | 'desc';

export type RoleSortOption = {
  field: RoleSortField;
  direction: SortDirection;
};

export type RoleWhereFilter = {
  isSystem?: boolean;
};

export function useRolesList() {
  const { selectedOrganizationId } = useSelectedOrganizationContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [whereFilter, setWhereFilter] = useState<RoleWhereFilter>({});

  const [sort, setSort] = useState<RoleSortOption>({
    field: 'createdAt',
    direction: 'desc',
  });

  const query = useInfiniteQuery({
    queryKey: getRoleListCursorQueryKey({
      organizationId: selectedOrganizationId || '',
      searchQuery,
      where: whereFilter,
      sort,
      take: ROLES_PAGE_SIZE,
    }),
    enabled: !!selectedOrganizationId,

    initialPageParam: undefined as string | undefined,

    queryFn: ({ pageParam }) =>
      roleListCursor({
        organizationId: selectedOrganizationId!,
        cursor: pageParam,
        take: ROLES_PAGE_SIZE,
        searchQuery: searchQuery || undefined,
        where: whereFilter,
        sort,
      }),

    getNextPageParam: (lastPage: RoleListCursor200) => lastPage.data.meta.nextCursor ?? undefined,
  });

  const roles = useMemo(
    () => query.data?.pages.flatMap((page) => page.data.items) ?? [],
    [query.data]
  );

  const activeFilterChip = useMemo(() => {
    if (whereFilter.isSystem === true) return 'system';
    if (whereFilter.isSystem === false) return 'custom';
    return 'all';
  }, [whereFilter.isSystem]);

  const setActiveFilterChip = (value: string) => {
    switch (value) {
      case 'system':
        setWhereFilter((prev) => ({
          ...prev,
          isSystem: true,
        }));
        break;

      case 'custom':
        setWhereFilter((prev) => ({
          ...prev,
          isSystem: false,
        }));
        break;

      default:
        setWhereFilter((prev) => ({
          ...prev,
          isSystem: undefined,
        }));
    }
  };

  return {
    roles,

    searchQuery,
    setSearchQuery,

    whereFilter,
    setWhereFilter,

    activeFilterChip,
    setActiveFilterChip,

    sort,
    setSort,

    ...query,
  };
}
