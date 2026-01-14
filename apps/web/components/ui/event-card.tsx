'use client';

import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin } from 'lucide-react';

interface EventCardProps {
  title: string;
  date: string;
  time?: string;
  location?: string;
  color?: string;
  delay?: number;
  onClick?: () => void;
}

export function EventCard({
  title,
  date,
  time,
  location,
  color = 'bg-indigo-500',
  delay = 0,
  onClick,
}: EventCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.4,
        delay: delay * 0.1,
        ease: [0.22, 1, 0.36, 1]
      }}
      whileHover={{
        x: 4,
        backgroundColor: 'rgba(249, 250, 251, 1)',
        transition: { duration: 0.2 }
      }}
      onClick={onClick}
      className="flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-colors"
    >
      <motion.div
        whileHover={{ scale: 1.2 }}
        className={`w-3 h-3 rounded-full ${color} mt-1.5 flex-shrink-0`}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{title}</p>
        <div className="flex flex-wrap items-center gap-3 mt-1.5">
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            {date}
          </span>
          {time && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              {time}
            </span>
          )}
          {location && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="w-3 h-3" />
              {location}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
