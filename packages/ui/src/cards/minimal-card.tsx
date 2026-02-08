import React from 'react';
import { cn } from '../utils';

export interface MinimalCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  className?: string;
}

/**
 * MinimalCard - Clean white card with subtle shadow
 * Replaces the GlassCard component with a professional minimal design
 */
export const MinimalCard = React.forwardRef<HTMLDivElement, MinimalCardProps>(
  ({ children, padding = 'md', hover = false, className, ...props }, ref) => {
    const paddingClasses = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'bg-white',
          'border border-slate-200',
          'rounded-xl',
          'shadow-sm',
          // Padding
          paddingClasses[padding],
          // Hover effect
          hover && 'transition-shadow duration-200 hover:shadow-md cursor-pointer',
          // Custom classes
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

MinimalCard.displayName = 'MinimalCard';
