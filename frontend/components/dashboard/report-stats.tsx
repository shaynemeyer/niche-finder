function StatCard({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <div className="bg-card rounded-lg border border-border shadow-sm px-6 py-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className={`text-2xl font-bold ${className ?? 'text-foreground'}`}>
        {value}
      </div>
    </div>
  );
}

export function ReportStats({
  total,
  completed,
  processing,
  failed,
}: {
  total: number;
  completed: number;
  processing: number;
  failed: number;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard label="Total" value={total} />
      <StatCard
        label="Completed"
        value={completed}
        className="text-green-600 dark:text-green-400"
      />
      <StatCard
        label="Analyzing"
        value={processing}
        className="text-blue-600 dark:text-blue-400"
      />
      <StatCard
        label="Failed"
        value={failed}
        className="text-red-600 dark:text-red-400"
      />
    </div>
  );
}
