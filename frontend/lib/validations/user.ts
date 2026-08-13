import { z } from 'zod';

import { PlanType, Role } from '@/lib/generated/prisma/client';

/**
 * PATCH /api/admin/users/[id] updates one field at a time — the role select
 * and the plan select are independent controls, each firing its own request.
 */
export const updateAdminUserSchema = z.union([
  z.object({ role: z.enum(Role) }),
  z.object({ planType: z.enum(PlanType) }),
]);

export type UpdateAdminUserValues = z.infer<typeof updateAdminUserSchema>;
