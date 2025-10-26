'use client';

import { useEffect, useState } from 'react';
import { schoolService, type School } from '../../../lib/services/superadmin/school.service';

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

    // Sort schools by student count for top performing
    const sortedByStudents = [...schoolsData]
      .sort((a, b) => (b.studentCount || 0) - (a.studentCount || 0))
      .slice(0, 5)
      .map(s => ({
        name: s.schoolName,
        students: s.studentCount || 0,
        engagement: Math.floor(Math.random() * 30) + 70, // Mock engagement score
      }));

    // Mock low engagement schools
    const lowEngagement = schoolsData
      .filter(s => s.isActive)
      .slice(0, 5)
      .map(s => ({
        name: s.schoolName,
        students: s.studentCount || 0,
        engagement: Math.floor(Math.random() * 30) + 30, // Mock low engagement score
      }));

    return {
      totalSchools: schoolsData.length,
      totalStudents,
      avgStudentsPerSchool,
      topPerformingSchools: sortedByStudents,
      lowEngagementSchools: lowEngagement,
      growthRate: 12.5, // Mock growth rate
      churnRate: 2.3, // Mock churn rate
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Reports & Analytics
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Multi-school analytics and performance insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadReport('pdf')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
          >
            Download PDF
          </button>
          <button
            onClick={() => downloadReport('csv')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="timeRange" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Time Range
            </label>
            <select
              id="timeRange"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
          </div>
          <div>
            <label htmlFor="reportType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Report Type
            </label>
            <select
              id="reportType"
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Schools</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
            {metrics?.totalSchools || 0}
          </p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-2">
            +{metrics?.growthRate}% from last period
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Students</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
            {metrics?.totalStudents.toLocaleString() || 0}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            Avg: {Math.round(metrics?.avgStudentsPerSchool || 0)} per school
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Growth Rate</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
            +{metrics?.growthRate}%
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            Month over month
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Churn Rate</p>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
            {metrics?.churnRate}%
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            Last 30 days
          </p>
        </div>
      </div>

      {/* Top Performing Schools */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Top Performing Schools
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Ranked by student count and engagement
          </p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {metrics?.topPerformingSchools.map((school, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                    <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{school.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {school.students} students
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {school.engagement}% engagement
                  </p>
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${school.engagement}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low Engagement Schools */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Schools Needing Attention
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Schools with low engagement that may need support
          </p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {metrics?.lowEngagementSchools.map((school, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                    <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{school.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {school.students} students
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {school.engagement}% engagement
                  </p>
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${school.engagement}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue by Plan Chart */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Revenue Distribution by Plan
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {['free', 'basic', 'premium', 'enterprise'].map(plan => {
            const planSchools = schools.filter(s => s.subscriptionPlan === plan);
            const revenue = planSchools.reduce((sum, s) => sum + (s.mrr || 0), 0);
            return (
              <div key={plan} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{plan}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                  {formatCurrency(revenue)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {planSchools.length} schools
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
