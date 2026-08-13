import { Users } from 'lucide-react';

import type { PlanType, Role } from '@/lib/generated/prisma/client';
import { UserRow, type AdminUser } from '@/components/admin/users/user-row';

type UsersTableProps = {
  users: AdminUser[];
  onRoleChange: (userId: string, role: Role) => void;
  updatingRoleId: string | null;
  onPlanChange: (userId: string, planType: PlanType) => void;
  updatingPlanId: string | null;
  onDeleteRequest: (userId: string) => void;
  deletingId: string | null;
};

export function UsersTable({
  users,
  onRoleChange,
  updatingRoleId,
  onPlanChange,
  updatingPlanId,
  onDeleteRequest,
  deletingId,
}: UsersTableProps) {
  return (
    <div className="bg-card rounded-lg border border-border shadow-sm">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Users className="w-5 h-5" />
          All Users
        </h2>
      </div>
      <div className="px-6 py-4">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Reports
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {users.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  onRoleChange={onRoleChange}
                  isUpdatingRole={updatingRoleId === user.id}
                  onPlanChange={onPlanChange}
                  isUpdatingPlan={updatingPlanId === user.id}
                  onDeleteRequest={onDeleteRequest}
                  isDeleting={deletingId === user.id}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
