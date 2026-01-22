'use client';

import { useEffect, useCallback, ReactNode } from 'react';
import { Portal } from '../portal';
import { X } from 'lucide-react';

interface SlideSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function SlideSheet({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
}: SlideSheetProps) {
  // Handle escape key
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  // Responsive size classes - full width on mobile, constrained on desktop
  const sizeClasses = {
    sm: 'max-w-full sm:max-w-sm',
    md: 'max-w-full sm:max-w-md',
    lg: 'max-w-full sm:max-w-lg md:max-w-xl',
    xl: 'max-w-full sm:max-w-xl md:max-w-2xl',
    full: 'max-w-full md:max-w-3xl lg:max-w-4xl',
  };

  return (
    <Portal>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 z-[9998] transition-opacity"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={`fixed inset-y-0 right-0 z-[9999] w-full ${sizeClasses[size]} bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-out`}
        style={{ animation: 'slideInRight 0.3s ease-out' }}
      >
        {/* Header */}
        <div className="flex-shrink-0 px-4 sm:px-6 py-4 border-b border-slate-200 bg-white">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 pr-4">
              <h2 className="text-lg font-semibold text-slate-900 truncate">
                {title}
              </h2>
              {subtitle && (
                <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 -mr-2 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex-shrink-0 px-4 sm:px-6 py-4 border-t border-slate-200 bg-slate-50">
            {footer}
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </Portal>
  );
}

// Form Section Component for consistent styling within sheets
export function SheetSection({
  title,
  children,
  icon,
  action,
}: {
  title?: string;
  children: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="space-y-4">
      {title && (
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            {icon && (
              <div className="p-1.5 bg-slate-100 rounded-lg">
                {icon}
              </div>
            )}
            <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

// Form Field Component for consistent form styling
export function SheetField({
  label,
  required,
  error,
  icon,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
        {icon && <span className="text-slate-400">{icon}</span>}
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}

// Detail Row Component for displaying data in sheets
export function SheetDetailRow({
  label,
  value,
  className,
  labelClassName,
  valueClassName,
  icon,
  iconBgColor,
  children,
}: {
  label?: string;
  value?: ReactNode;
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
  icon?: ReactNode;
  iconBgColor?: string;
  children?: ReactNode;
}) {
  // If children are provided, use a different layout
  if (children) {
    return (
      <div className={`py-3 ${className || ''}`}>
        {icon && (
          <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg mb-2 ${iconBgColor || 'bg-slate-100'}`}>
            {icon}
          </div>
        )}
        {label && <p className={`text-xs mb-1 ${labelClassName || 'text-slate-500'}`}>{label}</p>}
        {children}
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-between py-3 border-b border-slate-100 last:border-0 ${className || ''}`}>
      <span className={`text-sm ${labelClassName || 'text-slate-500'}`}>{label}</span>
      <span className={`text-sm font-medium text-right max-w-[60%] ${valueClassName || 'text-slate-900'}`}>
        {value || '—'}
      </span>
    </div>
  );
}
