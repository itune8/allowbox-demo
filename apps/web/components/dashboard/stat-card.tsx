"use client";

import React, { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  iconBgColor?: string;
}

export function StatCard({ title, value, icon, trend, iconBgColor = "bg-gray-50" }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`${iconBgColor} p-2.5 rounded-lg`}>
            {icon}
          </div>
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
        {trend && (
          <p className={`text-xs font-medium ${trend.isPositive ? "text-green-600" : "text-red-600"}`}>
            {trend.isPositive ? "↑" : "↓"} {trend.value}
          </p>
        )}
      </div>
    </div>
  );
}
