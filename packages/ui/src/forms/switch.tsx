'use client';

import React from 'react';
import { cn } from '../utils';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  error?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

/**
 * Switch - Toggle switch component
 * Professional toggle switch with label and description
 */
export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  (
    { label, description, error, checked, onCheckedChange, className, onChange, ...props },
    ref
  ) => {
    const switchId = React.useId();
    const [isChecked, setIsChecked] = React.useState(checked || false);

    React.useEffect(() => {
      if (checked !== undefined) {
        setIsChecked(checked);
      }
    }, [checked]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newChecked = e.target.checked;
      setIsChecked(newChecked);
      onCheckedChange?.(newChecked);
      onChange?.(e);
    };

    return (
      <div className="w-full">
        {/* Switch with label */}
        <div className="flex items-start gap-3">
          {/* Switch button */}
          <button
            type="button"
            role="switch"
            aria-checked={isChecked}
            onClick={() => {
              const event = {
                target: { checked: !isChecked },
              } as React.ChangeEvent<HTMLInputElement>;
              handleChange(event);
            }}
            className={cn(
              // Base styles
              'relative inline-flex h-6 w-11 shrink-0',
              'border-2 border-transparent',
              'rounded-full',
              'transition-colors duration-200 ease-in-out',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
              // Checked/unchecked states
              isChecked ? 'bg-primary' : 'bg-slate-200',
              // Disabled state
              props.disabled && 'opacity-50 cursor-not-allowed',
              // Error state
              error && 'ring-2 ring-red-500',
              className
            )}
            disabled={props.disabled}
          >
            {/* Hidden input for form integration */}
            <input
              ref={ref}
              id={switchId}
              type="checkbox"
              checked={isChecked}
              onChange={handleChange}
              className="sr-only"
              {...props}
            />

            {/* Switch thumb */}
            <span
              className={cn(
                'pointer-events-none inline-block h-5 w-5',
                'transform rounded-full bg-white shadow ring-0',
                'transition duration-200 ease-in-out',
                isChecked ? 'translate-x-5' : 'translate-x-0'
              )}
            />
          </button>

          {/* Label and description */}
          {(label || description) && (
            <div className="flex-1">
              {label && (
                <label
                  htmlFor={switchId}
                  className="block text-sm font-medium text-slate-700 cursor-pointer select-none"
                >
                  {label}
                </label>
              )}
              {description && (
                <p className="mt-0.5 text-sm text-slate-500">{description}</p>
              )}
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p className="mt-1.5 ml-14 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Switch.displayName = 'Switch';
