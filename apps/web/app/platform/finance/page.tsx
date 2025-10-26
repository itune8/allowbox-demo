'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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

  // Page protection: Only super_admin and finance can access
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

  // Generate mock payment data from schools
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
      paid: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', label: 'Paid' },
      pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', label: 'Pending' },
      overdue: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', label: 'Overdue' },
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`text-xs px-2 py-1 rounded font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Finance & Billing
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage revenue, billing, and payments across all schools
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Recurring Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                {formatCurrency(metrics?.totalMRR || 0)}
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Annual Recurring Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                {formatCurrency(metrics?.totalARR || 0)}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                {formatCurrency(metrics?.totalRevenue || 0)}
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Outstanding Balance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                {formatCurrency(metrics?.outstandingBalance || 0)}
              </p>
            </div>
            <div className="h-12 w-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue by Plan */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Revenue by Plan
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {metrics?.revenueByPlan.map((item) => (
            <div key={item.plan} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">{item.plan}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                {formatCurrency(item.mrr)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {item.schools} {item.schools === 1 ? 'school' : 'schools'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Payment History
            </h3>
            <div className="flex items-center gap-2">
              <label htmlFor="statusFilter" className="text-sm text-gray-600 dark:text-gray-400">
                Filter:
              </label>
              <select
                id="statusFilter"
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Invoice ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  School
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No payments found
                  </td>
                </tr>
              ) : (
                filteredPayments.slice(0, 20).map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                      {payment.invoiceId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {payment.schoolName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(payment.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getStatusBadge(payment.status)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredPayments.length > 20 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing 20 of {filteredPayments.length} payments
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
