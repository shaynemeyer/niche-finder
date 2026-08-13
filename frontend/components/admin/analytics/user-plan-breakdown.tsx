import { Users } from 'lucide-react';

import { ProgressBar } from '@/components/admin/progress-bar';

type UserPlanBreakdownProps = {
  proUsers: number;
  freeUsers: number;
};

export function UserPlanBreakdown({
  proUsers,
  freeUsers,
}: UserPlanBreakdownProps) {
  const totalUsers = proUsers + freeUsers;

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm">
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-lg font-semibold text-foreground">
            User Breakdown
          </h2>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">
          Plan distribution across all users
        </p>
      </div>
      <div className="px-6 py-4 space-y-5">
        <div className="space-y-4">
          <ProgressBar
            label="Pro Users"
            value={proUsers}
            max={totalUsers}
            barClassName="bg-purple-500 dark:bg-purple-400"
            showPercent
          />
          <ProgressBar
            label="Free Users"
            value={freeUsers}
            max={totalUsers}
            barClassName="bg-blue-500 dark:bg-blue-400"
            showPercent
          />
        </div>

        <div className="pt-2 border-t border-border grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">
              {proUsers}
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-400 mt-0.5">
              Pro Users
            </div>
          </div>
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
              {freeUsers}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
              Free Users
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
