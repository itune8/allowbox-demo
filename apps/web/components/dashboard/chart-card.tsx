"use client";

import React, { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
}

export function ChartCard({ title, subtitle, icon, children }: ChartCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-all duration-200">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {icon && <span className="text-gray-600">{icon}</span>}
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          </div>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}
