import { Trash2 } from 'lucide-react';

import type { PlanType, Role } from '@/lib/generated/prisma/client';
import type { listAdminUsers } from '@/lib/data/users';

export type AdminUser = Awaited<ReturnType<typeof listAdminUsers>>[number];

function formatJoinedDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

type UserRowProps = {
  user: AdminUser;
  onRoleChange: (userId: string, role: Role) => void;
  isUpdatingRole: boolean;
  onPlanChange: (userId: string, planType: PlanType) => void;
  isUpdatingPlan: boolean;
  onDeleteRequest: (userId: string) => void;
  isDeleting: boolean;
};

export function UserRow({
  user,
  onRoleChange,
  isUpdatingRole,
  onPlanChange,
  isUpdatingPlan,
  onDeleteRequest,
  isDeleting,
}: UserRowProps) {
  return (
    <tr className="hover:bg-accent">
      <td className="px-4 py-4">
        <div>
          <div className="font-medium text-foreground">
            {user.name ?? 'Unnamed user'}
          </div>
          <div className="text-sm text-muted-foreground">{user.email}</div>
        </div>
      </td>
      <td className="px-4 py-4">
        <select
          value={user.role}
          onChange={(event) =>
            onRoleChange(user.id, event.target.value as Role)
          }
          disabled={isUpdatingRole}
          className="text-sm border border-border rounded px-2 py-1 bg-background text-foreground focus:ring-2 focus:ring-ring disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
      </td>
      <td className="px-4 py-4">
        {user.subscription ? (
          <select
            value={user.subscription.planType}
            onChange={(event) =>
              onPlanChange(user.id, event.target.value as PlanType)
            }
            disabled={isUpdatingPlan}
            className="text-sm border border-border rounded px-2 py-1 bg-background text-foreground focus:ring-2 focus:ring-ring disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <option value="FREE">FREE</option>
            <option value="PRO">PRO</option>
          </select>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
            No subscription
          </span>
        )}
      </td>
      <td className="px-4 py-4">
        <span className="text-sm text-foreground">{user._count.reports}</span>
      </td>
      <td className="px-4 py-4">
        <span className="text-sm text-muted-foreground">
          {formatJoinedDate(user.createdAt)}
        </span>
      </td>
      <td className="px-4 py-4">
        <button
          type="button"
          onClick={() => onDeleteRequest(user.id)}
          disabled={isDeleting}
          title="Delete user"
          className="inline-flex items-center justify-center p-1.5 text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-colors disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-red-600 dark:disabled:hover:bg-red-700"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
}
