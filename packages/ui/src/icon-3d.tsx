import { ReactNode } from 'react';

interface Icon3DProps {
  children: ReactNode;
  gradient: string;
}

/**
 * Icon3D Component - A 3D styled icon wrapper with gradient background
 *
 * Creates a modern 3D effect with gradient backgrounds and subtle shine effect
 *
 * @param children - The icon element to wrap
 * @param gradient - Tailwind gradient classes (e.g., 'from-indigo-500 to-purple-600')
 */
export function Icon3D({ children, gradient }: Icon3DProps) {
  return (
    <div className={`relative p-1.5 rounded-lg bg-gradient-to-br ${gradient} shadow-sm`}>
      <div className="absolute inset-0 rounded-lg bg-gradient-to-b from-white/30 to-transparent" />
      <div className="relative text-white">{children}</div>
    </div>
  );
}
