'use client';

const schoolStatusColors: Record<string, { bg: string; text: string; dot: string }> = {
  active: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  inactive: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
  blocked: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  present: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  absent: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  late: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  on_leave: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
  class_teacher: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  subject_teacher: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  submitted: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  graded: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  not_submitted: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  partial: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  paid: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  overdue: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  approved: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  rejected: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  upcoming: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  cancelled: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
  in_progress: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  draft: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
  open: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  resolved: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  closed: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
  scheduled: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  low_stock: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  out_of_stock: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  in_stock: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  high: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  medium: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  low: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  urgent: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
};

function formatLabel(value: string): string {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

interface SchoolStatusBadgeProps {
  value: string;
  showDot?: boolean;
}

export function SchoolStatusBadge({ value, showDot = true }: SchoolStatusBadgeProps) {
  const normalized = value.toLowerCase().replace(/\s+/g, '_');
  const colors = schoolStatusColors[normalized] || { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />}
      {formatLabel(value)}
    </span>
  );
}
