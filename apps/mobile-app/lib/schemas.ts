import { z } from '@avuny/zod';

export const mutateOrganizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
  description: z.string().nullable().optional(),
  countryId: z.string().optional(),
  stateId: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  zipCode: z.string().nullable().optional(),
  industryCategoryId: z.string().nullable().optional(),
  fiscalYearPatternId: z.string().nullable().optional(),
  inventoryStartDate: z.string().optional(),
});

export const mutateRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required'),
  description: z.string().nullable().optional(),
  permissions: z.array(z.any()).optional(),
  customPermissions: z.array(z.any()).optional(),
});

export interface RolePermissionItem {
  id: string;
  permissionId: string;
}

export interface GetRoleByIdResponse {
  id: string;
  name: string;
  description?: string | null;
  isSystem?: boolean;
  priority?: number;
  rolePermissions: RolePermissionItem[];
  createdAt?: string;
  updatedAt?: string;
}
