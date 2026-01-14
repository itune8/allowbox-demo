'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { schoolService, type School } from '../../../lib/services/superadmin/school.service';
import { GlassCard, AnimatedStatCard, Icon3D } from '@/components/ui';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Users,
  School as SchoolIcon,
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

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

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
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-500"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <Icon3D gradient="from-purple-500 to-pink-500">
            <BarChart3 className="w-5 h-5" />
          </Icon3D>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Reports & Analytics
            </h2>
            <p className="text-gray-600 mt-1">
              Multi-school analytics and performance insights
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => downloadReport('pdf')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => downloadReport('csv')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Export CSV
          </motion.button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <GlassCard className="bg-white p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="timeRange" className="block text-sm font-medium text-gray-700 mb-2">
                Time Range
              </label>
              <select
                id="timeRange"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">Last Year</option>
              </select>
            </div>
            <div>
              <label htmlFor="reportType" className="block text-sm font-medium text-gray-700 mb-2">
                Report Type
              </label>
              <select
                id="reportType"
                value={reportType}
                onChange={(e) => setReportType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="overview">Overview</option>
                <option value="schools">Schools Performance</option>
                <option value="revenue">Revenue Analysis</option>
                <option value="engagement">Engagement Metrics</option>
              </select>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <AnimatedStatCard
          title="Total Schools"
          value={metrics?.totalSchools || 0}
          icon={<SchoolIcon className="w-5 h-5 text-white" />}
          trend={metrics?.growthRate ? { value: `${metrics.growthRate}%`, isPositive: metrics.growthRate > 0 } : undefined}
          gradient="from-purple-500 to-pink-500"
        />

        <AnimatedStatCard
          title="Total Students"
          value={metrics?.totalStudents.toLocaleString() || '0'}
          icon={<Users className="w-5 h-5 text-white" />}
          gradient="from-purple-500 to-pink-500"
        />

        <AnimatedStatCard
          title="Growth Rate"
          value={`+${metrics?.growthRate}%`}
          icon={<TrendingUp className="w-5 h-5 text-white" />}
          gradient="from-green-500 to-emerald-500"
        />

        <AnimatedStatCard
          title="Churn Rate"
          value={`${metrics?.churnRate}%`}
          icon={<TrendingDown className="w-5 h-5 text-white" />}
          gradient="from-red-500 to-rose-500"
        />
      </motion.div>

      {/* Top Performing Schools */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <GlassCard className="bg-white">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Icon3D gradient="from-purple-500 to-pink-500">
                <Award className="w-4 h-4" />
              </Icon3D>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Top Performing Schools
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Ranked by student count and engagement
                </p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="space-y-4"
            >
              {metrics?.topPerformingSchools.map((school, index) => (
                <motion.div
                  key={index}
                  variants={item}
                  whileHover={{ scale: 1.02, x: 5 }}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full"
                    >
                      <span className="text-lg font-bold text-white">
                        {index + 1}
                      </span>
                    </motion.div>
                    <div>
                      <p className="font-medium text-gray-900">{school.name}</p>
                      <p className="text-sm text-gray-600">
                        {school.students} students
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {school.engagement}% engagement
                    </p>
                    <div className="w-32 bg-gray-200 rounded-full h-2 mt-1 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${school.engagement}%` }}
                        transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Low Engagement Schools */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <GlassCard className="bg-white">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Icon3D gradient="from-orange-500 to-red-500">
                <AlertTriangle className="w-4 h-4" />
              </Icon3D>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Schools Needing Attention
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Schools with low engagement that may need support
                </p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="space-y-4"
            >
              {metrics?.lowEngagementSchools.map((school, index) => (
                <motion.div
                  key={index}
                  variants={item}
                  whileHover={{ scale: 1.02, x: 5 }}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-center w-10 h-10 bg-yellow-100 rounded-full"
                    >
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    </motion.div>
                    <div>
                      <p className="font-medium text-gray-900">{school.name}</p>
                      <p className="text-sm text-gray-600">
                        {school.students} students
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {school.engagement}% engagement
                    </p>
                    <div className="w-32 bg-gray-200 rounded-full h-2 mt-1 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${school.engagement}%` }}
                        transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                        className="bg-gradient-to-r from-red-500 to-rose-500 h-2 rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Revenue by Plan Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <GlassCard className="bg-white p-6">
          <div className="flex items-center gap-3 mb-4">
            <Icon3D gradient="from-purple-500 to-pink-500">
              <PieChart className="w-4 h-4" />
            </Icon3D>
            <h3 className="text-lg font-semibold text-gray-900">
              Revenue Distribution by Plan
            </h3>
          </div>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            {['free', 'basic', 'premium', 'enterprise'].map((plan, index) => {
              const planSchools = schools.filter(s => s.subscriptionPlan === plan);
              const revenue = planSchools.reduce((sum, s) => sum + (s.mrr || 0), 0);
              const gradients = [
                'from-gray-500 to-gray-600',
                'from-blue-500 to-cyan-500',
                'from-purple-500 to-pink-500',
                'from-orange-500 to-red-500',
              ];
              return (
                <motion.div
                  key={plan}
                  variants={item}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-lg transition-all"
                >
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradients[index]} mb-3`} />
                  <p className="text-sm text-gray-600 capitalize">{plan}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {formatCurrency(revenue)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {planSchools.length} schools
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
