'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@repo/ui/button';
import { GlassCard, AnimatedStatCard, Icon3D } from '../../../../components/ui';
import {
  BarChart3,
  FileText,
  Download,
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  Eye,
} from 'lucide-react';

const reports = [
  { name: 'Fees Summary', icon: DollarSign, color: 'from-emerald-500 to-teal-500' },
  { name: 'Attendance Overview', icon: Users, color: 'from-blue-500 to-cyan-500' },
  { name: 'Students by Class', icon: BarChart3, color: 'from-violet-500 to-purple-500' },
];

export default function ReportsPage() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Icon3D gradient="from-purple-500 to-violet-500" size="lg">
            <BarChart3 className="w-6 h-6" />
          </Icon3D>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
            <p className="text-sm text-gray-500">Generate and view school reports</p>
          </div>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button className="shadow-lg shadow-indigo-500/25">
            <Download className="w-4 h-4 mr-2" />
            Export All Reports
          </Button>
        </motion.div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AnimatedStatCard
          title="Total Reports"
          value={12}
          icon={<FileText className="w-5 h-5" />}
          gradient="from-purple-500 to-violet-500"
          delay={0}
        />
        <AnimatedStatCard
          title="Generated Today"
          value={3}
          icon={<Calendar className="w-5 h-5" />}
          gradient="from-blue-500 to-cyan-500"
          delay={0.1}
        />
        <AnimatedStatCard
          title="Downloads"
          value={48}
          icon={<Download className="w-5 h-5" />}
          gradient="from-emerald-500 to-teal-500"
          delay={0.2}
        />
        <AnimatedStatCard
          title="Trending"
          value={5}
          icon={<TrendingUp className="w-5 h-5" />}
          gradient="from-orange-500 to-amber-500"
          delay={0.3}
        />
      </div>

      {/* Time Filter */}
      <GlassCard hover={false} className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500 mr-2">Filter by period:</span>
          {['This Month', 'Last 3 Months', 'This Year'].map((r, index) => (
            <motion.button
              key={r}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-full px-4 py-2 border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-sm font-medium text-gray-700 hover:text-indigo-700 transition-all shadow-sm hover:shadow-md"
            >
              {r}
            </motion.button>
          ))}
        </div>
      </GlassCard>

      {/* Reports Table */}
      <GlassCard hover={false} className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100/80">
              <tr>
                <th className="px-4 py-4 text-left font-semibold text-gray-700">Report</th>
                <th className="px-4 py-4 text-left font-semibold text-gray-700">Generated</th>
                <th className="px-4 py-4 text-right font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <AnimatePresence>
                {reports.map((report, i) => {
                  const IconComponent = report.icon;
                  return (
                    <motion.tr
                      key={report.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ backgroundColor: 'rgba(249, 250, 251, 0.8)' }}
                      className="group cursor-pointer transition-all"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${report.color} flex items-center justify-center shadow-lg`}
                          >
                            <IconComponent className="w-5 h-5 text-white" />
                          </motion.div>
                          <span className="text-gray-900 font-medium group-hover:text-indigo-600 transition-colors">
                            {report.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(Date.now() - i * 86400000).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="inline-flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 rounded-lg hover:bg-indigo-100 text-gray-400 hover:text-indigo-600 transition-all"
                            title="View Report"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 rounded-lg hover:bg-green-100 text-gray-400 hover:text-green-600 transition-all"
                            title="Download Report"
                          >
                            <Download className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </GlassCard>
    </motion.section>
  );
}
