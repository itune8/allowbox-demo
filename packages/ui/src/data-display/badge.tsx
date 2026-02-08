import React from 'react';
import { cn } from '../utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Badge - Status indicators, counts, and labels
 * Used for status displays, counts, and categorical labels
 */
export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className,
  ...props
}) => {
  const variantClasses = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    error: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    purple: 'bg-primary-100 text-primary-700',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  return (
    <span
      className={cn(
        // Base styles
        'inline-flex items-center justify-center',
        'font-medium',
        'rounded-full',
        'whitespace-nowrap',
        // Variant
        variantClasses[variant],
        // Size
        sizeClasses[size],
        // Custom
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
