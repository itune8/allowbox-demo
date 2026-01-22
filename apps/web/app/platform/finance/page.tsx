'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, TrendingUp, Wallet, AlertCircle, CreditCard } from 'lucide-react';
import { useAuth } from '../../../contexts/auth-context';
import { hasPermission } from '../../../lib/permissions';
import { schoolService, type School } from '../../../lib/services/superadmin/school.service';
import { GlassCard } from '../../../components/ui/glass-card';
import { AnimatedStatCard } from '../../../components/ui/animated-stat-card';
import { Icon3D } from '../../../components/ui/icon-3d';

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

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

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
      paid: { bg: 'bg-green-100', text: 'text-green-700', label: 'Paid' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
      overdue: { bg: 'bg-red-100', text: 'text-red-700', label: 'Overdue' },
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`text-xs px-2 py-1 rounded font-medium ${badge?.bg} ${badge?.text}`}>
        {badge?.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-green-200 border-t-green-500 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-start gap-4"
      >
        <Icon3D bgColor="bg-green-500" size="lg">
          <DollarSign className="w-6 h-6" />
        </Icon3D>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Finance & Billing
          </h2>
          <p className="text-gray-600 mt-1">
            Manage revenue, billing, and payments across all schools
          </p>
        </div>
      </motion.div>

      {/* Metrics Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <AnimatedStatCard
          title="Monthly Recurring Revenue"
          value={formatCurrency(metrics?.totalMRR || 0)}
          icon={<DollarSign className="w-6 h-6" />}
          iconBgColor="bg-green-500"
          delay={0}
        />

        <AnimatedStatCard
          title="Annual Recurring Revenue"
          value={formatCurrency(metrics?.totalARR || 0)}
          icon={<TrendingUp className="w-6 h-6" />}
          iconBgColor="bg-emerald-500"
          delay={1}
        />

        <AnimatedStatCard
          title="Total Revenue"
          value={formatCurrency(metrics?.totalRevenue || 0)}
          icon={<Wallet className="w-6 h-6 text-emerald-600" />}
          iconBgColor="bg-emerald-50"
          delay={2}
        />

        <AnimatedStatCard
          title="Outstanding Balance"
          value={formatCurrency(metrics?.outstandingBalance || 0)}
          icon={<AlertCircle className="w-6 h-6" />}
          iconBgColor="bg-red-500"
          delay={3}
        />
      </motion.div>

      {/* Revenue by Plan */}
      <GlassCard className="bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Revenue by Plan
        </h3>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          {metrics?.revenueByPlan.map((item, idx) => (
            <motion.div
              key={item.plan}
              variants={itemVariants}
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="bg-emerald-50 border border-green-100 rounded-lg p-4 cursor-pointer"
            >
              <p className="text-sm text-gray-600">{item.plan}</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {formatCurrency(item.mrr)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {item.schools} {item.schools === 1 ? 'school' : 'schools'}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </GlassCard>

      {/* Payments Table */}
      <GlassCard className="bg-white">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Payment History
            </h3>
            <div className="flex items-center gap-2">
              <label htmlFor="statusFilter" className="text-sm text-gray-600">
                Filter:
              </label>
              <motion.select
                whileTap={{ scale: 0.98 }}
                id="statusFilter"
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </motion.select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-emerald-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  School
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <AnimatePresence mode="popLayout">
                {filteredPayments.length === 0 ? (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No payments found
                    </td>
                  </motion.tr>
                ) : (
                  filteredPayments.slice(0, 20).map((payment, idx) => (
                    <motion.tr
                      key={payment.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ backgroundColor: 'rgba(16, 185, 129, 0.05)' }}
                      className="transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {payment.invoiceId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.schoolName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(payment.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {getStatusBadge(payment.status)}
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filteredPayments.length > 20 && (
          <div className="px-6 py-4 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Showing 20 of {filteredPayments.length} payments
            </p>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
