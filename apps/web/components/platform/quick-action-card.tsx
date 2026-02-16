import { type ReactNode } from 'react';

interface QuickActionCardProps {
  icon: ReactNode;
  label: string;
  color: string; // e.g. 'purple', 'blue', 'green', 'orange'
  variant?: 'solid' | 'dashed';
  onClick: () => void;
}

const colorMap: Record<string, { bg: string; iconColor: string; border: string }> = {
  purple: { bg: 'bg-purple-100', iconColor: 'text-purple-600', border: 'border-purple-200' },
  blue: { bg: 'bg-blue-100', iconColor: 'text-blue-600', border: 'border-blue-200' },
  green: { bg: 'bg-emerald-100', iconColor: 'text-emerald-600', border: 'border-emerald-200' },
  orange: { bg: 'bg-orange-100', iconColor: 'text-orange-600', border: 'border-orange-200' },
};

export function QuickActionCard({ icon, label, color, variant = 'solid', onClick }: QuickActionCardProps) {
  const colors = colorMap[color] ?? colorMap.purple!;

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-3 p-6 rounded-xl border bg-white hover:shadow-md transition-all ${
        variant === 'dashed' ? `border-dashed ${colors.border}` : 'border-slate-200'
      }`}
    >
      <div className={`p-3 rounded-xl ${colors.bg}`}>
        <span className={colors.iconColor}>{icon}</span>
      </div>
      <span className="text-sm font-medium text-slate-700">{label}</span>
    </button>
  );
}
