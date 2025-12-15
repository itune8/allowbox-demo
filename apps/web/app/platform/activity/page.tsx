'use client';

import { useState, useEffect } from 'react';
import { activityLogService, type ActivityLog } from '../../../lib/services/activity-log.service';

export default function ActivityPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
      return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400';
    if (action.includes('UPDATED') || action.includes('SENT'))
      return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400';
    if (action.includes('SUSPENDED') || action.includes('DELETED') || action.includes('CANCELLED'))
      return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400';
    if (action.includes('WARNING'))
      return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400';
    return 'text-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-gray-400';
  };

  const getLevelBadge = (level: string) => {
    const colors: Record<string, string> = {
      INFO: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      WARNING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
      ERROR: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      CRITICAL: 'bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-200',
    };
    return colors[level] || colors.INFO;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <section className="animate-slide-in-right">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Activity Logs</h2>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Search logs..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-10 w-64 border border-gray-200 dark:border-gray-700 rounded-lg px-4 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          />
          <button
            type="submit"
            className="px-4 h-10 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
          >
            Search
          </button>
        </form>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-200">Action</th>
              <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-200">Description</th>
              <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-200">User</th>
              <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-200">Target</th>
              <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-200">Time</th>
              <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-200">IP</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                    <div className="text-gray-500">Loading logs...</div>
                  </div>
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                  No activity logs found
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id || log._id} className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getActionColor(log.action)}`}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300 max-w-xs truncate">
                    {log.description}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-900 dark:text-gray-100">{log.userName || 'System'}</div>
                    <div className="text-gray-500 text-xs">{log.userEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    {log.targetName || log.targetType || '-'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-500 text-xs">
                    {formatDate(log.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                    {log.ipAddress || '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 rounded border border-gray-200 dark:border-gray-700 disabled:opacity-50 text-sm"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 rounded border border-gray-200 dark:border-gray-700 disabled:opacity-50 text-sm"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}
