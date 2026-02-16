interface EngagementBarProps {
  percentage: number;
  showLabel?: boolean;
}

export function EngagementBar({ percentage, showLabel = true }: EngagementBarProps) {
  const clampedPercentage = Math.min(100, Math.max(0, percentage));

  let barColor = 'bg-red-500';
  if (clampedPercentage >= 80) {
    barColor = 'bg-emerald-500';
  } else if (clampedPercentage >= 60) {
    barColor = 'bg-amber-500';
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden min-w-[80px]">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-slate-700 w-10 text-right">{clampedPercentage}%</span>
      )}
    </div>
  );
}
