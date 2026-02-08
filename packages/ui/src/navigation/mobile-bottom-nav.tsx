'use client';

import React from 'react';
import { cn } from '../utils';

export interface BottomNavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

export interface MobileBottomNavProps {
  items: BottomNavItem[];
  activeItem?: string;
  onItemClick: (key: string) => void;
  className?: string;
}

/**
 * MobileBottomNav - Mobile bottom navigation bar
 * Fixed navigation bar at the bottom of the screen for mobile devices
 * Maximum 5 items recommended
 */
export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  items,
  activeItem,
  onItemClick,
  className,
}) => {
  if (items.length > 5) {
    console.warn('MobileBottomNav: More than 5 items detected. Consider reducing for better UX.');
  }

  return (
    <nav
      className={cn(
        'md:hidden',
        'fixed bottom-0 left-0 right-0',
        'bg-white border-t border-slate-200',
        'safe-bottom', // For devices with notches
        'z-40',
        className
      )}
    >
      <div className="flex items-center justify-around px-2 pb-safe">
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => !item.disabled && onItemClick(item.key)}
            disabled={item.disabled}
            className={cn(
              'flex flex-col items-center justify-center',
              'px-3 py-2 min-w-0',
              'transition-colors',
              activeItem === item.key
                ? 'text-primary'
                : 'text-slate-600',
              item.disabled && 'opacity-50 cursor-not-allowed'
            )}
            style={{ flex: `1 1 ${100 / items.length}%` }}
          >
            {/* Icon with badge */}
            <div className="relative">
              <span className={cn(
                'block w-6 h-6',
                activeItem === item.key && 'scale-110 transition-transform'
              )}>
                {item.icon}
              </span>
              {item.badge && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center">
                  {typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </div>

            {/* Label */}
            <span className={cn(
              'mt-1 text-[10px] font-medium truncate max-w-full',
              activeItem === item.key && 'font-semibold'
            )}>
              {item.label}
            </span>

            {/* Active indicator */}
            {activeItem === item.key && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};
