import React from 'react';
import { MinimalCard } from './minimal-card';
import { cn } from '../utils';

export interface ActionCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  iconBgColor?: string;
  onClick?: () => void;
  className?: string;
}

/**
 * ActionCard - Click able card for quick actions
 * Used for dashboard quick actions and menu items
 */
export const ActionCard: React.FC<ActionCardProps> = ({
  title,
  description,
  icon,
  iconBgColor = 'bg-primary-50',
  onClick,
  className,
}) => {
  return (
    <MinimalCard
      hover={!!onClick}
      onClick={onClick}
      padding="md"
      className={cn('cursor-pointer', className)}
    >
      <div className="flex items-start gap-4">
        {icon && (
          <div className={cn('p-3 rounded-lg inline-flex shrink-0', iconBgColor)}>
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate-900 mb-1">{title}</h3>
          {description && (
            <p className="text-xs text-slate-600">{description}</p>
          )}
        </div>
        {/* Arrow indicator */}
        {onClick && (
          <svg
            className="w-5 h-5 text-slate-400 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        )}
      </div>
    </MinimalCard>
  );
};
