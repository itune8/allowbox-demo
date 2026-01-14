'use client';

import { ReactNode } from 'react';

interface MarqueeProps {
  children: ReactNode;
  speed?: 'slow' | 'normal' | 'fast';
  direction?: 'left' | 'right';
  pauseOnHover?: boolean;
  className?: string;
}

export function Marquee({
  children,
  speed = 'normal',
  direction = 'left',
  pauseOnHover = true,
  className = '',
}: MarqueeProps) {
  const speedClasses = {
    slow: 'animate-marquee-slow',
    normal: 'animate-marquee',
    fast: '[animation-duration:15s]',
  };

  const animationClass = direction === 'right' ? 'animate-marquee-reverse' : speedClasses[speed];

  return (
    <div className={`overflow-hidden ${className}`}>
      <div
        className={`flex whitespace-nowrap ${animationClass} ${pauseOnHover ? 'hover:[animation-play-state:paused]' : ''}`}
      >
        <div className="flex items-center gap-8 pr-8">{children}</div>
        <div className="flex items-center gap-8 pr-8" aria-hidden="true">{children}</div>
      </div>
    </div>
  );
}

interface MarqueeItemProps {
  children: ReactNode;
  className?: string;
}

export function MarqueeItem({ children, className = '' }: MarqueeItemProps) {
  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 shadow-sm ${className}`}>
      {children}
    </div>
  );
}
