'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ActionCardProps {
  icon: ReactNode;
  title: string;
  description?: string;
  onClick?: () => void;
  color?: 'indigo' | 'green' | 'blue' | 'amber' | 'purple' | 'red' | 'cyan' | 'emerald';
  variant?: 'solid' | 'outline' | 'ghost';
  delay?: number;
}

export function ActionCard({
  icon,
  title,
  description,
  onClick,
  color = 'indigo',
  variant = 'outline',
  delay = 0,
}: ActionCardProps) {
  const colorStyles = {
    indigo: {
      solid: 'bg-indigo-500 text-white hover:bg-indigo-600',
      outline: 'border-2 border-dashed border-gray-200 hover:border-indigo-400 hover:bg-indigo-50/50',
      ghost: 'hover:bg-indigo-50',
    },
    green: {
      solid: 'bg-emerald-500 text-white hover:bg-emerald-600',
      outline: 'border-2 border-dashed border-gray-200 hover:border-emerald-400 hover:bg-emerald-50/50',
      ghost: 'hover:bg-emerald-50',
    },
    blue: {
      solid: 'bg-blue-500 text-white hover:bg-blue-600',
      outline: 'border border-gray-200 hover:border-blue-400 hover:bg-blue-50/50',
      ghost: 'hover:bg-blue-50',
    },
    amber: {
      solid: 'bg-amber-500 text-white hover:bg-amber-600',
      outline: 'border border-gray-200 hover:border-amber-400 hover:bg-amber-50/50',
      ghost: 'hover:bg-amber-50',
    },
    purple: {
      solid: 'bg-purple-500 text-white hover:bg-purple-600',
      outline: 'border border-gray-200 hover:border-purple-400 hover:bg-purple-50/50',
      ghost: 'hover:bg-purple-50',
    },
    red: {
      solid: 'bg-red-500 text-white hover:bg-red-600',
      outline: 'border border-gray-200 hover:border-red-400 hover:bg-red-50/50',
      ghost: 'hover:bg-red-50',
    },
    cyan: {
      solid: 'bg-cyan-500 text-white hover:bg-cyan-600',
      outline: 'border border-gray-200 hover:border-cyan-400 hover:bg-cyan-50/50',
      ghost: 'hover:bg-cyan-50',
    },
    emerald: {
      solid: 'bg-emerald-500 text-white hover:bg-emerald-600',
      outline: 'border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50/50',
      ghost: 'hover:bg-emerald-50',
    },
  };

  const iconColors = {
    indigo: 'text-indigo-600 group-hover:text-indigo-700',
    green: 'text-emerald-600 group-hover:text-emerald-700',
    blue: 'text-blue-600 group-hover:text-blue-700',
    amber: 'text-amber-600 group-hover:text-amber-700',
    purple: 'text-purple-600 group-hover:text-purple-700',
    red: 'text-red-600 group-hover:text-red-700',
    cyan: 'text-cyan-600 group-hover:text-cyan-700',
    emerald: 'text-emerald-600 group-hover:text-emerald-700',
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: delay * 0.05,
        ease: [0.22, 1, 0.36, 1]
      }}
      whileHover={{
        scale: 1.02,
        y: -2,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`group flex flex-col items-center justify-center p-5 rounded-xl transition-all duration-300 ${colorStyles[color][variant]} ${variant !== 'solid' ? 'bg-white' : ''}`}
    >
      <motion.div
        whileHover={{ scale: 1.15, rotate: 5 }}
        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        className={`mb-3 ${variant === 'solid' ? 'text-white' : iconColors[color]}`}
      >
        {icon}
      </motion.div>
      <span className={`text-sm font-medium ${variant === 'solid' ? 'text-white' : 'text-gray-700'}`}>
        {title}
      </span>
      {description && (
        <span className={`text-xs mt-1 ${variant === 'solid' ? 'text-white/80' : 'text-gray-500'}`}>
          {description}
        </span>
      )}
    </motion.button>
  );
}
