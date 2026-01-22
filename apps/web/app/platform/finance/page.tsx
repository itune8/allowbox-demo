'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DollarSign, TrendingUp, Wallet, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../contexts/auth-context';
import { hasPermission } from '../../../lib/permissions';
import { schoolService, type School } from '../../../lib/services/superadmin/school.service';

interface FinanceMetrics {
  totalMRR: number;
  totalARR: number;
  totalRevenue: number;
  outstandingBalance: number;
  revenueByPlan: {
    plan: string;
    mrr: number;
    schools: number;
  }[];
}

interface Payment {
  id: string;
  schoolName: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'overdue';
  invoiceId: string;
}

export default function FinancePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [schools, setSchools] = useState<School[]>([]);
  const [metrics, setMetrics] = useState<FinanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');

  const canAccessFinance = hasPermission(user?.roles, 'canAccessFinance');

  useEffect(() => {
    if (!canAccessFinance) {
      router.push('/platform/dashboard');
    }
  }, [canAccessFinance, router]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const schoolsData = await schoolService.getSchools();
      setSchools(schoolsData);
      calculateMetrics(schoolsData);
    } catch (error) {
      console.error('Failed to load finance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (schoolsData: School[]) => {
    const totalMRR = schoolsData.reduce((sum, school) => sum + (school.mrr || 0), 0);
    const totalARR = schoolsData.reduce((sum, school) => sum + (school.arr || 0), 0);
    const totalRevenue = schoolsData.reduce((sum, school) => sum + (school.totalRevenue || 0), 0);
    const outstandingBalance = schoolsData.reduce((sum, school) => sum + (school.outstandingBalance || 0), 0);

    const revenueByPlan = ['free', 'basic', 'premium', 'enterprise'].map(plan => {
      const planSchools = schoolsData.filter(s => s.subscriptionPlan === plan);
      return {
        plan: plan.charAt(0).toUpperCase() + plan.slice(1),
        mrr: planSchools.reduce((sum, s) => sum + (s.mrr || 0), 0),
        schools: planSchools.length,
      };
    });

    setMetrics({
      totalMRR,
      totalARR,
      totalRevenue,
      outstandingBalance,
      revenueByPlan,
    });
  };

  const getPayments = (): Payment[] => {
    const payments: Payment[] = [];
    schools.forEach((school, idx) => {
      if (school.lastPaymentDate) {
        payments.push({
          id: `pay-${idx}`,
          schoolName: school.schoolName,
          amount: school.mrr || 0,
          date: school.lastPaymentDate,
          status: 'paid',
          invoiceId: `INV-${1000 + idx}`,
        });
      }
      if (school.outstandingBalance > 0) {
        payments.push({
          id: `pending-${idx}`,
          schoolName: school.schoolName,
          amount: school.outstandingBalance,
          date: school.nextBillingDate || new Date().toISOString(),
          status: new Date(school.nextBillingDate || '') < new Date() ? 'overdue' : 'pending',
          invoiceId: `INV-${2000 + idx}`,
        });
      }
    });
    return payments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const payments = getPayments();
  const filteredPayments = filter === 'all' ? payments : payments.filter(p => p.status === filter);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      paid: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Paid' },
      pending: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Pending' },
      overdue: { bg: 'bg-red-50', text: 'text-red-700', label: 'Overdue' },
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`text-xs px-2 py-1 rounded-md font-medium ${badge?.bg} ${badge?.text}`}>
        {badge?.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Finance & Billing</h1>
        <p className="text-slate-500 mt-1">Manage revenue, billing, and payments across all schools</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-50">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Monthly Revenue</p>
              <p className="text-2xl font-semibold text-slate-900">{formatCurrency(metrics?.totalMRR || 0)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-50">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Annual Revenue</p>
              <p className="text-2xl font-semibold text-slate-900">{formatCurrency(metrics?.totalARR || 0)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-purple-50">
              <Wallet className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Revenue</p>
              <p className="text-2xl font-semibold text-slate-900">{formatCurrency(metrics?.totalRevenue || 0)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-red-50">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Outstanding</p>
              <p className="text-2xl font-semibold text-slate-900">{formatCurrency(metrics?.outstandingBalance || 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue by Plan */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-900 mb-4">Revenue by Plan</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics?.revenueByPlan.map((item) => (
            <div
              key={item.plan}
              className="bg-slate-50 border border-slate-100 rounded-lg p-4"
            >
              <p className="text-sm text-slate-500">{item.plan}</p>
              <p className="text-xl font-semibold text-slate-900 mt-1">
                {formatCurrency(item.mrr)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {item.schools} {item.schools === 1 ? 'school' : 'schools'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-5 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Payment History</h3>
            <div className="flex items-center gap-2">
              <label htmlFor="statusFilter" className="text-sm text-slate-500">
                Filter:
              </label>
              <select
                id="statusFilter"
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="h-9 px-3 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="all">All</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Invoice ID</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">School</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Amount</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Date</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                    No payments found
                  </td>
                </tr>
              ) : (
                filteredPayments.slice(0, 20).map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{payment.invoiceId}</td>
                    <td className="px-4 py-3 text-slate-700">{payment.schoolName}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{formatCurrency(payment.amount)}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(payment.date)}</td>
                    <td className="px-4 py-3">{getStatusBadge(payment.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredPayments.length > 20 && (
          <div className="px-4 py-3 border-t border-slate-200 text-center">
            <p className="text-sm text-slate-500">Showing 20 of {filteredPayments.length} payments</p>
          </div>
        )}
      </div>
    </div>
  );
}
