'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@repo/ui/button';
import {
  supportTicketService,
  SupportTicket,
  TicketStatus,
  TicketPriority,
  TicketCategory,
  TicketStatistics,
} from '../../../../lib/services/support-ticket.service';
import { GlassCard, AnimatedStatCard, Icon3D } from '../../../../components/ui';
import {
  HelpCircle,
  MessageCircle,
  Phone,
  Mail,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Ticket,
  X,
} from 'lucide-react';

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
    [TicketStatus.OPEN]: 'bg-yellow-100 text-yellow-700',
    [TicketStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-700',
    [TicketStatus.WAITING_FOR_USER]: 'bg-orange-100 text-orange-700',
    [TicketStatus.RESOLVED]: 'bg-green-100 text-green-700',
    [TicketStatus.CLOSED]: 'bg-gray-100 text-gray-700',
  };

  const priorityColors: Record<TicketPriority, string> = {
    [TicketPriority.LOW]: 'bg-gray-100 text-gray-700',
    [TicketPriority.MEDIUM]: 'bg-blue-100 text-blue-700',
    [TicketPriority.HIGH]: 'bg-orange-100 text-orange-700',
    [TicketPriority.URGENT]: 'bg-red-100 text-red-700',
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
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

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
          <Icon3D gradient="from-orange-500 to-red-500" size="lg">
            <HelpCircle className="w-6 h-6" />
          </Icon3D>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
            <p className="text-sm text-gray-500">View and track support tickets from your school</p>
          </div>
        </div>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-strong rounded-xl border border-red-200 px-4 py-3 text-red-700 flex items-center justify-between"
          >
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-2 underline hover:no-underline">Dismiss</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <AnimatedStatCard
            title="Total Tickets"
            value={stats.total}
            icon={<Ticket className="w-5 h-5" />}
            gradient="from-orange-500 to-red-500"
            delay={0}
          />
          <AnimatedStatCard
            title="Open"
            value={stats.open}
            icon={<AlertCircle className="w-5 h-5" />}
            gradient="from-yellow-500 to-amber-500"
            delay={0.1}
          />
          <AnimatedStatCard
            title="In Progress"
            value={stats.inProgress}
            icon={<Loader2 className="w-5 h-5" />}
            gradient="from-blue-500 to-cyan-500"
            delay={0.2}
          />
          <AnimatedStatCard
            title="Resolved"
            value={stats.resolved}
            icon={<CheckCircle className="w-5 h-5" />}
            gradient="from-emerald-500 to-teal-500"
            delay={0.3}
          />
          <AnimatedStatCard
            title="Avg Resolution"
            value={`${stats.avgResolutionTimeHours}h`}
            icon={<Clock className="w-5 h-5" />}
            gradient="from-violet-500 to-purple-500"
            delay={0.4}
          />
        </div>
      )}

      {/* Filter & Tickets List */}
      <GlassCard hover={false} className="overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-wrap gap-3">
          <h3 className="text-lg font-semibold text-gray-900">All Tickets</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                className="h-10 w-48 border border-gray-200 rounded-xl pl-9 pr-9 text-sm bg-white/80 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-300 transition-all"
                placeholder="Search tickets..."
                value={ticketSearch}
                onChange={(e) => setTicketSearch(e.target.value)}
              />
              {ticketSearch && (
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setTicketSearch('')}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <select
              className="border border-gray-200 bg-white/80 backdrop-blur-sm text-gray-900 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500/50 focus:border-orange-300 transition-all"
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
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 text-center text-gray-500"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <Ticket className="w-16 h-16 mx-auto text-gray-300 mb-3" />
            </motion.div>
            <p>No tickets found.</p>
          </motion.div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100/80">
                <tr className="text-left text-gray-500">
                  <th className="py-3 px-4 font-semibold">Ticket #</th>
                  <th className="py-3 px-4 font-semibold">Subject</th>
                  <th className="py-3 px-4 font-semibold">Submitted By</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Priority</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTickets.map((ticket, index) => (
                  <motion.tr
                    key={ticket._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    whileHover={{ backgroundColor: 'rgba(249, 250, 251, 0.8)' }}
                    className="cursor-pointer group transition-all"
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <td className="py-3 px-4 font-mono text-xs text-gray-500">{ticket.ticketNumber}</td>
                    <td className="py-3 px-4 font-medium text-gray-900 group-hover:text-orange-600 transition-colors">{ticket.subject}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {ticket.createdBy?.firstName} {ticket.createdBy?.lastName}
                      <span className="text-xs text-gray-400 ml-1">({ticket.createdBy?.role})</span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{categoryLabels[ticket.category]}</td>
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
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* View Ticket Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setSelectedTicket(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative glass-strong rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 mx-4"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-xs text-gray-500 font-mono">{selectedTicket.ticketNumber}</span>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedTicket.subject}</h3>
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
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-gray-600"
                >
                  <span className="font-medium">Submitted by:</span>{' '}
                  {selectedTicket.createdBy?.firstName} {selectedTicket.createdBy?.lastName}
                  <span className="text-xs text-gray-400 ml-1">({selectedTicket.createdBy?.role})</span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                  className="bg-gray-50 rounded-lg p-4"
                >
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedTicket.description}</p>
                </motion.div>

                {selectedTicket.assignedTo && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-gray-600"
                  >
                    <span className="font-medium">Assigned to:</span>{' '}
                    {selectedTicket.assignedTo.firstName} {selectedTicket.assignedTo.lastName}
                  </motion.div>
                )}

                {/* Comments */}
                {selectedTicket.comments.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="space-y-3"
                  >
                    <h4 className="font-medium text-gray-900">Activity</h4>
                    {selectedTicket.comments.map((comment, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + idx * 0.05 }}
                        className={`rounded-lg p-3 ${comment.isInternal ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900">
                            {comment.userId?.firstName} {comment.userId?.lastName}
                            {comment.isInternal && <span className="text-xs text-yellow-600 ml-2">(Internal Note)</span>}
                          </span>
                          <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200"
              >
                <Button variant="outline" onClick={() => setSelectedTicket(null)}>Close</Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
