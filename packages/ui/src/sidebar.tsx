"use client";

import { ReactNode, useState, useEffect } from "react";
import { cn } from "./utils";

export interface SidebarMenuItem {
  key: string;
  label: string;
  icon?: ReactNode;
  href?: string;
  isSection?: boolean;
  badge?: string | number;
}

export interface SidebarProps {
  title: string;
  subtitle?: string;
  logo?: ReactNode;
  menu: SidebarMenuItem[];
  activeItem?: string;
  onItemClick?: (key: string) => void;
  defaultCollapsed?: boolean;
  footer?: ReactNode;
  className?: string;
  onCollapsedChange?: (collapsed: boolean) => void;
  user?: {
    name: string;
    email?: string;
    avatar?: string;
    role?: string;
  };
  bottomNavItems?: SidebarMenuItem[];
  onLogout?: () => void;
}

// Mobile Bottom Navigation Component
export const MobileBottomNav = ({
  items,
  activeItem,
  onItemClick,
}: {
  items: SidebarMenuItem[];
  activeItem?: string;
  onItemClick?: (key: string) => void;
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {items.slice(0, 5).map((item) => (
          <button
            key={item.key}
            onClick={() => onItemClick?.(item.key)}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full py-1 px-1 rounded-lg transition-all",
              activeItem === item.key
                ? "text-indigo-600 dark:text-indigo-400"
                : "text-gray-500 dark:text-gray-400 active:bg-gray-100 dark:active:bg-gray-800"
            )}
          >
            <span className={cn(
              "mb-0.5 transition-transform",
              activeItem === item.key && "scale-110"
            )}>
              {item.icon}
            </span>
            <span className="text-[10px] font-medium truncate max-w-full">
              {item.label}
            </span>
            {item.badge && (
              <span className="absolute top-1 right-1/4 min-w-[16px] h-4 px-1 text-[10px] font-bold text-white bg-red-500 rounded-full flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};

// Mobile Slide-out Menu
const MobileMenu = ({
  isOpen,
  onClose,
  title,
  subtitle,
  logo,
  menu,
  activeItem,
  onItemClick,
  user,
  onLogout,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  logo?: ReactNode;
  menu: SidebarMenuItem[];
  activeItem?: string;
  onItemClick?: (key: string) => void;
  user?: SidebarProps["user"];
  onLogout?: () => void;
}) => {
  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Slide-out Panel */}
      <aside
        className={cn(
          "md:hidden fixed top-0 left-0 bottom-0 w-[280px] bg-white dark:bg-gray-900 z-50 flex flex-col transition-transform duration-300 ease-out shadow-2xl",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            {logo || (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                {title[0]}
              </div>
            )}
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">{title}</h2>
              {subtitle && (
                <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto py-2">
          {menu.map((item) =>
            item.isSection ? (
              <div
                key={item.key}
                className="px-4 pt-4 pb-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider"
              >
                {item.label}
              </div>
            ) : (
              <button
                key={item.key}
                onClick={() => {
                  onItemClick?.(item.key);
                  onClose();
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 transition-all",
                  activeItem === item.key
                    ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-r-4 border-indigo-600"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                )}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </button>
            )
          )}
        </nav>

        {/* User Profile & Logout */}
        {user && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-200 font-semibold">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  user.name[0]
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.role || user.email}
                </p>
              </div>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Sign Out
              </button>
            )}
          </div>
        )}
      </aside>
    </>
  );
};

export const Sidebar = ({
  title,
  subtitle,
  logo,
  menu,
  activeItem,
  onItemClick,
  defaultCollapsed = false,
  footer,
  className = "",
  onCollapsedChange,
  user,
  bottomNavItems,
  onLogout,
}: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleToggleCollapse = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    onCollapsedChange?.(newCollapsed);
  };

  // Default bottom nav items if not provided
  const mobileBottomItems = bottomNavItems || menu.filter(m => !m.isSection).slice(0, 5);

  return (
    <>
      {/* Mobile Menu Button - shown in header on mobile */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="md:hidden fixed top-3 left-3 z-30 p-2.5 rounded-xl bg-white dark:bg-gray-900 shadow-md border border-gray-200 dark:border-gray-700 active:scale-95 transition-transform"
        aria-label="Open menu"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
        </svg>
      </button>

      {/* Mobile Slide-out Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        title={title}
        subtitle={subtitle}
        logo={logo}
        menu={menu}
        activeItem={activeItem}
        onItemClick={onItemClick}
        user={user}
        onLogout={onLogout}
      />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        items={mobileBottomItems}
        activeItem={activeItem}
        onItemClick={onItemClick}
      />

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-col fixed top-0 left-0 h-screen transition-all duration-300 ease-out z-40",
          isCollapsed ? "w-[72px]" : "w-64",
          className
        )}
      >
        {/* Header */}
        <div className={cn(
          "h-16 flex items-center border-b border-gray-200 dark:border-gray-800",
          isCollapsed ? "justify-center px-2" : "justify-between px-4"
        )}>
          {!isCollapsed ? (
            <div className="flex items-center gap-3 min-w-0">
              {logo || (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {title[0]}
                </div>
              )}
              <div className="min-w-0">
                <span className="text-sm font-bold text-gray-900 dark:text-white truncate block">
                  {title}
                </span>
                {subtitle && (
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate block">
                    {subtitle}
                  </span>
                )}
              </div>
            </div>
          ) : (
            logo || (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                {title[0]}
              </div>
            )
          )}
          <button
            onClick={handleToggleCollapse}
            className={cn(
              "p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
              isCollapsed && "absolute -right-3 top-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm"
            )}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cn(
                "text-gray-500 dark:text-gray-400 transition-transform duration-300",
                isCollapsed ? "rotate-180" : ""
              )}
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden scrollbar-thin">
          {menu.map((item) =>
            item.isSection ? (
              !isCollapsed && (
                <div
                  key={item.key}
                  className="px-4 pt-5 pb-2 text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider"
                >
                  {item.label}
                </div>
              )
            ) : (
              <button
                key={item.key}
                onClick={() => onItemClick?.(item.key)}
                className={cn(
                  "group w-full flex items-center gap-3 py-2.5 transition-all duration-200 relative",
                  isCollapsed ? "justify-center px-2 mx-2 rounded-lg" : "px-4",
                  activeItem === item.key
                    ? isCollapsed
                      ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                      : "bg-gradient-to-r from-indigo-50 to-transparent dark:from-indigo-900/20 dark:to-transparent text-indigo-600 dark:text-indigo-400 border-r-[3px] border-indigo-600 dark:border-indigo-400"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <span className={cn(
                  "flex-shrink-0 transition-transform duration-200",
                  activeItem === item.key && "scale-110"
                )}>
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <>
                    <span className="text-sm font-medium truncate">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
                {isCollapsed && item.badge && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 text-[10px] font-bold text-white bg-red-500 rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <span className="absolute left-full ml-2 px-2 py-1 text-xs font-medium text-white bg-gray-900 dark:bg-gray-700 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                    {item.label}
                  </span>
                )}
              </button>
            )
          )}
        </nav>

        {/* User Profile Section */}
        {user && (
          <div className={cn(
            "border-t border-gray-200 dark:border-gray-800",
            isCollapsed ? "p-2" : "p-3"
          )}>
            <div className={cn(
              "flex items-center rounded-lg transition-colors",
              isCollapsed ? "justify-center p-2" : "gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800"
            )}>
              <div className={cn(
                "rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-200 font-semibold flex-shrink-0",
                isCollapsed ? "w-9 h-9" : "w-9 h-9"
              )}>
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-sm">{user.name[0]}</span>
                )}
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                    {user.role || user.email}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer / Logout */}
        {(footer || onLogout) && (
          <div className={cn(
            "border-t border-gray-200 dark:border-gray-800",
            isCollapsed ? "p-2" : "p-3"
          )}>
            {footer || (
              onLogout && (
                <button
                  onClick={onLogout}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 rounded-lg font-medium transition-colors",
                    isCollapsed
                      ? "p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      : "px-3 py-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30"
                  )}
                  title={isCollapsed ? "Sign Out" : undefined}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  {!isCollapsed && <span>Sign Out</span>}
                </button>
              )
            )}
          </div>
        )}
      </aside>
    </>
  );
};
