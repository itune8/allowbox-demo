// Centralized design tokens for the Super Admin platform
// All color mappings used across pages

export const statCardColors = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-600', icon: 'text-blue-600' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-600', icon: 'text-purple-600' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-600', icon: 'text-orange-600' },
  green: { bg: 'bg-emerald-100', text: 'text-emerald-600', icon: 'text-emerald-600' },
  red: { bg: 'bg-red-100', text: 'text-red-600', icon: 'text-red-600' },
  amber: { bg: 'bg-amber-100', text: 'text-amber-600', icon: 'text-amber-600' },
  teal: { bg: 'bg-teal-100', text: 'text-teal-600', icon: 'text-teal-600' },
  cyan: { bg: 'bg-cyan-100', text: 'text-cyan-600', icon: 'text-cyan-600' },
  slate: { bg: 'bg-slate-100', text: 'text-slate-600', icon: 'text-slate-600' },
} as const;

export type StatCardColor = keyof typeof statCardColors;

export const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  active: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  paid: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  trial: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  overdue: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  failed: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  suspended: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  inactive: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
  draft: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
  cancelled: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
  closed: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
  open: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  in_progress: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  waiting_for_user: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
  resolved: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  scheduled: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  sent: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  online: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  maintenance: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  healthy: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  // School-specific statuses
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
  blocked: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  approved: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  rejected: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  upcoming: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
};

export const planColors: Record<string, { bg: string; text: string }> = {
  premium: { bg: 'bg-purple-50', text: 'text-purple-700' },
  standard: { bg: 'bg-blue-50', text: 'text-blue-700' },
  enterprise: { bg: 'bg-indigo-50', text: 'text-indigo-700' },
  basic: { bg: 'bg-slate-100', text: 'text-slate-600' },
  free: { bg: 'bg-slate-100', text: 'text-slate-600' },
};

export const roleColors: Record<string, { bg: string; text: string }> = {
  super_admin: { bg: 'bg-purple-50', text: 'text-purple-700' },
  admin: { bg: 'bg-purple-50', text: 'text-purple-700' },
  sales: { bg: 'bg-blue-50', text: 'text-blue-700' },
  finance: { bg: 'bg-amber-50', text: 'text-amber-700' },
  support: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  tenant_admin: { bg: 'bg-slate-100', text: 'text-slate-700' },
};

export const priorityColors: Record<string, { bg: string; text: string; bar: string }> = {
  high: { bg: 'bg-red-50', text: 'text-red-700', bar: 'bg-red-500' },
  medium: { bg: 'bg-amber-50', text: 'text-amber-700', bar: 'bg-amber-500' },
  low: { bg: 'bg-blue-50', text: 'text-blue-700', bar: 'bg-blue-500' },
  urgent: { bg: 'bg-red-50', text: 'text-red-700', bar: 'bg-red-600' },
};

export const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  sales: 'Sales',
  finance: 'Finance',
  support: 'Support',
  tenant_admin: 'School Admin',
};
