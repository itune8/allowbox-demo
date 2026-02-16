import { type ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { statCardColors, type StatCardColor } from '../../lib/platform-design-tokens';

interface PlatformStatCardProps {
  icon: ReactNode;
  color: StatCardColor;
  label: string;
  value: string | number;
  trend?: {
    value: string;
    positive: boolean;
  };
  badge?: string;
  subtitle?: string;
  subtitleColor?: 'default' | 'orange' | 'red' | 'green';
  onClick?: () => void;
}

export function PlatformStatCard({
  icon,
  color,
  label,
  value,
  trend,
  badge,
  subtitle,
  subtitleColor = 'default',
  onClick,
}: PlatformStatCardProps) {
  const colors = statCardColors[color];

  const subtitleColorMap = {
    default: 'text-slate-500',
    orange: 'text-orange-600',
    red: 'text-red-600',
    green: 'text-emerald-600',
  };

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 p-5 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${colors.bg}`}>
          <span className={colors.icon}>{icon}</span>
        </div>
        <div className="flex items-center gap-2">
          {badge && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">
              {badge}
            </span>
          )}
          {trend && (
            <span
              className={`flex items-center gap-0.5 text-sm font-semibold ${
                trend.positive ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              {trend.positive ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              {trend.value}
            </span>
          )}
        </div>
      </div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-900 mt-0.5">{value}</p>
      {subtitle && (
        <p className={`text-xs mt-1 ${subtitleColorMap[subtitleColor]}`}>{subtitle}</p>
      )}
    </div>
  );
}
