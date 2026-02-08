import React from 'react';
import { cn } from '../utils';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

/**
 * EmptyState - Consistent empty state UI
 * Used when lists, tables, or sections have no data to display
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center',
      'py-12 px-4 text-center',
      className
    )}>
      {/* Icon */}
      {icon && (
        <div className="mb-4 text-slate-400">
          {icon}
        </div>
      )}

      {/* Title */}
      <h3 className="text-lg font-semibold text-slate-900 mb-2">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-sm text-slate-600 max-w-sm mb-6">
          {description}
        </p>
      )}

      {/* Action button */}
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          {action.label}
        </button>
      )}
    </div>
  );
};
