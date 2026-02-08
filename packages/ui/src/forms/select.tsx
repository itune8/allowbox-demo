import React from 'react';
import { cn } from '../utils';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
}

/**
 * Select - Minimal select dropdown
 * Professional select input with label and error states
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, error, helperText, options, placeholder, className, ...props },
    ref
  ) => {
    const selectId = React.useId();

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            {label}
          </label>
        )}

        {/* Select wrapper */}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              // Base styles
              'w-full',
              'px-4 py-2.5',
              'pr-10', // Space for dropdown icon
              'bg-white',
              'border border-slate-200',
              'rounded-lg',
              'text-sm text-slate-900',
              'transition-colors',
              'appearance-none', // Remove default arrow
              // Focus state
              'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
              // Disabled state
              'disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed',
              // Error state
              error && 'border-red-300 focus:ring-red-500',
              // Custom className
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Dropdown icon */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <p className="mt-1.5 text-sm text-red-600">{error}</p>
        )}

        {/* Helper text */}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
