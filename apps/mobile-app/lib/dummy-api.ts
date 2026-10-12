/**
 * Dummy Data and Functions for Mobile App screens.
 *
 * NOTE: These dummy implementations replace backend endpoints that
 * do not exist yet in the new project. When real backend endpoints are ready,
 * replace these dummy hooks and functions with generated Orval clients.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { GetRoleByIdResponse, RolePermissionItem } from './schemas';

// ============================================================================
// Types
// ============================================================================

export interface AuthUser {
  id: string;
  identifier: string;
  name: string;
  createdAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  tokens: AuthTokens;
  user: AuthUser;
}

export interface Organization {
  id: string;
  name: string;
}

export interface Country {
  id: string;
  name: string;
}

export interface State {
  id: string;
  name: string;
}

export interface GetSidebarOption {
  name: string;
  label: string;
}

export type GetSidebar200ItemOptionsItemName = string;

export interface GetSidebar200Item {
  name: string;
  label: string;
  options: GetSidebarOption[];
}

export interface Role {
  id: string;
  name: string;
  description?: string | null;
  isSystem?: boolean;
  priority?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetRoles200 {
  items: Role[];
}

export interface RoleListCursor200 {
  data: {
    items: Role[];
    meta: {
      nextCursor?: string | null;
    };
  };
}

export interface PermissionAction {
  id: string;
  label: string;
}

export interface PermissionResource {
  id: string;
  label: string;
}

export interface MatrixPermission {
  id: string;
  actionId: string;
  resourceId: string;
}

export interface PermissionsMatrixData {
  resources: PermissionResource[];
  actions: PermissionAction[];
  permissions: MatrixPermission[];
}

// ============================================================================
// Initial Dummy Fixtures
// ============================================================================

export const DUMMY_USER: AuthUser = {
  id: 'usr-admin-1',
  identifier: 'karim@avuny.com',
  name: 'Karim Admin',
  createdAt: '2026-01-01T08:00:00Z',
};

export const DUMMY_TOKENS: AuthTokens = {
  accessToken: 'dummy-access-token-12345',
  refreshToken: 'dummy-refresh-token-67890',
};

export let dummyOrganizations: Organization[] = [
  { id: 'org-main', name: 'Avuny Headquarters' },
  { id: 'org-cairo', name: 'Cairo Branch' },
  { id: 'org-dubai', name: 'Dubai Logistics Hub' },
];

export const DUMMY_COUNTRIES: Country[] = [
  { id: 'c-egypt', name: 'Egypt' },
  { id: 'c-uae', name: 'United Arab Emirates' },
  { id: 'c-ksa', name: 'Saudi Arabia' },
  { id: 'c-us', name: 'United States' },
];

export const DUMMY_STATES: Record<string, State[]> = {
  'c-egypt': [
    { id: 's-cairo', name: 'Cairo' },
    { id: 's-giza', name: 'Giza' },
    { id: 's-alex', name: 'Alexandria' },
  ],
  'c-uae': [
    { id: 's-dubai', name: 'Dubai' },
    { id: 's-abudhabi', name: 'Abu Dhabi' },
    { id: 's-sharjah', name: 'Sharjah' },
  ],
  'c-ksa': [
    { id: 's-riyadh', name: 'Riyadh' },
    { id: 's-jeddah', name: 'Jeddah' },
    { id: 's-dammam', name: 'Dammam' },
  ],
  'c-us': [
    { id: 's-ny', name: 'New York' },
    { id: 's-ca', name: 'California' },
    { id: 's-tx', name: 'Texas' },
  ],
};

export const DUMMY_SIDEBAR_MODULES: GetSidebar200Item[] = [
  {
    name: 'users',
    label: 'Users & Roles',
    options: [
      { name: 'user', label: 'Users' },
      { name: 'role', label: 'Roles' },
    ],
  },
  {
    name: 'purchases',
    label: 'Purchases',
    options: [
      { name: 'orders', label: 'Purchase Orders' },
      { name: 'vendors', label: 'Vendors' },
    ],
  },
  {
    name: 'inventory',
    label: 'Inventory',
    options: [
      { name: 'items', label: 'Inventory Items' },
      { name: 'warehouses', label: 'Warehouses' },
    ],
  },
  {
    name: 'sales',
    label: 'Sales',
    options: [
      { name: 'orders', label: 'Sales Orders' },
      { name: 'customers', label: 'Customers' },
    ],
  },
];

export let dummyRoles: Role[] = [
  {
    id: 'role-1',
    name: 'Owner / Administrator',
    description: 'Full access to all system features and tenant configuration.',
    isSystem: true,
    priority: 1,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'role-2',
    name: 'Inventory Manager',
    description: 'Manage warehouse stock, count adjustments, and transfers.',
    isSystem: false,
    priority: 2,
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'role-3',
    name: 'Sales Representative',
    description: 'Create customer quotes, orders, and track deliveries.',
    isSystem: false,
    priority: 3,
    createdAt: '2026-02-10T00:00:00Z',
    updatedAt: '2026-02-15T00:00:00Z',
  },
  {
    id: 'role-4',
    name: 'Purchasing Officer',
    description: 'Manage purchase orders, suppliers, and incoming bills.',
    isSystem: false,
    priority: 4,
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-03-05T00:00:00Z',
  },
  {
    id: 'role-5',
    name: 'Auditor (Read Only)',
    description: 'Inspect transactions, books, and financial ledger records.',
    isSystem: true,
    priority: 5,
    createdAt: '2026-03-10T00:00:00Z',
    updatedAt: '2026-03-12T00:00:00Z',
  },
];

export const DUMMY_PERMISSIONS_MATRIX: PermissionsMatrixData = (() => {
  const resources: PermissionResource[] = [
    { id: 'res-org', label: 'Organization Settings' },
    { id: 'res-users', label: 'Users & Roles' },
    { id: 'res-inventory', label: 'Inventory & Items' },
    { id: 'res-sales', label: 'Sales & Invoices' },
    { id: 'res-purchases', label: 'Purchases & Bills' },
    { id: 'res-cash', label: 'Cash & Bank Accounts' },
  ];

  const actions: PermissionAction[] = [
    { id: 'act-view', label: 'View' },
    { id: 'act-create', label: 'Create' },
    { id: 'act-edit', label: 'Edit' },
    { id: 'act-delete', label: 'Delete' },
  ];

  const permissions: MatrixPermission[] = [];
  for (const r of resources) {
    for (const a of actions) {
      permissions.push({
        id: `perm-${r.id}-${a.id}`,
        resourceId: r.id,
        actionId: a.id,
      });
    }
  }

  return { resources, actions, permissions };
})();

// Role permission assignments storage
export const dummyRolePermissions: Record<string, RolePermissionItem[]> = {
  'role-1': DUMMY_PERMISSIONS_MATRIX.permissions.map((p) => ({ id: `rp-${p.id}`, permissionId: p.id })),
  'role-2': DUMMY_PERMISSIONS_MATRIX.permissions
    .filter((p) => p.resourceId === 'res-inventory')
    .map((p) => ({ id: `rp-${p.id}`, permissionId: p.id })),
  'role-3': DUMMY_PERMISSIONS_MATRIX.permissions
    .filter((p) => p.resourceId === 'res-sales')
    .map((p) => ({ id: `rp-${p.id}`, permissionId: p.id })),
  'role-4': DUMMY_PERMISSIONS_MATRIX.permissions
    .filter((p) => p.resourceId === 'res-purchases')
    .map((p) => ({ id: `rp-${p.id}`, permissionId: p.id })),
  'role-5': DUMMY_PERMISSIONS_MATRIX.permissions
    .filter((p) => p.actionId === 'act-view')
    .map((p) => ({ id: `rp-${p.id}`, permissionId: p.id })),
};

// ============================================================================
// Query Keys
// ============================================================================

export const getIsAuthenticatedQueryKey = () => ['/api/auth/me'] as const;
export const getOrganizationListQueryKey = () => ['/api/organizations'] as const;
export const getGetSidebarQueryKey = () => ['/api/navigation/sidebar'] as const;
export const getRoleListQueryKey = () => ['/api/roles'] as const;
export const getGetRolesQueryKey = () => ['/api/roles'] as const;
export const getGetRoleByIdQueryKey = (id: string) => ['/api/roles', id] as const;
export const getRoleListCursorQueryKey = (params?: unknown) => ['/api/roles/cursor', params] as const;
export const getPermissionsMatrixQueryKey = () => ['/api/permissions/matrix'] as const;

// ============================================================================
// Auth Hooks
// ============================================================================

export function useIsAuthenticated(options?: { query?: { queryKey?: readonly unknown[]; retry?: number; staleTime?: number; gcTime?: number } }) {
  return useQuery({
    queryKey: options?.query?.queryKey ?? getIsAuthenticatedQueryKey(),
    queryFn: async () => ({
      data: DUMMY_USER,
      success: true,
      status: 200,
    }),
    staleTime: options?.query?.staleTime ?? 1000 * 60 * 5,
  });
}

export function useSignIn(options?: {
  mutation?: {
    onSuccess?: (data: { data: AuthResponse }) => void;
  };
}) {
  return useMutation({
    mutationFn: async (variables: { data: { identifier: string; password: string } }) => {
      // Simulate network latency
      await new Promise((resolve) => setTimeout(resolve, 300));
      return {
        data: {
          tokens: DUMMY_TOKENS,
          user: {
            ...DUMMY_USER,
            identifier: variables.data.identifier || DUMMY_USER.identifier,
          },
        },
      };
    },
    onSuccess: (data) => {
      options?.mutation?.onSuccess?.(data);
    },
  });
}

export function useSignUp(options?: {
  mutation?: {
    onSuccess?: (data: { data: AuthResponse }) => void;
  };
}) {
  return useMutation({
    mutationFn: async (variables: { data: { identifier: string; name: string; password: string } }) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return {
        data: {
          tokens: DUMMY_TOKENS,
          user: {
            ...DUMMY_USER,
            identifier: variables.data.identifier,
            name: variables.data.name,
          },
        },
      };
    },
    onSuccess: (data) => {
      options?.mutation?.onSuccess?.(data);
    },
  });
}

export function useSignOut(options?: {
  mutation?: {
    onSuccess?: () => Promise<void> | void;
  };
}) {
  return useMutation({
    mutationFn: async (_variables?: { data?: Record<string, unknown> }) => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return { success: true };
    },
    onSuccess: () => {
      options?.mutation?.onSuccess?.();
    },
  });
}

export const signOut = async () => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return { success: true };
};

// ============================================================================
// Organizations Hooks
// ============================================================================

export function useOrganizationList() {
  return useQuery({
    queryKey: getOrganizationListQueryKey(),
    queryFn: async () => ({
      data: {
        list: [...dummyOrganizations],
      },
    }),
  });
}

export function useCountryList() {
  return useQuery({
    queryKey: ['/api/countries'],
    queryFn: async () => [...DUMMY_COUNTRIES],
  });
}

export function useStateList(
  params: { countryId?: string },
  options?: { query?: { enabled?: boolean; queryKey?: readonly unknown[] } }
) {
  return useQuery({
    queryKey: options?.query?.queryKey ?? ['/api/states', params.countryId],
    enabled: options?.query?.enabled ?? !!params.countryId,
    queryFn: async () => {
      if (!params.countryId) return [];
      return DUMMY_STATES[params.countryId] ?? [
        { id: `${params.countryId}-st1`, name: 'Central District' },
        { id: `${params.countryId}-st2`, name: 'North Province' },
      ];
    },
  });
}

export function useCreateOrganization(options?: {
  mutation?: {
    onSuccess?: (data: { data: Organization }) => void;
  };
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (variables: { data: { name: string; [key: string]: unknown } }) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const newOrg: Organization = {
        id: `org-${Date.now()}`,
        name: variables.data.name,
      };
      dummyOrganizations.push(newOrg);
      return { data: newOrg };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: getOrganizationListQueryKey() });
      options?.mutation?.onSuccess?.(data);
    },
  });
}

// ============================================================================
// Sidebar Navigation Hooks
// ============================================================================

export function useGetSidebar() {
  return useQuery({
    queryKey: getGetSidebarQueryKey(),
    queryFn: async () => [...DUMMY_SIDEBAR_MODULES],
  });
}

// ============================================================================
// Roles & Permissions Hooks
// ============================================================================

export async function roleListCursor(params: {
  organizationId: string;
  cursor?: string;
  take?: number;
  searchQuery?: string;
  where?: { isSystem?: boolean };
  sort?: { field: string; direction: 'asc' | 'desc' };
}): Promise<RoleListCursor200> {
  await new Promise((resolve) => setTimeout(resolve, 150));

  let items = [...dummyRoles];

  // Apply search query
  if (params.searchQuery) {
    const q = params.searchQuery.toLowerCase();
    items = items.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (r.description && r.description.toLowerCase().includes(q))
    );
  }

  // Apply where filter
  if (params.where?.isSystem !== undefined) {
    items = items.filter((r) => r.isSystem === params.where?.isSystem);
  }

  // Apply sort
  if (params.sort) {
    const { field, direction } = params.sort;
    items.sort((a, b) => {
      const valA = (a as unknown as Record<string, unknown>)[field] ?? '';
      const valB = (b as unknown as Record<string, unknown>)[field] ?? '';
      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  return {
    data: {
      items,
      meta: {
        nextCursor: null,
      },
    },
  };
}

export function useRoleListCursor() {
  return useQuery({
    queryKey: getRoleListCursorQueryKey(),
    queryFn: async () => ({
      data: {
        items: [...dummyRoles],
        meta: { nextCursor: null },
      },
    }),
  });
}

export function useGetRoleById(
  id: string,
  options?: { query?: { enabled?: boolean; queryKey?: readonly unknown[] } }
) {
  return useQuery({
    queryKey: options?.query?.queryKey ?? getGetRoleByIdQueryKey(id),
    enabled: options?.query?.enabled ?? !!id,
    queryFn: async (): Promise<{ data: GetRoleByIdResponse }> => {
      const found = dummyRoles.find((r) => r.id === id);
      if (!found) {
        throw new Error('Role not found');
      }
      return {
        data: {
          ...found,
          rolePermissions: dummyRolePermissions[id] ?? [],
        },
      };
    },
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (variables: {
      data: {
        name: string;
        description?: string | null;
        permissions?: RolePermissionItem[];
        [key: string]: unknown;
      };
    }) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const newRole: Role = {
        id: `role-${Date.now()}`,
        name: variables.data.name,
        description: variables.data.description,
        isSystem: false,
        priority: dummyRoles.length + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      dummyRoles.unshift(newRole);
      if (variables.data.permissions) {
        dummyRolePermissions[newRole.id] = variables.data.permissions;
      }
      return { data: newRole };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getRoleListQueryKey() });
      queryClient.invalidateQueries({ queryKey: ['/api/roles/cursor'] });
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (variables: {
      id: string;
      data: {
        name: string;
        description?: string | null;
        permissions?: RolePermissionItem[];
        [key: string]: unknown;
      };
    }) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const idx = dummyRoles.findIndex((r) => r.id === variables.id);
      if (idx !== -1) {
        dummyRoles[idx] = {
          ...dummyRoles[idx],
          name: variables.data.name,
          description: variables.data.description,
          updatedAt: new Date().toISOString(),
        };
      }
      if (variables.data.permissions) {
        dummyRolePermissions[variables.id] = variables.data.permissions;
      }
      return { data: dummyRoles[idx] };
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: getGetRoleByIdQueryKey(vars.id) });
      queryClient.invalidateQueries({ queryKey: getRoleListQueryKey() });
      queryClient.invalidateQueries({ queryKey: ['/api/roles/cursor'] });
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (variables: { id: string }) => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      dummyRoles = dummyRoles.filter((r) => r.id !== variables.id);
      delete dummyRolePermissions[variables.id];
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getRoleListQueryKey() });
      queryClient.invalidateQueries({ queryKey: ['/api/roles/cursor'] });
    },
  });
}

export function useGetPermissionsMatrix() {
  return useQuery({
    queryKey: getPermissionsMatrixQueryKey(),
    queryFn: async () => ({
      data: DUMMY_PERMISSIONS_MATRIX,
    }),
  });
}
