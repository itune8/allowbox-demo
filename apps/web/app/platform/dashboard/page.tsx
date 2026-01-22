'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedStatCard } from '@/components/ui';
import {
  Building2,
  Users,
  TrendingUp,
  DollarSign,
  Plus,
  AlertCircle,
  Clock,
  Info,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../../contexts/auth-context';
import { hasPermission } from '../../../lib/permissions';
import { schoolService, type School } from '../../../lib/services/superadmin/school.service';

interface DashboardMetrics {
  totalSchools: number;
  activeSchools: number;
  inactiveSchools: number;
  totalStudents: number;
  totalTeachers: number;
  totalRevenue: number;
  mrr: number;
  arr: number;
}

interface Alert {
  id: string;
  type: 'unpaid' | 'expiring_trial' | 'inactive';
  schoolName: string;
  schoolId: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [schools, setSchools] = useState<School[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const canCreateSchools = hasPermission(user?.roles, 'canCreateSchools');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const schoolsData = await schoolService.getSchools();
      setSchools(schoolsData);

      const dashboardMetrics = calculateMetrics(schoolsData);
      setMetrics(dashboardMetrics);

      const dashboardAlerts = generateAlerts(schoolsData);
      setAlerts(dashboardAlerts);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (schoolsData: School[]): DashboardMetrics => {
    const activeSchools = schoolsData.filter(s => s.isActive).length;
    const inactiveSchools = schoolsData.filter(s => !s.isActive).length;
    const totalStudents = schoolsData.reduce((sum, s) => sum + (s.studentCount || 0), 0);
    const totalTeachers = schoolsData.reduce((sum, s) => sum + (s.teacherCount || 0), 0);
    const totalRevenue = schoolsData.reduce((sum, s) => sum + (s.totalRevenue || 0), 0);
    const mrr = schoolsData.reduce((sum, s) => sum + (s.mrr || 0), 0);
    const arr = schoolsData.reduce((sum, s) => sum + (s.arr || 0), 0);

    return {
      totalSchools: schoolsData.length,
      activeSchools,
      inactiveSchools,
      totalStudents,
      totalTeachers,
      totalRevenue,
      mrr,
      arr,
    };
  };

  const generateAlerts = (schoolsData: School[]): Alert[] => {
    const alertsList: Alert[] = [];

    schoolsData.forEach(school => {
      if (school.outstandingBalance > 0) {
        alertsList.push({
          id: `unpaid-${school._id}`,
          type: 'unpaid',
          schoolName: school.schoolName,
          schoolId: school._id,
          message: `Outstanding balance: $${school.outstandingBalance.toFixed(2)}`,
          severity: school.outstandingBalance > 1000 ? 'high' : 'medium',
          createdAt: new Date().toISOString(),
        });
      }
    });

    schoolsData.forEach(school => {
      if (school.subscriptionStatus === 'trial' && school.trialEndDate) {
        const daysUntilExpiry = Math.ceil(
          (new Date(school.trialEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysUntilExpiry <= 7 && daysUntilExpiry >= 0) {
          alertsList.push({
            id: `trial-${school._id}`,
            type: 'expiring_trial',
            schoolName: school.schoolName,
            schoolId: school._id,
            message: `Trial expires in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? '' : 's'}`,
            severity: daysUntilExpiry <= 3 ? 'high' : 'medium',
            createdAt: new Date().toISOString(),
          });
        }
      }
    });

    schoolsData.forEach(school => {
      if (!school.isActive) {
        alertsList.push({
          id: `inactive-${school._id}`,
          type: 'inactive',
          schoolName: school.schoolName,
          schoolId: school._id,
          message: 'School is currently inactive',
          severity: 'low',
          createdAt: new Date().toISOString(),
        });
      }
    });

    return alertsList.sort((a, b) => {
      const severityOrder = { high: 0, medium: 1, low: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'unpaid':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'expiring_trial':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'inactive':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 className="h-12 w-12 text-primary" />
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600 mt-1">Overview of your platform metrics and alerts</p>
        </div>
        {canCreateSchools && (
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/platform/schools')}
            className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 font-semibold"
          >
            <Plus className="w-5 h-5" />
            Add School
          </motion.button>
        )}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnimatedStatCard
          title="Total Schools"
          value={metrics?.totalSchools || 0}
          icon={<Building2 className="w-6 h-6 text-primary" />}
          iconBgColor="bg-primary-50"
          trend={{
            value: `${metrics?.activeSchools} active`,
            isPositive: true
          }}
          delay={0}
        />

        <AnimatedStatCard
          title="Total Students"
          value={metrics?.totalStudents.toLocaleString() || '0'}
          icon={<Users className="w-6 h-6 text-emerald-600" />}
          iconBgColor="bg-emerald-50"
          trend={{
            value: `${metrics?.totalTeachers.toLocaleString()} teachers`,
            isPositive: true
          }}
          delay={1}
        />

        <AnimatedStatCard
          title="Monthly Revenue (MRR)"
          value={formatCurrency(metrics?.mrr || 0)}
          icon={<TrendingUp className="w-6 h-6 text-blue-600" />}
          iconBgColor="bg-blue-50"
          trend={{
            value: `ARR: ${formatCurrency(metrics?.arr || 0)}`,
            isPositive: true
          }}
          delay={2}
        />

        <AnimatedStatCard
          title="Total Revenue"
          value={formatCurrency(metrics?.totalRevenue || 0)}
          icon={<DollarSign className="w-6 h-6 text-purple-600" />}
          iconBgColor="bg-purple-50"
          trend={{
            value: 'All time',
            isPositive: true
          }}
          delay={3}
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red-50">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Alerts & Notifications</h3>
            </div>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="text-sm text-gray-500"
            >
              {alerts.length} alert{alerts.length !== 1 ? 's' : ''}
            </motion.span>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          <AnimatePresence mode="popLayout">
            {alerts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="px-6 py-8 text-center"
              >
                <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-400" />
                <p className="mt-2 text-gray-500">No alerts at this time</p>
              </motion.div>
            ) : (
              alerts.slice(0, 10).map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ backgroundColor: 'rgba(249, 250, 251, 0.5)', x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-6 py-4 flex items-start gap-4 transition-colors cursor-pointer border-l-4 ${getSeverityColor(alert.severity)}`}
                  onClick={() => router.push('/platform/schools')}
                >
                  <motion.div
                    className="flex-shrink-0 mt-0.5"
                    whileHover={{ scale: 1.2, rotate: 10 }}
                  >
                    {getAlertIcon(alert.type)}
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{alert.schoolName}</p>
                    <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.05 + 0.2 }}
                      className={`text-xs px-2 py-1 rounded font-medium ${
                        alert.severity === 'high' ? 'bg-red-100 text-red-700' :
                        alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {alert.severity}
                    </motion.span>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {alerts.length > 10 && (
          <div className="px-6 py-4 border-t border-gray-200 text-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-sm text-primary hover:text-primary-dark font-medium"
            >
              View all {alerts.length} alerts
            </motion.button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-purple-50">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Subscription Distribution</h3>
          </div>
          <div className="space-y-3">
            {['free', 'basic', 'premium', 'enterprise'].map((plan, index) => {
              const count = schools.filter(s => s.subscriptionPlan === plan).length;
              const percentage = schools.length > 0 ? (count / schools.length) * 100 : 0;
              return (
                <motion.div
                  key={plan}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 + 0.5 }}
                >
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-700 capitalize font-medium">{plan}</span>
                    <span className="text-gray-600">{count} schools ({percentage.toFixed(0)}%)</span>
                  </div>
                  <motion.div
                    className="w-full bg-gray-200 rounded-full h-2 overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: index * 0.05, duration: 0.8, ease: 'easeOut' }}
                      className={`h-2 rounded-full ${plan === 'free' ? 'bg-gray-400' : plan === 'basic' ? 'bg-blue-500' : plan === 'premium' ? 'bg-purple-500' : 'bg-primary'}`}
                    />
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-emerald-50">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Status Overview</h3>
          </div>
          <div className="space-y-3">
            {['trial', 'active', 'suspended', 'cancelled'].map((status, index) => {
              const count = schools.filter(s => s.subscriptionStatus === status).length;
              const percentage = schools.length > 0 ? (count / schools.length) * 100 : 0;
              return (
                <motion.div
                  key={status}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-700 capitalize font-medium">{status}</span>
                    <span className="text-gray-600">{count} schools ({percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: index * 0.05, ease: 'easeOut' }}
                      className={`h-2 rounded-full ${status === 'trial' ? 'bg-blue-500' : status === 'active' ? 'bg-green-500' : status === 'suspended' ? 'bg-yellow-500' : 'bg-red-500'}`}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
