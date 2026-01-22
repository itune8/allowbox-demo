'use client';

import { useState, useEffect } from 'react';
import { Button } from '@repo/ui/button';
import { SlideSheet, SheetSection, SheetField, SheetDetailRow } from '@/components/ui';
import {
  supportTicketService,
  SupportTicket,
  TicketStatus,
  TicketPriority,
  TicketCategory,
  TicketStatistics,
} from '../../../../lib/services/support-ticket.service';
import {
  HelpCircle,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Ticket,
  X,
  TrendingUp,
} from 'lucide-react';

export default function SchoolSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [stats, setStats] = useState<TicketStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [showDetailsSheet, setShowDetailsSheet] = useState(false);
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
    [TicketStatus.OPEN]: 'bg-amber-100 text-amber-700',
    [TicketStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-700',
    [TicketStatus.WAITING_FOR_USER]: 'bg-orange-100 text-orange-700',
    [TicketStatus.RESOLVED]: 'bg-emerald-100 text-emerald-700',
    [TicketStatus.CLOSED]: 'bg-slate-100 text-slate-700',
  };

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
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white">
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
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <Ticket className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-sm text-slate-600">Total Tickets</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.open}</div>
            <div className="text-sm text-slate-600">Open</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.inProgress}</div>
            <div className="text-sm text-slate-600">In Progress</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.resolved}</div>
            <div className="text-sm text-slate-600">Resolved</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.avgResolutionTimeHours}h</div>
            <div className="text-sm text-slate-600">Avg Resolution</div>
          </div>
        </div>
      )}

      {/* Filter & Tickets List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 flex-wrap gap-3">
          <h3 className="text-lg font-semibold text-slate-900">All Tickets</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                className="h-10 w-48 border border-slate-200 rounded-xl pl-9 pr-9 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
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
              className="border border-slate-200 bg-white text-slate-900 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all"
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
                      setShowDetailsSheet(true);
                    }}
                  >
                    <td className="py-3 px-4 font-mono text-xs text-slate-500">{ticket.ticketNumber}</td>
                    <td className="py-3 px-4 font-medium text-slate-900 hover:text-primary transition-colors">{ticket.subject}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {ticket.createdBy?.firstName} {ticket.createdBy?.lastName}
                      <span className="text-xs text-slate-400 ml-1">({ticket.createdBy?.role})</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{categoryLabels[ticket.category]}</td>
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

      {/* View Ticket Details Sheet */}
      <SlideSheet
        isOpen={showDetailsSheet}
        onClose={() => {
          setShowDetailsSheet(false);
          setSelectedTicket(null);
        }}
        title={selectedTicket?.subject || ''}
        subtitle={selectedTicket?.ticketNumber}
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowDetailsSheet(false);
                setSelectedTicket(null);
              }}
            >
              Close
            </Button>
          </div>
        }
      >
        {selectedTicket && (
          <div className="space-y-6">
            <SheetSection title="Ticket Information">
              <div className="space-y-4">
                <SheetDetailRow
                  label="Status"
                  value={
                    <span className={`text-xs px-2 py-0.5 rounded ${statusColors[selectedTicket.status]}`}>
                      {selectedTicket.status.replace('_', ' ')}
                    </span>
                  }
                />
                <SheetDetailRow
                  label="Priority"
                  value={
                    <span className={`text-xs px-2 py-0.5 rounded ${priorityColors[selectedTicket.priority]}`}>
                      {selectedTicket.priority}
                    </span>
                  }
                />
                <SheetDetailRow
                  label="Category"
                  value={categoryLabels[selectedTicket.category]}
                />
                <SheetDetailRow
                  label="Submitted by"
                  value={
                    <>
                      {selectedTicket.createdBy?.firstName} {selectedTicket.createdBy?.lastName}
                      <span className="text-xs text-slate-400 ml-1">({selectedTicket.createdBy?.role})</span>
                    </>
                  }
                />
                <SheetDetailRow
                  label="Created"
                  value={new Date(selectedTicket.createdAt).toLocaleString()}
                />
                {selectedTicket.assignedTo && (
                  <SheetDetailRow
                    label="Assigned to"
                    value={`${selectedTicket.assignedTo.firstName} ${selectedTicket.assignedTo.lastName}`}
                  />
                )}
              </div>
            </SheetSection>

            <SheetSection title="Description">
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-slate-700 whitespace-pre-wrap">{selectedTicket.description}</p>
              </div>
            </SheetSection>

            {selectedTicket.comments.length > 0 && (
              <SheetSection title="Activity">
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
              </SheetSection>
            )}
          </div>
        )}
      </SlideSheet>
    </section>
  );
}
