'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  BookOpen,
  GraduationCap,
  FileText,
  BookMarked,
  DollarSign,
  HeartPulse,
  Bus,
  Package,
  CalendarCheck,
  Calendar,
  MessageSquare,
  BarChart3,
  Settings,
  HelpCircle,
  MoreHorizontal,
  Home,
  type LucideIcon,
} from 'lucide-react';

interface AnimatedIconProps {
  name: string;
  className?: string;
  isActive?: boolean;
}

const iconMap: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  home: Home,
  students: Users,
  staff: UserPlus,
  classes: BookOpen,
  grades: GraduationCap,
  homework: FileText,
  diary: BookMarked,
  fees: DollarSign,
  health: HeartPulse,
  transport: Bus,
  inventory: Package,
  leave: CalendarCheck,
  events: Calendar,
  messages: MessageSquare,
  reports: BarChart3,
  settings: Settings,
  support: HelpCircle,
  more: MoreHorizontal,
};

// 3D gradient backgrounds for icons
const iconGradients: Record<string, string> = {
  dashboard: 'from-indigo-500 to-purple-600',
  home: 'from-indigo-500 to-purple-600',
  students: 'from-blue-500 to-cyan-500',
  staff: 'from-emerald-500 to-teal-500',
  classes: 'from-violet-500 to-purple-500',
  grades: 'from-amber-500 to-orange-500',
  homework: 'from-rose-500 to-pink-500',
  diary: 'from-sky-500 to-blue-500',
  fees: 'from-yellow-500 to-amber-500',
  health: 'from-red-500 to-rose-500',
  transport: 'from-slate-500 to-gray-600',
  inventory: 'from-cyan-500 to-teal-500',
  leave: 'from-green-500 to-emerald-500',
  events: 'from-fuchsia-500 to-pink-500',
  messages: 'from-blue-500 to-indigo-500',
  reports: 'from-purple-500 to-violet-500',
  settings: 'from-gray-500 to-slate-600',
  support: 'from-orange-500 to-red-500',
  more: 'from-gray-400 to-gray-500',
};

export function AnimatedIcon({ name, className = '', isActive = false }: AnimatedIconProps) {
  const Icon = iconMap[name] || LayoutDashboard;
  const gradient = iconGradients[name] || 'from-gray-500 to-gray-600';

  return (
    <motion.div
      whileHover={{ scale: 1.15, rotate: 5 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      className={`relative ${className}`}
    >
      {/* 3D effect background */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`absolute inset-0 rounded-lg bg-gradient-to-br ${gradient} opacity-20 blur-sm`}
        />
      )}
      <Icon
        className={`w-5 h-5 relative z-10 ${isActive ? 'drop-shadow-md' : ''}`}
      />
    </motion.div>
  );
}

// Standalone animated icon component for use anywhere
interface StandaloneIconProps {
  icon: LucideIcon;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  gradient?: string;
  animated?: boolean;
  className?: string;
}

export function Icon3D({
  icon: IconComponent,
  size = 'md',
  gradient = 'from-indigo-500 to-purple-600',
  animated = true,
  className = '',
}: StandaloneIconProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  };

  const containerSizes = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
    xl: 'p-3',
  };

  const Wrapper = animated ? motion.div : 'div';
  const wrapperProps = animated
    ? {
        whileHover: { scale: 1.1, y: -2 },
        whileTap: { scale: 0.95 },
        transition: { type: 'spring' as const, stiffness: 400, damping: 15 },
      }
    : {};

  return (
    <Wrapper
      {...wrapperProps}
      className={`relative inline-flex items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg ${containerSizes[size]} ${className}`}
      style={{
        boxShadow: `0 4px 14px 0 rgba(99, 102, 241, 0.3), 0 1px 3px 0 rgba(0, 0, 0, 0.1)`,
      }}
    >
      {/* Inner highlight for 3D effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/20 to-transparent" />
      <IconComponent className={`relative z-10 ${sizeClasses[size]}`} />
    </Wrapper>
  );
}
