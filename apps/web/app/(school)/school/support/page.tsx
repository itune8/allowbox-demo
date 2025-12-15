'use client';

import { useState, useEffect } from 'react';
import { Button } from '@repo/ui/button';
import {
  supportTicketService,
  SupportTicket,
  TicketStatus,
  TicketPriority,
  TicketCategory,
  TicketStatistics,
} from '../../../../lib/services/support-ticket.service';

export default function SchoolSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [stats, setStats] = useState<TicketStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [filter, setFilter] = useState<'All' | TicketStatus>('All');
  const [ticketSearch, setTicketSearch] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [ticketsData, statsData] = await Promise.all([
        supportTicketService.getSchoolTickets(),
        supportTicketService.getStatistics(),
      ]);
      setTickets(ticketsData);
      setStats(statsData);
    } catch (err) {
      setError('Failed to load support tickets');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const statusColors: Record<TicketStatus, string> = {
    [TicketStatus.OPEN]: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    [TicketStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    [TicketStatus.WAITING_FOR_USER]: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    [TicketStatus.RESOLVED]: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    [TicketStatus.CLOSED]: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  };

  const priorityColors: Record<TicketPriority, string> = {
    [TicketPriority.LOW]: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    [TicketPriority.MEDIUM]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    [TicketPriority.HIGH]: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    [TicketPriority.URGENT]: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  };

  const categoryLabels: Record<TicketCategory, string> = {
    [TicketCategory.TECHNICAL]: 'Technical',
    [TicketCategory.BILLING]: 'Billing',
    [TicketCategory.ACCOUNT]: 'Account',
    [TicketCategory.FEATURE_REQUEST]: 'Feature',
    [TicketCategory.BUG_REPORT]: 'Bug',
    [TicketCategory.GENERAL]: 'General',
    [TicketCategory.OTHER]: 'Other',
  };

  const filteredTickets = tickets
    .filter((t) => filter === 'All' || t.status === filter)
    .filter((t) => {
      const q = ticketSearch.trim().toLowerCase();
      return !q || t.subject.toLowerCase().includes(q) || t.ticketNumber.toLowerCase().includes(q);
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Support Tickets</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          View and track support tickets from your school
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</div>
            <div className="text-sm text-gray-500">Total Tickets</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.open}</div>
            <div className="text-sm text-gray-500">Open</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <div className="text-sm text-gray-500">In Progress</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
            <div className="text-sm text-gray-500">Resolved</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="text-2xl font-bold text-gray-600">{stats.avgResolutionTimeHours}h</div>
            <div className="text-sm text-gray-500">Avg Resolution</div>
          </div>
        </div>
      )}

      {/* Filter & Tickets List */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 flex-wrap gap-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">All Tickets</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                className="h-10 w-48 border border-gray-300 rounded-lg pl-9 pr-3 text-sm bg-white dark:bg-gray-900 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Search tickets..."
                value={ticketSearch}
                onChange={(e) => setTicketSearch(e.target.value)}
              />
              <span className="absolute left-3 top-2.5 text-gray-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
              </span>
            </div>
            <select
              className="border border-gray-300 bg-white text-gray-900 rounded-md px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'All' | TicketStatus)}
            >
              <option value="All">All Status</option>
              {Object.values(TicketStatus).map((s) => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
        </div>

        {filteredTickets.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-3">🎫</div>
            <p>No tickets found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr className="text-left text-gray-500 dark:text-gray-400">
                  <th className="py-3 px-4">Ticket #</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Submitted By</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredTickets.map((ticket) => (
                  <tr
                    key={ticket._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer"
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <td className="py-3 px-4 font-mono text-xs text-gray-500">{ticket.ticketNumber}</td>
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">{ticket.subject}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {ticket.createdBy?.firstName} {ticket.createdBy?.lastName}
                      <span className="text-xs text-gray-400 ml-1">({ticket.createdBy?.role})</span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{categoryLabels[ticket.category]}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-0.5 rounded ${priorityColors[ticket.priority]}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-0.5 rounded ${statusColors[ticket.status]}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Ticket Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={() => setSelectedTicket(null)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 animate-zoom-in">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-xs text-gray-500 font-mono">{selectedTicket.ticketNumber}</span>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedTicket.subject}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded ${statusColors[selectedTicket.status]}`}>
                    {selectedTicket.status.replace('_', ' ')}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded ${priorityColors[selectedTicket.priority]}`}>
                    {selectedTicket.priority}
                  </span>
                </div>
              </div>
              <span className="text-sm text-gray-500">{new Date(selectedTicket.createdAt).toLocaleString()}</span>
            </div>

            <div className="space-y-4 text-sm">
              <div className="text-gray-600 dark:text-gray-400">
                <span className="font-medium">Submitted by:</span>{' '}
                {selectedTicket.createdBy?.firstName} {selectedTicket.createdBy?.lastName}
                <span className="text-xs text-gray-400 ml-1">({selectedTicket.createdBy?.role})</span>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedTicket.description}</p>
              </div>

              {selectedTicket.assignedTo && (
                <div className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Assigned to:</span>{' '}
                  {selectedTicket.assignedTo.firstName} {selectedTicket.assignedTo.lastName}
                </div>
              )}

              {/* Comments */}
              {selectedTicket.comments.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Activity</h4>
                  {selectedTicket.comments.map((comment, idx) => (
                    <div key={idx} className={`rounded-lg p-3 ${comment.isInternal ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800' : 'bg-gray-50 dark:bg-gray-800'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {comment.userId?.firstName} {comment.userId?.lastName}
                          {comment.isInternal && <span className="text-xs text-yellow-600 ml-2">(Internal Note)</span>}
                        </span>
                        <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button variant="outline" onClick={() => setSelectedTicket(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
