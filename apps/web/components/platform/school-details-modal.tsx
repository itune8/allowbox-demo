'use client';

import { useEffect, useCallback } from 'react';
import { Portal } from '../portal';
import {
  X,
  Download,
  Check,
  Ban,
} from 'lucide-react';
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

  const totalUsers = (school.studentCount || 0) + (school.teacherCount || 0);

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

  const shortDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  const address = [school.address, school.city, school.state, school.country, school.postalCode]
    .filter(Boolean)
    .join(', ') || '—';

  const planLabel = (school.subscriptionPlan || 'basic').charAt(0).toUpperCase() + (school.subscriptionPlan || 'basic').slice(1);
  const isActive = school.isActive || school.subscriptionStatus === 'active';

  // Generate payment history
  const payments: PaymentRecord[] = [];
  const baseDate = new Date();
  for (let i = 0; i < 4; i++) {
    const date = new Date(baseDate);
    date.setMonth(date.getMonth() - i * 6);
    const nextDate = new Date(date);
    nextDate.setMonth(nextDate.getMonth() + 6);
    const userCount = Math.max(totalUsers - i * 10, 0);
    const amount = Math.max((school.mrr || 0) - i * 50, 0);

    payments.push({
      invoiceId: `INV-${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}${String(i + 1).padStart(2, '0')}`,
      date: date.toISOString(),
      plan: `${planLabel} / Annual`,
      duration: 'Annual',
      users: userCount,
      revenue: amount,
      nextBilling: nextDate.toISOString(),
    });
  }

  return (
    <Portal>
      <div
        className="fixed inset-0 bg-slate-900/50 z-[9998] transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-6">
        <div
          className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-[620px] max-h-[92vh] sm:max-h-[88vh] flex flex-col"
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
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {!isActive ? (
                <button className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors">
                  <Check className="w-3.5 h-3.5" />
                  Activate
                </button>
              ) : (
                <button className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-700 rounded-lg hover:bg-slate-800 transition-colors">
                  <Ban className="w-3.5 h-3.5" />
                  Block School
                </button>
              )}
            </div>

            {/* School Information Card */}
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-3">School Information</h3>
              <div className="border border-slate-200 rounded-xl p-5">
                <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">School Name</p>
                    <p className="text-sm font-medium text-slate-900">{school.schoolName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Status</p>
                    <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {isActive ? 'Active' : (school.subscriptionStatus || 'Pending')}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Address</p>
                    <p className="text-sm font-medium text-slate-900">{address}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Email</p>
                    <p className="text-sm font-medium text-slate-900">{school.contactEmail || school.adminId?.email || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Phone</p>
                    <p className="text-sm font-medium text-slate-900">{school.contactPhone || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Registration Date</p>
                    <p className="text-sm font-medium text-slate-900">{formatDate(school.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Plan */}
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-3">Current Plan</h3>
              <div className="border border-slate-200 rounded-xl p-5">
                <div className="grid grid-cols-3 gap-x-8 gap-y-5">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Plan Type</p>
                    <p className="text-sm font-medium text-slate-900">{planLabel} Plan</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Number of Users</p>
                    <p className="text-sm font-medium text-slate-900">{(school.teacherCount || 0) + (school.staffCount || 0)} Users</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Next Billing Date</p>
                    <p className="text-sm font-medium text-slate-900">{shortDate(school.nextBillingDate || new Date().toISOString())}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Monthly Cost</p>
                    <p className="text-sm font-medium text-slate-900">{formatCurrency(school.mrr || 0)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Plan Status</p>
                    <span className={`text-sm font-medium ${isActive ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Auto-Renewal</p>
                    <p className="text-sm font-medium text-slate-900">Enabled</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment History Table */}
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-3">Payment History</h3>
              <div className="border border-slate-200 rounded-xl overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50">
                    <tr className="border-b border-slate-200">
                      <th className="px-3 py-2.5 text-left text-xs font-medium text-slate-500 uppercase whitespace-nowrap">Invoice Date</th>
                      <th className="px-3 py-2.5 text-left text-xs font-medium text-slate-500 uppercase whitespace-nowrap">Payment Date</th>
                      <th className="px-3 py-2.5 text-left text-xs font-medium text-slate-500 uppercase whitespace-nowrap">Plan</th>
                      <th className="px-3 py-2.5 text-left text-xs font-medium text-slate-500 uppercase whitespace-nowrap">Users</th>
                      <th className="px-3 py-2.5 text-left text-xs font-medium text-slate-500 uppercase whitespace-nowrap">Amount</th>
                      <th className="px-3 py-2.5 text-left text-xs font-medium text-slate-500 uppercase whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payments.map((payment) => {
                      const paymentDate = new Date(payment.date);
                      paymentDate.setDate(paymentDate.getDate() + 1);
                      return (
                        <tr key={payment.invoiceId} className="hover:bg-slate-50/50">
                          <td className="px-3 py-3 text-slate-600 whitespace-nowrap">{shortDate(payment.date)}</td>
                          <td className="px-3 py-3 text-slate-600 whitespace-nowrap">{shortDate(paymentDate.toISOString())}</td>
                          <td className="px-3 py-3 text-slate-600 whitespace-nowrap">{payment.plan}</td>
                          <td className="px-3 py-3 text-slate-600 whitespace-nowrap">{payment.users}</td>
                          <td className="px-3 py-3 font-semibold text-slate-900 whitespace-nowrap">{formatCurrency(payment.revenue)}</td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <button
                              onClick={() => onOpenInvoice?.(school, payment)}
                              className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Download
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>
    </Portal>
  );
}
