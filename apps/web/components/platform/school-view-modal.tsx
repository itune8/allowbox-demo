'use client';

import { useEffect, useCallback, type ReactElement } from 'react';
import { Portal } from '../portal';
import {
  X,
  Building2,
  Check,
  Ban,
  XCircle,
  Download,
} from 'lucide-react';
import type { School } from '../../lib/services/superadmin/school.service';

interface SchoolViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  school: School | null;
  onActivate?: (school: School) => void;
  onReject?: (school: School) => void;
  onBlock?: (school: School) => void;
  actionLoading?: boolean;
}

export function SchoolViewModal({
  isOpen,
  onClose,
  school,
  onActivate,
  onReject,
  onBlock,
  actionLoading,
}: SchoolViewModalProps) {
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
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen || !school) return null;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const shortDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  const status = school.subscriptionStatus;
  const totalUsers = (school.teacherCount || 0) + (school.staffCount || 0);
  const totalStudents = school.studentCount || 0;
  const planLabel =
    (school.subscriptionPlan || 'basic').charAt(0).toUpperCase() +
    (school.subscriptionPlan || 'basic').slice(1);

  // Status-based action buttons
  const getActionButtons = () => {
    const buttons: ReactElement[] = [];

    if (status === 'trial' || status === 'suspended' || status === 'cancelled' || !school.isActive) {
      buttons.push(
        <button
          key="activate"
          onClick={() => onActivate?.(school)}
          disabled={actionLoading}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          <Check className="w-4 h-4" />
          Activate
        </button>
      );
    }

    if (status === 'trial' || !school.isActive) {
      buttons.push(
        <button
          key="reject"
          onClick={() => onReject?.(school)}
          disabled={actionLoading}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          <XCircle className="w-4 h-4" />
          Reject
        </button>
      );
    }

    if (status === 'active' && school.isActive) {
      buttons.push(
        <button
          key="block"
          onClick={() => onBlock?.(school)}
          disabled={actionLoading}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          <Ban className="w-4 h-4" />
          Block
        </button>
      );
    }

    return buttons;
  };

  // Generate mock payment history
  const generatePayments = () => {
    const records = [];
    const baseDate = new Date();
    for (let i = 0; i < 3; i++) {
      const invoiceDate = new Date(baseDate);
      invoiceDate.setMonth(invoiceDate.getMonth() - i * 6);
      const paymentDate = new Date(invoiceDate);
      paymentDate.setDate(paymentDate.getDate() + 1);
      const userCount = totalUsers + totalStudents - i * 5;
      const amount = (school.pricePerStudent || 4.5) * (userCount > 0 ? userCount : totalUsers + totalStudents);

      records.push({
        invoiceDate: invoiceDate.toISOString(),
        paymentDate: paymentDate.toISOString(),
        plan: `${planLabel} / Annual`,
        users: userCount > 0 ? userCount : totalUsers + totalStudents,
        amount: Math.round(amount * 12),
      });
    }
    return records;
  };

  const payments = generatePayments();
  const address = [school.address, school.city, school.state, school.postalCode]
    .filter(Boolean)
    .join(', ') || '123 Education Street, New York, NY 10001';

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
          className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-[640px] max-h-[92vh] sm:max-h-[85vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">School Details</h2>
            <button
              onClick={onClose}
              className="p-2 -mr-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {/* School Name + ID + Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#824ef2]/10">
                  <Building2 className="w-6 h-6 text-[#824ef2]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{school.schoolName}</h3>
                  <p className="text-sm text-slate-400">ID: {school.tenantId || 'SCH-001'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-12 sm:ml-0">
                {getActionButtons()}
              </div>
            </div>

            {/* Contact Information Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <p className="text-[11px] font-semibold text-[#824ef2] uppercase tracking-wider mb-1.5">
                    Address
                  </p>
                  <p className="text-sm font-medium text-slate-800">{address}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#824ef2] uppercase tracking-wider mb-1.5">
                    Email
                  </p>
                  <p className="text-sm font-medium text-slate-800">
                    {school.contactEmail || 'contact@school.edu'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#824ef2] uppercase tracking-wider mb-1.5">
                    Contact Number
                  </p>
                  <p className="text-sm font-medium text-slate-800">
                    {school.contactPhone || '+1 (555) 123-4567'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#824ef2] uppercase tracking-wider mb-1.5">
                    Registration Date
                  </p>
                  <p className="text-sm font-medium text-slate-800">
                    {formatDate(school.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Current Plan Card - Purple Gradient */}
            <h3 className="text-base font-bold text-slate-900 mb-3">Current Plan</h3>
            <div className="rounded-xl overflow-hidden mb-6" style={{ background: 'linear-gradient(135deg, #824ef2 0%, #a78bfa 100%)' }}>
              {/* Plan top row */}
              <div className="px-5 pt-5 pb-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-white/70 uppercase tracking-wider">Plan Type</p>
                  <p className="text-xl font-bold text-white mt-0.5">{planLabel} Plan</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-white/70 uppercase tracking-wider">Billing Cycle</p>
                  <p className="text-xl font-bold text-white mt-0.5">Annual</p>
                </div>
              </div>
              {/* Plan bottom row */}
              <div className="px-5 pb-5 pt-3 border-t border-white/20 grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs font-medium text-white/70 uppercase tracking-wider">Users</p>
                  <p className="text-base font-bold text-white mt-0.5">{totalUsers} Users</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-white/70 uppercase tracking-wider">Students</p>
                  <p className="text-base font-bold text-white mt-0.5">
                    {totalStudents.toLocaleString()} Students
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-white/70 uppercase tracking-wider">Next Billing</p>
                  <p className="text-base font-bold text-white mt-0.5">
                    {school.nextBillingDate
                      ? shortDate(school.nextBillingDate)
                      : 'Jan 15, 2025'}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment History */}
            <h3 className="text-base font-bold text-slate-900 mb-3">Payment History</h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200">
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#824ef2] uppercase tracking-wider">
                      Invoice Date
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#824ef2] uppercase tracking-wider">
                      Payment Date
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#824ef2] uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#824ef2] uppercase tracking-wider">
                      Users
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#824ef2] uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#824ef2] uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((p, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 text-slate-700">{shortDate(p.invoiceDate)}</td>
                      <td className="px-4 py-3 text-slate-700">{shortDate(p.paymentDate)}</td>
                      <td className="px-4 py-3 text-slate-700">{p.plan}</td>
                      <td className="px-4 py-3 text-slate-700">{p.users}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <button className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-[#824ef2] transition-colors">
                          <Download className="w-3.5 h-3.5" />
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
