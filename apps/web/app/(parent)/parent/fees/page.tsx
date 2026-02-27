'use client';

import { useState, useEffect, useMemo } from 'react';
import { SchoolStatCard, useToast } from '../../../../components/school';
import {
  DollarSign,
  CheckCircle,
  AlertCircle,
  Calendar,
  ChevronDown,
  Loader2,
  CreditCard,
  Download,
  TrendingUp,
} from 'lucide-react';

// ── Mock data ──
const MOCK_CHILDREN = [
  { id: 'child1', name: 'Aarav Sharma', class: 'Class 10-A', photo: 'AS' },
  { id: 'child2', name: 'Priya Sharma', class: 'Class 7-B', photo: 'PS' },
];

interface FeeBreakdownItem {
  id: string;
  type: string;
  dueDate: string;
  amount: number;
  paid: number;
  balance: number;
  status: 'paid' | 'pending' | 'overdue';
}

interface PaymentHistoryItem {
  id: string;
  date: string;
  description: string;
  amount: number;
  method: string;
  receiptNo: string;
}

const MOCK_FEE_BREAKDOWN: FeeBreakdownItem[] = [
  { id: 'f1', type: 'Tuition Fee', dueDate: '2026-04-01', amount: 25000, paid: 25000, balance: 0, status: 'paid' },
  { id: 'f2', type: 'Transport Fee', dueDate: '2026-04-01', amount: 5000, paid: 5000, balance: 0, status: 'paid' },
  { id: 'f3', type: 'Lab Fee', dueDate: '2026-04-01', amount: 3000, paid: 3000, balance: 0, status: 'paid' },
  { id: 'f4', type: 'Tuition Fee', dueDate: '2026-07-01', amount: 25000, paid: 0, balance: 25000, status: 'pending' },
  { id: 'f5', type: 'Transport Fee', dueDate: '2026-07-01', amount: 5000, paid: 0, balance: 5000, status: 'pending' },
  { id: 'f6', type: 'Activity Fee', dueDate: '2026-03-15', amount: 4000, paid: 0, balance: 4000, status: 'overdue' },
  { id: 'f7', type: 'Exam Fee', dueDate: '2026-05-01', amount: 2000, paid: 0, balance: 2000, status: 'pending' },
  { id: 'f8', type: 'Library Fee', dueDate: '2026-04-01', amount: 1500, paid: 1500, balance: 0, status: 'paid' },
];

const MOCK_PAYMENT_HISTORY: PaymentHistoryItem[] = [
  { id: 'p1', date: '2026-02-15', description: 'Tuition Fee - Q3', amount: 25000, method: 'Online Banking', receiptNo: 'RCP-20260215-001' },
  { id: 'p2', date: '2026-02-15', description: 'Transport Fee - Q3', amount: 5000, method: 'Online Banking', receiptNo: 'RCP-20260215-002' },
  { id: 'p3', date: '2026-02-15', description: 'Lab Fee - Q3', amount: 3000, method: 'Online Banking', receiptNo: 'RCP-20260215-003' },
  { id: 'p4', date: '2026-02-15', description: 'Library Fee', amount: 1500, method: 'Online Banking', receiptNo: 'RCP-20260215-004' },
  { id: 'p5', date: '2025-11-10', description: 'Tuition Fee - Q2', amount: 25000, method: 'UPI', receiptNo: 'RCP-20251110-001' },
  { id: 'p6', date: '2025-11-10', description: 'Transport Fee - Q2', amount: 5000, method: 'UPI', receiptNo: 'RCP-20251110-002' },
  { id: 'p7', date: '2025-08-05', description: 'Tuition Fee - Q1', amount: 25000, method: 'Credit Card', receiptNo: 'RCP-20250805-001' },
  { id: 'p8', date: '2025-08-05', description: 'Transport Fee - Q1', amount: 5000, method: 'Credit Card', receiptNo: 'RCP-20250805-002' },
];

const statusBadge: Record<string, string> = {
  paid: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  overdue: 'bg-red-100 text-red-700',
};

export default function ParentFeesPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState(MOCK_CHILDREN[0]!.id);
  const [showChildDropdown, setShowChildDropdown] = useState(false);
  const [tab, setTab] = useState<'breakdown' | 'history' | 'quickpay'>('breakdown');

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const currentChild = MOCK_CHILDREN.find((c) => c.id === selectedChild) || MOCK_CHILDREN[0]!;

  const stats = useMemo(() => {
    const totalAnnual = MOCK_FEE_BREAKDOWN.reduce((sum, f) => sum + f.amount, 0);
    const totalPaid = MOCK_FEE_BREAKDOWN.reduce((sum, f) => sum + f.paid, 0);
    const outstanding = MOCK_FEE_BREAKDOWN.reduce((sum, f) => sum + f.balance, 0);
    const nextDue = MOCK_FEE_BREAKDOWN
      .filter((f) => f.status !== 'paid')
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];
    return { totalAnnual, totalPaid, outstanding, nextDue };
  }, []);

  const totalPayable = MOCK_FEE_BREAKDOWN
    .filter((f) => f.status !== 'paid')
    .reduce((sum, f) => sum + f.balance, 0);

  function handlePayNow() {
    showToast('success', `Payment of Rs. ${totalPayable.toLocaleString()} initiated. You will be redirected to the payment gateway shortly.`);
  }

  function handleDownloadReceipt(receiptNo: string) {
    showToast('info', `Downloading receipt ${receiptNo}...`);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-[#824ef2] animate-spin" />
        <p className="mt-4 text-slate-500">Loading fees...</p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Fees</h1>
            <p className="text-sm text-slate-500">Track fee payments and outstanding balances for your children</p>
          </div>
        </div>
        {MOCK_CHILDREN.length > 1 && (
          <div className="relative">
            <button onClick={() => setShowChildDropdown(!showChildDropdown)} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="w-7 h-7 rounded-full bg-[#824ef2]/10 flex items-center justify-center text-xs font-bold text-[#824ef2]">{currentChild.photo}</div>
              <span className="text-sm font-medium text-slate-700">{currentChild.name}</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
            {showChildDropdown && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 min-w-[200px]">
                {MOCK_CHILDREN.map((child) => (
                  <button key={child.id} onClick={() => { setSelectedChild(child.id); setShowChildDropdown(false); }} className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${selectedChild === child.id ? 'bg-[#824ef2]/5 text-[#824ef2]' : 'text-slate-700'}`}>
                    <div className="w-7 h-7 rounded-full bg-[#824ef2]/10 flex items-center justify-center text-xs font-bold text-[#824ef2]">{child.photo}</div>
                    <div className="text-left">
                      <p className="font-medium">{child.name}</p>
                      <p className="text-xs text-slate-400">{child.class}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SchoolStatCard icon={<DollarSign className="w-5 h-5" />} color="blue" label="Total Annual" value={`Rs. ${stats.totalAnnual.toLocaleString()}`} />
        <SchoolStatCard icon={<CheckCircle className="w-5 h-5" />} color="green" label="Paid" value={`Rs. ${stats.totalPaid.toLocaleString()}`} />
        <SchoolStatCard icon={<AlertCircle className="w-5 h-5" />} color="red" label="Outstanding" value={`Rs. ${stats.outstanding.toLocaleString()}`} />
        <SchoolStatCard icon={<Calendar className="w-5 h-5" />} color="amber" label="Next Due" value={stats.nextDue ? new Date(stats.nextDue.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'None'} subtitle={stats.nextDue ? stats.nextDue.type : undefined} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {([
          { key: 'breakdown' as const, label: 'Fee Breakdown' },
          { key: 'history' as const, label: 'Payment History' },
          { key: 'quickpay' as const, label: 'Quick Pay' },
        ]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key ? 'border-[#824ef2] text-[#824ef2]' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Fee Breakdown Tab */}
      {tab === 'breakdown' && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Fee Type</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Due Date</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Amount</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Paid</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Balance</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_FEE_BREAKDOWN.map((fee) => (
                  <tr key={fee.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-5 font-medium text-slate-900">{fee.type}</td>
                    <td className="py-3 px-5 text-slate-600">{new Date(fee.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td className="py-3 px-5 text-slate-700 font-medium">Rs. {fee.amount.toLocaleString()}</td>
                    <td className="py-3 px-5 text-green-600 font-medium">Rs. {fee.paid.toLocaleString()}</td>
                    <td className="py-3 px-5 font-semibold text-slate-900">Rs. {fee.balance.toLocaleString()}</td>
                    <td className="py-3 px-5">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusBadge[fee.status]}`}>
                        {fee.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment History Tab */}
      {tab === 'history' && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Date</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Description</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Amount</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Method</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_PAYMENT_HISTORY.map((payment) => (
                  <tr key={payment.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-5 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(payment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="py-3 px-5 font-medium text-slate-900">{payment.description}</td>
                    <td className="py-3 px-5 text-green-600 font-semibold">Rs. {payment.amount.toLocaleString()}</td>
                    <td className="py-3 px-5 text-slate-600">{payment.method}</td>
                    <td className="py-3 px-5">
                      <button
                        onClick={() => handleDownloadReceipt(payment.receiptNo)}
                        className="flex items-center gap-1.5 text-[#824ef2] hover:text-[#6b3fd4] text-sm font-medium transition-colors"
                      >
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
      )}

      {/* Quick Pay Tab */}
      {tab === 'quickpay' && (
        <div className="space-y-4">
          {/* Outstanding Items */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="p-5 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Outstanding Fees</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {MOCK_FEE_BREAKDOWN.filter((f) => f.status !== 'paid').map((fee) => (
                <div key={fee.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{fee.type}</p>
                    <p className="text-xs text-slate-500">Due: {new Date(fee.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusBadge[fee.status]}`}>
                      {fee.status}
                    </span>
                    <span className="text-sm font-semibold text-slate-900">Rs. {fee.balance.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total Payable Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-[#824ef2]/10 flex items-center justify-center">
                  <CreditCard className="w-7 h-7 text-[#824ef2]" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Total Payable Amount</p>
                  <p className="text-3xl font-bold text-slate-900">Rs. {totalPayable.toLocaleString()}</p>
                </div>
              </div>
              <button
                onClick={handlePayNow}
                className="px-8 py-3 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Pay Now
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
