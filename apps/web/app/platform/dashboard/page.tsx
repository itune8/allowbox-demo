'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Users,
  TrendingUp,
  DollarSign,
  Plus,
  AlertCircle,
  CheckCircle2,
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
        return <DollarSign className="w-5 h-5" />;
      case 'expiring_trial':
        return <AlertCircle className="w-5 h-5" />;
      case 'inactive':
        return <Building2 className="w-5 h-5" />;
    }
  };

  const getSeverityStyles = (severity: Alert['severity']) => {
    switch (severity) {
      case 'high':
        return 'border-l-red-500 bg-red-50/50';
      case 'medium':
        return 'border-l-amber-500 bg-amber-50/50';
      case 'low':
        return 'border-l-blue-500 bg-blue-50/50';
    }
  };

  const getSeverityBadge = (severity: Alert['severity']) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-amber-100 text-amber-700';
      case 'low':
        return 'bg-blue-100 text-blue-700';
    }
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Overview of your platform metrics and alerts</p>
        </div>
        {canCreateSchools && (
          <button
            onClick={() => router.push('/platform/schools')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add School
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-50">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Schools</p>
              <p className="text-2xl font-semibold text-slate-900">{metrics?.totalSchools || 0}</p>
              <p className="text-xs text-emerald-600 mt-0.5">{metrics?.activeSchools} active</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-50">
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Students</p>
              <p className="text-2xl font-semibold text-slate-900">{metrics?.totalStudents.toLocaleString() || '0'}</p>
              <p className="text-xs text-slate-500 mt-0.5">{metrics?.totalTeachers.toLocaleString()} teachers</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-purple-50">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Monthly Revenue</p>
              <p className="text-2xl font-semibold text-slate-900">{formatCurrency(metrics?.mrr || 0)}</p>
              <p className="text-xs text-slate-500 mt-0.5">ARR: {formatCurrency(metrics?.arr || 0)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-50">
              <DollarSign className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Revenue</p>
              <p className="text-2xl font-semibold text-slate-900">{formatCurrency(metrics?.totalRevenue || 0)}</p>
              <p className="text-xs text-slate-500 mt-0.5">All time</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-50">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Alerts & Notifications</h2>
            </div>
            <span className="text-sm text-slate-500">
              {alerts.length} alert{alerts.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {alerts.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-400" />
              <p className="mt-3 text-slate-500">No alerts at this time</p>
            </div>
          ) : (
            alerts.slice(0, 10).map((alert) => (
              <div
                key={alert.id}
                className={`px-5 py-4 flex items-start gap-4 border-l-4 cursor-pointer hover:bg-slate-50 transition-colors ${getSeverityStyles(alert.severity)}`}
                onClick={() => router.push('/platform/schools')}
              >
                <div className="flex-shrink-0 mt-0.5 text-slate-500">
                  {getAlertIcon(alert.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900">{alert.schoolName}</p>
                  <p className="text-sm text-slate-600 mt-0.5">{alert.message}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-md font-medium ${getSeverityBadge(alert.severity)}`}>
                  {alert.severity}
                </span>
              </div>
            ))
          )}
        </div>

        {alerts.length > 10 && (
          <div className="px-5 py-3 border-t border-slate-200 text-center">
            <button className="text-sm text-primary font-medium hover:underline">
              View all {alerts.length} alerts
            </button>
          </div>
        )}
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscription Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-lg bg-purple-50">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Subscription Distribution</h3>
          </div>
          <div className="space-y-4">
            {['free', 'basic', 'premium', 'enterprise'].map((plan) => {
              const count = schools.filter(s => s.subscriptionPlan === plan).length;
              const percentage = schools.length > 0 ? (count / schools.length) * 100 : 0;
              const colors: Record<string, string> = {
                free: 'bg-slate-400',
                basic: 'bg-blue-500',
                premium: 'bg-purple-500',
                enterprise: 'bg-amber-500',
              };
              return (
                <div key={plan}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-medium text-slate-700 capitalize">{plan}</span>
                    <span className="text-slate-500">{count} schools ({percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${colors[plan]}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Overview */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-lg bg-emerald-50">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Status Overview</h3>
          </div>
          <div className="space-y-4">
            {['trial', 'active', 'suspended', 'cancelled'].map((status) => {
              const count = schools.filter(s => s.subscriptionStatus === status).length;
              const percentage = schools.length > 0 ? (count / schools.length) * 100 : 0;
              const colors: Record<string, string> = {
                trial: 'bg-blue-500',
                active: 'bg-emerald-500',
                suspended: 'bg-amber-500',
                cancelled: 'bg-red-500',
              };
              return (
                <div key={status}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-medium text-slate-700 capitalize">{status}</span>
                    <span className="text-slate-500">{count} schools ({percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${colors[status]}`}
                      style={{ width: `${percentage}%` }}
                    />
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
