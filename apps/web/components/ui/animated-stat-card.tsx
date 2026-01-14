'use client';

import { ReactNode, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface AnimatedStatCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  iconBgColor?: string;
  gradient?: string; // For backwards compatibility - converts to iconBgColor
  delay?: number;
  onClick?: () => void;
}

export function AnimatedStatCard({
  title,
  value,
  icon,
  trend,
  iconBgColor = 'bg-indigo-50',
  gradient,
  delay = 0,
  onClick,
}: AnimatedStatCardProps) {
  // Convert gradient to iconBgColor if provided
  const bgClass = gradient ? `bg-gradient-to-br ${gradient}` : iconBgColor;
  const [displayValue, setDisplayValue] = useState(0);
  const numericValue = typeof value === 'number' ? value : parseInt(value) || 0;

  useEffect(() => {
    if (typeof value !== 'number') {
      return;
    }

    const duration = 1000;
    const steps = 30;
    const increment = numericValue / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= numericValue) {
        setDisplayValue(numericValue);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [numericValue, value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: delay * 0.1,
        ease: [0.22, 1, 0.36, 1]
      }}
      whileHover={{
        y: -4,
        boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.1)',
        transition: { duration: 0.2 }
      }}
      onClick={onClick}
      className={`bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-xl transition-all duration-300 ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-2">{title}</p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-3xl font-bold text-gray-900 tracking-tight"
          >
            {typeof value === 'number' ? displayValue : value}
          </motion.p>
          {trend && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay * 0.1 + 0.3 }}
              className="flex items-center gap-1 mt-2"
            >
              <span className={`text-xs font-medium ${trend.isPositive !== false ? 'text-emerald-600' : 'text-red-500'}`}>
                {trend.isPositive !== false ? '↑' : '↓'} {trend.value}
              </span>
            </motion.div>
          )}
        </div>
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 400 }}
          className={`p-3 rounded-xl ${bgClass} ${gradient ? 'text-white' : ''}`}
        >
          {icon}
        </motion.div>
      </div>
    </motion.div>
  );
}
