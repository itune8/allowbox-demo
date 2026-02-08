'use client';

import React from 'react';
import { cn } from '../utils';
import { TopNavItem, UserInfo } from './types';
import { Avatar } from '../data-display/avatar';

export interface TopNavigationProps {
  logo?: React.ReactNode;
  title?: string;
  items: TopNavItem[];
  activeItem?: string;
  onItemClick: (key: string) => void;
  centerContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  user?: UserInfo;
  onLogout?: () => void;
  showNotifications?: boolean;
  onNotificationClick?: () => void;
  notificationCount?: number;
  className?: string;
}

/**
 * TopNavigation - Horizontal navigation for Parent & Teacher panels
 * Features: Tabs, search, notifications, user profile
 */
export const TopNavigation: React.FC<TopNavigationProps> = ({
  logo,
  title = 'SchoolHub',
  items,
  activeItem,
  onItemClick,
  centerContent,
  rightContent,
  user,
  onLogout,
  showNotifications = true,
  onNotificationClick,
  notificationCount = 0,
  className,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);

  return (
    <>
      {/* Main navigation bar */}
      <nav
        className={cn(
          'sticky top-0 z-30',
          'bg-white/90 backdrop-blur-sm',
          'border-b border-slate-200',
          className
        )}
      >
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Left: Logo + Title + Nav Items (desktop) */}
            <div className="flex items-center gap-6 flex-1 min-w-0">
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>

              {/* Logo */}
              {logo ? (
                <div className="shrink-0">{logo}</div>
              ) : (
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">S</span>
                  </div>
                  <span className="font-bold text-lg text-slate-900 hidden sm:block">{title}</span>
                </div>
              )}

              {/* Desktop navigation items */}
              <div className="hidden md:flex items-center gap-1 flex-1">
                {items.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => !item.disabled && onItemClick(item.key)}
                    disabled={item.disabled}
                    className={cn(
                      'relative px-4 py-2 text-sm font-medium transition-colors rounded-lg',
                      activeItem === item.key
                        ? 'text-primary'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50',
                      item.disabled && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <span className="flex items-center gap-2">
                      {item.icon}
                      {item.label}
                      {item.badge && (
                        <span className="ml-1 px-1.5 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </span>
                    {/* Active indicator */}
                    {activeItem === item.key && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Center content (e.g., child selector) */}
            {centerContent && (
              <div className="hidden lg:flex items-center justify-center px-4">
                {centerContent}
              </div>
            )}

            {/* Right: Search, Notifications, User */}
            <div className="flex items-center gap-3">
              {/* Custom right content */}
              {rightContent}

              {/* Notifications */}
              {showNotifications && (
                <button
                  onClick={onNotificationClick}
                  className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                  aria-label="Notifications"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {notificationCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </button>
              )}

              {/* User menu */}
              {user && (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Avatar src={user.avatar} name={user.name} size="sm" />
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium text-slate-900">{user.name}</p>
                      {user.role && <p className="text-xs text-slate-500">{user.role}</p>}
                    </div>
                    <svg className="hidden sm:block w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* User dropdown */}
                  {isUserMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20">
                        <div className="px-4 py-3 border-b border-slate-100">
                          <p className="text-sm font-medium text-slate-900">{user.name}</p>
                          {user.email && <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>}
                        </div>
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onLogout?.();
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Sign out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-sm">
          <div className="bg-white w-64 h-full shadow-lg">
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <span className="font-bold text-lg text-slate-900">{title}</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-1">
                {items.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => {
                      !item.disabled && onItemClick(item.key);
                      setIsMobileMenuOpen(false);
                    }}
                    disabled={item.disabled}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                      activeItem === item.key
                        ? 'bg-primary text-white'
                        : 'text-slate-700 hover:bg-slate-100',
                      item.disabled && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    {item.icon}
                    {item.label}
                    {item.badge && (
                      <span className="ml-auto px-1.5 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
