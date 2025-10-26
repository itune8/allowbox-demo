"use client";

import { ReactNode, useState } from "react";
import { cn } from "./utils";

export interface SidebarMenuItem {
  key: string;
  label: string;
  icon?: ReactNode;
  href?: string;
}

export interface SidebarProps {
  title: string;
  menu: SidebarMenuItem[];
  activeItem?: string;
  onItemClick?: (key: string) => void;
  defaultCollapsed?: boolean;
  footer?: ReactNode;
  className?: string;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export const Sidebar = ({
  title,
  menu,
  activeItem,
  onItemClick,
  defaultCollapsed = false,
  footer,
  className = '',
  onCollapsedChange,
}: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const handleToggleCollapse = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    onCollapsedChange?.(newCollapsed);
  };

  return (
    <aside
      className={cn(
        "bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col fixed top-0 left-0 h-screen shadow-sm transition-all duration-300 ease-in-out z-40",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
        {!isCollapsed && (
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
            {title}
          </span>
        )}
        <button
          onClick={handleToggleCollapse}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn(
              "text-gray-600 dark:text-gray-400 transition-transform duration-300",
              isCollapsed ? "rotate-180" : ""
            )}
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-auto">
        {menu.map((item) => (
          <button
            key={item.key}
            onClick={() => onItemClick?.(item.key)}
            className={cn(
              "group w-full flex items-center gap-3 px-4 py-3 rounded-r-xl border-l-4 transition-all ease-in-out duration-300 transform",
              activeItem === item.key
                ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-semibold border-gray-900 dark:border-gray-100"
                : "text-gray-600 dark:text-gray-400 border-transparent hover:bg-gray-900 dark:hover:bg-gray-100 hover:text-white dark:hover:text-gray-900 hover:border-gray-900 dark:hover:border-gray-100 hover:pl-5 hover:-translate-y-0.5",
              isCollapsed && "justify-center px-2"
            )}
            title={isCollapsed ? item.label : undefined}
          >
            {item.icon && (
              <span className={cn("flex-shrink-0", isCollapsed && "mx-auto")}>
                {item.icon}
              </span>
            )}
            {!isCollapsed && <span className="truncate">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Footer */}
      {footer && (
        <div className={cn(
          "p-4 border-t border-gray-200 dark:border-gray-800",
          isCollapsed && "p-2"
        )}>
          {footer}
        </div>
      )}
    </aside>
  );
};
