import React from 'react';
import { cn } from '../utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/**
 * Input - Minimal text input field
 * Professional input with label, error states, and icon support
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, helperText, leftIcon, rightIcon, className, ...props },
    ref
  ) => {
    const inputId = React.useId();

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            {label}
          </label>
        )}

        {/* Input wrapper */}
        <div className="relative">
          {/* Left icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              {leftIcon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              // Base styles
              'w-full',
              'px-4 py-2.5',
              'bg-white',
              'border border-slate-200',
              'rounded-lg',
              'text-sm text-slate-900',
              'placeholder:text-slate-400',
              'transition-colors',
              // Focus state
              'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
              // Disabled state
              'disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed',
              // Error state
              error && 'border-red-300 focus:ring-red-500',
              // Icon padding
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              // Custom className
              className
            )}
            {...props}
          />

          {/* Right icon */}
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              {rightIcon}
            </div>
          )}
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

Input.displayName = 'Input';
