import React from 'react';
import { MinimalCard } from './minimal-card';
import { cn } from '../utils';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  iconBgColor?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  subtitle?: string;
  variant?: 'default' | 'compact' | 'horizontal';
  onClick?: () => void;
  loading?: boolean;
  className?: string;
}

/**
 * StatCard - Professional metric display card
 * Used for dashboards and analytics pages
 */
export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  iconBgColor = 'bg-primary-50',
  trend,
  subtitle,
  variant = 'default',
  onClick,
  loading = false,
  className,
}) => {
  if (loading) {
    return (
      <MinimalCard className={cn('animate-pulse', className)}>
        <div className="space-y-3">
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          <div className="h-8 bg-slate-200 rounded w-3/4"></div>
        </div>
      </MinimalCard>
    );
  }

  // Horizontal variant
  if (variant === 'horizontal') {
    return (
      <MinimalCard
        hover={!!onClick}
        onClick={onClick}
        className={cn('flex items-center gap-4', className)}
      >
        {icon && (
          <div className={cn('p-3 rounded-lg inline-flex shrink-0', iconBgColor)}>
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-500 truncate">{title}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            {trend && (
              <span className={cn(
                'text-xs font-medium',
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              )}>
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
      </MinimalCard>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <MinimalCard
        padding="sm"
        hover={!!onClick}
        onClick={onClick}
        className={className}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-500 truncate">{title}</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{value}</p>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {icon && (
            <div className={cn('p-2 rounded-lg inline-flex shrink-0', iconBgColor)}>
              {icon}
            </div>
          )}
        </div>
        {trend && (
          <div className="mt-2 pt-2 border-t border-slate-100">
            <span className={cn(
              'text-xs font-medium',
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            )}>
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </span>
            <span className="text-xs text-slate-400 ml-1">from last period</span>
          </div>
        )}
      </MinimalCard>
    );
  }

  // Default variant
  return (
    <MinimalCard
      hover={!!onClick}
      onClick={onClick}
      className={className}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {icon && (
          <div className={cn('p-3 rounded-lg inline-flex shrink-0', iconBgColor)}>
            {icon}
          </div>
        )}
      </div>
      <div className="mt-3">
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold text-slate-900">{value}</p>
          {trend && (
            <span className={cn(
              'text-sm font-medium flex items-center gap-0.5',
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            )}>
              {trend.isPositive ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              )}
              {trend.value}
            </span>
          )}
        </div>
      </div>
    </MinimalCard>
  );
};
