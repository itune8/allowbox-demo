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
import { GlassCard, Icon3D, SlideSheet, SheetSection, SheetField, SheetDetailRow } from '@/components/ui';
import {
  HelpCircle,
  Plus,
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
    [TicketStatus.OPEN]: 'bg-yellow-500',
    [TicketStatus.IN_PROGRESS]: 'bg-blue-500',
    [TicketStatus.WAITING_FOR_USER]: 'bg-orange-500',
    [TicketStatus.RESOLVED]: 'bg-green-500',
    [TicketStatus.CLOSED]: 'bg-gray-500',
  };

  const priorityColors: Record<TicketPriority, string> = {
    [TicketPriority.LOW]: 'bg-gray-400',
    [TicketPriority.MEDIUM]: 'bg-blue-400',
    [TicketPriority.HIGH]: 'bg-orange-400',
    [TicketPriority.URGENT]: 'bg-red-400',
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
        <Icon3D bgColor="bg-orange-500" size="lg">
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
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-orange-500 text-white rounded-lg font-medium shadow-lg hover:from-orange-600 hover:to-red-600 transition-all text-xs sm:text-sm"
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
                  <GlassCard className="p-4 bg-white/80 hover:bg-orange-50 transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <Icon3D bgColor="bg-gray-500" size="md">
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
                            <span className={`text-xs px-2.5 py-1 rounded-lg ${statusColors[ticket.status]} text-white font-medium`}>
                              {ticket.status.replace('_', ' ')}
                            </span>
                            <span className={`text-xs px-2.5 py-1 rounded-lg ${priorityColors[ticket.priority]} text-white font-medium`}>
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
                  className="p-3 sm:p-4 bg-white/80 hover:bg-orange-50 cursor-pointer transition-all"
                  onClick={() => setExpandedFAQ(expandedFAQ === idx ? null : idx)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium text-gray-900 text-sm sm:text-base flex items-center gap-2">
                      <Icon3D bgColor="bg-orange-500" size="sm">
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

      {/* Create Ticket Sheet */}
      <SlideSheet
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Create Support Ticket"
        subtitle="Submit a new support request"
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              onClick={(e) => {
                e.preventDefault();
                handleSubmit(e as any);
              }}
            >
              {submitting ? 'Creating...' : 'Submit Ticket'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <SheetField label="Category">
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as TicketCategory })}
              >
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </SheetField>
            <SheetField label="Priority">
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as TicketPriority })}
              >
                {Object.values(TicketPriority).map((priority) => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </SheetField>
          </div>

          <SheetField label="Subject" required>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Brief description of your issue..."
              required
            />
          </SheetField>

          <SheetField label="Description" required>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 resize-none"
              rows={5}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Please provide details about your issue..."
              required
            />
          </SheetField>
        </form>
      </SlideSheet>

      {/* View Ticket Sheet */}
      <SlideSheet
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        title={selectedTicket?.subject || ''}
        subtitle={selectedTicket ? `#${selectedTicket.ticketNumber} • ${selectedTicket.status.replace('_', ' ')} • ${new Date(selectedTicket.createdAt).toLocaleString()}` : ''}
        size="lg"
        footer={
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setSelectedTicket(null)}>
              Close
            </Button>
          </div>
        }
      >
        {selectedTicket && (
          <div className="space-y-4">
            <SheetSection title="Description">
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {selectedTicket.description}
              </p>
            </SheetSection>

            {selectedTicket.assignedTo && (
              <SheetSection title="Assigned To" icon={<User className="w-4 h-4" />}>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="font-semibold text-gray-900">
                    {selectedTicket.assignedTo.firstName} {selectedTicket.assignedTo.lastName}
                  </div>
                </div>
              </SheetSection>
            )}

            {/* Comments */}
            {selectedTicket.comments.filter(c => !c.isInternal).length > 0 && (
              <SheetSection title="Replies" icon={<MessageSquare className="w-4 h-4" />}>
                <div className="space-y-3">
                  {selectedTicket.comments.filter(c => !c.isInternal).map((comment, idx) => (
                    <div key={idx} className="p-3 bg-white border border-gray-200 rounded-lg">
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
                    </div>
                  ))}
                </div>
              </SheetSection>
            )}

            {/* Add Comment */}
            {selectedTicket.status !== TicketStatus.CLOSED && (
              <SheetSection title="Add Reply">
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 resize-none"
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Type your reply..."
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-all disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    Send Reply
                  </button>
                </div>
              </SheetSection>
            )}
          </div>
        )}
      </SlideSheet>
    </div>
  );
}
