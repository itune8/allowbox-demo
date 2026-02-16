import { statusColors, planColors, roleColors, priorityColors, roleLabels } from '../../lib/platform-design-tokens';

type BadgeType = 'status' | 'plan' | 'role' | 'priority';

interface StatusBadgeProps {
  value: string;
  type?: BadgeType;
  showDot?: boolean;
  className?: string;
}

function getColors(value: string, type: BadgeType) {
  const key = value.toLowerCase().replace(/\s+/g, '_');
  switch (type) {
    case 'plan':
      return planColors[key] || { bg: 'bg-slate-100', text: 'text-slate-600' };
    case 'role':
      return roleColors[key] || { bg: 'bg-slate-100', text: 'text-slate-600' };
    case 'priority':
      return priorityColors[key] || { bg: 'bg-slate-100', text: 'text-slate-600' };
    case 'status':
    default:
      return statusColors[key] || { bg: 'bg-slate-100', text: 'text-slate-600' };
  }
}

function getLabel(value: string, type: BadgeType) {
  if (type === 'role') {
    const key = value.toLowerCase().replace(/\s+/g, '_');
    return roleLabels[key] || value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' ');
  }
  return value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' ');
}

function getDotColor(value: string, type: BadgeType): string | undefined {
  if (type === 'status') {
    const key = value.toLowerCase().replace(/\s+/g, '_');
    const colors = statusColors[key];
    return colors?.dot;
  }
  return undefined;
}

export function StatusBadge({ value, type = 'status', showDot = false, className = '' }: StatusBadgeProps) {
  const colors = getColors(value, type);
  const label = getLabel(value, type);
  const dotColor = showDot ? getDotColor(value, type) : undefined;

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${colors.bg} ${colors.text} ${className}`}
    >
      {dotColor && <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />}
      {label}
    </span>
  );
}
