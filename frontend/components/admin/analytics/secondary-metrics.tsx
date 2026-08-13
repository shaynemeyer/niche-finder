import { Target, TrendingUp, Zap } from 'lucide-react';

type StatCardProps = {
  icon: typeof Target;
  iconClassName: string;
  label: string;
  value: string;
  hint?: string;
  percentage?: number;
  barClassName?: string;
};

function StatCard({
  icon: Icon,
  iconClassName,
  label,
  value,
  hint,
  percentage,
  barClassName,
}: StatCardProps) {
  return (
    <div className="bg-card rounded-lg border border-border shadow-sm px-6 py-5">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${iconClassName}`} />
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
      </div>
      <div className="text-3xl font-bold text-foreground">{value}</div>
      {hint ? (
        <p className="text-xs text-muted-foreground mt-1">{hint}</p>
      ) : null}
      {percentage !== undefined ? (
        <div className="mt-3 w-full bg-muted rounded-full h-2">
          <div
            className={`h-2 rounded-full ${barClassName}`}
            style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}

type SecondaryMetricsProps = {
  averageScore: number;
  monthlyValidations: number;
  proConversionRate: number;
};

export function SecondaryMetrics({
  averageScore,
  monthlyValidations,
  proConversionRate,
}: SecondaryMetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard
        icon={Target}
        iconClassName="text-blue-600 dark:text-blue-400"
        label="Avg. Report Score"
        value={`${averageScore}/100`}
        percentage={averageScore}
        barClassName="bg-blue-600 dark:bg-blue-500"
      />
      <StatCard
        icon={Zap}
        iconClassName="text-yellow-600 dark:text-yellow-400"
        label="Monthly Validations"
        value={String(monthlyValidations)}
        hint="Current month total"
      />
      <StatCard
        icon={TrendingUp}
        iconClassName="text-purple-600 dark:text-purple-400"
        label="Pro Conversion Rate"
        value={`${proConversionRate}%`}
        percentage={proConversionRate}
        barClassName="bg-purple-600 dark:bg-purple-500"
      />
    </div>
  );
}
