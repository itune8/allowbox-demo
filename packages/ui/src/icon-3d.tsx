import { ReactNode } from 'react';

interface Icon3DProps {
  children: ReactNode;
  bgColor: string;
  textColor?: string;
}

/**
 * Icon3D Component - A 3D styled icon wrapper with solid color background
 *
 * Creates a modern 3D effect with solid color backgrounds and subtle shine effect
 *
 * @param children - The icon element to wrap
 * @param bgColor - Tailwind background color class (e.g., 'bg-indigo-600')
 * @param textColor - Optional text color class (defaults to 'text-white')
 */
export function Icon3D({ children, bgColor, textColor = 'text-white' }: Icon3DProps) {
  return (
    <div className={`relative p-1.5 rounded-lg ${bgColor} shadow-sm`}>
      <div className="absolute inset-0 rounded-lg bg-white/10" />
      <div className={`relative ${textColor}`}>{children}</div>
    </div>
  );
}
