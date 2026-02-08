'use client';

import { useEffect, useState } from 'react';
import { schoolService, type School } from '../../../lib/services/superadmin/school.service';
import { Button } from '@repo/ui/button';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  Download,
  FileText,
  AlertTriangle,
  Award,
  DollarSign,
  Activity,
} from 'lucide-react';

interface ReportMetrics {
  totalSchools: number;
  totalStudents: number;
  avgStudentsPerSchool: number;
  activeUsers: number;
  monthlyRevenue: number;
  retentionRate: number;
  topPerformingSchools: { name: string; location: string; students: number; engagement: number; status: string }[];
  lowEngagementSchools: { name: string; students: number; engagement: number }[];
  growthRate: number;
  churnRate: number;
  revenueGrowth: number;
  retentionGrowth: number;
}

export default function ReportsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [metrics, setMetrics] = useState<ReportMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [reportType, setReportType] = useState<'overview' | 'schools' | 'revenue' | 'engagement'>('overview');

  useEffect(() => {
    loadReportsData();
  }, []);

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

    const lowEngagement = schoolsData
      .filter(s => s.isActive)
      .slice(0, 5)
      .map(s => ({
        name: s.schoolName,
        students: s.studentCount || 0,
        engagement: Math.floor(Math.random() * 30) + 30,
      }));

    return {
      totalSchools: schoolsData.length,
      totalStudents,
      avgStudentsPerSchool,
      activeUsers,
      monthlyRevenue,
      retentionRate: 94.2,
      topPerformingSchools: sortedByStudents,
      lowEngagementSchools: lowEngagement,
      growthRate: 12,
      churnRate: 2.3,
      revenueGrowth: 24,
      retentionGrowth: 5,
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
    alert(`Downloading ${format.toUpperCase()} report... (This is a demo)`);
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
          <h1 className="text-2xl font-semibold text-slate-900">Platform Analytics</h1>
          <p className="text-slate-500 mt-1">Comprehensive overview of all schools and user engagement</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="h-10 px-4 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          <Button variant="outline" onClick={() => downloadReport('pdf')}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics - Matching Reference Design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-lg bg-purple-100">
              <Building2 className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm font-semibold text-emerald-600">+{metrics?.growthRate}%</span>
          </div>
          <p className="text-sm text-slate-500">Total Schools</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{metrics?.totalSchools || 0}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-lg bg-orange-100">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-sm font-semibold text-emerald-600">+8%</span>
          </div>
          <p className="text-sm text-slate-500">Active Users</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{metrics?.activeUsers.toLocaleString() || '0'}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-lg bg-emerald-100">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-sm font-semibold text-emerald-600">+{metrics?.revenueGrowth}%</span>
          </div>
          <p className="text-sm text-slate-500">Monthly Revenue</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{formatCurrency(metrics?.monthlyRevenue || 0)}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-lg bg-blue-100">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-semibold text-emerald-600">+{metrics?.retentionGrowth}%</span>
          </div>
          <p className="text-sm text-slate-500">Retention Rate</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{metrics?.retentionRate}%</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-slate-900">User Growth</h3>
            <button className="text-slate-400 hover:text-slate-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
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
          <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
            <span>0K</span>
            <span>10K</span>
            <span>20K</span>
            <span>30K</span>
            <span className="ml-auto">40K</span>
          </div>
        </div>

        {/* Revenue Breakdown Donut Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-slate-900">Revenue Breakdown</h3>
            <button className="text-slate-400 hover:text-slate-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative w-48 h-48">
              {/* Donut Chart - Simplified representation */}
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

      {/* Engagement Metrics Bar Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-slate-900">Engagement Metrics</h3>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-purple-100 text-purple-700">Daily</button>
            <button className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-600 hover:bg-slate-100">Weekly</button>
            <button className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-600 hover:bg-slate-100">Monthly</button>
          </div>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-purple-500"></div>
            <span className="text-sm text-slate-600">Teachers</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-orange-500"></div>
            <span className="text-sm text-slate-600">Parents</span>
          </div>
        </div>
        <div className="h-64 flex items-end justify-between gap-3">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
            const teacherHeights = [65, 70, 62, 68, 72, 45, 40];
            const parentHeights = [80, 85, 78, 82, 88, 70, 65];
            return (
              <div key={day} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex gap-1">
                  <div className="flex-1 bg-purple-500 rounded-t" style={{ height: `${(teacherHeights[index] ?? 0) * 2.8}px` }}></div>
                  <div className="flex-1 bg-orange-500 rounded-t" style={{ height: `${(parentHeights[index] ?? 0) * 2.8}px` }}></div>
                </div>
                <span className="text-xs text-slate-500">{day}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <span>0</span>
          <span>1000</span>
          <span>2000</span>
          <span>3000</span>
          <span>4000</span>
        </div>
      </div>

      {/* Top Performing Schools */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Top Performing Schools</h3>
          <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">View All</button>
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
                const colors = ['bg-purple-500', 'bg-orange-500', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500'];
                return (
                  <tr key={index} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${colors[index]} flex items-center justify-center text-white font-semibold`}>
                          {school.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-900">{school.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">{school.location}</td>
                    <td className="px-5 py-4 text-sm text-slate-900 font-medium">{school.students.toLocaleString()}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 max-w-32 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full ${colors[index]}`}
                            style={{ width: `${school.engagement}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-slate-900 w-10">{school.engagement}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        school.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {school.status}
                      </span>
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
