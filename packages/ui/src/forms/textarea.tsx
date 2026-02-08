import React from 'react';
import { cn } from '../utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  resize?: boolean;
}

/**
 * Textarea - Minimal textarea field
 * Professional textarea with label, error states, and resize control
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { label, error, helperText, resize = true, className, ...props },
    ref
  ) => {
    const textareaId = React.useId();

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            {label}
          </label>
        )}

        {/* Textarea */}
        <textarea
          ref={ref}
          id={textareaId}
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
            // Resize
            resize ? 'resize-y' : 'resize-none',
            // Custom className
            className
          )}
          {...props}
        />

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

Textarea.displayName = 'Textarea';
