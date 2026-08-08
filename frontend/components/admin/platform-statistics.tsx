type StatBarProps = {
  label: string;
  value: string;
  /** 0-100, drives the bar width. */
  percentage: number;
  barClassName: string;
};

function StatBar({ label, value, percentage, barClassName }: StatBarProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-lg font-bold text-foreground">{value}</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className={`h-2 rounded-full ${barClassName}`}
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        />
      </div>
    </div>
  );
}

type PlatformStatisticsProps = {
  monthlyValidations: number;
  monthlyValidationsTarget: number;
  averageScore: number;
  proConversionRate: number;
};

export function PlatformStatistics({
  monthlyValidations,
  monthlyValidationsTarget,
  averageScore,
  proConversionRate,
}: PlatformStatisticsProps) {
  const validationPercentage = monthlyValidationsTarget
    ? (monthlyValidations / monthlyValidationsTarget) * 100
    : 0;

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">
          Platform Statistics
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Additional metrics and insights
        </p>
      </div>
      <div className="px-6 py-4">
        <div className="space-y-4">
          <StatBar
            label="Monthly Validations"
            value={String(monthlyValidations)}
            percentage={validationPercentage}
            barClassName="bg-blue-600 dark:bg-blue-500"
          />
          <StatBar
            label="Average Report Score"
            value={`${averageScore}/100`}
            percentage={averageScore}
            barClassName="bg-green-600 dark:bg-green-500"
          />
          <StatBar
            label="Pro Conversion Rate"
            value={`${proConversionRate}%`}
            percentage={proConversionRate}
            barClassName="bg-purple-600 dark:bg-purple-500"
          />

          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold">Success Rate:</span> % of reports
              completed successfully
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
