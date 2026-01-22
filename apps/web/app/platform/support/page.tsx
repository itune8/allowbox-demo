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
} from '../../../lib/services/support-ticket.service';
import { useAuth } from '../../../contexts/auth-context';
import { SlideSheet, SheetSection, SheetDetailRow } from '../../../components/ui';
import {
  HeadphonesIcon,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Send,
  User,
  FileText,
  TrendingUp,
} from 'lucide-react';

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
      [TicketStatus.OPEN]: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Open' },
      [TicketStatus.IN_PROGRESS]: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'In Progress' },
      [TicketStatus.WAITING_FOR_USER]: { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Waiting' },
      [TicketStatus.RESOLVED]: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Resolved' },
      [TicketStatus.CLOSED]: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Closed' },
    };
    const badge = badges[status] || badges[TicketStatus.OPEN];
    return (
      <span className={`text-xs px-2 py-1 rounded-md font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: TicketPriority) => {
    const badges: Record<TicketPriority, { bg: string; text: string; label: string }> = {
      [TicketPriority.LOW]: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Low' },
      [TicketPriority.MEDIUM]: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Medium' },
      [TicketPriority.HIGH]: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'High' },
      [TicketPriority.URGENT]: { bg: 'bg-red-50', text: 'text-red-700', label: 'Urgent' },
    };
    const badge = badges[priority] || badges[TicketPriority.MEDIUM];
    return (
      <span className={`text-xs px-2 py-1 rounded-md font-medium ${badge.bg} ${badge.text}`}>
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
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Support Tickets</h1>
        <p className="text-slate-500 mt-1">Manage and track support requests from all schools</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline font-medium">Dismiss</button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-50">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total</p>
              <p className="text-2xl font-semibold text-slate-900">{stats?.total || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-50">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Open</p>
              <p className="text-2xl font-semibold text-slate-900">{stats?.open || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-purple-50">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">In Progress</p>
              <p className="text-2xl font-semibold text-slate-900">{stats?.inProgress || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-50">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Resolved</p>
              <p className="text-2xl font-semibold text-slate-900">{stats?.resolved || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-slate-100">
              <TrendingUp className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Avg. Resolution</p>
              <p className="text-2xl font-semibold text-slate-900">
                {stats?.avgResolutionTimeHours ? `${Math.round(stats.avgResolutionTimeHours)}h` : '-'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-slate-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by ID, subject, or school..."
                className="w-full h-10 pl-10 pr-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
            <label htmlFor="priorityFilter" className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
            <select
              id="priorityFilter"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Ticket #</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Subject</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">School</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Category</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Priority</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Created</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-500">
                      <HeadphonesIcon className="w-12 h-12 text-slate-300" />
                      <p>No tickets found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => (
                  <tr key={ticket._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{ticket.ticketNumber}</td>
                    <td className="px-4 py-3 text-slate-700 max-w-xs truncate">{ticket.subject}</td>
                    <td className="px-4 py-3 text-slate-600">{ticket.tenantId?.schoolName || '-'}</td>
                    <td className="px-4 py-3 text-slate-600">{getCategoryLabel(ticket.category)}</td>
                    <td className="px-4 py-3">{getPriorityBadge(ticket.priority)}</td>
                    <td className="px-4 py-3">{getStatusBadge(ticket.status)}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(ticket.createdAt)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleViewTicket(ticket)}
                        className="text-primary hover:underline font-medium text-sm"
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
          <div className="px-4 py-3 border-t border-slate-200">
            <p className="text-sm text-slate-500">Showing {filteredTickets.length} of {tickets.length} tickets</p>
          </div>
        )}
      </div>

      {/* Ticket Detail SlideSheet */}
      <SlideSheet
        isOpen={showDetailModal && selectedTicket !== null}
        onClose={() => { setShowDetailModal(false); setSelectedTicket(null); setNewComment(''); }}
        title={selectedTicket ? `Ticket ${selectedTicket.ticketNumber}` : ''}
        subtitle={selectedTicket?.tenantId?.schoolName}
        size="lg"
        footer={
          <div className="flex flex-wrap gap-3 justify-between">
            <div className="flex gap-2 flex-wrap">
              {selectedTicket && !selectedTicket.assignedTo && (
                <Button variant="outline" size="sm" onClick={handleClaimTicket} disabled={updatingTicket}>
                  Claim Ticket
                </Button>
              )}
              {selectedTicket && selectedTicket.status === TicketStatus.OPEN && (
                <Button size="sm" onClick={() => handleUpdateStatus(TicketStatus.IN_PROGRESS)} disabled={updatingTicket}>
                  Start Working
                </Button>
              )}
              {selectedTicket && selectedTicket.status === TicketStatus.IN_PROGRESS && (
                <>
                  <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(TicketStatus.WAITING_FOR_USER)} disabled={updatingTicket}>
                    Waiting for User
                  </Button>
                  <Button size="sm" onClick={() => handleUpdateStatus(TicketStatus.RESOLVED)} disabled={updatingTicket}>
                    Mark Resolved
                  </Button>
                </>
              )}
              {selectedTicket && selectedTicket.status === TicketStatus.WAITING_FOR_USER && (
                <Button size="sm" onClick={() => handleUpdateStatus(TicketStatus.IN_PROGRESS)} disabled={updatingTicket}>
                  Resume
                </Button>
              )}
              {selectedTicket && selectedTicket.status === TicketStatus.RESOLVED && (
                <Button size="sm" onClick={() => handleUpdateStatus(TicketStatus.CLOSED)} disabled={updatingTicket}>
                  Close Ticket
                </Button>
              )}
            </div>
            <Button variant="outline" onClick={() => { setShowDetailModal(false); setSelectedTicket(null); setNewComment(''); }}>
              Close
            </Button>
          </div>
        }
      >
        {selectedTicket && (
          <>
            <SheetSection>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedTicket.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Priority</p>
                  <div className="mt-1">{getPriorityBadge(selectedTicket.priority)}</div>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Category</p>
                  <p className="text-sm font-medium text-slate-900 mt-1">{getCategoryLabel(selectedTicket.category)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Assigned To</p>
                  <p className="text-sm font-medium text-slate-900 mt-1">
                    {selectedTicket.assignedTo
                      ? `${selectedTicket.assignedTo.firstName} ${selectedTicket.assignedTo.lastName}`
                      : 'Unassigned'}
                  </p>
                </div>
              </div>
            </SheetSection>

            <SheetSection title="Ticket Details">
              <SheetDetailRow label="Subject" value={selectedTicket.subject} />
              <div className="py-3 border-b border-slate-200">
                <p className="text-sm text-slate-500 mb-2">Description</p>
                <p className="text-sm text-slate-900 whitespace-pre-wrap">{selectedTicket.description}</p>
              </div>
              <SheetDetailRow label="Created By" value={`${selectedTicket.createdBy.firstName} ${selectedTicket.createdBy.lastName}`} />
              <SheetDetailRow label="Created" value={formatDate(selectedTicket.createdAt)} />
            </SheetSection>

            {selectedTicket.comments && selectedTicket.comments.length > 0 && (
              <SheetSection title={`Comments (${selectedTicket.comments.length})`}>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {selectedTicket.comments.map((comment, idx) => (
                    <div key={idx} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-900 flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {comment.userId.firstName} {comment.userId.lastName}
                        </span>
                        <span className="text-xs text-slate-500">{formatDate(comment.createdAt)}</span>
                      </div>
                      <p className="text-sm text-slate-700">{comment.content}</p>
                    </div>
                  ))}
                </div>
              </SheetSection>
            )}

            <SheetSection title="Add Comment">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write your response..."
                rows={3}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <div className="flex justify-end mt-2">
                <Button
                  onClick={handleAddComment}
                  disabled={addingComment || !newComment.trim()}
                  size="sm"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {addingComment ? 'Sending...' : 'Send Reply'}
                </Button>
              </div>
            </SheetSection>
          </>
        )}
      </SlideSheet>
    </div>
  );
}
