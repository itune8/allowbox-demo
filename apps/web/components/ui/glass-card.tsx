'use client';

import { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  variant?: 'default' | 'strong' | 'subtle';
  hover?: boolean;
  glow?: 'none' | 'indigo' | 'purple' | 'blue';
}

export function GlassCard({
  children,
  variant = 'default',
  hover = true,
  glow = 'none',
  className = '',
  ...props
}: GlassCardProps) {
  const variantClasses = {
    default: 'glass',
    strong: 'glass-strong',
    subtle: 'glass-subtle',
  };

  const glowClasses = {
    none: '',
    indigo: 'glow-indigo',
    purple: 'glow-purple',
    blue: 'glow-blue',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : undefined}
      className={`rounded-xl ${variantClasses[variant]} ${glowClasses[glow]} ${hover ? 'hover-lift' : ''} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
