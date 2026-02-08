import React from 'react';
import { cn } from '../utils';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'circle' | 'square';
  className?: string;
}

/**
 * Avatar - User avatars with fallback initials
 * Displays user image or initials with colored background
 */
export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  variant = 'circle',
  className,
  ...props
}) => {
  const [imageError, setImageError] = React.useState(false);

  // Extract initials from name (max 2 characters)
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0]?.charAt(0).toUpperCase() || '?';
    const firstChar = parts[0]?.charAt(0) || '';
    const lastChar = parts[parts.length - 1]?.charAt(0) || '';
    return (firstChar + lastChar).toUpperCase() || '?';
  };

  // Generate consistent color based on name
  const getColorFromName = (name: string) => {
    const colors = [
      'bg-red-500',
      'bg-orange-500',
      'bg-amber-500',
      'bg-yellow-500',
      'bg-lime-500',
      'bg-green-500',
      'bg-emerald-500',
      'bg-teal-500',
      'bg-cyan-500',
      'bg-sky-500',
      'bg-blue-500',
      'bg-indigo-500',
      'bg-violet-500',
      'bg-purple-500',
      'bg-fuchsia-500',
      'bg-pink-500',
    ];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const roundedClasses = {
    circle: 'rounded-full',
    square: 'rounded-lg',
  };

  const showInitials = !src || imageError;

  return (
    <div
      className={cn(
        // Base styles
        'inline-flex items-center justify-center',
        'font-semibold text-white',
        'overflow-hidden',
        'select-none',
        'shrink-0',
        // Size
        sizeClasses[size],
        // Shape
        roundedClasses[variant],
        // Background color (only for initials)
        showInitials && getColorFromName(name),
        // Custom
        className
      )}
      title={name}
      {...props}
    >
      {showInitials ? (
        <span>{getInitials(name)}</span>
      ) : (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      )}
    </div>
  );
};
