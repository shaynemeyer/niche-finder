function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-card rounded-lg border border-border shadow-sm px-6 py-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="text-3xl font-bold text-foreground">{value}</div>
    </div>
  );
}

type QuickStatsProps = {
  total: number;
  thisMonth: number;
  completed: number;
};

export function QuickStats({ total, thisMonth, completed }: QuickStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* All three count reports, so they say so — "Total Validations" next to
          "This Month" left it ambiguous which thing was being counted. */}
      <StatCard label="Total Reports" value={total} />
      <StatCard label="Reports This Month" value={thisMonth} />
      <StatCard label="Completed Reports" value={completed} />
    </div>
  );
}
