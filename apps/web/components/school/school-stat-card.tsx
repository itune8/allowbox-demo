'use client';

import { type ReactNode } from 'react';

export type SchoolStatColor = 'green' | 'blue' | 'orange' | 'purple' | 'red' | 'amber' | 'teal' | 'cyan' | 'slate';

const colorMap: Record<SchoolStatColor, { iconBg: string; iconText: string; percentageText: string; progressBg: string; progressBar: string }> = {
  green: { iconBg: 'bg-emerald-100', iconText: 'text-emerald-600', percentageText: 'text-emerald-600', progressBg: 'bg-emerald-100', progressBar: 'bg-emerald-500' },
  blue: { iconBg: 'bg-blue-100', iconText: 'text-blue-600', percentageText: 'text-blue-600', progressBg: 'bg-blue-100', progressBar: 'bg-blue-500' },
  orange: { iconBg: 'bg-orange-100', iconText: 'text-orange-600', percentageText: 'text-orange-600', progressBg: 'bg-orange-100', progressBar: 'bg-orange-500' },
  purple: { iconBg: 'bg-purple-100', iconText: 'text-purple-600', percentageText: 'text-purple-600', progressBg: 'bg-purple-100', progressBar: 'bg-[#824ef2]' },
  red: { iconBg: 'bg-red-100', iconText: 'text-red-600', percentageText: 'text-red-600', progressBg: 'bg-red-100', progressBar: 'bg-red-500' },
  amber: { iconBg: 'bg-amber-100', iconText: 'text-amber-600', percentageText: 'text-amber-600', progressBg: 'bg-amber-100', progressBar: 'bg-amber-500' },
  teal: { iconBg: 'bg-teal-100', iconText: 'text-teal-600', percentageText: 'text-teal-600', progressBg: 'bg-teal-100', progressBar: 'bg-teal-500' },
  cyan: { iconBg: 'bg-cyan-100', iconText: 'text-cyan-600', percentageText: 'text-cyan-600', progressBg: 'bg-cyan-100', progressBar: 'bg-cyan-500' },
  slate: { iconBg: 'bg-slate-100', iconText: 'text-slate-600', percentageText: 'text-slate-600', progressBg: 'bg-slate-100', progressBar: 'bg-slate-500' },
};

interface SchoolStatCardProps {
  icon: ReactNode;
  color: SchoolStatColor;
  label: string;
  value: string | number;
  total?: string | number;
  percentage?: number;
  subtitle?: string;
  progressBar?: boolean;
  onClick?: () => void;
}

export function SchoolStatCard({
  icon,
  color,
  label,
  value,
  total,
  percentage,
  subtitle,
  progressBar = false,
  onClick,
}: SchoolStatCardProps) {
  const colors = colorMap[color];

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 p-5 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className={`p-2.5 rounded-xl ${colors.iconBg}`}>
          <span className={colors.iconText}>{icon}</span>
        </div>
        {percentage !== undefined && (
          <span className={`text-xl font-bold ${colors.percentageText}`}>
            {percentage}%
          </span>
        )}
      </div>
      <p className="text-sm text-slate-500 mt-2">{label}</p>
      <div className="flex items-baseline gap-1.5 mt-1">
        <span className="text-2xl font-bold text-slate-900">{value}</span>
        {total && (
          <span className="text-sm text-slate-400">/ {total}</span>
        )}
      </div>
      {subtitle && (
        <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
      )}
      {progressBar && percentage !== undefined && (
        <div className={`mt-3 h-1.5 ${colors.progressBg} rounded-full overflow-hidden`}>
          <div
            className={`h-full ${colors.progressBar} rounded-full transition-all duration-500`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}
