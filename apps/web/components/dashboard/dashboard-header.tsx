"use client";

import React from "react";

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export function DashboardHeader({ title, subtitle, breadcrumbs }: DashboardHeaderProps) {
  return (
    <div className="mb-8">
      {breadcrumbs && (
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-3">
          <HomeIcon className="w-4 h-4 text-gray-400" />
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && <span className="text-gray-300">›</span>}
              {crumb.href ? (
                <a href={crumb.href} className="hover:text-gray-700 transition-colors">
                  {crumb.label}
                </a>
              ) : (
                <span className="text-gray-700 font-medium">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
            <option>Last 30 days</option>
            <option>Last 7 days</option>
            <option>Last 90 days</option>
            <option>Last 12 months</option>
          </select>
          <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all" aria-label="Refresh">
            <RefreshIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}
