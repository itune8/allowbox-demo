'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface Icon3DProps {
  children: ReactNode;
  gradient: string;
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

export function Icon3D({ children, gradient, size = 'md', className = '' }: Icon3DProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.1, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className={`relative ${sizeClasses[size]} rounded-xl bg-gradient-to-br ${gradient} shadow-lg ${className}`}
      style={{ boxShadow: `0 4px 14px 0 rgba(99, 102, 241, 0.3)` }}
    >
      <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/20 to-transparent" />
      <div className="relative text-white flex items-center justify-center">{children}</div>
    </motion.div>
  );
}

// Common gradient presets
export const gradients = {
  indigo: 'from-indigo-500 to-purple-600',
  blue: 'from-blue-500 to-cyan-500',
  emerald: 'from-emerald-500 to-teal-500',
  violet: 'from-violet-500 to-purple-500',
  amber: 'from-amber-500 to-orange-500',
  rose: 'from-rose-500 to-pink-500',
  sky: 'from-sky-500 to-blue-500',
  yellow: 'from-yellow-500 to-amber-500',
  red: 'from-red-500 to-rose-500',
  slate: 'from-slate-500 to-gray-600',
  cyan: 'from-cyan-500 to-teal-500',
  green: 'from-green-500 to-emerald-500',
  fuchsia: 'from-fuchsia-500 to-pink-500',
  purple: 'from-purple-500 to-violet-500',
  gray: 'from-gray-500 to-slate-600',
  orange: 'from-orange-500 to-red-500',
};
