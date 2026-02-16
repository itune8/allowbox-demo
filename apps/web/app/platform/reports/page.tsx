'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { schoolService, type School } from '../../../lib/services/superadmin/school.service';
import {
  BarChart3,
  Users,
  Building2,
  Download,
  DollarSign,
  UserMinus,
  CheckCircle2,
} from 'lucide-react';
import { PlatformStatCard, StatusBadge, EngagementBar } from '../../../components/platform';

interface ReportMetrics {
  totalSchools: number;
  totalStudents: number;
  avgStudentsPerSchool: number;
  activeUsers: number;
  monthlyRevenue: number;
  retentionRate: number;
  topPerformingSchools: { name: string; location: string; students: number; engagement: number; status: string }[];
  growthRate: number;
  churnRate: number;
  engagementRate: number;
}

export default function ReportsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [metrics, setMetrics] = useState<ReportMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [toast, setToast] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadReportsData();
  }, []);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const loadReportsData = async () => {
    try {
      setLoading(true);
      const schoolsData = await schoolService.getSchools();
      setSchools(schoolsData);
      const reportMetrics = calculateMetrics(schoolsData);
      setMetrics(reportMetrics);
    } catch (error) {
      console.error('Failed to load reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (schoolsData: School[]): ReportMetrics => {
    const totalStudents = schoolsData.reduce((sum, s) => sum + (s.studentCount || 0), 0);
    const totalTeachers = schoolsData.reduce((sum, s) => sum + (s.teacherCount || 0), 0);
    const avgStudentsPerSchool = schoolsData.length > 0 ? totalStudents / schoolsData.length : 0;
    const activeUsers = totalStudents + totalTeachers;
    const monthlyRevenue = schoolsData.reduce((sum, s) => sum + (s.mrr || 0), 0);

    const locations = ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ'];
    const statuses = ['Active', 'Active', 'Active', 'Active', 'Trial'];

    const sortedByStudents = [...schoolsData]
      .sort((a, b) => (b.studentCount || 0) - (a.studentCount || 0))
      .slice(0, 5)
      .map((s, index) => ({
        name: s.schoolName,
        location: locations[index] || 'Unknown',
        students: s.studentCount || 0,
        engagement: Math.floor(Math.random() * 20) + 78,
        status: statuses[index] || 'Active',
      }));

    return {
      totalSchools: schoolsData.length,
      totalStudents,
      avgStudentsPerSchool,
      activeUsers,
      monthlyRevenue,
      retentionRate: 94.2,
      topPerformingSchools: sortedByStudents,
      growthRate: 12,
      churnRate: 3.2,
      engagementRate: 78.4,
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const downloadReport = (format: 'pdf' | 'csv' | 'excel') => {
    setToast(`Downloading ${format.toUpperCase()} report...`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-[#824ef2] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-[9999] bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Platform Analytics</h1>
          <p className="text-slate-500 mt-1">Comprehensive overview of all schools and user engagement</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="h-10 px-4 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2]"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          <button
            onClick={() => downloadReport('pdf')}
            className="inline-flex items-center gap-2 h-10 px-4 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <PlatformStatCard
          icon={<DollarSign className="w-5 h-5" />}
          color="purple"
          label="MRR"
          value={formatCurrency(metrics?.monthlyRevenue || 0)}
          trend={{ value: '+12.5%', positive: true }}
          badge="Active"
          subtitle="Track subscription revenue trends"
          onClick={() => router.push('/platform/reports/mrr')}
        />
        <PlatformStatCard
          icon={<UserMinus className="w-5 h-5" />}
          color="red"
          label="Churn Rate"
          value={`${metrics?.churnRate || 0}%`}
          trend={{ value: '-0.8%', positive: true }}
          badge="Active"
          subtitle="Monitor customer retention"
          onClick={() => router.push('/platform/reports/churn')}
        />
        <PlatformStatCard
          icon={<BarChart3 className="w-5 h-5" />}
          color="blue"
          label="Engagement Rate"
          value={`${metrics?.engagementRate || 0}%`}
          trend={{ value: '+5.2%', positive: true }}
          badge="Active"
          subtitle="Measure platform usage"
          onClick={() => router.push('/platform/reports/engagement')}
        />
        <PlatformStatCard
          icon={<Building2 className="w-5 h-5" />}
          color="green"
          label="Total Schools"
          value={metrics?.totalSchools || 0}
          trend={{ value: `+${metrics?.growthRate || 0}%`, positive: true }}
          badge="Active"
          subtitle="Active platform schools"
          onClick={() => router.push('/platform/reports/schools')}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-slate-900">User Growth</h3>
          </div>
          <div className="h-64 flex items-end justify-between gap-2">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, index) => {
              const heights = [55, 60, 65, 70, 75, 80];
              return (
                <div key={month} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-gradient-to-t from-purple-500/80 to-purple-500/20 rounded-t-lg relative" style={{ height: `${heights[index]}%` }}>
                    <div className="absolute inset-0 bg-purple-100/50 rounded-t-lg"></div>
                  </div>
                  <span className="text-xs text-slate-500">{month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue Breakdown Donut Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-slate-900">Revenue Breakdown</h3>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 100 100" className="transform -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#E2E8F0" strokeWidth="20" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#8B5CF6" strokeWidth="20" strokeDasharray="180 251" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#F59E0B" strokeWidth="20" strokeDasharray="33 251" strokeDashoffset="-180" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#10B981" strokeWidth="20" strokeDasharray="25 251" strokeDashoffset="-213" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#3B82F6" strokeWidth="20" strokeDasharray="13 251" strokeDashoffset="-238" />
              </svg>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <div className="flex-1">
                <p className="text-xs text-slate-500">Subscriptions</p>
                <p className="text-sm font-semibold text-slate-900">72%</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <div className="flex-1">
                <p className="text-xs text-slate-500">Add-ons</p>
                <p className="text-sm font-semibold text-slate-900">13%</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <div className="flex-1">
                <p className="text-xs text-slate-500">Training</p>
                <p className="text-sm font-semibold text-slate-900">10%</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <div className="flex-1">
                <p className="text-xs text-slate-500">Support</p>
                <p className="text-sm font-semibold text-slate-900">5%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Schools */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Top Performing Schools</h3>
          <button className="text-sm text-[#824ef2] hover:opacity-80 font-medium">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">School Name</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Location</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Students</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Engagement</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {metrics?.topPerformingSchools.map((school, index) => {
                const avatarColors = ['bg-purple-500', 'bg-orange-500', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500'];
                return (
                  <tr key={index} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${avatarColors[index]} flex items-center justify-center text-white font-semibold`}>
                          {school.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-900">{school.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">{school.location}</td>
                    <td className="px-5 py-4 text-sm text-slate-900 font-medium">{school.students.toLocaleString()}</td>
                    <td className="px-5 py-4">
                      <EngagementBar percentage={school.engagement} />
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge value={school.status.toLowerCase()} type="status" showDot />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
