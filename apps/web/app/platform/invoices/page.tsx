'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  Search,
  Eye,
  Send,
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  AlertTriangle,
  Building2,
} from 'lucide-react';
import { schoolService, type School } from '../../../lib/services/superadmin/school.service';
import {
  PlatformStatCard,
  CreateInvoiceModal,
  InvoiceDetailsModal,
  PaymentReceiptModal,
  SendReminderModal,
} from '../../../components/platform';

interface PlatformInvoice {
  id: string;
  invoiceNumber: string;
  schoolId: string;
  schoolName: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  plan: string;
  studentCount: number;
  paymentMethod?: string;
}

const ITEMS_PER_PAGE = 10;

export default function PlatformInvoicesPage() {
  const [invoices, setInvoices] = useState<PlatformInvoice[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<PlatformInvoice | null>(null);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const schoolsData = await schoolService.getSchools();
      setSchools(schoolsData);
      const generatedInvoices = generateInvoicesFromSchools(schoolsData);
      setInvoices(generatedInvoices);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const generateInvoicesFromSchools = (schoolsData: School[]): PlatformInvoice[] => {
    const result: PlatformInvoice[] = [];
    let invoiceCounter = 1000;

    schoolsData.forEach((school, idx) => {
      if (school.subscriptionPlan !== 'free') {
        const now = new Date();
        const dueDate = school.nextBillingDate ? new Date(school.nextBillingDate) : new Date(now.setMonth(now.getMonth() + 1));
        const isPastDue = new Date() > dueDate;
        const methods = ['Online - Credit Card', 'Cash', 'Bank Transfer', 'Online - PayPal'];

        result.push({
          id: `inv-current-${idx}`,
          invoiceNumber: `INV-${new Date().getFullYear()}-${String(invoiceCounter++).padStart(3, '0')}`,
          schoolId: school._id,
          schoolName: school.schoolName,
          amount: school.mrr || 0,
          status: school.outstandingBalance > 0 ? (isPastDue ? 'overdue' : 'pending') : 'paid',
          issueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          dueDate: dueDate.toISOString(),
          paidDate: school.outstandingBalance === 0 ? school.lastPaymentDate : undefined,
          plan: school.subscriptionPlan,
          studentCount: school.studentCount || 0,
          paymentMethod: methods[idx % methods.length],
        });
      }

      if (school.lastPaymentDate) {
        const methods = ['Online - Credit Card', 'Cash', 'Bank Transfer', 'Online - PayPal'];
        result.push({
          id: `inv-hist-${idx}`,
          invoiceNumber: `INV-${new Date().getFullYear()}-${String(invoiceCounter++).padStart(3, '0')}`,
          schoolId: school._id,
          schoolName: school.schoolName,
          amount: school.mrr || 0,
          status: 'paid',
          issueDate: new Date(new Date(school.lastPaymentDate).setMonth(new Date(school.lastPaymentDate).getMonth() - 1)).toISOString(),
          dueDate: school.lastPaymentDate,
          paidDate: school.lastPaymentDate,
          plan: school.subscriptionPlan,
          studentCount: school.studentCount || 0,
          paymentMethod: methods[(idx + 1) % methods.length],
        });
      }
    });

    return result.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
      const matchesSearch = searchQuery === '' ||
        inv.schoolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [invoices, statusFilter, searchQuery]);

  const totalPages = Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE);
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const stats = useMemo(() => ({
    total: invoices.length,
    paid: invoices.filter(i => i.status === 'paid').length,
    pending: invoices.filter(i => i.status === 'pending').length,
    overdue: invoices.filter(i => i.status === 'overdue').length,
    collectedAmount: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0),
    overdueAmount: invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0),
  }), [invoices]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; dot: string }> = {
      paid: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
      pending: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
      overdue: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
      cancelled: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
    };
    const c = config[status] || config.paid!;
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${c!.bg} ${c!.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${c!.dot}`} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPlanBadge = (plan: string) => {
    const colors: Record<string, string> = {
      premium: 'bg-purple-50 text-purple-700',
      professional: 'bg-blue-50 text-blue-700',
      enterprise: 'bg-indigo-50 text-indigo-700',
      basic: 'bg-slate-100 text-slate-700',
      free: 'bg-slate-100 text-slate-500',
    };
    return colors[plan] || 'bg-slate-100 text-slate-600';
  };

  // Action handlers
  const handleViewInvoice = (invoice: PlatformInvoice) => {
    setSelectedInvoice(invoice);
    setDetailsModalOpen(true);
  };

  const handleViewReceipt = (invoice: PlatformInvoice) => {
    setSelectedInvoice(invoice);
    setReceiptModalOpen(true);
  };

  const handleDownload = (invoice: PlatformInvoice) => {
    setToast({ message: `Downloading ${invoice.invoiceNumber}...`, type: 'success' });
  };

  const handleSendInvoice = (invoice: PlatformInvoice) => {
    setToast({ message: `Invoice ${invoice.invoiceNumber} sent to ${invoice.schoolName}`, type: 'success' });
  };

  const handleCreateInvoice = async (data: {
    schoolId: string;
    plan: string;
    users: number;
    amount: number;
    billingCycle: string;
    paymentMethod: string;
    dueDate: string;
  }) => {
    const school = schools.find(s => s._id === data.schoolId);
    if (!school) return;

    const newInvoice: PlatformInvoice = {
      id: `inv-new-${Date.now()}`,
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(invoices.length + 1001).padStart(3, '0')}`,
      schoolId: data.schoolId,
      schoolName: school.schoolName,
      amount: data.amount,
      status: 'pending',
      issueDate: new Date().toISOString(),
      dueDate: new Date(data.dueDate).toISOString(),
      plan: data.plan,
      studentCount: data.users,
      paymentMethod: data.paymentMethod === 'online' ? 'Online - Credit Card' : data.paymentMethod === 'cash' ? 'Cash' : data.paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 'Credit Card',
    };

    setInvoices(prev => [newInvoice, ...prev]);
    setCreateModalOpen(false);
    setToast({ message: `Invoice ${newInvoice.invoiceNumber} created for ${school.schoolName}`, type: 'success' });
  };

  const handleSendReminder = async (data: {
    target: 'overdue' | 'pending' | 'specific';
    message: string;
    autoFollowUp: boolean;
    selectedSchools?: string[];
  }) => {
    const count = data.target === 'overdue' ? stats.overdue : data.target === 'pending' ? stats.pending : (data.selectedSchools?.length || 0);
    setToast({ message: `Reminder sent to ${count} school${count !== 1 ? 's' : ''}`, type: 'success' });
  };

  // Status-based actions per row
  const getRowActions = (invoice: PlatformInvoice) => {
    const actions = [];

    if (invoice.status === 'paid') {
      actions.push(
        <button
          key="receipt"
          onClick={() => handleViewReceipt(invoice)}
          className="p-1.5 text-slate-400 hover:text-[#824ef2] hover:bg-[#824ef2]/5 rounded-lg transition-colors"
          title="View Receipt"
        >
          <RefreshCw className="w-4 h-4" />
        </button>,
        <button
          key="view"
          onClick={() => handleViewInvoice(invoice)}
          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="View Invoice"
        >
          <Eye className="w-4 h-4" />
        </button>,
        <button
          key="download"
          onClick={() => handleDownload(invoice)}
          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
          title="Download"
        >
          <Download className="w-4 h-4" />
        </button>
      );
    } else if (invoice.status === 'pending') {
      actions.push(
        <button
          key="remind"
          onClick={() => { setSelectedInvoice(invoice); setReminderModalOpen(true); }}
          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
          title="Send Reminder"
        >
          <RefreshCw className="w-4 h-4" />
        </button>,
        <button
          key="view"
          onClick={() => handleViewInvoice(invoice)}
          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="View Invoice"
        >
          <Eye className="w-4 h-4" />
        </button>,
        <button
          key="send"
          onClick={() => handleSendInvoice(invoice)}
          className="p-1.5 text-slate-400 hover:text-[#824ef2] hover:bg-[#824ef2]/5 rounded-lg transition-colors"
          title="Send Invoice"
        >
          <Send className="w-4 h-4" />
        </button>
      );
    } else if (invoice.status === 'overdue') {
      actions.push(
        <button
          key="alert"
          onClick={() => { setSelectedInvoice(invoice); setReminderModalOpen(true); }}
          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Send Alert"
        >
          <AlertTriangle className="w-4 h-4" />
        </button>,
        <button
          key="view"
          onClick={() => handleViewInvoice(invoice)}
          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="View Invoice"
        >
          <Eye className="w-4 h-4" />
        </button>,
        <button
          key="download"
          onClick={() => handleDownload(invoice)}
          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
          title="Download"
        >
          <Download className="w-4 h-4" />
        </button>
      );
    }

    return actions;
  };

  // Receipt data builder
  const getReceiptData = (invoice: PlatformInvoice) => ({
    receiptNumber: `RCP-${new Date().getFullYear()}-${invoice.invoiceNumber.split('-').pop()}`,
    schoolName: invoice.schoolName,
    schoolId: invoice.schoolId.slice(0, 8).toUpperCase(),
    paymentDate: invoice.paidDate || new Date().toISOString(),
    paymentMethod: invoice.paymentMethod || 'Online - Credit Card',
    plan: (invoice.plan || 'basic').charAt(0).toUpperCase() + (invoice.plan || 'basic').slice(1),
    billingPeriod: 'Monthly',
    amount: invoice.amount,
  });

  // Invoice data builder for modal
  const getInvoiceData = (invoice: PlatformInvoice) => ({
    invoiceNumber: invoice.invoiceNumber,
    schoolName: invoice.schoolName,
    schoolId: invoice.schoolId,
    plan: invoice.plan,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    status: invoice.status,
    amount: invoice.amount,
    paidDate: invoice.paidDate,
    paymentMethod: invoice.paymentMethod,
    studentCount: invoice.studentCount,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-[#824ef2] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[10000] px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white transition-all ${
          toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Platform Invoices</h1>
          <p className="text-slate-500 mt-1">View and manage invoices across all schools</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-colors"
            style={{ backgroundColor: '#824ef2' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#7040d9')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#824ef2')}
          >
            <Plus className="w-4 h-4" />
            Create Invoice
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-sm underline">Dismiss</button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <PlatformStatCard
          icon={<FileText className="w-5 h-5" />}
          color="blue"
          label="Total Invoices"
          value={stats.total}
          subtitle={`${stats.paid} collected`}
        />
        <PlatformStatCard
          icon={<CheckCircle className="w-5 h-5" />}
          color="green"
          label="Collected"
          value={formatCurrency(stats.collectedAmount)}
          trend={{ value: '+12.5%', positive: true }}
        />
        <PlatformStatCard
          icon={<Clock className="w-5 h-5" />}
          color="amber"
          label="Pending"
          value={stats.pending}
          subtitle={`${stats.pending} invoices pending`}
          subtitleColor="orange"
        />
        <PlatformStatCard
          icon={<XCircle className="w-5 h-5" />}
          color="red"
          label="Overdue"
          value={stats.overdue}
          subtitle={`${formatCurrency(stats.overdueAmount)} overdue`}
          subtitleColor="red"
        />
      </div>

      {/* Filter Tabs + Search */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status pill tabs */}
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          {[
            { key: 'all', label: 'All Invoices' },
            { key: 'paid', label: 'Paid' },
            { key: 'pending', label: 'Pending' },
            { key: 'overdue', label: 'Overdue' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => { setStatusFilter(tab.key); setCurrentPage(1); }}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                statusFilter === tab.key
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Search */}
        <div className="relative min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search schools, invoices..."
            className="w-full h-10 pl-9 pr-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2]"
          />
        </div>

        {/* Send Reminders button */}
        <button
          onClick={() => setReminderModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
        >
          <AlertTriangle className="w-4 h-4" />
          Overdue Reminders
        </button>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#824ef2] uppercase tracking-wider">Invoice Number</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#824ef2] uppercase tracking-wider">School</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#824ef2] uppercase tracking-wider">Plan</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#824ef2] uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#824ef2] uppercase tracking-wider">Issue Date</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#824ef2] uppercase tracking-wider">Next Due</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#824ef2] uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#824ef2] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-500">
                      <FileText className="w-12 h-12 text-slate-300" />
                      <span>No invoices found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{invoice.invoiceNumber}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-[#824ef2]/10 flex-shrink-0">
                          <Building2 className="w-3.5 h-3.5 text-[#824ef2]" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{invoice.schoolName}</p>
                          <p className="text-[11px] text-slate-400">{invoice.schoolId.slice(0, 10)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${getPlanBadge(invoice.plan)}`}>
                        {invoice.plan.charAt(0).toUpperCase() + invoice.plan.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{formatCurrency(invoice.amount)}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatDate(invoice.issueDate)}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatDate(invoice.dueDate)}</td>
                    <td className="px-4 py-3">
                      {getStatusBadge(invoice.status)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {getRowActions(invoice)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredInvoices.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to{' '}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredInvoices.length)} of{' '}
              <span className="font-medium" style={{ color: '#824ef2' }}>{filteredInvoices.length} invoices</span>
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 text-sm font-medium rounded-lg transition-colors ${
                    currentPage === page
                      ? 'text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  style={currentPage === page ? { backgroundColor: '#824ef2' } : undefined}
                >
                  {page}
                </button>
              ))}
              {totalPages > 5 && (
                <>
                  <span className="text-slate-400">...</span>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className={`w-8 h-8 text-sm font-medium rounded-lg transition-colors ${
                      currentPage === totalPages ? 'text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                    style={currentPage === totalPages ? { backgroundColor: '#824ef2' } : undefined}
                  >
                    {totalPages}
                  </button>
                </>
              )}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Invoice Modal */}
      <CreateInvoiceModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        schools={schools}
        onSubmit={handleCreateInvoice}
      />

      {/* Invoice Details Modal */}
      <InvoiceDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => { setDetailsModalOpen(false); setSelectedInvoice(null); }}
        invoice={selectedInvoice ? getInvoiceData(selectedInvoice) : null}
        onDownload={() => {
          if (selectedInvoice) handleDownload(selectedInvoice);
        }}
        onSendEmail={() => {
          if (selectedInvoice) handleSendInvoice(selectedInvoice);
        }}
      />

      {/* Payment Receipt Modal */}
      <PaymentReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => { setReceiptModalOpen(false); setSelectedInvoice(null); }}
        receipt={selectedInvoice ? getReceiptData(selectedInvoice) : null}
        onDownload={() => {
          setToast({ message: 'Downloading receipt PDF...', type: 'success' });
        }}
        onPrint={() => {
          window.print();
        }}
      />

      {/* Send Reminder Modal */}
      <SendReminderModal
        isOpen={reminderModalOpen}
        onClose={() => { setReminderModalOpen(false); setSelectedInvoice(null); }}
        overdueCount={stats.overdue}
        pendingCount={stats.pending}
        overdueAmount={stats.overdueAmount}
        schools={schools.map(s => ({ id: s._id, name: s.schoolName }))}
        onSend={handleSendReminder}
      />
    </div>
  );
}
