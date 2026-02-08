import React from 'react';
import { cn } from '../utils';

export interface Breadcrumb {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: Breadcrumb[];
  className?: string;
}

/**
 * PageHeader - Consistent page title + actions layout
 * Used at the top of pages for title, description, and action buttons
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actions,
  breadcrumbs,
  className,
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center space-x-2 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && (
                <svg
                  className="w-4 h-4 text-slate-400"
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
              {crumb.href ? (
                <a
                  href={crumb.href}
                  className="flex items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors"
                >
                  {crumb.icon}
                  <span>{crumb.label}</span>
                </a>
              ) : (
                <span className="flex items-center gap-1 text-slate-900 font-medium">
                  {crumb.icon}
                  <span>{crumb.label}</span>
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Header content */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 truncate">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-sm text-slate-600 max-w-3xl">
              {description}
            </p>
          )}
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex items-center gap-3 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
