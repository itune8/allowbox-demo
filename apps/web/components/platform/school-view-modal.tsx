'use client';

import { useEffect, useCallback, useState, type ReactElement } from 'react';
import { Portal } from '../portal';
import {
  X,
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

type TabId = 'info' | 'plan' | 'payments';

const TABS: { id: TabId; label: string }[] = [
  { id: 'info', label: 'School Info' },
  { id: 'plan', label: 'Plan & Billing' },
  { id: 'payments', label: 'Payment History' },
];

export function SchoolViewModal({
  isOpen,
  onClose,
  school,
  onActivate,
  onReject,
  onBlock,
  actionLoading,
}: SchoolViewModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>('info');

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
        plan: planLabel,
        duration: 'Annual',
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

          {/* Tabs */}
          <div className="px-6 border-b border-slate-200">
            <div className="flex gap-6">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3 pt-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-[#824ef2] text-[#824ef2]'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5">

            {/* School Info Tab */}
            {activeTab === 'info' && (
              <div className="space-y-6">
                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  {getActionButtons()}
                </div>

                {/* School Information Card */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-3">School Information</h3>
                  <div className="border border-slate-200 rounded-xl p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">School Name</p>
                        <p className="text-sm font-medium text-slate-900">{school.schoolName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Status</p>
                        <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full ${
                          school.isActive
                            ? 'bg-emerald-50 text-emerald-700'
                            : status === 'trial'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-slate-100 text-slate-600'
                        }`}>
                          {school.isActive ? 'Active' : (status || 'Pending')}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Address</p>
                        <p className="text-sm font-medium text-slate-900">{address}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Email</p>
                        <p className="text-sm font-medium text-slate-900">
                          {school.contactEmail || 'contact@school.edu'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Phone</p>
                        <p className="text-sm font-medium text-slate-900">
                          {school.contactPhone || '+1 (555) 123-4567'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Registration Date</p>
                        <p className="text-sm font-medium text-slate-900">
                          {formatDate(school.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Plan & Billing Tab */}
            {activeTab === 'plan' && (
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
                      <p className="text-sm font-medium text-slate-900">{totalUsers} Users</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Next Billing Date</p>
                      <p className="text-sm font-medium text-slate-900">
                        {school.nextBillingDate
                          ? shortDate(school.nextBillingDate)
                          : 'Jan 15, 2025'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Monthly Cost</p>
                      <p className="text-sm font-medium text-slate-900">{formatCurrency((school.mrr || 0))}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Plan Status</p>
                      <span className={`text-sm font-medium ${school.isActive ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {school.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Auto-Renewal</p>
                      <p className="text-sm font-medium text-slate-900">Enabled</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment History Tab */}
            {activeTab === 'payments' && (
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-3">Payment History</h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr className="border-b border-slate-200">
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase whitespace-nowrap">Invoice Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase whitespace-nowrap">Payment Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase whitespace-nowrap">Plan</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase whitespace-nowrap">Users</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase whitespace-nowrap">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase whitespace-nowrap">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {payments.map((p, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 text-slate-700">{shortDate(p.invoiceDate)}</td>
                          <td className="px-4 py-3 text-slate-700">{shortDate(p.paymentDate)}</td>
                          <td className="px-4 py-3"><div className="font-semibold text-slate-900">{p.plan}</div><div className="text-xs text-slate-500">{p.duration}</div></td>
                          <td className="px-4 py-3 text-slate-700">{p.users}</td>
                          <td className="px-4 py-3 font-semibold text-slate-900">
                            {formatCurrency(p.amount)}
                          </td>
                          <td className="px-4 py-3">
                            <button title="Download" className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors">
                              <Download className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
}
