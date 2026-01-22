'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface Icon3DProps {
  children: ReactNode;
  bgColor: string;
  textColor?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'p-1.5',
  md: 'p-2',
  lg: 'p-3',
  xl: 'p-4',
};

const iconSizes = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
};

export function Icon3D({
  children,
  bgColor,
  textColor = 'text-white',
  size = 'md',
  className = ''
}: Icon3DProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.1, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className={`relative ${sizeClasses[size]} rounded-xl ${bgColor} shadow-md hover:shadow-lg transition-shadow ${className}`}
    >
      <div className="absolute inset-0 rounded-xl bg-white/10" />
      <div className={`relative ${textColor} flex items-center justify-center`}>{children}</div>
    </motion.div>
  );
}

// Common solid color presets for sections
export const sectionColors = {
  dashboard: { bg: 'bg-indigo-600', text: 'text-white', light: 'bg-indigo-50' },
  students: { bg: 'bg-sky-500', text: 'text-white', light: 'bg-sky-50' },
  staff: { bg: 'bg-emerald-500', text: 'text-white', light: 'bg-emerald-50' },
  classes: { bg: 'bg-violet-500', text: 'text-white', light: 'bg-violet-50' },
  grades: { bg: 'bg-amber-500', text: 'text-white', light: 'bg-amber-50' },
  homework: { bg: 'bg-pink-500', text: 'text-white', light: 'bg-pink-50' },
  diary: { bg: 'bg-cyan-500', text: 'text-white', light: 'bg-cyan-50' },
  fees: { bg: 'bg-yellow-500', text: 'text-white', light: 'bg-yellow-50' },
  health: { bg: 'bg-red-500', text: 'text-white', light: 'bg-red-50' },
  transport: { bg: 'bg-slate-500', text: 'text-white', light: 'bg-slate-50' },
  inventory: { bg: 'bg-teal-500', text: 'text-white', light: 'bg-teal-50' },
  leave: { bg: 'bg-green-500', text: 'text-white', light: 'bg-green-50' },
  events: { bg: 'bg-fuchsia-500', text: 'text-white', light: 'bg-fuchsia-50' },
  messages: { bg: 'bg-blue-500', text: 'text-white', light: 'bg-blue-50' },
  reports: { bg: 'bg-purple-500', text: 'text-white', light: 'bg-purple-50' },
  settings: { bg: 'bg-gray-500', text: 'text-white', light: 'bg-gray-50' },
  support: { bg: 'bg-orange-500', text: 'text-white', light: 'bg-orange-50' },
};
