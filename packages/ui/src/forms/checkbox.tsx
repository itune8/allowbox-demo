import React from 'react';
import { cn } from '../utils';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
}

/**
 * Checkbox - Minimal checkbox input
 * Professional checkbox with label and error states
 */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    { label, error, helperText, className, ...props },
    ref
  ) => {
    const checkboxId = React.useId();

    return (
      <div className="w-full">
        {/* Checkbox with label */}
        <div className="flex items-start gap-2">
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            className={cn(
              // Base styles
              'w-4 h-4 mt-0.5',
              'text-primary',
              'bg-white',
              'border border-slate-300',
              'rounded',
              'transition-colors',
              // Focus state
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0',
              // Disabled state
              'disabled:bg-slate-50 disabled:cursor-not-allowed',
              // Error state
              error && 'border-red-300 focus:ring-red-500',
              // Custom className
              className
            )}
            {...props}
          />

          {label && (
            <label
              htmlFor={checkboxId}
              className="flex-1 text-sm text-slate-700 cursor-pointer select-none"
            >
              {label}
            </label>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p className="mt-1.5 ml-6 text-sm text-red-600">{error}</p>
        )}

        {/* Helper text */}
        {helperText && !error && (
          <p className="mt-1.5 ml-6 text-sm text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
