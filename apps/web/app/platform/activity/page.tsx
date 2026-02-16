'use client';

import { useState, useEffect } from 'react';
import { activityLogService, type ActivityLog } from '../../../lib/services/activity-log.service';
import { Activity, Clock, User, Target, Calendar, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { PlatformStatCard, StatusBadge } from '../../../components/platform';

export default function ActivityPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Activity Logs</h1>
        <p className="text-slate-500 mt-1">Monitor all system activities and user actions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <PlatformStatCard
          icon={<Activity className="w-5 h-5" />}
          color="cyan"
          label="Total Activities"
          value={stats.totalActivities}
        />
        <PlatformStatCard
          icon={<Clock className="w-5 h-5" />}
          color="blue"
          label="Today's Activities"
          value={stats.todayActivities}
        />
        <PlatformStatCard
          icon={<User className="w-5 h-5" />}
          color="purple"
          label="Active Users"
          value={stats.activeUsers}
        />
        <PlatformStatCard
          icon={<Target className="w-5 h-5" />}
          color="red"
          label="Critical Events"
          value={stats.criticalEvents}
        />
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search logs by action, user, or description..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="h-10 w-full border border-slate-200 rounded-lg pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] focus:outline-none bg-white text-slate-900"
            />
          </div>
          <button
            type="submit"
            style={{ backgroundColor: '#824ef2' }}
            className="h-10 px-5 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Activity Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Action</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Description</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">User</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Target</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Time</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 border-2 border-[#824ef2] border-t-transparent rounded-full animate-spin" />
                      <span className="text-slate-500">Loading activity logs...</span>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-500">
                      <Activity className="w-12 h-12 text-slate-300" />
                      <p>No activity logs found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id || log._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <StatusBadge
                        value={log.action.replace(/_/g, ' ').toLowerCase()}
                        type="status"
                      />
                    </td>
                    <td className="px-4 py-3 text-slate-700 max-w-xs truncate">
                      {log.description}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-900 font-medium">{log.userName || 'System'}</div>
                      <div className="text-slate-500 text-xs">{log.userEmail}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {log.targetName || log.targetType || '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(log.createdAt)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400 font-mono text-xs">
                      {log.ipAddress || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="inline-flex items-center gap-1 h-9 px-3 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-slate-600 font-medium">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="inline-flex items-center gap-1 h-9 px-3 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
