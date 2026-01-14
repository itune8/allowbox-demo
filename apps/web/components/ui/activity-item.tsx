'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ActivityItemProps {
  icon: ReactNode;
  message: string;
  time: string;
  type?: 'default' | 'success' | 'warning' | 'error';
  delay?: number;
}

export function ActivityItem({
  icon,
  message,
  time,
  type = 'default',
  delay = 0,
}: ActivityItemProps) {
  const bgColors = {
    default: 'bg-gray-100',
    success: 'bg-emerald-100',
    warning: 'bg-amber-100',
    error: 'bg-red-100',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.4,
        delay: delay * 0.1,
        ease: [0.22, 1, 0.36, 1]
      }}
      whileHover={{
        backgroundColor: 'rgba(249, 250, 251, 1)',
        x: 4,
        transition: { duration: 0.2 }
      }}
      className="flex items-start gap-4 p-4 rounded-xl cursor-pointer"
    >
      <motion.div
        whileHover={{ scale: 1.1, rotate: 10 }}
        className={`w-10 h-10 rounded-xl ${bgColors[type]} flex items-center justify-center flex-shrink-0`}
      >
        <span className="text-xl">{icon}</span>
      </motion.div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">{message}</p>
        <p className="text-xs text-gray-500 mt-1">{time}</p>
      </div>
    </motion.div>
  );
}
