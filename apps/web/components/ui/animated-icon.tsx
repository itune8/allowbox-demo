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

// Solid color backgrounds for icons (matching semantic colors)
const iconColors: Record<string, { bg: string; text: string; light: string }> = {
  dashboard: { bg: 'bg-indigo-600', text: 'text-indigo-600', light: 'bg-indigo-50' },
  home: { bg: 'bg-indigo-600', text: 'text-indigo-600', light: 'bg-indigo-50' },
  students: { bg: 'bg-sky-500', text: 'text-sky-500', light: 'bg-sky-50' },
  staff: { bg: 'bg-emerald-500', text: 'text-emerald-500', light: 'bg-emerald-50' },
  classes: { bg: 'bg-violet-500', text: 'text-violet-500', light: 'bg-violet-50' },
  grades: { bg: 'bg-amber-500', text: 'text-amber-500', light: 'bg-amber-50' },
  homework: { bg: 'bg-pink-500', text: 'text-pink-500', light: 'bg-pink-50' },
  diary: { bg: 'bg-cyan-500', text: 'text-cyan-500', light: 'bg-cyan-50' },
  fees: { bg: 'bg-yellow-500', text: 'text-yellow-500', light: 'bg-yellow-50' },
  health: { bg: 'bg-red-500', text: 'text-red-500', light: 'bg-red-50' },
  transport: { bg: 'bg-slate-500', text: 'text-slate-500', light: 'bg-slate-50' },
  inventory: { bg: 'bg-teal-500', text: 'text-teal-500', light: 'bg-teal-50' },
  leave: { bg: 'bg-green-500', text: 'text-green-500', light: 'bg-green-50' },
  events: { bg: 'bg-fuchsia-500', text: 'text-fuchsia-500', light: 'bg-fuchsia-50' },
  messages: { bg: 'bg-blue-500', text: 'text-blue-500', light: 'bg-blue-50' },
  reports: { bg: 'bg-purple-500', text: 'text-purple-500', light: 'bg-purple-50' },
  settings: { bg: 'bg-gray-500', text: 'text-gray-500', light: 'bg-gray-50' },
  support: { bg: 'bg-orange-500', text: 'text-orange-500', light: 'bg-orange-50' },
  more: { bg: 'bg-gray-400', text: 'text-gray-400', light: 'bg-gray-50' },
};

export function AnimatedIcon({ name, className = '', isActive = false }: AnimatedIconProps) {
  const Icon = iconMap[name] || LayoutDashboard;
  const colors = iconColors[name] || { bg: 'bg-gray-500', text: 'text-gray-500', light: 'bg-gray-50' };

  return (
    <motion.div
      whileHover={{ scale: 1.15, rotate: 5 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      className={`relative ${className}`}
    >
      {/* Active state background */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`absolute inset-0 rounded-lg ${colors.light} ring-2 ring-offset-1 ${colors.bg.replace('bg-', 'ring-')}`}
        />
      )}
      <Icon
        className={`w-5 h-5 relative z-10 ${isActive ? `${colors.text} drop-shadow-sm` : ''}`}
      />
    </motion.div>
  );
}

// Standalone animated icon component for use anywhere
interface StandaloneIconProps {
  icon: LucideIcon;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  bgColor?: string;
  textColor?: string;
  animated?: boolean;
  className?: string;
}

export function Icon3D({
  icon: IconComponent,
  size = 'md',
  bgColor = 'bg-indigo-600',
  textColor = 'text-white',
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
      className={`relative inline-flex items-center justify-center rounded-xl ${bgColor} ${textColor} shadow-md hover:shadow-lg transition-shadow ${containerSizes[size]} ${className}`}
    >
      {/* Inner highlight for subtle depth */}
      <div className="absolute inset-0 rounded-xl bg-white/10" />
      <IconComponent className={`relative z-10 ${sizeClasses[size]}`} />
    </Wrapper>
  );
}
