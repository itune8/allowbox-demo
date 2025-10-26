'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
      case 'low':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Overview of your platform metrics and alerts</p>
        </div>
        {canCreateSchools && (
          <button
            onClick={() => router.push('/platform/schools')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add School
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Schools</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{metrics?.totalSchools || 0}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-xs text-green-600 dark:text-green-400">{metrics?.activeSchools} active</span>
                <span className="text-xs text-gray-500 dark:text-gray-500">{metrics?.inactiveSchools} inactive</span>
              </div>
            </div>
            <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Students</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{metrics?.totalStudents.toLocaleString() || 0}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">{metrics?.totalTeachers.toLocaleString()} teachers</p>
            </div>
            <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Revenue (MRR)</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{formatCurrency(metrics?.mrr || 0)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">ARR: {formatCurrency(metrics?.arr || 0)}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{formatCurrency(metrics?.totalRevenue || 0)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">All time</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Alerts & Notifications</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">{alerts.length} alert{alerts.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {alerts.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <svg className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-2 text-gray-500 dark:text-gray-400">No alerts at this time</p>
            </div>
          ) : (
            alerts.slice(0, 10).map(alert => (
              <div
                key={alert.id}
                className={`px-6 py-4 flex items-start gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer border-l-4 ${getSeverityColor(alert.severity)}`}
                onClick={() => router.push('/platform/schools')}
              >
                <div className="flex-shrink-0 mt-0.5">{getAlertIcon(alert.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{alert.schoolName}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{alert.message}</p>
                </div>
                <div className="flex-shrink-0">
                  <span className={`text-xs px-2 py-1 rounded font-medium ${
                    alert.severity === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                    alert.severity === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                    'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  }`}>{alert.severity}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {alerts.length > 10 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 text-center">
            <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium">
              View all {alerts.length} alerts
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Subscription Distribution</h3>
          <div className="space-y-3">
            {['free', 'basic', 'premium', 'enterprise'].map(plan => {
              const count = schools.filter(s => s.subscriptionPlan === plan).length;
              const percentage = schools.length > 0 ? (count / schools.length) * 100 : 0;
              return (
                <div key={plan}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-300 capitalize font-medium">{plan}</span>
                    <span className="text-gray-600 dark:text-gray-400">{count} schools ({percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className={`h-2 rounded-full ${plan === 'free' ? 'bg-gray-400' : plan === 'basic' ? 'bg-blue-500' : plan === 'premium' ? 'bg-purple-500' : 'bg-indigo-600'}`} style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Status Overview</h3>
          <div className="space-y-3">
            {['trial', 'active', 'suspended', 'cancelled'].map(status => {
              const count = schools.filter(s => s.subscriptionStatus === status).length;
              const percentage = schools.length > 0 ? (count / schools.length) * 100 : 0;
              return (
                <div key={status}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-300 capitalize font-medium">{status}</span>
                    <span className="text-gray-600 dark:text-gray-400">{count} schools ({percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className={`h-2 rounded-full ${status === 'trial' ? 'bg-blue-500' : status === 'active' ? 'bg-green-500' : status === 'suspended' ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
