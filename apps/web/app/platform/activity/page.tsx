'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { activityLogService, type ActivityLog } from '../../../lib/services/activity-log.service';
import { GlassCard } from '@/components/ui/glass-card';
import { AnimatedStatCard } from '@/components/ui/animated-stat-card';
import { Icon3D } from '@/components/ui/icon-3d';
import { Activity, Clock, User, Target, Calendar, Search } from 'lucide-react';

export default function ActivityPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Stats
  const [stats, setStats] = useState({
    totalActivities: 0,
    todayActivities: 0,
    activeUsers: 0,
    criticalEvents: 0,
  });

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await activityLogService.getLogs({
        page,
        limit: 20,
        search: filter || undefined,
      });
      setLogs(response.logs);
      setTotalPages(response.totalPages);

      // Calculate stats
      const today = new Date().toDateString();
      const todayCount = response.logs.filter(
        (log) => new Date(log.createdAt).toDateString() === today
      ).length;
      const uniqueUsers = new Set(response.logs.map((log) => log.userId)).size;
      const criticalCount = response.logs.filter(
        (log) => log.level === 'CRITICAL' || log.level === 'ERROR'
      ).length;

      setStats({
        totalActivities: response.total || response.logs.length,
        todayActivities: todayCount,
        activeUsers: uniqueUsers,
        criticalEvents: criticalCount,
      });
    } catch (err: any) {
      console.error('Failed to fetch logs:', err);
      setError('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const getActionColor = (action: string) => {
    if (action.includes('CREATED') || action.includes('LOGIN'))
      return 'text-green-600 bg-green-50';
    if (action.includes('UPDATED') || action.includes('SENT'))
      return 'text-blue-600 bg-blue-50';
    if (action.includes('SUSPENDED') || action.includes('DELETED') || action.includes('CANCELLED'))
      return 'text-red-600 bg-red-50';
    if (action.includes('WARNING'))
      return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getLevelBadge = (level: string) => {
    const colors: Record<string, string> = {
      INFO: 'bg-blue-100 text-blue-700',
      WARNING: 'bg-yellow-100 text-yellow-700',
      ERROR: 'bg-red-100 text-red-700',
      CRITICAL: 'bg-red-200 text-red-800',
    };
    return colors[level] || colors.INFO;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

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
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut" as const
      }
    },
  };

  return (
    <section className="space-y-6">
      {/* Header with Icon3D */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-4"
      >
        <Icon3D gradient="from-sky-500 to-blue-500" size="lg">
          <Activity className="w-6 h-6" />
        </Icon3D>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Activity Logs</h2>
          <p className="text-sm text-gray-600">Monitor all system activities and user actions</p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <AnimatedStatCard
          title="Total Activities"
          value={stats.totalActivities}
          icon={<Activity className="w-5 h-5" />}
          gradient="from-sky-500 to-blue-500"
          delay={0}
        />
        <AnimatedStatCard
          title="Today's Activities"
          value={stats.todayActivities}
          icon={<Clock className="w-5 h-5" />}
          gradient="from-blue-500 to-indigo-500"
          delay={1}
        />
        <AnimatedStatCard
          title="Active Users"
          value={stats.activeUsers}
          icon={<User className="w-5 h-5" />}
          gradient="from-indigo-500 to-purple-500"
          delay={2}
        />
        <AnimatedStatCard
          title="Critical Events"
          value={stats.criticalEvents}
          icon={<Target className="w-5 h-5" />}
          gradient="from-purple-500 to-violet-500"
          delay={3}
        />
      </motion.div>

      {/* Search Bar */}
      <GlassCard className="bg-white p-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs by action, user, or description..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="h-10 w-full border border-gray-200 rounded-lg pl-10 pr-4 text-sm focus:ring-2 focus:ring-sky-400 focus:border-transparent focus:outline-none bg-white text-gray-900"
            />
          </div>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 h-10 bg-gradient-to-r from-sky-500 to-blue-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-sky-500/30 hover:shadow-xl hover:shadow-sky-500/40 transition-all"
          >
            Search
          </motion.button>
        </form>
      </GlassCard>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Activity Logs Table */}
      <GlassCard className="bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50/80 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Action</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Target</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Time</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">IP</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-10 h-10 border-3 border-sky-500 border-t-transparent rounded-full"
                      />
                      <div className="text-gray-500 font-medium">Loading activity logs...</div>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col items-center gap-2"
                    >
                      <Activity className="w-12 h-12 text-gray-300" />
                      <p className="font-medium">No activity logs found</p>
                    </motion.div>
                  </td>
                </tr>
              ) : (
                <motion.tbody
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                >
                  {logs.map((log, index) => (
                    <motion.tr
                      key={log.id || log._id}
                      variants={itemVariants}
                      whileHover={{ backgroundColor: 'rgba(249, 250, 251, 0.8)' }}
                      className="border-t border-gray-100 cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <motion.span
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className={`px-2 py-1 rounded text-xs font-medium ${getActionColor(log.action)}`}
                        >
                          {log.action.replace(/_/g, ' ')}
                        </motion.span>
                      </td>
                      <td className="px-4 py-3 text-gray-700 max-w-xs truncate">
                        {log.description}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-900 font-medium">{log.userName || 'System'}</div>
                        <div className="text-gray-500 text-xs">{log.userEmail}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {log.targetName || log.targetType || '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(log.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                        {log.ipAddress || '-'}
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-2"
        >
          <motion.button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            whileHover={{ scale: page === 1 ? 1 : 1.05 }}
            whileTap={{ scale: page === 1 ? 1 : 0.95 }}
            className="px-4 py-2 rounded-lg border border-gray-200 bg-white disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Previous
          </motion.button>
          <span className="px-4 py-2 text-sm text-gray-600 font-medium">
            Page {page} of {totalPages}
          </span>
          <motion.button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            whileHover={{ scale: page === totalPages ? 1 : 1.05 }}
            whileTap={{ scale: page === totalPages ? 1 : 0.95 }}
            className="px-4 py-2 rounded-lg border border-gray-200 bg-white disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Next
          </motion.button>
        </motion.div>
      )}
    </section>
  );
}
