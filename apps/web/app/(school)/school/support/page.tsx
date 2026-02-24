'use client';

import { useState, useEffect } from 'react';
import {
  supportTicketService,
  SupportTicket,
  TicketStatus,
  TicketPriority,
  TicketCategory,
  TicketStatistics,
} from '../../../../lib/services/support-ticket.service';
import { SchoolStatCard, SchoolStatusBadge, FormModal, useToast } from '../../../../components/school';
import {
  HelpCircle,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Ticket,
  X,
  XCircle,
} from 'lucide-react';

export default function SchoolSupportPage() {
  const { showToast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [stats, setStats] = useState<TicketStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
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
      showToast('error', 'Failed to load support tickets');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const priorityColors: Record<TicketPriority, string> = {
    [TicketPriority.LOW]: 'bg-slate-100 text-slate-700',
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
        <Loader2 className="w-10 h-10 text-slate-400 animate-spin" />
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#824ef2] rounded-xl flex items-center justify-center text-white">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Support Tickets</h1>
            <p className="text-sm text-slate-600">View and track support tickets from your school</p>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-white rounded-xl border border-red-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-700">{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SchoolStatCard
          icon={<HelpCircle className="w-5 h-5" />}
          color="blue"
          label="Total Tickets"
          value={stats?.total || 0}
        />
        <SchoolStatCard
          icon={<AlertCircle className="w-5 h-5" />}
          color="amber"
          label="Open"
          value={stats?.open || 0}
        />
        <SchoolStatCard
          icon={<CheckCircle className="w-5 h-5" />}
          color="green"
          label="Resolved"
          value={stats?.resolved || 0}
        />
        <SchoolStatCard
          icon={<XCircle className="w-5 h-5" />}
          color="slate"
          label="Closed"
          value={stats?.avgResolutionTimeHours ? `${stats.avgResolutionTimeHours}h avg` : '0'}
          subtitle="Avg resolution time"
        />
      </div>

      {/* Filter & Tickets List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 flex-wrap gap-3">
          <h3 className="text-lg font-semibold text-slate-900">All Tickets</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                className="h-10 w-48 border border-slate-200 rounded-xl pl-9 pr-9 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] transition-all"
                placeholder="Search tickets..."
                value={ticketSearch}
                onChange={(e) => setTicketSearch(e.target.value)}
              />
              {ticketSearch && (
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  onClick={() => setTicketSearch('')}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <select
              className="border border-slate-200 bg-white text-slate-900 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] transition-all"
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
          <div className="p-8 text-center text-slate-500">
            <Ticket className="w-16 h-16 mx-auto text-slate-300 mb-3" />
            <p>No tickets found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-slate-600">
                  <th className="py-3 px-4 font-semibold">Ticket #</th>
                  <th className="py-3 px-4 font-semibold">Subject</th>
                  <th className="py-3 px-4 font-semibold">Submitted By</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Priority</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTickets.map((ticket) => (
                  <tr
                    key={ticket._id}
                    className="cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setShowDetailsModal(true);
                    }}
                  >
                    <td className="py-3 px-4 font-mono text-xs text-slate-500">{ticket.ticketNumber}</td>
                    <td className="py-3 px-4 font-medium text-slate-900 hover:text-[#824ef2] transition-colors">{ticket.subject}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {ticket.createdBy?.firstName} {ticket.createdBy?.lastName}
                      <span className="text-xs text-slate-400 ml-1">({ticket.createdBy?.role})</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{categoryLabels[ticket.category]}</td>
                    <td className="py-3 px-4">
                      <SchoolStatusBadge value={ticket.priority} />
                    </td>
                    <td className="py-3 px-4">
                      <SchoolStatusBadge value={ticket.status.replace('_', ' ')} />
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Ticket Details Modal */}
      <FormModal
        open={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedTicket(null);
        }}
        title={selectedTicket?.subject || ''}
        size="lg"
        footer={
          <button
            onClick={() => {
              setShowDetailsModal(false);
              setSelectedTicket(null);
            }}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        }
      >
        {selectedTicket && (
          <div className="space-y-6">
            {/* Ticket Information */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Ticket Information</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-500">Ticket Number</span>
                  <span className="text-sm font-medium text-slate-900 font-mono">{selectedTicket.ticketNumber}</span>
                </div>
                <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-500">Status</span>
                  <SchoolStatusBadge value={selectedTicket.status.replace('_', ' ')} />
                </div>
                <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-500">Priority</span>
                  <SchoolStatusBadge value={selectedTicket.priority} />
                </div>
                <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-500">Category</span>
                  <span className="text-sm font-medium text-slate-900">{categoryLabels[selectedTicket.category]}</span>
                </div>
                <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-500">Submitted by</span>
                  <span className="text-sm font-medium text-slate-900">
                    {selectedTicket.createdBy?.firstName} {selectedTicket.createdBy?.lastName}
                    <span className="text-xs text-slate-400 ml-1">({selectedTicket.createdBy?.role})</span>
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-500">Created</span>
                  <span className="text-sm font-medium text-slate-900">{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                </div>
                {selectedTicket.assignedTo && (
                  <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-500">Assigned to</span>
                    <span className="text-sm font-medium text-slate-900">
                      {selectedTicket.assignedTo.firstName} {selectedTicket.assignedTo.lastName}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Description</h3>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-slate-700 whitespace-pre-wrap">{selectedTicket.description}</p>
              </div>
            </div>

            {/* Activity / Comments */}
            {selectedTicket.comments.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Activity</h3>
                <div className="space-y-3">
                  {selectedTicket.comments.map((comment, idx) => (
                    <div
                      key={idx}
                      className={`rounded-lg p-3 ${comment.isInternal ? 'bg-amber-50 border border-amber-200' : 'bg-slate-50'}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-slate-900">
                          {comment.userId?.firstName} {comment.userId?.lastName}
                          {comment.isInternal && <span className="text-xs text-amber-600 ml-2">(Internal Note)</span>}
                        </span>
                        <span className="text-xs text-slate-500">{new Date(comment.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-slate-700">{comment.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </FormModal>
    </section>
  );
}
