'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { GlassCard } from '@/components/ui/glass-card';
import { AnimatedStatCard } from '@/components/ui/animated-stat-card';
import { Icon3D } from '@/components/ui/icon-3d';
import { SlideSheet, SheetSection, SheetField, SheetDetailRow } from '@/components/ui';
import {
  HeadphonesIcon,
  MessageCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  X,
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
      [TicketStatus.OPEN]: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Open' },
      [TicketStatus.IN_PROGRESS]: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'In Progress' },
      [TicketStatus.WAITING_FOR_USER]: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Waiting' },
      [TicketStatus.RESOLVED]: { bg: 'bg-green-100', text: 'text-green-700', label: 'Resolved' },
      [TicketStatus.CLOSED]: { bg: 'bg-gray-100/30', text: 'text-gray-700', label: 'Closed' },
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
      [TicketPriority.LOW]: { bg: 'bg-gray-100/30', text: 'text-gray-700', label: 'Low' },
      [TicketPriority.MEDIUM]: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Medium' },
      [TicketPriority.HIGH]: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'High' },
      [TicketPriority.URGENT]: { bg: 'bg-red-100', text: 'text-red-700', label: 'Urgent' },
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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
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
        ease: [0.22, 1, 0.36, 1]
      }
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-3 border-teal-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Icon3D */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-4"
      >
        <Icon3D bgColor="bg-teal-500" size="lg">
          <HeadphonesIcon className="w-6 h-6" />
        </Icon3D>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Support Tickets</h2>
          <p className="text-sm text-gray-600">Manage and track support requests from all schools</p>
        </div>
      </motion.div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700"
          >
            {error}
            <button onClick={() => setError(null)} className="ml-2 underline font-medium">Dismiss</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-5 gap-4"
      >
        <AnimatedStatCard
          title="Total Tickets"
          value={stats?.total || 0}
          icon={<FileText className="w-5 h-5" />}
          iconBgColor="bg-teal-500"
          delay={0}
        />
        <AnimatedStatCard
          title="Open"
          value={stats?.open || 0}
          icon={<AlertCircle className="w-5 h-5" />}
          iconBgColor="bg-blue-500"
          delay={1}
        />
        <AnimatedStatCard
          title="In Progress"
          value={stats?.inProgress || 0}
          icon={<Clock className="w-5 h-5" />}
          iconBgColor="bg-yellow-500"
          delay={2}
        />
        <AnimatedStatCard
          title="Resolved"
          value={stats?.resolved || 0}
          icon={<CheckCircle className="w-5 h-5" />}
          iconBgColor="bg-green-500"
          delay={3}
        />
        <AnimatedStatCard
          title="Avg. Resolution"
          value={stats?.avgResolutionTimeHours ? `${Math.round(stats.avgResolutionTimeHours)}h` : '-'}
          icon={<TrendingUp className="w-5 h-5" />}
          iconBgColor="bg-purple-500"
          delay={4}
        />
      </motion.div>

      {/* Filters and Search */}
      <GlassCard className="bg-white p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by ID, subject, or school..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
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
            <label htmlFor="priorityFilter" className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              id="priorityFilter"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Priorities</option>
              <option value={TicketPriority.LOW}>Low</option>
              <option value={TicketPriority.MEDIUM}>Medium</option>
              <option value={TicketPriority.HIGH}>High</option>
              <option value={TicketPriority.URGENT}>Urgent</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Tickets Table */}
      <GlassCard className="bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/80 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Ticket #
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  School
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col items-center gap-2"
                    >
                      <HeadphonesIcon className="w-12 h-12 text-gray-300" />
                      <p className="font-medium">No tickets found</p>
                    </motion.div>
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket, index) => (
                  <motion.tr
                    key={ticket._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ backgroundColor: 'rgba(249, 250, 251, 0.8)' }}
                    className="transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {ticket.ticketNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {ticket.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {ticket.tenantId?.schoolName || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {getCategoryLabel(ticket.category)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getPriorityBadge(ticket.priority)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getStatusBadge(ticket.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(ticket.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <motion.button
                        onClick={() => handleViewTicket(ticket)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-teal-600 hover:text-teal-700 font-medium"
                      >
                        View
                      </motion.button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredTickets.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50">
            <p className="text-sm text-gray-500">
              Showing {filteredTickets.length} of {tickets.length} tickets
            </p>
          </div>
        )}
      </GlassCard>

      {/* Ticket Detail SlideSheet */}
      <SlideSheet
        isOpen={showDetailModal && selectedTicket !== null}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedTicket(null);
          setNewComment('');
        }}
        title={selectedTicket ? `Ticket ${selectedTicket.ticketNumber}` : ''}
        subtitle={selectedTicket?.tenantId?.schoolName}
        size="lg"
        footer={
          <div className="flex flex-wrap gap-3 justify-between">
            <div className="flex gap-2 flex-wrap">
              {selectedTicket && !selectedTicket.assignedTo && (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClaimTicket}
                    disabled={updatingTicket}
                  >
                    Claim Ticket
                  </Button>
                </motion.div>
              )}
              {selectedTicket && selectedTicket.status === TicketStatus.OPEN && (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    size="sm"
                    onClick={() => handleUpdateStatus(TicketStatus.IN_PROGRESS)}
                    disabled={updatingTicket}
                  >
                    Start Working
                  </Button>
                </motion.div>
              )}
              {selectedTicket && selectedTicket.status === TicketStatus.IN_PROGRESS && (
                <>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateStatus(TicketStatus.WAITING_FOR_USER)}
                      disabled={updatingTicket}
                    >
                      Waiting for User
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(TicketStatus.RESOLVED)}
                      disabled={updatingTicket}
                    >
                      Mark Resolved
                    </Button>
                  </motion.div>
                </>
              )}
              {selectedTicket && selectedTicket.status === TicketStatus.WAITING_FOR_USER && (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    size="sm"
                    onClick={() => handleUpdateStatus(TicketStatus.IN_PROGRESS)}
                    disabled={updatingTicket}
                  >
                    Resume
                  </Button>
                </motion.div>
              )}
              {selectedTicket && selectedTicket.status === TicketStatus.RESOLVED && (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    size="sm"
                    onClick={() => handleUpdateStatus(TicketStatus.CLOSED)}
                    disabled={updatingTicket}
                  >
                    Close Ticket
                  </Button>
                </motion.div>
              )}
            </div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
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
            </motion.div>
          </div>
        }
      >
        {selectedTicket && (
          <>
            <SheetSection>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedTicket.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Priority</p>
                  <div className="mt-1">{getPriorityBadge(selectedTicket.priority)}</div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {getCategoryLabel(selectedTicket.category)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Assigned To</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {selectedTicket.assignedTo
                      ? `${selectedTicket.assignedTo.firstName} ${selectedTicket.assignedTo.lastName}`
                      : 'Unassigned'}
                  </p>
                </div>
              </div>
            </SheetSection>

            <SheetSection title="Ticket Details">
              <SheetDetailRow label="Subject" value={selectedTicket.subject} />
              <div className="py-3 border-b border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Description</p>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                  {selectedTicket.description}
                </p>
              </div>
              <SheetDetailRow
                label="Created By"
                value={`${selectedTicket.createdBy.firstName} ${selectedTicket.createdBy.lastName}`}
              />
              <SheetDetailRow label="Created" value={formatDate(selectedTicket.createdAt)} />
            </SheetSection>

            {selectedTicket.comments && selectedTicket.comments.length > 0 && (
              <SheetSection title={`Comments (${selectedTicket.comments.length})`}>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {selectedTicket.comments.map((comment, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-gray-50 rounded-lg p-3 border border-gray-100"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {comment.userId.firstName} {comment.userId.lastName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </motion.div>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <div className="flex justify-end mt-2">
                <motion.button
                  onClick={handleAddComment}
                  disabled={addingComment || !newComment.trim()}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 bg-teal-500 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-teal-500/30"
                >
                  <Send className="w-4 h-4" />
                  {addingComment ? 'Sending...' : 'Send Reply'}
                </motion.button>
              </div>
            </SheetSection>
          </>
        )}
      </SlideSheet>
    </div>
  );
}
