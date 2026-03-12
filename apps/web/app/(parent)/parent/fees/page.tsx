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
  Award,
  X,
} from 'lucide-react';

// ── Mock data ──
const MOCK_CHILDREN = [
  { id: 'child1', name: 'Aarav Sharma', class: 'Class 10-A', photo: 'AS' },
  { id: 'child2', name: 'Priya Sharma', class: 'Class 7-B', photo: 'PS' },
];

interface FeeBreakdownItem {
  id: string;
  type: string;
  category: 'Academic' | 'Transport' | 'Extra-Curricular';
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

interface ConcessionItem {
  id: string;
  type: string;
  description: string;
  amount: string;
  appliedTo: string;
  status: 'active' | 'pending' | 'expired';
}

const MOCK_FEE_BREAKDOWN: FeeBreakdownItem[] = [
  { id: 'f1', type: 'Tuition Fee', category: 'Academic', dueDate: '2026-04-01', amount: 25000, paid: 25000, balance: 0, status: 'paid' },
  { id: 'f2', type: 'Transport Fee', category: 'Transport', dueDate: '2026-04-01', amount: 5000, paid: 5000, balance: 0, status: 'paid' },
  { id: 'f3', type: 'Lab Fee', category: 'Academic', dueDate: '2026-04-01', amount: 3000, paid: 3000, balance: 0, status: 'paid' },
  { id: 'f4', type: 'Tuition Fee', category: 'Academic', dueDate: '2026-07-01', amount: 25000, paid: 0, balance: 25000, status: 'pending' },
  { id: 'f5', type: 'Transport Fee', category: 'Transport', dueDate: '2026-07-01', amount: 5000, paid: 0, balance: 5000, status: 'pending' },
  { id: 'f6', type: 'Activity Fee', category: 'Extra-Curricular', dueDate: '2026-03-15', amount: 4000, paid: 0, balance: 4000, status: 'overdue' },
  { id: 'f7', type: 'Exam Fee', category: 'Academic', dueDate: '2026-05-01', amount: 2000, paid: 0, balance: 2000, status: 'pending' },
  { id: 'f8', type: 'Library Fee', category: 'Academic', dueDate: '2026-04-01', amount: 1500, paid: 1500, balance: 0, status: 'paid' },
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

const MOCK_CONCESSIONS: ConcessionItem[] = [
  { id: 'c1', type: 'Merit Scholarship', description: '10% discount on tuition fee for academic excellence', amount: 'Rs. 5,000', appliedTo: 'Tuition Fee', status: 'active' },
  { id: 'c2', type: 'Sibling Discount', description: '5% discount on tuition fee for second child enrollment', amount: 'Rs. 2,500', appliedTo: 'Tuition Fee', status: 'active' },
  { id: 'c3', type: 'Sports Scholarship', description: 'Scholarship for outstanding performance in inter-school sports', amount: 'Rs. 3,000', appliedTo: 'Activity Fee', status: 'pending' },
  { id: 'c4', type: 'Early Payment Discount', description: '2% discount for paying fees before the due date', amount: 'Rs. 1,400', appliedTo: 'All Fees', status: 'active' },
];

const statusBadge: Record<string, string> = {
  paid: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  overdue: 'bg-red-100 text-red-700',
  active: 'bg-green-100 text-green-700',
  expired: 'bg-slate-100 text-slate-500',
};

const CATEGORY_ORDER: FeeBreakdownItem['category'][] = ['Academic', 'Transport', 'Extra-Curricular'];

export default function ParentFeesPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState(MOCK_CHILDREN[0]!.id);
  const [showChildDropdown, setShowChildDropdown] = useState(false);
  const [tab, setTab] = useState<'breakdown' | 'history' | 'concessions'>('breakdown');
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedFees, setSelectedFees] = useState<string[]>([]);

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

  const pendingFees = MOCK_FEE_BREAKDOWN.filter((f) => f.status !== 'paid');

  const totalPayable = pendingFees.reduce((sum, f) => sum + f.balance, 0);

  const selectedTotal = pendingFees
    .filter((f) => selectedFees.includes(f.id))
    .reduce((sum, f) => sum + f.balance, 0);

  const groupedFees = useMemo(() => {
    const groups: Record<string, FeeBreakdownItem[]> = {};
    for (const category of CATEGORY_ORDER) {
      const items = MOCK_FEE_BREAKDOWN.filter((f) => f.category === category);
      if (items.length > 0) {
        groups[category] = items;
      }
    }
    return groups;
  }, []);

  const totalConcessionSavings = useMemo(() => {
    return MOCK_CONCESSIONS
      .filter((c) => c.status === 'active')
      .reduce((sum, c) => {
        const numericAmount = parseInt(c.amount.replace(/[^0-9]/g, ''), 10);
        return sum + (isNaN(numericAmount) ? 0 : numericAmount);
      }, 0);
  }, []);

  function handlePayNow() {
    setSelectedFees(pendingFees.map((f) => f.id));
    setShowPayModal(true);
  }

  function toggleFeeSelection(id: string) {
    setSelectedFees((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  }

  function handleProcessPayment() {
    if (selectedFees.length === 0) return;
    setShowPayModal(false);
    showToast('success', `Payment of Rs. ${selectedTotal.toLocaleString()} initiated. Redirecting to payment gateway...`);
    setSelectedFees([]);
  }

  function handlePayFee(fee: FeeBreakdownItem) {
    showToast('success', `Payment of Rs. ${fee.balance.toLocaleString()} for ${fee.type} initiated. Redirecting to payment gateway...`);
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
        <div className="flex items-center gap-3">
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
          <button
            onClick={handlePayNow}
            className="px-4 py-2 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors"
          >
            Pay
          </button>
        </div>
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
          { key: 'concessions' as const, label: 'Concessions & Scholarships' },
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
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Action</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(groupedFees).map(([category, fees]) => (
                  <>
                    <tr key={`cat-${category}`} className="bg-slate-100/70">
                      <td colSpan={7} className="py-2.5 px-5 font-semibold text-slate-700 text-xs uppercase tracking-wider">
                        {category}
                      </td>
                    </tr>
                    {fees.map((fee) => (
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
                        <td className="py-3 px-5">
                          {fee.status !== 'paid' && (
                            <button
                              onClick={() => handlePayFee(fee)}
                              className="text-xs px-3 py-1 rounded-lg font-medium text-white bg-[#824ef2] hover:bg-[#6b3fd4] transition-colors"
                            >
                              Pay Now
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </>
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

      {/* Concessions & Scholarships Tab */}
      {tab === 'concessions' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="p-5 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-[#824ef2]" />
                <h2 className="text-lg font-semibold text-slate-900">Concessions & Scholarships</h2>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left py-3 px-5 font-medium text-slate-500">Type</th>
                    <th className="text-left py-3 px-5 font-medium text-slate-500">Description</th>
                    <th className="text-left py-3 px-5 font-medium text-slate-500">Amount</th>
                    <th className="text-left py-3 px-5 font-medium text-slate-500">Applied To</th>
                    <th className="text-left py-3 px-5 font-medium text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_CONCESSIONS.map((concession) => (
                    <tr key={concession.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-5 font-medium text-slate-900">{concession.type}</td>
                      <td className="py-3 px-5 text-slate-600">{concession.description}</td>
                      <td className="py-3 px-5 text-green-600 font-semibold">{concession.amount}</td>
                      <td className="py-3 px-5 text-slate-600">{concession.appliedTo}</td>
                      <td className="py-3 px-5">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusBadge[concession.status]}`}>
                          {concession.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Total Savings Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Active Savings</p>
                <p className="text-3xl font-bold text-green-600">Rs. {totalConcessionSavings.toLocaleString()}</p>
                <p className="text-xs text-slate-400 mt-0.5">From {MOCK_CONCESSIONS.filter((c) => c.status === 'active').length} active concessions & scholarships</p>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Payment Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#824ef2]" />
                <h2 className="text-lg font-semibold text-slate-900">Select Fees to Pay</h2>
              </div>
              <button onClick={() => setShowPayModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Fee List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-2">
              {/* Select All */}
              <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors border border-slate-200">
                <input
                  type="checkbox"
                  checked={selectedFees.length === pendingFees.length}
                  onChange={() => {
                    if (selectedFees.length === pendingFees.length) {
                      setSelectedFees([]);
                    } else {
                      setSelectedFees(pendingFees.map((f) => f.id));
                    }
                  }}
                  className="w-4 h-4 rounded border-slate-300 text-[#824ef2] focus:ring-[#824ef2]"
                />
                <span className="text-sm font-medium text-slate-700">Select All</span>
                <span className="ml-auto text-sm font-semibold text-slate-900">Rs. {totalPayable.toLocaleString()}</span>
              </label>

              {/* Individual Fees */}
              {pendingFees.map((fee) => (
                <label
                  key={fee.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors border border-slate-200"
                >
                  <input
                    type="checkbox"
                    checked={selectedFees.includes(fee.id)}
                    onChange={() => toggleFeeSelection(fee.id)}
                    className="w-4 h-4 rounded border-slate-300 text-[#824ef2] focus:ring-[#824ef2]"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">{fee.type}</p>
                    <p className="text-xs text-slate-500">
                      Due: {new Date(fee.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {fee.status === 'overdue' && (
                        <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">Overdue</span>
                      )}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">Rs. {fee.balance.toLocaleString()}</span>
                </label>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">{selectedFees.length} fee{selectedFees.length !== 1 ? 's' : ''} selected</span>
                <span className="text-lg font-bold text-slate-900">Rs. {selectedTotal.toLocaleString()}</span>
              </div>
              <button
                onClick={handleProcessPayment}
                disabled={selectedFees.length === 0}
                className="w-full py-2.5 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Process Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
