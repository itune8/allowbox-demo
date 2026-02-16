'use client';

import React from 'react';
import { cn } from '../utils';
import { SidebarSection, SidebarItem, UserInfo } from './types';
import { Avatar } from '../data-display/avatar';

export interface ProfessionalSidebarProps {
  title: string;
  subtitle?: string;
  logo?: React.ReactNode;
  sections: SidebarSection[];
  activeItem?: string;
  onItemClick: (key: string) => void;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  user?: UserInfo;
  onLogout?: () => void;
  footer?: React.ReactNode;
  className?: string;
}

/**
 * ProfessionalSidebar - Professional left sidebar for School & Super Admin panels
 * Features: Grouped sections, collapsible, mobile drawer
 */
export const ProfessionalSidebar: React.FC<ProfessionalSidebarProps> = ({
  title,
  subtitle,
  logo,
  sections,
  activeItem,
  onItemClick,
  defaultCollapsed = false,
  onCollapsedChange,
  user,
  onLogout,
  footer,
  className,
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  const handleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onCollapsedChange?.(newState);
  };

  const handleItemClick = (key: string) => {
    onItemClick(key);
    setIsMobileOpen(false); // Close mobile menu on item click
  };

  // Sidebar content component (reused for desktop and mobile)
  const SidebarContent = () => (
    <>
      {/* Header */}
      <div className={cn(
        'p-4 border-b border-slate-200',
        isCollapsed && 'hidden md:block'
      )}>
        {logo ? (
          <div>{logo}</div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#824ef2] rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-lg text-slate-900 truncate">{title}</h2>
                {subtitle && <p className="text-xs text-slate-500 truncate">{subtitle}</p>}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation sections */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-6">
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            {/* Section header */}
            {!isCollapsed && (
              <h3 className="px-3 mb-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
                {section.title}
              </h3>
            )}

            {/* Section items */}
            <div className="space-y-1">
              {section.items.map((item) => (
                <button
                  key={item.key}
                  onClick={() => !item.disabled && handleItemClick(item.key)}
                  disabled={item.disabled}
                  title={isCollapsed ? item.label : undefined}
                  className={cn(
                    'w-full flex items-center gap-3 rounded-lg transition-colors',
                    isCollapsed ? 'px-2 py-2.5 justify-center' : 'px-3 py-2.5',
                    activeItem === item.key
                      ? 'bg-[#824ef2] text-white'
                      : 'text-slate-700 hover:bg-slate-100',
                    item.disabled && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <span className={cn('shrink-0', isCollapsed ? 'w-5 h-5' : 'w-5 h-5')}>
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-left text-sm font-medium truncate">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className={cn(
                          'px-2 py-0.5 text-xs font-semibold rounded-full',
                          activeItem === item.key
                            ? 'bg-white/20 text-white'
                            : 'bg-red-100 text-red-700'
                        )}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer / User section */}
      {(footer || user) && (
        <div className="p-3 border-t border-slate-200">
          {footer ? (
            footer
          ) : user ? (
            <div className={cn(
              'flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 transition-colors',
              isCollapsed && 'justify-center'
            )}>
              <Avatar src={user.avatar} name={user.name} size="sm" />
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
                  {user.role && <p className="text-xs text-slate-500 truncate">{user.role}</p>}
                </div>
              )}
              {!isCollapsed && onLogout && (
                <button
                  onClick={onLogout}
                  className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                  title="Sign out"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              )}
            </div>
          ) : null}
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col',
          'fixed left-0 top-0 h-screen',
          'bg-white border-r border-slate-200',
          'transition-all duration-300 ease-in-out',
          'z-30',
          isCollapsed ? 'w-20' : 'w-64',
          className
        )}
      >
        <SidebarContent />

        {/* Collapse toggle button */}
        <button
          onClick={handleCollapse}
          className={cn(
            'absolute -right-3 top-6',
            'w-6 h-6',
            'bg-white border border-slate-200 rounded-full',
            'flex items-center justify-center',
            'text-slate-400 hover:text-slate-600',
            'transition-colors',
            'shadow-sm'
          )}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg
            className={cn('w-3 h-3 transition-transform', isCollapsed && 'rotate-180')}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </aside>

      {/* Mobile sidebar */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />

          {/* Drawer */}
          <aside className="absolute left-0 top-0 h-full w-64 bg-white shadow-lg flex flex-col">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Mobile menu button (shown when sidebar is not open) */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed bottom-4 right-4 z-30 w-14 h-14 bg-[#824ef2] text-white rounded-full shadow-lg flex items-center justify-center hover:opacity-90 transition-colors"
        aria-label="Open menu"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </>
  );
};
