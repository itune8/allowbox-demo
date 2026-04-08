'use client';

import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';

export interface RoleCardProps {
  label: string;
  description: string;
  Icon: LucideIcon;
  /** 'amber' (Parent) or 'emerald' (Teacher). Tailwind color family name. */
  accentColor: 'amber' | 'emerald';
  /** True while this card is mid-transition to its panel. Drives the zoom-out animation. */
  isExpanding: boolean;
  /** True if a sibling card is expanding. Used to fade this card out while the other takes the stage. */
  siblingIsExpanding: boolean;
  onEnter: () => void;
}

const STRIPE_CLASSES: Record<RoleCardProps['accentColor'], string> = {
  amber:   'bg-amber-500',
  emerald: 'bg-emerald-500',
};

const ICON_CLASSES: Record<RoleCardProps['accentColor'], string> = {
  amber:   'text-amber-500',
  emerald: 'text-emerald-500',
};

export function RoleCard({
  label,
  description,
  Icon,
  accentColor,
  isExpanding,
  siblingIsExpanding,
  onEnter,
}: RoleCardProps) {
  const disabled = isExpanding || siblingIsExpanding;

  return (
    <button
      type="button"
      onClick={onEnter}
      disabled={disabled}
      aria-label={`Enter ${label} demo`}
      className={[
        'group relative overflow-hidden',
        'w-full sm:w-[300px] h-[200px] sm:h-[340px]',
        'bg-white rounded-2xl',
        'border border-black/5',
        'shadow-[0_4px_24px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]',
        'text-left',
        'transition-all duration-300 ease-smooth',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900',
        !disabled && 'hover:-translate-y-2 hover:shadow-[0_12px_40px_rgba(0,0,0,0.10),0_2px_4px_rgba(0,0,0,0.06)] active:scale-[0.98]',
        !disabled && 'animate-card-float',
        isExpanding && 'animate-card-enter',
        siblingIsExpanding && 'opacity-0 transition-opacity duration-300',
      ].filter(Boolean).join(' ')}
    >
      {/* Accent stripe */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${STRIPE_CLASSES[accentColor]}`} aria-hidden />

      {/* Content */}
      <div className="relative h-full flex flex-col justify-between p-6 pl-8">
        <div>
          <Icon className={`w-12 h-12 ${ICON_CLASSES[accentColor]} mb-4`} aria-hidden />
          <div className="text-2xl font-bold text-gray-900 mb-2">{label}</div>
          <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
        </div>

        <div className="flex items-center gap-2 text-sm font-medium text-gray-900 group-hover:gap-3 transition-all">
          <span>Tap to enter</span>
          <ArrowRight className="w-4 h-4" aria-hidden />
        </div>
      </div>
    </button>
  );
}
