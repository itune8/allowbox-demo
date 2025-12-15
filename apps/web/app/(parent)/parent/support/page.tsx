'use client';

import { useState, useEffect } from 'react';
import { Button } from '@repo/ui/button';
import {
  supportTicketService,
  SupportTicket,
  TicketStatus,
  TicketPriority,
  TicketCategory,
  CreateTicketDto,
} from '../../../../lib/services/support-ticket.service';

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Support Center</h1>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
          Get help and manage support tickets
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Support Tickets */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4 flex-wrap gap-2 sm:gap-3">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">My Support Tickets</h3>
          <div className="flex items-center gap-2">
            <select
              className="border border-gray-300 bg-white text-gray-900 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'All' | TicketStatus)}
            >
              <option value="All">All</option>
              {Object.values(TicketStatus).map((s) => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </select>
            <Button onClick={() => setShowForm(true)} className="text-xs sm:text-sm px-2 sm:px-4">
              <span className="hidden sm:inline">New </span>Ticket
            </Button>
          </div>
        </div>

        {/* Mobile Cards View */}
        <div className="sm:hidden space-y-3">
          {filteredTickets.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No tickets yet. Create one if you need assistance!
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <div
                key={ticket._id}
                className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 cursor-pointer active:bg-gray-100 dark:active:bg-gray-700 transition-all touch-manipulation"
                onClick={() => setSelectedTicket(ticket)}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate flex-1">
                    {ticket.subject}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded flex-shrink-0 ${statusColors[ticket.status]}`}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{categoryLabels[ticket.category]}</span>
                  <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr className="text-left text-gray-500 dark:text-gray-400">
                <th className="py-3 px-4">Ticket #</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-500 dark:text-gray-400">
                    No tickets yet. Create one if you need assistance!
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => (
                  <tr
                    key={ticket._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer"
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <td className="py-3 px-4 font-mono text-xs text-gray-500">{ticket.ticketNumber}</td>
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">{ticket.subject}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{categoryLabels[ticket.category]}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-0.5 rounded ${statusColors[ticket.status]}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
          Frequently Asked Questions
        </h3>
        <div className="space-y-2 sm:space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-gray-200 dark:border-gray-800 rounded-lg p-3 sm:p-4 hover:shadow-md transition-all cursor-pointer active:bg-gray-50 dark:active:bg-gray-800 touch-manipulation"
              onClick={() => setExpandedFAQ(expandedFAQ === idx ? null : idx)}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base">{faq.q}</div>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${expandedFAQ === idx ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <div className={`transition-all duration-300 overflow-hidden ${expandedFAQ === idx ? 'max-h-40 mt-3' : 'max-h-0'}`}>
                <div className="text-sm text-gray-600 dark:text-gray-300">{faq.a}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Ticket Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">
          <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={() => setShowForm(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6 animate-zoom-in">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Create Support Ticket
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as TicketCategory })}
                  >
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                  <select
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
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
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Subject *</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Brief description of your issue..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Description *</label>
                <textarea
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  rows={5}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Please provide details about your issue..."
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Submit Ticket'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Ticket Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">
          <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={() => setSelectedTicket(null)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 animate-zoom-in">
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
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedTicket.description}</p>
              </div>

              {selectedTicket.assignedTo && (
                <div className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Assigned to:</span> {selectedTicket.assignedTo.firstName} {selectedTicket.assignedTo.lastName}
                </div>
              )}

              {/* Comments */}
              {selectedTicket.comments.filter(c => !c.isInternal).length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Replies</h4>
                  {selectedTicket.comments.filter(c => !c.isInternal).map((comment, idx) => (
                    <div key={idx} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {comment.userId?.firstName} {comment.userId?.lastName}
                        </span>
                        <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Comment */}
              {selectedTicket.status !== TicketStatus.CLOSED && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Add Reply</label>
                  <textarea
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    rows={3}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Type your reply..."
                  />
                  <div className="flex justify-end mt-2">
                    <Button onClick={handleAddComment} disabled={!newComment.trim()}>Send Reply</Button>
                  </div>
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
