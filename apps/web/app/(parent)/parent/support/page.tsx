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
  CreateTicketDto,
} from '../../../../lib/services/support-ticket.service';
import { GlassCard, Icon3D } from '@/components/ui';
import {
  HelpCircle,
  Plus,
  X,
  Sparkles,
  ChevronDown,
  MessageSquare,
  Send,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
} from 'lucide-react';

export default function ParentSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [filter, setFilter] = useState<'All' | TicketStatus>('All');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateTicketDto>({
    subject: '',
    description: '',
    category: TicketCategory.GENERAL,
    priority: TicketPriority.MEDIUM,
  });

  useEffect(() => {
    loadTickets();
  }, []);

  async function loadTickets() {
    try {
      setLoading(true);
      const data = await supportTicketService.getMyTickets();
      setTickets(data);
    } catch (err) {
      setError('Failed to load tickets');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.description.trim()) return;

    try {
      setSubmitting(true);
      await supportTicketService.create(formData);
      await loadTickets();
      resetForm();
      setShowForm(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddComment() {
    if (!selectedTicket || !newComment.trim()) return;

    try {
      const updated = await supportTicketService.addComment(selectedTicket._id, {
        content: newComment,
      });
      setSelectedTicket(updated);
      setNewComment('');
      await loadTickets();
    } catch (err) {
      console.error(err);
    }
  }

  function resetForm() {
    setFormData({
      subject: '',
      description: '',
      category: TicketCategory.GENERAL,
      priority: TicketPriority.MEDIUM,
    });
  }

  const statusColors: Record<TicketStatus, string> = {
    [TicketStatus.OPEN]: 'from-yellow-400 to-yellow-600',
    [TicketStatus.IN_PROGRESS]: 'from-blue-400 to-blue-600',
    [TicketStatus.WAITING_FOR_USER]: 'from-orange-400 to-orange-600',
    [TicketStatus.RESOLVED]: 'from-green-400 to-green-600',
    [TicketStatus.CLOSED]: 'from-gray-400 to-gray-600',
  };

  const priorityColors: Record<TicketPriority, string> = {
    [TicketPriority.LOW]: 'from-gray-400 to-gray-500',
    [TicketPriority.MEDIUM]: 'from-blue-400 to-blue-500',
    [TicketPriority.HIGH]: 'from-orange-400 to-orange-500',
    [TicketPriority.URGENT]: 'from-red-400 to-red-500',
  };

  const categoryLabels: Record<TicketCategory, string> = {
    [TicketCategory.TECHNICAL]: 'Technical Issue',
    [TicketCategory.BILLING]: 'Billing',
    [TicketCategory.ACCOUNT]: 'Account',
    [TicketCategory.FEATURE_REQUEST]: 'Feature Request',
    [TicketCategory.BUG_REPORT]: 'Bug Report',
    [TicketCategory.GENERAL]: 'General',
    [TicketCategory.OTHER]: 'Other',
  };

  const faqs = [
    { q: 'How do I pay school fees online?', a: 'Open the Fees page and click Pay Now on a pending invoice.' },
    { q: 'Can I link multiple children?', a: 'Yes, use Link New Child in the Children page.' },
    { q: 'Where can I view my receipts?', a: 'Go to Payments and use Download Receipt action.' },
    { q: 'How do I update my contact information?', a: 'Contact school administration or use the profile settings.' },
  ];

  const filteredTickets = filter === 'All' ? tickets : tickets.filter((t) => t.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-4"
      >
        <Icon3D gradient="from-orange-500 to-red-500" size="lg">
          <HelpCircle className="w-6 h-6" />
        </Icon3D>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            Support Center
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="w-5 h-5 text-orange-500" />
            </motion.span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Get help and manage support tickets
          </p>
        </div>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
          <button onClick={() => setError(null)} className="ml-2 underline">
            Dismiss
          </button>
        </motion.div>
      )}

      {/* Support Tickets */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <GlassCard className="bg-white/90 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4 flex-wrap gap-2 sm:gap-3">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-orange-500" />
              My Support Tickets
            </h3>
            <div className="flex items-center gap-2">
              <select
                className="border border-gray-300 bg-white text-gray-900 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'All' | TicketStatus)}
              >
                <option value="All">All</option>
                {Object.values(TicketStatus).map((s) => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium shadow-lg hover:from-orange-600 hover:to-red-600 transition-all text-xs sm:text-sm"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New </span>Ticket
              </motion.button>
            </div>
          </div>

          {/* Tickets List */}
          <div className="space-y-3">
            {filteredTickets.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="mb-4"
                >
                  <MessageSquare className="w-16 h-16 mx-auto text-gray-300" />
                </motion.div>
                <p className="text-lg font-medium">No tickets yet</p>
                <p className="text-sm mt-1">Create one if you need assistance!</p>
              </div>
            ) : (
              filteredTickets.map((ticket, index) => (
                <motion.div
                  key={ticket._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="cursor-pointer group"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <GlassCard className="p-4 bg-white/80 hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-red-50/50 transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <Icon3D gradient={statusColors[ticket.status]} size="md">
                          <MessageSquare className="w-4 h-4" />
                        </Icon3D>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-semibold text-gray-900 group-hover:text-orange-700 transition-colors">
                              {ticket.subject}
                            </span>
                            <span className="text-xs font-mono text-gray-500">
                              #{ticket.ticketNumber}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <span className={`text-xs px-2.5 py-1 rounded-lg bg-gradient-to-r ${statusColors[ticket.status]} text-white font-medium`}>
                              {ticket.status.replace('_', ' ')}
                            </span>
                            <span className={`text-xs px-2.5 py-1 rounded-lg bg-gradient-to-r ${priorityColors[ticket.priority]} text-white font-medium`}>
                              {ticket.priority}
                            </span>
                            <span className="text-xs text-gray-600">
                              {categoryLabels[ticket.category]}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(ticket.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))
            )}
          </div>
        </GlassCard>
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <GlassCard className="bg-white/90 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-orange-500" />
            Frequently Asked Questions
          </h3>
          <div className="space-y-2 sm:space-y-3">
            {faqs.map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <GlassCard
                  className="p-3 sm:p-4 bg-white/80 hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-red-50/50 cursor-pointer transition-all"
                  onClick={() => setExpandedFAQ(expandedFAQ === idx ? null : idx)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium text-gray-900 text-sm sm:text-base flex items-center gap-2">
                      <Icon3D gradient="from-orange-500 to-red-500" size="sm">
                        <HelpCircle className="w-3.5 h-3.5" />
                      </Icon3D>
                      {faq.q}
                    </div>
                    <motion.div
                      animate={{ rotate: expandedFAQ === idx ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    </motion.div>
                  </div>
                  <AnimatePresence>
                    {expandedFAQ === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="text-sm text-gray-600 mt-3 pl-9">{faq.a}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Create Ticket Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowForm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-500 p-4 sm:p-6 rounded-t-2xl">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Icon3D gradient="from-white/20 to-white/5" size="lg">
                      <Plus className="w-6 h-6" />
                    </Icon3D>
                    <h3 className="text-xl font-bold text-white">
                      Create Support Ticket
                    </h3>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowForm(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </motion.button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as TicketCategory })}
                    >
                      {Object.entries(categoryLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as TicketPriority })}
                    >
                      {Object.values(TicketPriority).map((priority) => (
                        <option key={priority} value={priority}>{priority}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Brief description of your issue..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 resize-none"
                    rows={5}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Please provide details about your issue..."
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                      Cancel
                    </Button>
                  </motion.div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium shadow-lg hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50"
                  >
                    {submitting ? 'Creating...' : 'Submit Ticket'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Ticket Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setSelectedTicket(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-500 p-4 sm:p-6 rounded-t-2xl">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Icon3D gradient="from-white/20 to-white/5" size="lg">
                      <MessageSquare className="w-6 h-6" />
                    </Icon3D>
                    <div className="text-white flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-xs px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-sm font-medium">
                          #{selectedTicket.ticketNumber}
                        </span>
                        <span className={`text-xs px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-sm font-medium`}>
                          {selectedTicket.status.replace('_', ' ')}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold">{selectedTicket.subject}</h3>
                      <div className="flex items-center gap-1 text-sm text-orange-100 mt-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(selectedTicket.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedTicket(null)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </motion.button>
                </div>
              </div>

              <div className="p-4 sm:p-6 space-y-4">
                <GlassCard className="p-4 bg-gradient-to-br from-gray-50 to-gray-100/50">
                  <div className="text-xs text-gray-600 mb-2 font-medium">Description</div>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {selectedTicket.description}
                  </p>
                </GlassCard>

                {selectedTicket.assignedTo && (
                  <GlassCard className="p-4 bg-orange-50/50">
                    <div className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      Assigned to
                    </div>
                    <div className="font-semibold text-gray-900">
                      {selectedTicket.assignedTo.firstName} {selectedTicket.assignedTo.lastName}
                    </div>
                  </GlassCard>
                )}

                {/* Comments */}
                {selectedTicket.comments.filter(c => !c.isInternal).length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-orange-500" />
                      Replies
                    </h4>
                    {selectedTicket.comments.filter(c => !c.isInternal).map((comment, idx) => (
                      <GlassCard key={idx} className="p-3 bg-white/80">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                            <User className="w-3.5 h-3.5" />
                            {comment.userId?.firstName} {comment.userId?.lastName}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm">{comment.content}</p>
                      </GlassCard>
                    ))}
                  </div>
                )}

                {/* Add Comment */}
                {selectedTicket.status !== TicketStatus.CLOSED && (
                  <GlassCard className="p-4 bg-gradient-to-br from-orange-50 to-red-50/50">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Add Reply</label>
                    <textarea
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 resize-none"
                      rows={3}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Type your reply..."
                    />
                    <div className="flex justify-end mt-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium shadow-lg hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50"
                      >
                        <Send className="w-4 h-4" />
                        Send Reply
                      </motion.button>
                    </div>
                  </GlassCard>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button variant="outline" onClick={() => setSelectedTicket(null)}>
                      Close
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
