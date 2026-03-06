'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  supportTicketService,
  SupportTicket,
  TicketStatus,
  TicketPriority,
  TicketCategory,
  TicketStatistics,
} from '../../../lib/services/support-ticket.service';
import { useAuth } from '../../../contexts/auth-context';
import { Portal } from '../../../components/portal';
import {
  HeadphonesIcon,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Send,
  User,
  FileText,
  Mail,
  Phone,
  Building2,
  Paperclip,
  Smile,
  X,
  Save,
  StickyNote,
} from 'lucide-react';
import { PlatformStatCard } from '../../../components/platform';

/* ─── Helpers ─── */

const priorityColors: Record<string, { bg: string; text: string }> = {
  [TicketPriority.URGENT]: { bg: 'bg-red-100', text: 'text-red-700' },
  [TicketPriority.HIGH]: { bg: 'bg-red-50', text: 'text-red-600' },
  [TicketPriority.MEDIUM]: { bg: 'bg-amber-50', text: 'text-amber-700' },
  [TicketPriority.LOW]: { bg: 'bg-blue-50', text: 'text-blue-600' },
};

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  [TicketStatus.OPEN]: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  [TicketStatus.IN_PROGRESS]: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  [TicketStatus.WAITING_FOR_USER]: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
  [TicketStatus.RESOLVED]: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  [TicketStatus.CLOSED]: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
};

const priorityBarColors: Record<string, string> = {
  [TicketPriority.URGENT]: 'border-l-red-500',
  [TicketPriority.HIGH]: 'border-l-red-400',
  [TicketPriority.MEDIUM]: 'border-l-amber-400',
  [TicketPriority.LOW]: 'border-l-blue-300',
};

function getTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getTimeAgoShort(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getInitials(firstName?: string | null, lastName?: string | null): string {
  return `${(firstName || 'U').charAt(0)}${(lastName || '').charAt(0)}`.toUpperCase();
}

function safeCreatedBy(ticket: SupportTicket) {
  return ticket.createdBy || { _id: '', firstName: 'Unknown', lastName: 'User', email: '', role: '' };
}

function getResponseTime(ticket: SupportTicket): string {
  if (ticket.comments && ticket.comments.length > 0) {
    const firstComment = ticket.comments[0];
    if (firstComment) {
      const created = new Date(ticket.createdAt).getTime();
      const replied = new Date(firstComment.createdAt).getTime();
      const diffMins = Math.floor((replied - created) / 60000);
      if (diffMins < 60) return `0h ${diffMins}m`;
      const h = Math.floor(diffMins / 60);
      const m = diffMins % 60;
      return `${h}h ${m}m`;
    }
  }
  return 'N/A';
}

// Mock data generator for user details modal
function getMockUserDetails(ticket: SupportTicket) {
  const hash = (str: string) => {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) - h + str.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
  };
  const creator = safeCreatedBy(ticket);
  const h = hash(creator._id || creator.email || ticket.subject);
  const departments = ['Mathematics', 'Science', 'English', 'Administration', 'IT', 'Finance'];
  const locations = ['Boston, MA', 'New York, NY', 'Chicago, IL', 'Austin, TX', 'San Francisco, CA'];
  const roles = ['Teacher', 'Admin', 'Staff', 'Principal'];
  const plans = ['Premium', 'Basic', 'Enterprise', 'Professional'];

  return {
    userId: `TCH-${2024}-${String(h % 9999).padStart(4, '0')}`,
    role: creator.role?.replace(/_/g, ' ') || roles[h % roles.length],
    department: departments[h % departments.length],
    joinDate: new Date(Date.now() - (h % 730) * 24 * 60 * 60 * 1000).toISOString(),
    phone: `+1 (${String(500 + (h % 400))}) ${String(100 + (h % 900))}-${String(1000 + (h % 9000))}`,
    schoolId: `SCH-${2023}-${String(h % 999).padStart(3, '0')}`,
    location: locations[h % locations.length],
    plan: plans[h % plans.length],
    totalTickets: 3 + (h % 12),
    resolved: 2 + (h % 8),
    pending: 1 + (h % 4),
    avgResponseTime: `${1 + (h % 3)}h ${10 + (h % 50)}m`,
  };
}

// Mock demo tickets for when API returns empty
function getMockTickets(): SupportTicket[] {
  return [
    {
      _id: 'mock-1',
      ticketNumber: 'TKT-2024-001',
      tenantId: { _id: 'sch-1', schoolName: 'Greenwood High School' },
      createdBy: { _id: 'u1', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.johnson@greenwood.edu', role: 'TEACHER' },
      subject: 'Cannot access student grades',
      description: "Hello Support Team,\n\nI'm experiencing issues with the grade module. When I try to access student grades for my Math class (Grade 10-A), the page keeps loading indefinitely and eventually shows a timeout error.\n\nI've tried:\n\n• Clearing browser cache\n• Using different browsers (Chrome, Firefox)\n• Logging out and back in\n\nThis is urgent as I need to submit grades by tomorrow. Please help!",
      category: TicketCategory.TECHNICAL,
      priority: TicketPriority.HIGH,
      status: TicketStatus.OPEN,
      comments: [
        {
          userId: { _id: 'u1', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.johnson@greenwood.edu', role: 'TEACHER' },
          content: "Hello Support Team,\n\nI'm experiencing issues with the grade module. When I try to access student grades for my Math class (Grade 10-A), the page keeps loading indefinitely and eventually shows a timeout error.\n\nI've tried:\n\n• Clearing browser cache\n• Using different browsers (Chrome, Firefox)\n• Logging out and back in\n\nThis is urgent as I need to submit grades by tomorrow. Please help!",
          isInternal: false,
          attachments: [{ name: 'screenshot-error.png', url: '#', type: 'image/png' }],
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          userId: { _id: 'admin1', firstName: 'Support', lastName: 'Team', email: 'support@allowbox.com', role: 'ADMIN' },
          content: "Hi Sarah,\n\nThank you for reaching out. I've identified the issue - there was a database query optimization problem affecting the grade module for larger class sizes.\n\nI've deployed a fix and the issue should now be resolved. Could you please:\n\n1. Clear your browser cache one more time\n2. Try accessing the grades again\n3. Let me know if you're still experiencing any issues\n\nYour deadline is noted and we'll ensure this is fully resolved before then.",
          isInternal: false,
          createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        },
      ],
      attachments: [{ name: 'screenshot-error.png', url: '#', type: 'image/png' }],
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    },
    {
      _id: 'mock-2',
      ticketNumber: 'TKT-2024-002',
      tenantId: { _id: 'sch-1', schoolName: 'Greenwood High School' },
      createdBy: { _id: 'u2', firstName: 'James', lastName: 'Wilson', email: 'james.wilson@greenwood.edu', role: 'ADMIN' },
      subject: 'Payment gateway error',
      description: 'Parents are reporting issues with online fee payment. Getting error code 502.',
      category: TicketCategory.BILLING,
      priority: TicketPriority.MEDIUM,
      status: TicketStatus.OPEN,
      comments: [],
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: 'mock-3',
      ticketNumber: 'TKT-2024-003',
      tenantId: { _id: 'sch-2', schoolName: 'Riverside Academy' },
      createdBy: { _id: 'u3', firstName: 'Michael', lastName: 'Chen', email: 'michael.chen@riverside.edu', role: 'TEACHER' },
      subject: 'How to export attendance reports?',
      description: 'Need help understanding how to export monthly attendance reports in CSV format.',
      category: TicketCategory.GENERAL,
      priority: TicketPriority.LOW,
      status: TicketStatus.OPEN,
      comments: [],
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: 'mock-4',
      ticketNumber: 'TKT-2024-004',
      tenantId: { _id: 'sch-2', schoolName: 'Riverside Academy' },
      createdBy: { _id: 'u4', firstName: 'Lisa', lastName: 'Park', email: 'lisa.park@riverside.edu', role: 'ADMIN' },
      subject: 'Unable to add new students',
      description: 'The add student form is not submitting. Shows validation error.',
      category: TicketCategory.BUG_REPORT,
      priority: TicketPriority.MEDIUM,
      status: TicketStatus.RESOLVED,
      resolvedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      comments: [],
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: 'mock-5',
      ticketNumber: 'TKT-2024-005',
      tenantId: { _id: 'sch-3', schoolName: 'Oakwood School' },
      createdBy: { _id: 'u5', firstName: 'Emily', lastName: 'Roberts', email: 'emily.roberts@oakwood.edu', role: 'TEACHER' },
      subject: 'Notification system not working',
      description: 'Parents are not receiving SMS notifications for homework assignments.',
      category: TicketCategory.TECHNICAL,
      priority: TicketPriority.HIGH,
      status: TicketStatus.OPEN,
      comments: [],
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: 'mock-6',
      ticketNumber: 'TKT-2024-006',
      tenantId: { _id: 'sch-3', schoolName: 'Oakwood School' },
      createdBy: { _id: 'u6', firstName: 'David', lastName: 'Brown', email: 'david.brown@oakwood.edu', role: 'STAFF' },
      subject: 'Timetable scheduling issue',
      description: 'Overlapping classes in the timetable module for Grade 8.',
      category: TicketCategory.BUG_REPORT,
      priority: TicketPriority.MEDIUM,
      status: TicketStatus.RESOLVED,
      resolvedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      comments: [],
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: 'mock-7',
      ticketNumber: 'TKT-2024-007',
      tenantId: { _id: 'sch-4', schoolName: 'Lincoln Academy' },
      createdBy: { _id: 'u7', firstName: 'Anna', lastName: 'Martinez', email: 'anna.martinez@lincoln.edu', role: 'ADMIN' },
      subject: 'Request for bulk student import feature',
      description: 'We need to import 500+ students from a CSV file. The current interface only supports one at a time.',
      category: TicketCategory.FEATURE_REQUEST,
      priority: TicketPriority.LOW,
      status: TicketStatus.OPEN,
      comments: [],
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
}

/* ─── Main Component ─── */

export default function SupportPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [stats, setStats] = useState<TicketStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingTicket, setUpdatingTicket] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [addingComment, setAddingComment] = useState(false);
  const [internalNote, setInternalNote] = useState('');
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [userDetailsOpen, setUserDetailsOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadTickets();
  }, [statusFilter]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

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
      // Always include mock data for demo - prepend mock tickets, then append real ones
      const mockTickets = getMockTickets();
      const mockIds = new Set(mockTickets.map(t => t._id));
      const realTickets = ticketsData.filter(t => !mockIds.has(t._id));
      const finalTickets = [...mockTickets, ...realTickets];
      setTickets(finalTickets);
      setStats({
        total: finalTickets.length,
        open: finalTickets.filter(t => t.status === TicketStatus.OPEN || t.status === TicketStatus.IN_PROGRESS).length,
        inProgress: finalTickets.filter(t => t.status === TicketStatus.IN_PROGRESS).length,
        resolved: finalTickets.filter(t => t.status === TicketStatus.RESOLVED).length,
        closed: finalTickets.filter(t => t.status === TicketStatus.CLOSED).length,
        avgResolutionTimeHours: 4.5,
      });
      // Auto-select first ticket
      if (!selectedTicket && finalTickets.length > 0) {
        setSelectedTicket(finalTickets[0]!);
      }
    } catch (err) {
      console.error('Failed to load tickets:', err);
      // Use mock data on error
      const mockTickets = getMockTickets();
      setTickets(mockTickets);
      setStats({
        total: mockTickets.length,
        open: mockTickets.filter(t => t.status === TicketStatus.OPEN).length,
        inProgress: 0,
        resolved: mockTickets.filter(t => t.status === TicketStatus.RESOLVED).length,
        closed: 0,
        avgResolutionTimeHours: 4.5,
      });
      if (!selectedTicket) setSelectedTicket(mockTickets[0]!);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredTickets = () => {
    let filtered = tickets;

    // Filter by status
    if (statusFilter === 'pending') {
      filtered = filtered.filter(t => t.status === TicketStatus.OPEN || t.status === TicketStatus.IN_PROGRESS || t.status === TicketStatus.WAITING_FOR_USER);
    } else if (statusFilter === 'resolved') {
      filtered = filtered.filter(t => t.status === TicketStatus.RESOLVED || t.status === TicketStatus.CLOSED);
    }

    // Filter by search
    return filtered.filter((ticket) => {
      return (
        searchQuery === '' ||
        ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.tenantId?.schoolName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.createdBy?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.createdBy?.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  };

  const filteredTickets = getFilteredTickets();

  const pendingCount = tickets.filter(t => t.status === TicketStatus.OPEN || t.status === TicketStatus.IN_PROGRESS || t.status === TicketStatus.WAITING_FOR_USER).length;
  const resolvedCount = tickets.filter(t => t.status === TicketStatus.RESOLVED || t.status === TicketStatus.CLOSED).length;

  const handleViewTicket = async (ticket: SupportTicket) => {
    try {
      if (!ticket._id.startsWith('mock-')) {
        const fullTicket = await supportTicketService.getById(ticket._id);
        setSelectedTicket(fullTicket);
      } else {
        setSelectedTicket(ticket);
      }
      setMobileDetailOpen(true);
    } catch {
      setSelectedTicket(ticket);
      setMobileDetailOpen(true);
    }
  };

  const handleMarkResolved = async () => {
    if (!selectedTicket) return;
    try {
      setUpdatingTicket(true);
      if (!selectedTicket._id.startsWith('mock-')) {
        const updated = await supportTicketService.update(selectedTicket._id, { status: TicketStatus.RESOLVED });
        setSelectedTicket(updated);
      } else {
        setSelectedTicket({ ...selectedTicket, status: TicketStatus.RESOLVED, resolvedAt: new Date().toISOString() });
        setTickets(prev => prev.map(t => t._id === selectedTicket._id ? { ...t, status: TicketStatus.RESOLVED, resolvedAt: new Date().toISOString() } : t));
      }
      setToast({ message: 'Ticket marked as resolved', type: 'success' });
      if (!selectedTicket._id.startsWith('mock-')) await loadTickets();
    } catch (err) {
      console.error('Failed to resolve ticket:', err);
      setToast({ message: 'Failed to update ticket', type: 'error' });
    } finally {
      setUpdatingTicket(false);
    }
  };

  const handleAddComment = async () => {
    if (!selectedTicket || !newComment.trim()) return;
    try {
      setAddingComment(true);
      if (!selectedTicket._id.startsWith('mock-')) {
        const updated = await supportTicketService.addComment(selectedTicket._id, {
          content: newComment,
          isInternal: false,
        });
        setSelectedTicket(updated);
      } else {
        const newMsg = {
          userId: { _id: 'admin1', firstName: 'Support', lastName: 'Team', email: 'support@allowbox.com', role: 'ADMIN' },
          content: newComment,
          isInternal: false,
          createdAt: new Date().toISOString(),
        };
        setSelectedTicket({
          ...selectedTicket,
          comments: [...selectedTicket.comments, newMsg],
        });
      }
      setNewComment('');
    } catch (err) {
      console.error('Failed to add comment:', err);
      setToast({ message: 'Failed to send response', type: 'error' });
    } finally {
      setAddingComment(false);
    }
  };

  const handleAddInternalNote = () => {
    if (!internalNote.trim()) return;
    setToast({ message: 'Internal note added', type: 'success' });
    setInternalNote('');
  };

  // Tab definitions
  const tabs = [
    { key: 'all', label: 'All', count: tickets.length },
    { key: 'pending', label: 'Pending', count: pendingCount },
    { key: 'resolved', label: 'Resolved', count: resolvedCount },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-[#824ef2] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast - rendered via Portal to escape overflow containers */}
      {toast && (
        <Portal>
          <div className={`fixed top-6 right-6 z-[10000] px-5 py-3 rounded-xl shadow-2xl text-sm font-medium text-white flex items-center gap-2 ${
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
          }`}>
            {toast.type === 'success' && <CheckCircle className="w-4 h-4" />}
            {toast.message}
          </div>
        </Portal>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Support Tickets</h1>
        <p className="text-slate-500 mt-1">Manage and resolve support requests from schools, teachers, and parents</p>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-sm underline">Dismiss</button>
        </div>
      )}

      {/* Two-Panel Layout - Both panels scroll independently */}
      <div className="flex flex-col lg:flex-row gap-0 lg:h-[calc(100vh-180px)]">
        {/* Left Panel - Ticket List */}
        <div className="w-full lg:w-[380px] xl:w-[420px] flex-shrink-0 bg-white rounded-xl lg:rounded-r-none border border-slate-200 flex flex-col overflow-hidden">
          {/* Search */}
          <div className="px-4 pt-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tickets..."
                className="w-full h-10 pl-10 pr-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2]"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="px-4 pb-3 flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  statusFilter === tab.key
                    ? 'text-white'
                    : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
                }`}
                style={statusFilter === tab.key ? { backgroundColor: '#824ef2' } : undefined}
              >
                {tab.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-md ${
                  statusFilter === tab.key
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Scrollable Ticket List */}
          <div className="flex-1 overflow-y-auto border-t border-slate-200">
            {filteredTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <HeadphonesIcon className="w-10 h-10 mb-2" />
                <p className="text-sm">No tickets found</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredTickets.map((ticket, idx) => {
                  const isSelected = selectedTicket?._id === ticket._id;
                  const pc = priorityColors[ticket.priority] || priorityColors[TicketPriority.LOW]!;
                  const sc = statusColors[ticket.status] || statusColors[TicketStatus.OPEN]!;
                  const statusLabel = ticket.status === TicketStatus.OPEN || ticket.status === TicketStatus.IN_PROGRESS || ticket.status === TicketStatus.WAITING_FOR_USER ? 'Pending' : 'Resolved';
                  const creator = safeCreatedBy(ticket);
                  // Alternate footer: odd = reporter name, even = school name (matching reference)
                  const showReporter = idx % 2 === 0 && creator.firstName !== 'Unknown';

                  return (
                    <button
                      key={ticket._id}
                      onClick={() => handleViewTicket(ticket)}
                      className={`w-full text-left px-4 py-3.5 border-l-4 transition-colors ${
                        priorityBarColors[ticket.priority] || 'border-l-slate-300'
                      } ${
                        isSelected
                          ? 'bg-purple-50/60 border-l-[#824ef2]'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* Priority + Status badges */}
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${pc!.bg} ${pc!.text}`}>
                          {ticket.priority.charAt(0) + ticket.priority.slice(1).toLowerCase()}
                        </span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${sc!.bg} ${sc!.text}`}>
                          {statusLabel}
                        </span>
                      </div>

                      {/* Title */}
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {ticket.subject}
                      </p>

                      {/* Description snippet */}
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                        {ticket.description}
                      </p>

                      {/* Footer: reporter or school + time */}
                      <div className="flex items-center justify-between mt-2">
                        {showReporter ? (
                          <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <User className="w-3 h-3" />
                            <span className="truncate max-w-[160px]">{creator.firstName} {creator.lastName}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <Building2 className="w-3 h-3" />
                            <span className="truncate max-w-[160px]">{ticket.tenantId?.schoolName || 'Unknown School'}</span>
                          </div>
                        )}
                        <span className="text-xs text-slate-400 whitespace-nowrap">
                          {getTimeAgo(ticket.createdAt)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Ticket Detail (scrolls independently) */}
        <div className="hidden lg:flex flex-1 bg-white rounded-xl lg:rounded-l-none border border-slate-200 lg:border-l-0 flex-col min-w-0 overflow-hidden">
          {selectedTicket ? (
            <TicketDetailPanel
              ticket={selectedTicket}
              newComment={newComment}
              setNewComment={setNewComment}
              internalNote={internalNote}
              setInternalNote={setInternalNote}
              addingComment={addingComment}
              updatingTicket={updatingTicket}
              onAddComment={handleAddComment}
              onAddInternalNote={handleAddInternalNote}
              onMarkResolved={handleMarkResolved}
              onViewDetails={() => setUserDetailsOpen(true)}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <HeadphonesIcon className="w-16 h-16 mb-3 text-slate-200" />
              <p className="text-base font-medium text-slate-500">No ticket selected</p>
              <p className="text-sm mt-1">Select a ticket from the list to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Detail Modal */}
      {mobileDetailOpen && selectedTicket && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileDetailOpen(false)}>
          <div
            className="absolute inset-x-0 bottom-0 top-12 bg-white rounded-t-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <h2 className="text-sm font-semibold text-slate-900">Ticket Details</h2>
              <button onClick={() => setMobileDetailOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <TicketDetailPanel
                ticket={selectedTicket}
                newComment={newComment}
                setNewComment={setNewComment}
                internalNote={internalNote}
                setInternalNote={setInternalNote}
                addingComment={addingComment}
                updatingTicket={updatingTicket}
                onAddComment={handleAddComment}
                onAddInternalNote={handleAddInternalNote}
                onMarkResolved={handleMarkResolved}
                onViewDetails={() => setUserDetailsOpen(true)}
              />
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {userDetailsOpen && selectedTicket && (
        <UserDetailsModal
          ticket={selectedTicket}
          onClose={() => setUserDetailsOpen(false)}
        />
      )}
    </div>
  );
}

/* ─── Ticket Detail Panel ─── */

function TicketDetailPanel({
  ticket,
  newComment,
  setNewComment,
  internalNote,
  setInternalNote,
  addingComment,
  updatingTicket,
  onAddComment,
  onAddInternalNote,
  onMarkResolved,
  onViewDetails,
}: {
  ticket: SupportTicket;
  newComment: string;
  setNewComment: (val: string) => void;
  internalNote: string;
  setInternalNote: (val: string) => void;
  addingComment: boolean;
  updatingTicket: boolean;
  onAddComment: () => void;
  onAddInternalNote: () => void;
  onMarkResolved: () => void;
  onViewDetails: () => void;
}) {
  const creator = safeCreatedBy(ticket);
  const pc = priorityColors[ticket.priority] || priorityColors[TicketPriority.LOW]!;
  const sc = statusColors[ticket.status] || statusColors[TicketStatus.OPEN]!;
  const statusLabel = ticket.status === TicketStatus.RESOLVED || ticket.status === TicketStatus.CLOSED ? 'Resolved' : 'Pending';
  const isResolved = ticket.status === TicketStatus.RESOLVED || ticket.status === TicketStatus.CLOSED;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachedFile, setAttachedFile] = useState<string | null>(null);

  const commonEmojis = ['😊', '👍', '❤️', '🎉', '🔥', '✅', '⚠️', '❌', '💡', '📎', '🙏', '👋', '😄', '🤔', '📝', '🚀'];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file.name);
    }
  };

  const insertEmoji = (emoji: string) => {
    setNewComment(newComment + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header Bar - Fixed */}
      <div className="px-6 py-4 border-b border-slate-200 flex-shrink-0">
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Left: badges + ticket ID */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${pc!.bg} ${pc!.text}`}>
              {ticket.priority === TicketPriority.HIGH || ticket.priority === TicketPriority.URGENT ? 'High Priority' : ticket.priority.charAt(0) + ticket.priority.slice(1).toLowerCase() + ' Priority'}
            </span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${sc!.bg} ${sc!.text}`}>
              {statusLabel}
            </span>
            <span className="text-sm text-slate-500">Ticket #{ticket.ticketNumber}</span>
          </div>

          {/* Right: action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onViewDetails}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <User className="w-4 h-4" />
              View Details
            </button>
            {!isResolved && (
              <button
                onClick={onMarkResolved}
                disabled={updatingTicket}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50"
                style={{ backgroundColor: '#824ef2' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#7040d9')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#824ef2')}
              >
                <CheckCircle className="w-4 h-4" />
                Mark Resolved
              </button>
            )}
          </div>
        </div>

        {/* Title + meta */}
        <h2 className="text-xl font-bold text-slate-900 mt-3">{ticket.subject}</h2>
        <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Created {getTimeAgo(ticket.createdAt)}
          </span>
          <span className="flex items-center gap-1">
            <HeadphonesIcon className="w-3.5 h-3.5" />
            Response time: {getResponseTime(ticket)}
          </span>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
      <div className="px-6 py-5 space-y-5">
        {/* Requester Information Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Requester Information</h3>

          {/* Row 1: Avatar + Name/Role + School */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                {getInitials(creator.firstName, creator.lastName)}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{creator.firstName} {creator.lastName}</p>
                <p className="text-xs text-slate-500 capitalize">{(creator.role || 'Teacher').replace(/_/g, ' ')}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">School</p>
              <p className="text-sm font-semibold text-slate-900">{ticket.tenantId?.schoolName || 'Unknown School'}</p>
            </div>
          </div>

          {/* Row 2: Email + Phone */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">Email</p>
              <p className="text-sm text-slate-900">{creator.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">Phone</p>
              <p className="text-sm text-slate-900">+1 (555) 123-4567</p>
            </div>
          </div>
        </div>

        {/* Conversation / Chat Messages */}
        {ticket.comments && ticket.comments.length > 0 ? (
          <div className="space-y-4">
            {ticket.comments.map((comment, idx) => {
              const commentUser = comment.userId || { _id: '', firstName: 'Unknown', lastName: 'User', email: '', role: '' };
              const isAdmin = commentUser.role === 'ADMIN' || commentUser.role === 'admin' || commentUser.firstName === 'Support';
              return (
                <div key={idx} className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    isAdmin
                      ? 'bg-[#824ef2] text-white'
                      : 'bg-gradient-to-br from-purple-400 to-purple-600 text-white'
                  }`}>
                    {getInitials(commentUser.firstName, commentUser.lastName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-slate-900">
                        {commentUser.firstName} {commentUser.lastName}
                      </span>
                      {isAdmin && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#824ef2] text-white">Admin</span>
                      )}
                      <span className="text-xs text-slate-400">{getTimeAgo(comment.createdAt)}</span>
                    </div>
                    <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {comment.content}
                    </div>
                    {comment.attachments && comment.attachments.length > 0 && (
                      <div className="mt-2">
                        {comment.attachments.map((att, ai) => (
                          <span key={ai} className="inline-flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 rounded-lg px-2.5 py-1.5 border border-slate-200">
                            <Paperclip className="w-3 h-3" />
                            {att.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed bg-white rounded-xl border border-slate-200 p-4">
            {ticket.description}
          </div>
        )}
      </div>

      {/* Response Area */}
      <div className="border-t border-slate-200">
        {/* Add Response */}
        <div className="px-6 pt-4 pb-2">
          <h4 className="text-sm font-bold text-slate-800 mb-2">Add Response</h4>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Type your response here..."
            rows={3}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] resize-none"
          />
          {/* Attached file indicator */}
          {attachedFile && (
            <div className="flex items-center gap-2 mt-2 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-lg text-xs text-purple-700">
              <Paperclip className="w-3 h-3" />
              <span className="truncate">{attachedFile}</span>
              <button onClick={() => setAttachedFile(null)} className="ml-auto hover:text-purple-900">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-3">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
                onChange={handleFileSelect}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors"
              >
                <Paperclip className="w-3.5 h-3.5" />
                Attach File
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <Smile className="w-3.5 h-3.5" />
                  Emoji
                </button>
                {/* Emoji Picker Dropdown */}
                {showEmojiPicker && (
                  <div className="absolute bottom-full left-0 mb-2 bg-white rounded-xl border border-slate-200 shadow-xl p-3 z-50">
                    <div className="grid grid-cols-8 gap-1">
                      {commonEmojis.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => insertEmoji(emoji)}
                          className="w-8 h-8 flex items-center justify-center text-lg hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors">
                Save Draft
              </button>
              <button
                onClick={onAddComment}
                disabled={addingComment || !newComment.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50"
                style={{ backgroundColor: '#824ef2' }}
                onMouseEnter={(e) => { if (!addingComment) e.currentTarget.style.backgroundColor = '#7040d9'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#824ef2'; }}
              >
                {addingComment ? 'Sending...' : 'Send Response'}
              </button>
            </div>
          </div>
        </div>

        {/* Internal Notes */}
        <div className="px-6 pb-4 pt-2">
          <div className="flex items-center gap-1.5 mb-2">
            <StickyNote className="w-3.5 h-3.5 text-amber-500" />
            <h4 className="text-sm font-bold text-slate-800">Internal Notes <span className="text-xs font-normal text-slate-400">(Not visible to user)</span></h4>
          </div>
          <textarea
            value={internalNote}
            onChange={(e) => setInternalNote(e.target.value)}
            placeholder="Add internal notes for team reference..."
            rows={2}
            className="w-full px-3 py-2.5 border border-amber-200 bg-amber-50/50 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/40 focus:border-amber-300 resize-none"
          />
          <div className="mt-2">
            <button
              onClick={onAddInternalNote}
              disabled={!internalNote.trim()}
              className="px-3 py-1.5 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
            >
              Add Note
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

/* ─── User Details Modal ─── */

function UserDetailsModal({
  ticket,
  onClose,
}: {
  ticket: SupportTicket;
  onClose: () => void;
}) {
  const creator = safeCreatedBy(ticket);
  const mock = getMockUserDetails(ticket);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const planColors: Record<string, string> = {
    Premium: 'bg-[#824ef2] text-white',
    Enterprise: 'bg-indigo-600 text-white',
    Professional: 'bg-blue-600 text-white',
    Basic: 'bg-slate-600 text-white',
  };

  return (
    <Portal>
      <div
        className="fixed inset-0 bg-slate-900/50 z-[9998] transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-6">
        <div
          className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-[540px] max-h-[92vh] sm:max-h-[85vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">User Details</h2>
            <button onClick={onClose} className="p-2 -mr-2 rounded-lg hover:bg-slate-100 transition-colors">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {/* Profile Header */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 text-white flex items-center justify-center text-xl font-bold flex-shrink-0">
                {getInitials(creator.firstName, creator.lastName)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {creator.firstName} {creator.lastName}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                    {(mock.role || 'User').charAt(0).toUpperCase() + (mock.role || 'User').slice(1)}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-3">
                <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">User ID</p>
                <p className="text-sm font-semibold text-slate-900">{mock.userId}</p>
              </div>
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-3">
                <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">School</p>
                <p className="text-sm font-semibold text-slate-900">{ticket.tenantId?.schoolName || 'N/A'}</p>
              </div>
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-3">
                <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">Email</p>
                <p className="text-sm font-semibold text-slate-900 truncate">{creator.email || 'N/A'}</p>
              </div>
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-3">
                <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">Phone</p>
                <p className="text-sm font-semibold text-slate-900">{mock.phone}</p>
              </div>
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-3">
                <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">Department</p>
                <p className="text-sm font-semibold text-slate-900">{mock.department}</p>
              </div>
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-3">
                <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">Join Date</p>
                <p className="text-sm font-semibold text-slate-900">
                  {new Date(mock.joinDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* School Information */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-3">School Information</h3>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">School Name</span>
                  <span className="font-medium text-slate-900">{ticket.tenantId?.schoolName || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">School ID</span>
                  <span className="font-medium text-slate-900">{mock.schoolId}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Location</span>
                  <span className="font-medium text-slate-900">{mock.location}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Subscription Plan</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${planColors[mock.plan || ''] || 'bg-slate-600 text-white'}`}>
                    {mock.plan || 'Basic'}
                  </span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <hr className="border-slate-200" />

            {/* Support History */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-3">Support History</h3>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Total Tickets</span>
                  <span className="font-medium text-slate-900">{mock.totalTickets}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Resolved</span>
                  <span className="font-medium text-emerald-600">{mock.resolved}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Pending</span>
                  <span className="font-medium text-amber-600">{mock.pending}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Avg. Response Time</span>
                  <span className="font-semibold text-slate-900">{mock.avgResponseTime}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
