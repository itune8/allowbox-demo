'use client';

import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { Portal } from '../portal';
import {
  X,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  CreditCard,
  FileText,
  Download,
  Receipt,
} from 'lucide-react';
import { StatusBadge } from './status-badge';
import type { School } from '../../lib/services/superadmin/school.service';

export interface PaymentRecord {
  invoiceId: string;
  date: string;
  plan: string;
  duration: string;
  users: number;
  revenue: number;
  nextBilling: string;
}

interface SchoolDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  school: School | null;
  onOpenInvoice?: (school: School, payment: PaymentRecord) => void;
}

export function SchoolDetailsModal({
  isOpen,
  onClose,
  school,
  onOpenInvoice,
}: SchoolDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'users' | 'payments'>('info');

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      setActiveTab('info');
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen || !school) return null;

  const totalUsers = (school.studentCount || 0) + (school.teacherCount || 0);
  const engagement = Math.floor(Math.random() * 20) + 78;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Generate payment history based on school data
  const generatePaymentHistory = (): PaymentRecord[] => {
    const plan = school.subscriptionPlan || 'premium';
    const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1);
    const records: PaymentRecord[] = [];
    const baseDate = new Date();

    for (let i = 0; i < 3; i++) {
      const date = new Date(baseDate);
      date.setMonth(date.getMonth() - i);
      const nextDate = new Date(date);
      nextDate.setMonth(nextDate.getMonth() + 1);
      const userCount = totalUsers - i * 14;

      records.push({
        invoiceId: `INV-${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}${String(i + 1).padStart(2, '0')}`,
        date: date.toISOString(),
        plan: planLabel,
        duration: '1 Month',
        users: userCount > 0 ? userCount : totalUsers,
        revenue: school.mrr || (school.pricePerStudent || 4.5) * totalUsers,
        nextBilling: nextDate.toISOString(),
      });
    }
    return records;
  };

  const payments = generatePaymentHistory();

  const tabs = [
    { key: 'info' as const, label: 'School Info' },
    { key: 'users' as const, label: 'Users' },
    { key: 'payments' as const, label: 'Payment History' },
  ];

  return (
    <Portal>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 z-[9998] transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-6">
        <div
          className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-[680px] max-h-[92vh] sm:max-h-[85vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-5 sm:px-7 py-5 border-b border-slate-200">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">School Details</h2>
            <button
              onClick={onClose}
              className="p-2 -mr-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* ── Tabs ── */}
          <div className="px-5 sm:px-7 border-b border-slate-200">
            <div className="flex gap-1 overflow-x-auto -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Content ── */}
          <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-6">
            {activeTab === 'info' && (
              <SchoolInfoTab
                school={school}
                totalUsers={totalUsers}
                engagement={engagement}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
              />
            )}
            {activeTab === 'users' && <UsersTab school={school} />}
            {activeTab === 'payments' && (
              <PaymentHistoryTab
                payments={payments}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
                onInvoice={(payment) => onOpenInvoice?.(school, payment)}
              />
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
}

/* ────────────────────────────────────────────────────────────
   Shared: InfoRow — consistent label + value pair with divider
   ──────────────────────────────────────────────────────────── */
function InfoRow({
  label,
  value,
  children,
  noBorder,
}: {
  label: string;
  value?: string;
  children?: ReactNode;
  noBorder?: boolean;
}) {
  return (
    <div className={`py-3.5 ${noBorder ? '' : 'border-b border-slate-100'}`}>
      <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1.5">
        {label}
      </p>
      {children ? (
        <div>{children}</div>
      ) : (
        <p className="text-[14px] font-semibold text-slate-800">{value || '—'}</p>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Tab 1: School Info
   ──────────────────────────────────────────────────────────── */
function SchoolInfoTab({
  school,
  totalUsers,
  engagement,
  formatCurrency,
  formatDate,
}: {
  school: School;
  totalUsers: number;
  engagement: number;
  formatCurrency: (n: number) => string;
  formatDate: (s?: string) => string;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-0">
      {/* Left Column — Basic Information */}
      <div>
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1 pb-3 border-b-2 border-slate-200">
          Basic Information
        </h3>
        <InfoRow label="School Name" value={school.schoolName} />
        <InfoRow label="Status">
          <StatusBadge value={school.subscriptionStatus} type="status" showDot />
        </InfoRow>
        <InfoRow label="Total Users" value={String(totalUsers)} />
        <InfoRow label="Engagement Score" value={`${engagement}%`} />
        {school.contactEmail && (
          <InfoRow label="Contact Email" value={school.contactEmail} />
        )}
        {school.contactPhone && (
          <InfoRow label="Contact Phone" value={school.contactPhone} />
        )}
        {(school.address || school.city) && (
          <InfoRow
            label="Location"
            value={[school.address, school.city, school.state, school.country]
              .filter(Boolean)
              .join(', ')}
            noBorder
          />
        )}
      </div>

      {/* Right Column — Current Plan & Billing */}
      <div>
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1 pb-3 border-b-2 border-slate-200 mt-4 sm:mt-0">
          Current Plan & Billing
        </h3>
        <InfoRow label="Plan">
          <StatusBadge value={school.subscriptionPlan} type="plan" />
        </InfoRow>
        <InfoRow label="Monthly Revenue" value={formatCurrency(school.mrr || 0)} />
        <InfoRow label="Next Billing Date" value={formatDate(school.nextBillingDate)} />
        <InfoRow
          label="Payment Method"
          value={`Credit Card ****${Math.floor(1000 + Math.random() * 9000)}`}
        />
        <InfoRow
          label="Price Per Student"
          value={formatCurrency(school.pricePerStudent || 4.5)}
        />
        {school.trialEndDate && (
          <InfoRow label="Trial Ends" value={formatDate(school.trialEndDate)} noBorder />
        )}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Tab 2: Users
   ──────────────────────────────────────────────────────────── */
function UsersTab({ school }: { school: School }) {
  const admin = school.adminId;
  const mockUsers = [
    ...(admin
      ? [
          {
            name: `${admin.firstName} ${admin.lastName}`,
            email: admin.email,
            role: 'Admin',
          },
        ]
      : []),
    { name: 'John Smith', email: 'john.smith@school.edu', role: 'Teacher' },
    { name: 'Sarah Johnson', email: 'sarah.j@school.edu', role: 'Teacher' },
    { name: 'Michael Brown', email: 'mbrown@school.edu', role: 'Staff' },
  ];

  return (
    <div className="space-y-6">
      {/* Summary header */}
      <div>
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
          School Users
        </h3>
        <p className="text-sm text-slate-500">
          {school.teacherCount || 0} teachers, {school.studentCount || 0} students,{' '}
          {school.staffCount || 0} staff
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { count: school.teacherCount || 0, label: 'Teachers', bg: 'bg-purple-50', text: 'text-purple-700', sub: 'text-purple-500' },
          { count: school.studentCount || 0, label: 'Students', bg: 'bg-blue-50', text: 'text-blue-700', sub: 'text-blue-500' },
          { count: school.staffCount || 0, label: 'Staff', bg: 'bg-emerald-50', text: 'text-emerald-700', sub: 'text-emerald-500' },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.bg} rounded-xl p-4 text-center`}>
            <p className={`text-2xl font-bold ${stat.text}`}>{stat.count}</p>
            <p className={`text-xs font-medium ${stat.sub} mt-0.5`}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* User table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50/80">
            <tr className="border-b border-slate-200">
              <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                Email
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Role
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {mockUsers.map((u, i) => (
              <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-700 flex-shrink-0">
                      {u.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div className="min-w-0">
                      <span className="font-semibold text-slate-800 block">{u.name}</span>
                      <span className="text-xs text-slate-400 sm:hidden block truncate">{u.email}</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-slate-500 hidden sm:table-cell">{u.email}</td>
                <td className="px-4 py-3.5">
                  <StatusBadge value={u.role.toLowerCase()} type="role" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Tab 3: Payment History
   ──────────────────────────────────────────────────────────── */
function PaymentHistoryTab({
  payments,
  formatCurrency,
  formatDate,
  onInvoice,
}: {
  payments: PaymentRecord[];
  formatCurrency: (n: number) => string;
  formatDate: (s?: string) => string;
  onInvoice?: (payment: PaymentRecord) => void;
}) {
  const shortDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  return (
    <div className="space-y-4">
      {payments.map((payment) => (
        <div
          key={payment.invoiceId}
          className="border border-slate-200 rounded-xl overflow-hidden"
        >
          {/* Card body */}
          <div className="p-5">
            {/* Row of fields — wraps naturally */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
              <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">
                  Invoice ID
                </p>
                <p className="text-sm font-bold text-slate-900">{payment.invoiceId}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">
                  Date
                </p>
                <p className="text-sm font-semibold text-slate-800">{shortDate(payment.date)}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">
                  Plan
                </p>
                <p className="text-sm font-semibold text-slate-800">{payment.plan}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">
                  Duration
                </p>
                <p className="text-sm font-semibold text-slate-800">{payment.duration}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">
                  Users
                </p>
                <p className="text-sm font-semibold text-slate-800">{payment.users}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">
                  Revenue
                </p>
                <p className="text-sm font-bold text-emerald-600">
                  {formatCurrency(payment.revenue)}
                </p>
              </div>
            </div>
          </div>

          {/* Card footer — next billing + action buttons */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-3.5 bg-slate-50/60 border-t border-slate-100">
            <p className="text-xs text-slate-400">
              Next Billing: <span className="font-medium text-slate-500">{shortDate(payment.nextBilling)}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onInvoice?.(payment)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                Invoice
              </button>
              <button className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors">
                <Receipt className="w-3.5 h-3.5" />
                Receipt
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
