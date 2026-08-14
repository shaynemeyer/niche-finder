type SummaryCardsProps = {
  newUsersThisMonth: number;
  recentReports: number;
  mrr: number;
  successRate: number;
};

export function SummaryCards({
  newUsersThisMonth,
  recentReports,
  mrr,
  successRate,
}: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-blue-600 dark:bg-blue-500 rounded-lg px-5 py-4 text-white">
        <p className="text-blue-200 text-xs font-medium uppercase tracking-wide">
          New Users
        </p>
        <div className="text-3xl font-bold mt-1">{newUsersThisMonth}</div>
        <p className="text-blue-200 text-xs mt-1">This month</p>
      </div>
      <div className="bg-green-600 dark:bg-green-500 rounded-lg px-5 py-4 text-white">
        <p className="text-green-200 text-xs font-medium uppercase tracking-wide">
          Recent Reports
        </p>
        <div className="text-3xl font-bold mt-1">{recentReports}</div>
        <p className="text-green-200 text-xs mt-1">Last 7 days</p>
      </div>
      <div className="bg-purple-600 dark:bg-purple-500 rounded-lg px-5 py-4 text-white">
        <p className="text-purple-200 text-xs font-medium uppercase tracking-wide">
          MRR
        </p>
        <div className="text-3xl font-bold mt-1">${mrr}</div>
        <p className="text-purple-200 text-xs mt-1">
          Monthly recurring revenue
        </p>
      </div>
      <div className="bg-orange-500 dark:bg-orange-400 rounded-lg px-5 py-4 text-white">
        <p className="text-orange-100 text-xs font-medium uppercase tracking-wide">
          Success Rate
        </p>
        <div className="text-3xl font-bold mt-1">{successRate}%</div>
        <p className="text-orange-100 text-xs mt-1">Reports completed</p>
      </div>
    </div>
  );
}
