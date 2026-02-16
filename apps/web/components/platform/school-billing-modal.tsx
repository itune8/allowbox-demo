'use client';

import { useEffect, useCallback, useState } from 'react';
import { Portal } from '../portal';
import {
  X,
  Building2,
  Download,
  Send,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  CreditCard,
  FileText,
} from 'lucide-react';
import type { School } from '../../lib/services/superadmin/school.service';

interface SchoolBillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  school: School | null;
  invoiceId?: string;
}

// Mock invoice history
function generateInvoiceHistory(school: School | null) {
  if (!school) return [];
  const records = [];
  const baseDate = new Date();
  const planLabel = (school.subscriptionPlan || 'basic').charAt(0).toUpperCase() + (school.subscriptionPlan || 'basic').slice(1);
  const baseUsers = (school.studentCount || 0) + (school.teacherCount || 0);

  for (let i = 0; i < 4; i++) {
    const date = new Date(baseDate);
    date.setFullYear(date.getFullYear() - i);
    const users = Math.max(baseUsers - i * 20, 100 + i * 10);
    const amount = (school.mrr || 2500) - i * 300;

    records.push({
      id: `#INV-${2024 - i}-${String(Math.abs(school._id?.charCodeAt(0) || 1) * 100 + i).padStart(3, '0')}`,
      date: date.toISOString(),
      plan: planLabel,
      users,
      duration: 'Annual',
      amount: Math.max(amount, 1200),
      status: 'Paid' as const,
    });
  }
  return records;
}

function generateTransactions(school: School | null) {
  if (!school) return [];
  const records = [];
  const baseDate = new Date();

  for (let i = 0; i < 3; i++) {
    const date = new Date(baseDate);
    date.setFullYear(date.getFullYear() - i);
    const amount = (school.mrr || 2500) - i * 300;

    records.push({
      id: `TXN-${2024 - i}-${String(4000 + i * 111 + (school._id?.charCodeAt(0) || 0)).slice(0, 4)}`,
      date: date.toISOString(),
      description: `Annual ${(school.subscriptionPlan || 'Basic').charAt(0).toUpperCase() + (school.subscriptionPlan || 'Basic').slice(1)} Plan`,
      method: i % 2 === 0 ? 'Credit Card' : 'Bank Transfer',
      amount: Math.max(amount, 1200),
      status: 'Success',
    });
  }
  return records;
}

export function SchoolBillingModal({ isOpen, onClose, school, invoiceId }: SchoolBillingModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');

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
      setActiveTab('overview');
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen || !school) return null;

  const planLabel = (school.subscriptionPlan || 'basic').charAt(0).toUpperCase() + (school.subscriptionPlan || 'basic').slice(1);
  const totalUsers = (school.studentCount || 0) + (school.teacherCount || 0);
  const amount = school.mrr || 0;
  const invoices = generateInvoiceHistory(school);
  const transactions = generateTransactions(school);
  const currentInvoice = invoices[0];

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getPlanBadge = (plan: string) => {
    const colors: Record<string, string> = {
      Premium: 'bg-purple-100 text-purple-700',
      Professional: 'bg-blue-100 text-blue-700',
      Enterprise: 'bg-indigo-100 text-indigo-700',
      Basic: 'bg-slate-100 text-slate-700',
      Free: 'bg-slate-100 text-slate-500',
    };
    return colors[plan] || 'bg-slate-100 text-slate-600';
  };

  const address = [school.address, school.city, school.state, school.postalCode]
    .filter(Boolean)
    .join(', ') || 'N/A';

  return (
    <Portal>
      <div
        className="fixed inset-0 bg-slate-900/50 z-[9998] transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-6">
        <div
          className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-[680px] max-h-[92vh] sm:max-h-[88vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900">School Billing Details</h2>
              <p className="text-sm text-slate-500 mt-0.5">Complete billing and payment information</p>
            </div>
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
              {(['overview', 'history'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 pt-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'border-[#824ef2] text-[#824ef2]'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab === 'overview' ? 'Overview' : 'Payment History'}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {activeTab === 'overview' ? (
              <div className="space-y-6">
                {/* School Information + Current Plan Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* School Information */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3">School Information</h3>
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="p-2 rounded-lg bg-[#824ef2]/10">
                        <Building2 className="w-4 h-4 text-[#824ef2]" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{school.schoolName}</p>
                        <p className="text-xs text-slate-400">ID: {school.tenantId || school._id?.slice(0, 8)}</p>
                      </div>
                    </div>
                    <div className="space-y-2.5 text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{school.adminId?.firstName ? `${school.adminId.firstName} ${school.adminId.lastName}` : 'Contact Person'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{school.contactEmail || school.adminId?.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{school.contactPhone || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Current Plan Details */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3">Current Plan Details</h3>
                    <div className="space-y-2.5 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Plan Type:</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${getPlanBadge(planLabel)}`}>{planLabel}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Invoice Number:</span>
                        <span className="font-medium text-slate-700">{currentInvoice?.id || invoiceId || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Payment Method:</span>
                        <span className="text-slate-700">Online (Stripe)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Duration:</span>
                        <span className="text-slate-700">Annual</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Active Users:</span>
                        <span className="text-slate-700">{totalUsers}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Next Billing Date:</span>
                        <span className="text-slate-700">{formatDate(school.nextBillingDate)}</span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-slate-500 font-medium">Total Amount:</span>
                        <span className="text-lg font-bold text-[#824ef2]">{formatCurrency(amount)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Invoice History */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Recent Invoice History</h3>
                    <button
                      onClick={() => setActiveTab('history')}
                      className="text-xs font-medium text-[#824ef2] hover:underline"
                    >
                      View All
                    </button>
                  </div>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="divide-y divide-slate-100">
                      {invoices.slice(0, 3).map((inv) => (
                        <div key={inv.id} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50/50">
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-lg bg-[#824ef2]/10">
                              <FileText className="w-3.5 h-3.5 text-[#824ef2]" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">{inv.id}</p>
                              <p className="text-xs text-slate-400">{inv.plan} - {inv.users} Users - {inv.duration}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm font-semibold text-slate-900">{formatCurrency(inv.amount)}</p>
                              <p className="text-xs text-slate-400">{formatDate(inv.date)}</p>
                            </div>
                            <button
                              className="p-1.5 text-slate-400 hover:text-[#824ef2] hover:bg-[#824ef2]/5 rounded-lg transition-colors"
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Payment History Tab */
              <div className="space-y-6">
                {/* Invoice Table */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3">Invoice History</h3>
                  <div className="border border-slate-200 rounded-xl overflow-x-auto">
                    <table className="w-full text-sm min-w-[550px]">
                      <thead className="bg-slate-50">
                        <tr className="border-b border-slate-200">
                          <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Invoice #</th>
                          <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                          <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Plan</th>
                          <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Users</th>
                          <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                          <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                          <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {invoices.map((inv) => (
                          <tr key={inv.id} className="hover:bg-slate-50/50">
                            <td className="px-3 py-2.5 font-medium text-[#824ef2]">{inv.id}</td>
                            <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">{formatDate(inv.date)}</td>
                            <td className="px-3 py-2.5 text-slate-600">{inv.plan}</td>
                            <td className="px-3 py-2.5 text-slate-600">{inv.users}</td>
                            <td className="px-3 py-2.5 font-semibold text-slate-900">{formatCurrency(inv.amount)}</td>
                            <td className="px-3 py-2.5">
                              <span className="text-xs font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">{inv.status}</span>
                            </td>
                            <td className="px-3 py-2.5">
                              <div className="flex items-center gap-1">
                                <button className="p-1 text-slate-400 hover:text-[#824ef2] rounded transition-colors" title="Download">
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                                <button className="p-1 text-slate-400 hover:text-[#824ef2] rounded transition-colors" title="Send">
                                  <Send className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Transaction Log */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3">Transaction Log</h3>
                  <div className="border border-slate-200 rounded-xl overflow-x-auto">
                    <table className="w-full text-sm min-w-[500px]">
                      <thead className="bg-slate-50">
                        <tr className="border-b border-slate-200">
                          <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Transaction ID</th>
                          <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                          <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                          <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Method</th>
                          <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                          <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {transactions.map((txn) => (
                          <tr key={txn.id} className="hover:bg-slate-50/50">
                            <td className="px-3 py-2.5 font-medium text-slate-700">{txn.id}</td>
                            <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">{formatDate(txn.date)}</td>
                            <td className="px-3 py-2.5 text-slate-600">{txn.description}</td>
                            <td className="px-3 py-2.5 text-slate-600">{txn.method}</td>
                            <td className="px-3 py-2.5 font-semibold text-slate-900">{formatCurrency(txn.amount)}</td>
                            <td className="px-3 py-2.5">
                              <span className="text-xs font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">{txn.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-slate-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
            <div className="flex items-center gap-2">
              <button className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <Download className="w-3.5 h-3.5" />
                Download Invoice
              </button>
              <button className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <Send className="w-3.5 h-3.5" />
                Send Receipt
              </button>
              <button
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                style={{ backgroundColor: '#824ef2' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#7040d9')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#824ef2')}
              >
                <Send className="w-3.5 h-3.5" />
                Send Reminder
              </button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
