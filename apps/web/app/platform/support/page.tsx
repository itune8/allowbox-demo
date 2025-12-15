'use client';

import { useEffect, useState } from 'react';
import { Button } from '@repo/ui/button';
import {
  supportTicketService,
  SupportTicket,
  TicketStatus,
  TicketPriority,
  TicketCategory,
  TicketStatistics,
  UpdateTicketDto,
  AddCommentDto,
} from '../../../lib/services/support-ticket.service';
import { useAuth } from '../../../contexts/auth-context';

export default function SupportPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [stats, setStats] = useState<TicketStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Update ticket state
  const [updatingTicket, setUpdatingTicket] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [addingComment, setAddingComment] = useState(false);

  useEffect(() => {
    loadTickets();
  }, [statusFilter]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: { status?: TicketStatus } = {};
      if (statusFilter !== 'all') {
        filters.status = statusFilter as TicketStatus;
      }

      const [ticketsData, statsData] = await Promise.all([
        supportTicketService.getAll(filters),
        supportTicketService.getStatistics(),
      ]);

      setTickets(ticketsData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load tickets:', err);
      setError('Failed to load support tickets');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredTickets = () => {
    return tickets.filter(ticket => {
      const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
      const matchesSearch = searchQuery === '' ||
        ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.tenantId?.schoolName?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesPriority && matchesSearch;
    });
  };

  const filteredTickets = getFilteredTickets();

  const handleViewTicket = async (ticket: SupportTicket) => {
    try {
      const fullTicket = await supportTicketService.getById(ticket._id);
      setSelectedTicket(fullTicket);
      setShowDetailModal(true);
    } catch (err) {
      console.error('Failed to load ticket details:', err);
      setSelectedTicket(ticket);
      setShowDetailModal(true);
    }
  };

  const handleUpdateStatus = async (newStatus: TicketStatus) => {
    if (!selectedTicket) return;
    try {
      setUpdatingTicket(true);
      const updated = await supportTicketService.update(selectedTicket._id, { status: newStatus });
      setSelectedTicket(updated);
      await loadTickets();
    } catch (err) {
      console.error('Failed to update ticket:', err);
      alert('Failed to update ticket status');
    } finally {
      setUpdatingTicket(false);
    }
  };

  const handleClaimTicket = async () => {
    if (!selectedTicket) return;
    try {
      setUpdatingTicket(true);
      const updated = await supportTicketService.claimTicket(selectedTicket._id);
      setSelectedTicket(updated);
      await loadTickets();
    } catch (err) {
      console.error('Failed to claim ticket:', err);
      alert('Failed to claim ticket');
    } finally {
      setUpdatingTicket(false);
    }
  };

  const handleAddComment = async () => {
    if (!selectedTicket || !newComment.trim()) return;
    try {
      setAddingComment(true);
      const updated = await supportTicketService.addComment(selectedTicket._id, {
        content: newComment,
        isInternal: false,
      });
      setSelectedTicket(updated);
      setNewComment('');
    } catch (err) {
      console.error('Failed to add comment:', err);
      alert('Failed to add comment');
    } finally {
      setAddingComment(false);
    }
  };

  const getStatusBadge = (status: TicketStatus) => {
    const badges: Record<TicketStatus, { bg: string; text: string; label: string }> = {
      [TicketStatus.OPEN]: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', label: 'Open' },
      [TicketStatus.IN_PROGRESS]: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', label: 'In Progress' },
      [TicketStatus.WAITING_FOR_USER]: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', label: 'Waiting' },
      [TicketStatus.RESOLVED]: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', label: 'Resolved' },
      [TicketStatus.CLOSED]: { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-700 dark:text-gray-300', label: 'Closed' },
    };
    const badge = badges[status] || badges[TicketStatus.OPEN];
    return (
      <span className={`text-xs px-2 py-1 rounded font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: TicketPriority) => {
    const badges: Record<TicketPriority, { bg: string; text: string; label: string }> = {
      [TicketPriority.LOW]: { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-700 dark:text-gray-300', label: 'Low' },
      [TicketPriority.MEDIUM]: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', label: 'Medium' },
      [TicketPriority.HIGH]: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', label: 'High' },
      [TicketPriority.URGENT]: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', label: 'Urgent' },
    };
    const badge = badges[priority] || badges[TicketPriority.MEDIUM];
    return (
      <span className={`text-xs px-2 py-1 rounded font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const getCategoryLabel = (category: TicketCategory) => {
    const labels: Record<TicketCategory, string> = {
      [TicketCategory.TECHNICAL]: 'Technical',
      [TicketCategory.BILLING]: 'Billing',
      [TicketCategory.ACCOUNT]: 'Account',
      [TicketCategory.FEATURE_REQUEST]: 'Feature Request',
      [TicketCategory.BUG_REPORT]: 'Bug Report',
      [TicketCategory.GENERAL]: 'General',
      [TicketCategory.OTHER]: 'Other',
    };
    return labels[category] || category;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Support Tickets
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage and track support requests from all schools
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Tickets</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats?.total || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Open</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats?.open || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{stats?.inProgress || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Resolved</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{stats?.resolved || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Resolution</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
            {stats?.avgResolutionTimeHours ? `${Math.round(stats.avgResolutionTimeHours)}h` : '-'}
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <input
              id="search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, subject, or school..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value={TicketStatus.OPEN}>Open</option>
              <option value={TicketStatus.IN_PROGRESS}>In Progress</option>
              <option value={TicketStatus.WAITING_FOR_USER}>Waiting for User</option>
              <option value={TicketStatus.RESOLVED}>Resolved</option>
              <option value={TicketStatus.CLOSED}>Closed</option>
            </select>
          </div>
          <div>
            <label htmlFor="priorityFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Priority
            </label>
            <select
              id="priorityFilter"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Priorities</option>
              <option value={TicketPriority.LOW}>Low</option>
              <option value={TicketPriority.MEDIUM}>Medium</option>
              <option value={TicketPriority.HIGH}>High</option>
              <option value={TicketPriority.URGENT}>Urgent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Ticket #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  School
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    <div className="text-4xl mb-3">🎫</div>
                    No tickets found
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => (
                  <tr key={ticket._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                      {ticket.ticketNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate">
                      {ticket.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {ticket.tenantId?.schoolName || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {getCategoryLabel(ticket.category)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getPriorityBadge(ticket.priority)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getStatusBadge(ticket.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(ticket.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleViewTicket(ticket)}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 font-medium"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredTickets.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {filteredTickets.length} of {tickets.length} tickets
            </p>
          </div>
        )}
      </div>

      {/* Ticket Detail Slide-in Panel */}
      {showDetailModal && selectedTicket && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => { setShowDetailModal(false); setSelectedTicket(null); setNewComment(''); }} />
          <div className="relative bg-white dark:bg-gray-900 w-full max-w-2xl h-full overflow-y-auto shadow-xl animate-slide-in-right border-l border-gray-200 dark:border-gray-800">
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Ticket {selectedTicket.ticketNumber}
                </h3>
                <p className="text-sm text-gray-500">{selectedTicket.tenantId?.schoolName}</p>
              </div>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedTicket(null);
                  setNewComment('');
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Header Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedTicket.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Priority</p>
                  <div className="mt-1">{getPriorityBadge(selectedTicket.priority)}</div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Category</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">
                    {getCategoryLabel(selectedTicket.category)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Assigned To</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">
                    {selectedTicket.assignedTo
                      ? `${selectedTicket.assignedTo.firstName} ${selectedTicket.assignedTo.lastName}`
                      : 'Unassigned'}
                  </p>
                </div>
              </div>

              {/* Subject & Description */}
              <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Subject</p>
                <p className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1">
                  {selectedTicket.subject}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Description</p>
                <p className="text-sm text-gray-900 dark:text-gray-100 mt-1 whitespace-pre-wrap">
                  {selectedTicket.description}
                </p>
              </div>

              {/* Created By & Dates */}
              <div className="border-t border-gray-200 dark:border-gray-800 pt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Created By</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {selectedTicket.createdBy.firstName} {selectedTicket.createdBy.lastName}
                  </p>
                  {selectedTicket.createdBy.email && (
                    <p className="text-xs text-gray-500">{selectedTicket.createdBy.email}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Created</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {formatDate(selectedTicket.createdAt)}
                  </p>
                </div>
              </div>

              {/* Comments */}
              {selectedTicket.comments && selectedTicket.comments.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                    Comments ({selectedTicket.comments.length})
                  </p>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {selectedTicket.comments.map((comment, idx) => (
                      <div key={idx} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {comment.userId.firstName} {comment.userId.lastName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Comment */}
              <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Add Comment</p>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write your response..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex justify-end mt-2">
                  <Button
                    size="sm"
                    onClick={handleAddComment}
                    disabled={addingComment || !newComment.trim()}
                  >
                    {addingComment ? 'Sending...' : 'Send Reply'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-800/50 px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex flex-wrap gap-3 justify-between">
              <div className="flex gap-2">
                {!selectedTicket.assignedTo && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClaimTicket}
                    disabled={updatingTicket}
                  >
                    Claim Ticket
                  </Button>
                )}
                {selectedTicket.status === TicketStatus.OPEN && (
                  <Button
                    size="sm"
                    onClick={() => handleUpdateStatus(TicketStatus.IN_PROGRESS)}
                    disabled={updatingTicket}
                  >
                    Start Working
                  </Button>
                )}
                {selectedTicket.status === TicketStatus.IN_PROGRESS && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateStatus(TicketStatus.WAITING_FOR_USER)}
                      disabled={updatingTicket}
                    >
                      Waiting for User
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(TicketStatus.RESOLVED)}
                      disabled={updatingTicket}
                    >
                      Mark Resolved
                    </Button>
                  </>
                )}
                {selectedTicket.status === TicketStatus.WAITING_FOR_USER && (
                  <Button
                    size="sm"
                    onClick={() => handleUpdateStatus(TicketStatus.IN_PROGRESS)}
                    disabled={updatingTicket}
                  >
                    Resume
                  </Button>
                )}
                {selectedTicket.status === TicketStatus.RESOLVED && (
                  <Button
                    size="sm"
                    onClick={() => handleUpdateStatus(TicketStatus.CLOSED)}
                    disabled={updatingTicket}
                  >
                    Close Ticket
                  </Button>
                )}
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedTicket(null);
                  setNewComment('');
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
