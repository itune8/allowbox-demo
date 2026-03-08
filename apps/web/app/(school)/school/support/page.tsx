'use client';

import { useState, useEffect, useRef } from 'react';
import {
  SupportTicket,
  TicketStatus,
  TicketPriority,
  TicketCategory,
} from '../../../../lib/services/support-ticket.service';
import { useToast } from '../../../../components/school';
import {
  Search,
  Clock,
  CheckCircle,
  MessageSquare,
  Send,
  User,
  Paperclip,
  X,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const priorityColorMap: Record<string, { bg: string; text: string }> = {
  [TicketPriority.URGENT]: { bg: 'bg-red-100', text: 'text-red-700' },
  [TicketPriority.HIGH]: { bg: 'bg-orange-100', text: 'text-orange-700' },
  [TicketPriority.MEDIUM]: { bg: 'bg-blue-100', text: 'text-blue-700' },
  [TicketPriority.LOW]: { bg: 'bg-slate-100', text: 'text-slate-600' },
};

const statusColorMap: Record<string, { bg: string; text: string; dot: string }> = {
  [TicketStatus.OPEN]: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  [TicketStatus.IN_PROGRESS]: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  [TicketStatus.WAITING_FOR_USER]: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
  [TicketStatus.RESOLVED]: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  [TicketStatus.CLOSED]: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
};

const priorityBarColors: Record<string, string> = {
  [TicketPriority.URGENT]: 'border-l-red-500',
  [TicketPriority.HIGH]: 'border-l-orange-400',
  [TicketPriority.MEDIUM]: 'border-l-blue-400',
  [TicketPriority.LOW]: 'border-l-slate-300',
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

function getTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getInitials(firstName?: string | null, lastName?: string | null): string {
  return `${(firstName || 'U').charAt(0)}${(lastName || '').charAt(0)}`.toUpperCase();
}

function safeCreatedBy(ticket: SupportTicket) {
  return ticket.createdBy || { _id: '', firstName: 'Unknown', lastName: 'User', email: '', role: '' };
}

// ---------------------------------------------------------------------------
// Mock communication tickets (from parents/teachers reporting to school)
// ---------------------------------------------------------------------------

function getMockCommunicationTickets(): SupportTicket[] {
  return [
    {
      _id: 'comm-1',
      ticketNumber: 'COM-2026-001',
      tenantId: { _id: 'sch-1', schoolName: 'Hill Top' },
      createdBy: { _id: 'p1', firstName: 'Anita', lastName: 'Sharma', email: 'anita.sharma@parent.com', role: 'PARENT' },
      subject: 'Bus route change request',
      description: 'My child has moved to a new address. Can the school bus route be updated? The new address is 45 Greenfield Lane, Block C. The current stop is too far from our new house.\n\nPlease let me know what documentation you need.',
      category: TicketCategory.GENERAL,
      priority: TicketPriority.MEDIUM,
      status: TicketStatus.OPEN,
      comments: [
        {
          userId: { _id: 'p1', firstName: 'Anita', lastName: 'Sharma', email: 'anita.sharma@parent.com', role: 'PARENT' },
          content: 'My child has moved to a new address. Can the school bus route be updated? The new address is 45 Greenfield Lane, Block C.',
          isInternal: false,
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        },
      ],
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: 'comm-2',
      ticketNumber: 'COM-2026-002',
      tenantId: { _id: 'sch-1', schoolName: 'Hill Top' },
      createdBy: { _id: 't1', firstName: 'Rahul', lastName: 'Mehta', email: 'rahul.mehta@teacher.com', role: 'TEACHER' },
      subject: 'Projector not working in Room 204',
      description: "The projector in Room 204 has not been working since Monday. I've reported it to maintenance but no action has been taken. This is affecting my classes.",
      category: TicketCategory.TECHNICAL,
      priority: TicketPriority.HIGH,
      status: TicketStatus.IN_PROGRESS,
      comments: [
        {
          userId: { _id: 't1', firstName: 'Rahul', lastName: 'Mehta', email: 'rahul.mehta@teacher.com', role: 'TEACHER' },
          content: "The projector in Room 204 has not been working since Monday. I've reported it to maintenance but no action has been taken.",
          isInternal: false,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          userId: { _id: 'admin1', firstName: 'School', lastName: 'Admin', email: 'admin@hilltop.edu', role: 'SCHOOL_ADMIN' },
          content: "Hi Rahul, thanks for reporting this. I've escalated the issue to our IT team. They will visit Room 204 today afternoon to fix the projector.",
          isInternal: false,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          userId: { _id: 't1', firstName: 'Rahul', lastName: 'Mehta', email: 'rahul.mehta@teacher.com', role: 'TEACHER' },
          content: 'Thank you for the quick response. Will be waiting.',
          isInternal: false,
          createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
        },
      ],
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: 'comm-3',
      ticketNumber: 'COM-2026-003',
      tenantId: { _id: 'sch-1', schoolName: 'Hill Top' },
      createdBy: { _id: 'p2', firstName: 'Priya', lastName: 'Patel', email: 'priya.patel@parent.com', role: 'PARENT' },
      subject: 'Fee receipt not received',
      description: 'I paid the Term 2 fees on March 1st via UPI but have not received the fee receipt. Transaction reference: UPI-2026030112345. Please issue the receipt.',
      category: TicketCategory.BILLING,
      priority: TicketPriority.MEDIUM,
      status: TicketStatus.OPEN,
      comments: [
        {
          userId: { _id: 'p2', firstName: 'Priya', lastName: 'Patel', email: 'priya.patel@parent.com', role: 'PARENT' },
          content: 'I paid the Term 2 fees on March 1st via UPI but have not received the fee receipt. Transaction reference: UPI-2026030112345.',
          isInternal: false,
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        },
      ],
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: 'comm-4',
      ticketNumber: 'COM-2026-004',
      tenantId: { _id: 'sch-1', schoolName: 'Hill Top' },
      createdBy: { _id: 't2', firstName: 'Kavya', lastName: 'Joshi', email: 'kavya.joshi@teacher.com', role: 'TEACHER' },
      subject: 'Request for additional lab supplies',
      description: 'The science lab needs additional supplies for the upcoming practicals. We need 20 test tubes, 10 beakers, and 5 Bunsen burners. Current stock is insufficient for Grade 10 practicals.',
      category: TicketCategory.GENERAL,
      priority: TicketPriority.LOW,
      status: TicketStatus.RESOLVED,
      resolvedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      comments: [
        {
          userId: { _id: 't2', firstName: 'Kavya', lastName: 'Joshi', email: 'kavya.joshi@teacher.com', role: 'TEACHER' },
          content: 'The science lab needs additional supplies for the upcoming practicals. We need 20 test tubes, 10 beakers, and 5 Bunsen burners.',
          isInternal: false,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          userId: { _id: 'admin1', firstName: 'School', lastName: 'Admin', email: 'admin@hilltop.edu', role: 'SCHOOL_ADMIN' },
          content: "Hi Kavya, I've approved the purchase order. The supplies will be delivered by end of this week. Please check and confirm once received.",
          isInternal: false,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          userId: { _id: 't2', firstName: 'Kavya', lastName: 'Joshi', email: 'kavya.joshi@teacher.com', role: 'TEACHER' },
          content: 'Received all the supplies. Everything looks good. Thank you!',
          isInternal: false,
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        },
      ],
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: 'comm-5',
      ticketNumber: 'COM-2026-005',
      tenantId: { _id: 'sch-1', schoolName: 'Hill Top' },
      createdBy: { _id: 'p3', firstName: 'Vikram', lastName: 'Reddy', email: 'vikram.reddy@parent.com', role: 'PARENT' },
      subject: 'Child allergy information update',
      description: 'My son Arjun (Grade 5-A, Roll No 12) has been recently diagnosed with a nut allergy. Please update his health records and inform the cafeteria staff. Doctor certificate attached.',
      category: TicketCategory.ACCOUNT,
      priority: TicketPriority.HIGH,
      status: TicketStatus.OPEN,
      comments: [
        {
          userId: { _id: 'p3', firstName: 'Vikram', lastName: 'Reddy', email: 'vikram.reddy@parent.com', role: 'PARENT' },
          content: 'My son Arjun (Grade 5-A, Roll No 12) has been recently diagnosed with a nut allergy. Please update his health records and inform the cafeteria staff.',
          isInternal: false,
          attachments: [{ name: 'allergy-certificate.pdf', url: '#', type: 'application/pdf' }],
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        },
      ],
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: 'comm-6',
      ticketNumber: 'COM-2026-006',
      tenantId: { _id: 'sch-1', schoolName: 'Hill Top' },
      createdBy: { _id: 'p4', firstName: 'Sneha', lastName: 'Kumar', email: 'sneha.kumar@parent.com', role: 'PARENT' },
      subject: 'Report card discrepancy',
      description: "My daughter's Math marks show 72 but her answer sheet shows 82. There seems to be an error in data entry. Her name is Ishita Kumar, Grade 8-B.",
      category: TicketCategory.BUG_REPORT,
      priority: TicketPriority.MEDIUM,
      status: TicketStatus.OPEN,
      comments: [
        {
          userId: { _id: 'p4', firstName: 'Sneha', lastName: 'Kumar', email: 'sneha.kumar@parent.com', role: 'PARENT' },
          content: "My daughter's Math marks show 72 but her answer sheet shows 82. There seems to be an error in data entry. Her name is Ishita Kumar, Grade 8-B.",
          isInternal: false,
          createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        },
      ],
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: 'comm-7',
      ticketNumber: 'COM-2026-007',
      tenantId: { _id: 'sch-1', schoolName: 'Hill Top' },
      createdBy: { _id: 't3', firstName: 'Aditya', lastName: 'Verma', email: 'aditya.verma@teacher.com', role: 'TEACHER' },
      subject: 'Timetable conflict for Grade 9',
      description: 'There is a scheduling conflict for Grade 9-A on Wednesdays. Both Physics and Chemistry labs are assigned at the same slot (2:00 PM - 3:00 PM). Please resolve.',
      category: TicketCategory.TECHNICAL,
      priority: TicketPriority.MEDIUM,
      status: TicketStatus.RESOLVED,
      resolvedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      comments: [
        {
          userId: { _id: 't3', firstName: 'Aditya', lastName: 'Verma', email: 'aditya.verma@teacher.com', role: 'TEACHER' },
          content: 'There is a scheduling conflict for Grade 9-A on Wednesdays. Both Physics and Chemistry labs are assigned at the same slot (2:00 PM - 3:00 PM).',
          isInternal: false,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          userId: { _id: 'admin1', firstName: 'School', lastName: 'Admin', email: 'admin@hilltop.edu', role: 'SCHOOL_ADMIN' },
          content: 'Fixed! Chemistry lab has been moved to Thursday 2:00 PM - 3:00 PM. The updated timetable will reflect shortly.',
          isInternal: false,
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        },
      ],
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    },
  ];
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function SchoolSupportPage() {
  const { showToast } = useToast();

  const [commTickets, setCommTickets] = useState<SupportTicket[]>([]);
  const [selectedComm, setSelectedComm] = useState<SupportTicket | null>(null);
  const [commFilter, setCommFilter] = useState<'all' | 'pending' | 'resolved'>('all');
  const [commSearch, setCommSearch] = useState('');
  const [newReply, setNewReply] = useState('');
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  useEffect(() => {
    const mockComm = getMockCommunicationTickets();
    setCommTickets(mockComm);
    setSelectedComm(mockComm[0]!);
  }, []);

  const filteredCommTickets = commTickets
    .filter((t) => {
      if (commFilter === 'pending') return t.status === TicketStatus.OPEN || t.status === TicketStatus.IN_PROGRESS || t.status === TicketStatus.WAITING_FOR_USER;
      if (commFilter === 'resolved') return t.status === TicketStatus.RESOLVED || t.status === TicketStatus.CLOSED;
      return true;
    })
    .filter((t) => {
      const q = commSearch.trim().toLowerCase();
      return !q || t.subject.toLowerCase().includes(q) || (t.createdBy?.firstName + ' ' + t.createdBy?.lastName).toLowerCase().includes(q);
    });

  const commPendingCount = commTickets.filter(t => t.status === TicketStatus.OPEN || t.status === TicketStatus.IN_PROGRESS || t.status === TicketStatus.WAITING_FOR_USER).length;
  const commResolvedCount = commTickets.filter(t => t.status === TicketStatus.RESOLVED || t.status === TicketStatus.CLOSED).length;

  const handleSendReply = () => {
    if (!selectedComm || !newReply.trim()) return;
    const newMsg = {
      userId: { _id: 'admin1', firstName: 'School', lastName: 'Admin', email: 'admin@hilltop.edu', role: 'SCHOOL_ADMIN' },
      content: newReply,
      isInternal: false,
      createdAt: new Date().toISOString(),
    };
    const updated = { ...selectedComm, comments: [...selectedComm.comments, newMsg] };
    setSelectedComm(updated);
    setCommTickets(prev => prev.map(t => t._id === selectedComm._id ? updated : t));
    setNewReply('');
    showToast('success', 'Reply sent successfully');
  };

  const handleMarkResolved = () => {
    if (!selectedComm) return;
    const updated = { ...selectedComm, status: TicketStatus.RESOLVED, resolvedAt: new Date().toISOString() };
    setSelectedComm(updated);
    setCommTickets(prev => prev.map(t => t._id === selectedComm._id ? updated : t));
    showToast('success', 'Ticket marked as resolved');
  };

  return (
    <section className="space-y-6">
      {/* Two-Panel Communication Layout */}
      <div className="flex flex-col lg:flex-row gap-0 lg:h-[calc(100vh-140px)] min-h-[500px]">
        {/* Left Panel - Message List */}
        <div className="w-full lg:w-[380px] xl:w-[420px] flex-shrink-0 bg-white rounded-xl lg:rounded-r-none border border-slate-200 flex flex-col overflow-hidden">
          {/* Search */}
          <div className="px-4 pt-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={commSearch}
                onChange={(e) => setCommSearch(e.target.value)}
                placeholder="Search messages..."
                className="w-full h-10 pl-10 pr-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2]"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="px-4 pb-3 flex gap-2">
            {[
              { key: 'all' as const, label: 'All', count: commTickets.length },
              { key: 'pending' as const, label: 'Pending', count: commPendingCount },
              { key: 'resolved' as const, label: 'Resolved', count: commResolvedCount },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setCommFilter(tab.key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  commFilter === tab.key
                    ? 'text-white'
                    : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
                }`}
                style={commFilter === tab.key ? { backgroundColor: '#824ef2' } : undefined}
              >
                {tab.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-md ${
                  commFilter === tab.key
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Scrollable Message List */}
          <div className="flex-1 overflow-y-auto border-t border-slate-200">
            {filteredCommTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <MessageSquare className="w-10 h-10 mb-2" />
                <p className="text-sm">No messages found</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredCommTickets.map((ticket) => {
                  const isSelected = selectedComm?._id === ticket._id;
                  const pc = priorityColorMap[ticket.priority] || priorityColorMap[TicketPriority.LOW]!;
                  const sc = statusColorMap[ticket.status] || statusColorMap[TicketStatus.OPEN]!;
                  const statusLabel = ticket.status === TicketStatus.RESOLVED || ticket.status === TicketStatus.CLOSED ? 'Resolved' : 'Pending';
                  const creator = safeCreatedBy(ticket);

                  return (
                    <button
                      key={ticket._id}
                      onClick={() => {
                        setSelectedComm(ticket);
                        setMobileDetailOpen(true);
                      }}
                      className={`w-full text-left px-4 py-3.5 border-l-4 transition-colors ${
                        priorityBarColors[ticket.priority] || 'border-l-slate-300'
                      } ${
                        isSelected
                          ? 'bg-purple-50/60 border-l-[#824ef2]'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${pc!.bg} ${pc!.text}`}>
                          {ticket.priority.charAt(0) + ticket.priority.slice(1).toLowerCase()}
                        </span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${sc!.bg} ${sc!.text}`}>
                          {statusLabel}
                        </span>
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 capitalize">
                          {(creator.role || 'user').replace(/_/g, ' ').toLowerCase()}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-900 truncate">{ticket.subject}</p>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{ticket.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <User className="w-3 h-3" />
                          <span className="truncate max-w-[160px]">{creator.firstName} {creator.lastName}</span>
                        </div>
                        <span className="text-xs text-slate-400 whitespace-nowrap">{getTimeAgo(ticket.createdAt)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Conversation Detail */}
        <div className="hidden lg:flex flex-1 bg-white rounded-xl lg:rounded-l-none border border-slate-200 lg:border-l-0 flex-col min-w-0 overflow-hidden">
          {selectedComm ? (
            <CommDetailPanel
              ticket={selectedComm}
              newReply={newReply}
              setNewReply={setNewReply}
              onSendReply={handleSendReply}
              onMarkResolved={handleMarkResolved}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <MessageSquare className="w-16 h-16 mb-3 text-slate-200" />
              <p className="text-base font-medium text-slate-500">No message selected</p>
              <p className="text-sm mt-1">Select a message from the list to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Detail Modal */}
      {mobileDetailOpen && selectedComm && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileDetailOpen(false)}>
          <div
            className="absolute inset-x-0 bottom-0 top-12 bg-white rounded-t-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <h2 className="text-sm font-semibold text-slate-900">Message Details</h2>
              <button onClick={() => setMobileDetailOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <CommDetailPanel
                ticket={selectedComm}
                newReply={newReply}
                setNewReply={setNewReply}
                onSendReply={handleSendReply}
                onMarkResolved={handleMarkResolved}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Communication Detail Panel
// ---------------------------------------------------------------------------

function CommDetailPanel({
  ticket,
  newReply,
  setNewReply,
  onSendReply,
  onMarkResolved,
}: {
  ticket: SupportTicket;
  newReply: string;
  setNewReply: (val: string) => void;
  onSendReply: () => void;
  onMarkResolved: () => void;
}) {
  const creator = safeCreatedBy(ticket);
  const pc = priorityColorMap[ticket.priority] || priorityColorMap[TicketPriority.LOW]!;
  const sc = statusColorMap[ticket.status] || statusColorMap[TicketStatus.OPEN]!;
  const isResolved = ticket.status === TicketStatus.RESOLVED || ticket.status === TicketStatus.CLOSED;
  const statusLabel = isResolved ? 'Resolved' : 'Pending';
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket.comments.length]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 flex-shrink-0">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${pc!.bg} ${pc!.text}`}>
              {ticket.priority.charAt(0) + ticket.priority.slice(1).toLowerCase()}
            </span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${sc!.bg} ${sc!.text}`}>
              {statusLabel}
            </span>
            <span className="text-sm text-slate-500">#{ticket.ticketNumber}</span>
          </div>
          <div className="flex items-center gap-2">
            {!isResolved && (
              <button
                onClick={onMarkResolved}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Mark Resolved
              </button>
            )}
          </div>
        </div>
        <h2 className="text-lg font-bold text-slate-900 mt-3">{ticket.subject}</h2>
        <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            {creator.firstName} {creator.lastName}
            <span className="capitalize">({(creator.role || 'user').replace(/_/g, ' ').toLowerCase()})</span>
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {getTimeAgo(ticket.createdAt)}
          </span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
        {/* Requester Info Card */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
              {getInitials(creator.firstName, creator.lastName)}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{creator.firstName} {creator.lastName}</p>
              <p className="text-xs text-slate-500 capitalize">{(creator.role || 'User').replace(/_/g, ' ').toLowerCase()}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-white rounded-lg px-3 py-2 border border-slate-100">
              <p className="text-slate-400 mb-0.5">Email</p>
              <p className="text-slate-700 font-medium truncate">{creator.email || 'N/A'}</p>
            </div>
            <div className="bg-white rounded-lg px-3 py-2 border border-slate-100">
              <p className="text-slate-400 mb-0.5">Category</p>
              <p className="text-slate-700 font-medium">{categoryLabels[ticket.category]}</p>
            </div>
          </div>
        </div>

        {/* Conversation Thread */}
        {ticket.comments.map((comment, idx) => {
          const isAdmin = comment.userId?.role === 'SCHOOL_ADMIN' || comment.userId?.role === 'ADMIN';
          return (
            <div key={idx} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] ${isAdmin ? 'order-1' : ''}`}>
                <div className={`flex items-center gap-2 mb-1 ${isAdmin ? 'justify-end' : ''}`}>
                  {!isAdmin && (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                      {getInitials(comment.userId?.firstName, comment.userId?.lastName)}
                    </div>
                  )}
                  <span className="text-xs font-medium text-slate-600">
                    {comment.userId?.firstName} {comment.userId?.lastName}
                  </span>
                  <span className="text-[10px] text-slate-400">{getTimeAgo(comment.createdAt)}</span>
                  {isAdmin && (
                    <div className="w-6 h-6 rounded-full bg-[#824ef2] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                      {getInitials(comment.userId?.firstName, comment.userId?.lastName)}
                    </div>
                  )}
                </div>
                <div className={`rounded-xl px-4 py-3 text-sm ${
                  isAdmin
                    ? 'bg-[#824ef2] text-white rounded-tr-sm'
                    : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'
                }`}>
                  <p className="whitespace-pre-wrap">{comment.content}</p>
                  {comment.attachments && comment.attachments.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-white/20">
                      {comment.attachments.map((att: { name: string }, ai: number) => (
                        <div key={ai} className="flex items-center gap-1.5 text-xs opacity-80">
                          <Paperclip className="w-3 h-3" />
                          <span>{att.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Input */}
      {!isResolved ? (
        <div className="px-6 py-4 border-t border-slate-200 flex-shrink-0">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <textarea
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                placeholder="Type your reply..."
                rows={2}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    onSendReply();
                  }
                }}
              />
            </div>
            <button
              onClick={onSendReply}
              disabled={!newReply.trim()}
              className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#824ef2] text-white hover:bg-[#6b3fd4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5">Press Enter to send, Shift+Enter for new line</p>
        </div>
      ) : (
        <div className="px-6 py-4 border-t border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 rounded-lg px-4 py-3">
            <CheckCircle className="w-4 h-4" />
            <span className="font-medium">This conversation has been resolved</span>
          </div>
        </div>
      )}
    </div>
  );
}
