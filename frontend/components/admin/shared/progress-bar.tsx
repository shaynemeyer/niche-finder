type ProgressBarProps = {
  label: string;
  value: number;
  max: number;
  /** Bar fill color. Off-palette on purpose, so it needs a dark variant. */
  barClassName: string;
  showPercent?: boolean;
};

export function ProgressBar({
  label,
  value,
  max,
  barClassName,
  showPercent = false,
}: ProgressBarProps) {
  const percent = max > 0 ? Math.min((value / max) * 100, 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-sm font-semibold text-foreground">
          {showPercent ? `${Math.round(percent)}%` : value}
        </span>
      </div>
      <div className="w-full bg-muted rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full transition-all duration-700 ${barClassName}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
