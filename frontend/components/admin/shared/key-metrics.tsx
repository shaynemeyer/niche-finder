import { DollarSign, FileText, TrendingUp, Users } from 'lucide-react';

import { MetricCard } from './metric-card';

type KeyMetricsProps = {
  totalUsers: number;
  newUsersThisMonth: number;
  totalReports: number;
  recentReports: number;
  proUsers: number;
  freeUsers: number;
  mrr: number;
};

export function KeyMetrics({
  totalUsers,
  newUsersThisMonth,
  totalReports,
  recentReports,
  proUsers,
  freeUsers,
  mrr,
}: KeyMetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        label="Total Users"
        value={totalUsers}
        icon={Users}
        iconClassName="text-blue-600 dark:text-blue-400"
        hint={`+${newUsersThisMonth} this month`}
      />
      <MetricCard
        label="Total Reports"
        value={totalReports}
        icon={FileText}
        iconClassName="text-green-600 dark:text-green-400"
        hint={`${recentReports} in last 7 days`}
      />
      <MetricCard
        label="Pro Users"
        value={proUsers}
        icon={TrendingUp}
        iconClassName="text-purple-600 dark:text-purple-400"
        hint={`${freeUsers} free users`}
      />
      <MetricCard
        label="MRR"
        value={`$${mrr}`}
        icon={DollarSign}
        iconClassName="text-green-600 dark:text-green-400"
        hint="Monthly recurring revenue"
      />
    </div>
  );
}
