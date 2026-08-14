import type { LucideIcon } from 'lucide-react';

type MetricCardProps = {
  label: string;
  value: number | string;
  icon: LucideIcon;
  /** Accent for the icon. Off-palette on purpose, so it needs a dark variant. */
  iconClassName?: string;
  hint?: string;
};

export function MetricCard({
  label,
  value,
  icon: Icon,
  iconClassName = 'text-blue-600 dark:text-blue-400',
  hint,
}: MetricCardProps) {
  return (
    <div className="bg-card rounded-lg border border-border shadow-sm">
      <div className="flex flex-row items-center justify-between px-6 pt-4 pb-2">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <Icon className={`h-4 w-4 ${iconClassName}`} />
      </div>
      <div className="px-6 pb-4">
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {hint ? (
          <p className="text-xs text-muted-foreground mt-1">{hint}</p>
        ) : null}
      </div>
    </div>
  );
}
