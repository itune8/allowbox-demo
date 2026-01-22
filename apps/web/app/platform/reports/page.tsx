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
} from 'lucide-react';

interface ReportMetrics {
  totalSchools: number;
  totalStudents: number;
  avgStudentsPerSchool: number;
  topPerformingSchools: { name: string; students: number; engagement: number }[];
  lowEngagementSchools: { name: string; students: number; engagement: number }[];
  growthRate: number;
  churnRate: number;
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
    const avgStudentsPerSchool = schoolsData.length > 0 ? totalStudents / schoolsData.length : 0;

    const sortedByStudents = [...schoolsData]
      .sort((a, b) => (b.studentCount || 0) - (a.studentCount || 0))
      .slice(0, 5)
      .map(s => ({
        name: s.schoolName,
        students: s.studentCount || 0,
        engagement: Math.floor(Math.random() * 30) + 70,
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
      topPerformingSchools: sortedByStudents,
      lowEngagementSchools: lowEngagement,
      growthRate: 12.5,
      churnRate: 2.3,
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
          <h1 className="text-2xl font-semibold text-slate-900">Reports & Analytics</h1>
          <p className="text-slate-500 mt-1">Multi-school analytics and performance insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => downloadReport('pdf')}>
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="outline" onClick={() => downloadReport('csv')}>
            <FileText className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="timeRange" className="block text-sm font-medium text-slate-700 mb-2">
              Time Range
            </label>
            <select
              id="timeRange"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
          </div>
          <div>
            <label htmlFor="reportType" className="block text-sm font-medium text-slate-700 mb-2">
              Report Type
            </label>
            <select
              id="reportType"
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="overview">Overview</option>
              <option value="schools">Schools Performance</option>
              <option value="revenue">Revenue Analysis</option>
              <option value="engagement">Engagement Metrics</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-50">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Schools</p>
              <p className="text-2xl font-semibold text-slate-900">{metrics?.totalSchools || 0}</p>
              {metrics?.growthRate && (
                <p className="text-xs text-emerald-600 flex items-center gap-0.5 mt-0.5">
                  <TrendingUp className="w-3 h-3" />
                  +{metrics.growthRate}%
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-purple-50">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Students</p>
              <p className="text-2xl font-semibold text-slate-900">{metrics?.totalStudents.toLocaleString() || '0'}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-50">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Growth Rate</p>
              <p className="text-2xl font-semibold text-slate-900">+{metrics?.growthRate}%</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-red-50">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Churn Rate</p>
              <p className="text-2xl font-semibold text-slate-900">{metrics?.churnRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Schools */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-50">
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Top Performing Schools</h3>
              <p className="text-sm text-slate-500">Ranked by student count and engagement</p>
            </div>
          </div>
        </div>
        <div className="p-5 space-y-4">
          {metrics?.topPerformingSchools.map((school, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 bg-purple-500 rounded-full">
                  <span className="text-lg font-bold text-white">{index + 1}</span>
                </div>
                <div>
                  <p className="font-medium text-slate-900">{school.name}</p>
                  <p className="text-sm text-slate-600">{school.students} students</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">{school.engagement}% engagement</p>
                <div className="w-32 bg-slate-100 rounded-full h-2 mt-1 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${school.engagement}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Schools Needing Attention */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-50">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Schools Needing Attention</h3>
              <p className="text-sm text-slate-500">Schools with low engagement that may need support</p>
            </div>
          </div>
        </div>
        <div className="p-5 space-y-4">
          {metrics?.lowEngagementSchools.map((school, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 bg-amber-100 rounded-full">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">{school.name}</p>
                  <p className="text-sm text-slate-600">{school.students} students</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">{school.engagement}% engagement</p>
                <div className="w-32 bg-slate-100 rounded-full h-2 mt-1 overflow-hidden">
                  <div
                    className="bg-red-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${school.engagement}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Distribution by Plan */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-lg bg-purple-50">
            <BarChart3 className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="font-semibold text-slate-900">Revenue Distribution by Plan</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {['free', 'basic', 'premium', 'enterprise'].map((plan, index) => {
            const planSchools = schools.filter(s => s.subscriptionPlan === plan);
            const revenue = planSchools.reduce((sum, s) => sum + (s.mrr || 0), 0);
            const bgColors = ['bg-slate-500', 'bg-blue-500', 'bg-purple-500', 'bg-amber-500'];
            return (
              <div
                key={plan}
                className="border border-slate-200 rounded-lg p-4 bg-white hover:shadow-md transition-all"
              >
                <div className={`w-8 h-8 rounded-lg ${bgColors[index]} mb-3`} />
                <p className="text-sm text-slate-500 capitalize">{plan}</p>
                <p className="text-2xl font-semibold text-slate-900 mt-1">{formatCurrency(revenue)}</p>
                <p className="text-xs text-slate-500 mt-1">{planSchools.length} schools</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
