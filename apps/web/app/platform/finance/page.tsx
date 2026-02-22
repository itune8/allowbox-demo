'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  DollarSign,
  Building2,
  AlertCircle,
  AlertTriangle,
  Plus,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../../contexts/auth-context';
import { hasPermission } from '../../../lib/permissions';
import { schoolService, type School } from '../../../lib/services/superadmin/school.service';
import {
  PlatformStatCard,
  StatusBadge,
  SchoolBillingModal,
  ReviewPaymentModal,
  SendReminderModal,
  CreateInvoiceModal,
  InvoiceDetailsModal,
  PaymentReceiptModal,
} from '../../../components/platform';

interface FinanceMetrics {
  totalRevenue: number;
  activeSchools: number;
  newSchoolsThisMonth: number;
  pendingPayments: number;
  overduePayments: number;
}

interface Payment {
  id: string;
  invoiceId: string;
  schoolName: string;
  schoolId: string;
  school: School;
  plan: string;
  users: number;
  amount: number;
  nextDue: string;
  status: 'paid' | 'pending' | 'overdue' | 'failed';
}

const ITEMS_PER_PAGE = 10;

export default function FinancePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [schools, setSchools] = useState<School[]>([]);
  const [metrics, setMetrics] = useState<FinanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [createInvoiceOpen, setCreateInvoiceOpen] = useState(false);
  const [billingModalOpen, setBillingModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<'pending' | 'rejected' | 'failed'>('pending');
  const [actionLoading, setActionLoading] = useState(false);
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [invoiceDetailsOpen, setInvoiceDetailsOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedInvoiceData, setSelectedInvoiceData] = useState<any>(null);
  const [selectedReceiptData, setSelectedReceiptData] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const canAccessFinance = hasPermission(user?.roles, 'canAccessFinance');

  useEffect(() => {
    if (!canAccessFinance) {
      router.push('/platform/dashboard');
    }
  }, [canAccessFinance, router]);

  useEffect(() => {
    loadData();
  }, []);

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const loadData = async () => {
    try {
      setLoading(true);
      const schoolsData = await schoolService.getSchools();
      setSchools(schoolsData);
      calculateMetrics(schoolsData);
    } catch (error) {
      console.error('Failed to load finance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (schoolsData: School[]) => {
    const totalRevenue = schoolsData.reduce((sum, school) => sum + (school.totalRevenue || 0), 0);
    const activeSchools = schoolsData.filter(s => s.isActive).length;
    const pendingPayments = schoolsData.filter(s => s.outstandingBalance > 0 && new Date(s.nextBillingDate || '') >= new Date()).length;
    const overduePayments = schoolsData.filter(s => s.outstandingBalance > 0 && new Date(s.nextBillingDate || '') < new Date()).length;

    setMetrics({
      totalRevenue,
      activeSchools,
      newSchoolsThisMonth: Math.min(schoolsData.length, 8),
      pendingPayments,
      overduePayments,
    });
  };

  const payments = useMemo((): Payment[] => {
    const result: Payment[] = [];
    schools.forEach((school, idx) => {
      const dueDate = school.nextBillingDate ? new Date(school.nextBillingDate) : new Date();
      const isPastDue = new Date() > dueDate;

      let status: Payment['status'] = 'paid';
      if (school.outstandingBalance > 0) {
        status = isPastDue ? 'overdue' : 'pending';
      }

      result.push({
        id: `pay-${idx}`,
        invoiceId: `INV-${1000 + idx}`,
        schoolName: school.schoolName,
        schoolId: school._id,
        school,
        plan: school.subscriptionPlan,
        users: (school.studentCount || 0) + (school.teacherCount || 0),
        amount: school.mrr || 0,
        nextDue: school.nextBillingDate || new Date().toISOString(),
        status,
      });
    });
    return result.sort((a, b) => new Date(b.nextDue).getTime() - new Date(a.nextDue).getTime());
  }, [schools]);

  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchesPlan = planFilter === 'all' || p.plan === planFilter;
      const matchesSearch = searchQuery === '' ||
        p.schoolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.invoiceId.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesPlan && matchesSearch;
    });
  }, [payments, statusFilter, planFilter, searchQuery]);

  const totalPages = Math.ceil(filteredPayments.length / ITEMS_PER_PAGE);
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // Action handlers
  const handleView = (payment: Payment) => {
    setSelectedSchool(payment.school);
    setSelectedInvoiceId(payment.invoiceId);
    setBillingModalOpen(true);
  };

  const handleReview = (payment: Payment) => {
    setSelectedSchool(payment.school);
    setSelectedInvoiceId(payment.invoiceId);
    setSelectedPaymentStatus(payment.status === 'overdue' ? 'pending' : payment.status === 'failed' ? 'failed' : 'pending');
    setReviewModalOpen(true);
  };

  const handleAcceptPayment = async (school: School) => {
    try {
      setActionLoading(true);
      await schoolService.updateSchool(school._id, {
        subscriptionStatus: 'active',
        isActive: true,
      });
      setToast({ message: `Payment accepted for ${school.schoolName}`, type: 'success' });
      setReviewModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Failed to accept payment:', err);
      setToast({ message: 'Failed to accept payment', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectPayment = async (school: School) => {
    try {
      setActionLoading(true);
      await schoolService.updateSchool(school._id, {
        subscriptionStatus: 'suspended',
      });
      setToast({ message: `Payment rejected for ${school.schoolName}`, type: 'success' });
      setReviewModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Failed to reject payment:', err);
      setToast({ message: 'Failed to reject payment', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendReminder = (payment: Payment) => {
    setReminderModalOpen(true);
  };

  const handleReminderSend = async (data: {
    target: 'overdue' | 'pending' | 'specific';
    message: string;
    autoFollowUp: boolean;
    selectedSchools?: string[];
  }) => {
    const count = data.target === 'overdue' ? (metrics?.overduePayments || 0) : data.target === 'pending' ? (metrics?.pendingPayments || 0) : (data.selectedSchools?.length || 0);
    setToast({ message: `Reminder sent to ${count} school${count !== 1 ? 's' : ''}`, type: 'success' });
  };

  const handleDownload = (payment: Payment) => {
    setToast({ message: `Downloading invoice ${payment.invoiceId}...`, type: 'success' });
  };

  const handleViewReceipt = (payment: Payment) => {
    const planLabel = payment.plan.charAt(0).toUpperCase() + payment.plan.slice(1);
    setSelectedReceiptData({
      receiptNumber: `RCP-${payment.invoiceId.replace('INV-', '')}`,
      schoolName: payment.schoolName,
      schoolId: payment.schoolId.slice(0, 10),
      paymentDate: payment.nextDue,
      paymentMethod: 'Online (Stripe)',
      plan: `${planLabel} Plan`,
      billingPeriod: 'Annual',
      amount: payment.amount,
    });
    setReceiptModalOpen(true);
  };

  const handleViewInvoice = (payment: Payment) => {
    const planLabel = payment.plan.charAt(0).toUpperCase() + payment.plan.slice(1);
    const dueDate = new Date(payment.nextDue);
    dueDate.setDate(dueDate.getDate() + 30);
    setSelectedInvoiceData({
      invoiceNumber: payment.invoiceId,
      schoolName: payment.schoolName,
      schoolId: payment.schoolId.slice(0, 10),
      address: payment.school.address || '123 Education Street',
      city: [payment.school.city || 'New York', payment.school.state || 'NY', payment.school.postalCode || '10001'].join(', '),
      email: payment.school.contactEmail || `contact@${payment.schoolName.toLowerCase().replace(/\s+/g, '')}.edu`,
      plan: payment.plan,
      issueDate: payment.nextDue,
      dueDate: dueDate.toISOString(),
      status: payment.status,
      amount: payment.amount,
      paidDate: payment.status === 'paid' ? payment.nextDue : undefined,
      paymentMethod: 'Visa ****4243',
      studentCount: payment.users,
    });
    setInvoiceDetailsOpen(true);
  };

  // Status-based action buttons per row
  const getRowActions = (payment: Payment) => {
    const actions = [];

    if (payment.status === 'paid') {
      // Paid: View Details, View Receipt, View Invoice
      actions.push(
        <button
          key="details"
          onClick={() => handleView(payment)}
          className="px-2.5 py-1.5 text-xs font-medium text-[#824ef2] bg-[#824ef2]/5 border border-[#824ef2]/20 rounded-md hover:bg-[#824ef2]/10 transition-colors whitespace-nowrap"
        >
          View Details
        </button>,
        <button
          key="receipt"
          onClick={() => handleViewReceipt(payment)}
          className="px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 transition-colors whitespace-nowrap"
        >
          View Receipt
        </button>,
        <button
          key="invoice"
          onClick={() => handleViewInvoice(payment)}
          className="px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 transition-colors whitespace-nowrap"
        >
          View Invoice
        </button>
      );
    } else if (payment.status === 'pending') {
      // Pending: view details, accept, reject
      actions.push(
        <button
          key="details"
          onClick={() => handleView(payment)}
          className="px-2.5 py-1.5 text-xs font-medium text-[#824ef2] bg-[#824ef2]/5 border border-[#824ef2]/20 rounded-md hover:bg-[#824ef2]/10 transition-colors whitespace-nowrap"
        >
          View Details
        </button>,
        <button
          key="accept"
          onClick={() => handleAcceptPayment(payment.school)}
          className="px-2.5 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors whitespace-nowrap"
        >
          Accept
        </button>,
        <button
          key="reject"
          onClick={() => handleRejectPayment(payment.school)}
          className="px-2.5 py-1.5 text-xs font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors whitespace-nowrap"
        >
          Reject
        </button>
      );
    } else if (payment.status === 'overdue') {
      // Overdue: View Details, View Invoice, Send Reminder
      actions.push(
        <button
          key="details"
          onClick={() => handleView(payment)}
          className="px-2.5 py-1.5 text-xs font-medium text-[#824ef2] bg-[#824ef2]/5 border border-[#824ef2]/20 rounded-md hover:bg-[#824ef2]/10 transition-colors whitespace-nowrap"
        >
          View Details
        </button>,
        <button
          key="invoice"
          onClick={() => handleViewInvoice(payment)}
          className="px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 transition-colors whitespace-nowrap"
        >
          View Invoice
        </button>,
        <button
          key="remind"
          onClick={() => handleSendReminder(payment)}
          className="px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors whitespace-nowrap"
        >
          Send Reminder
        </button>
      );
    } else if (payment.status === 'failed') {
      // Failed: View Details, Review, Contact
      actions.push(
        <button
          key="details"
          onClick={() => handleView(payment)}
          className="px-2.5 py-1.5 text-xs font-medium text-[#824ef2] bg-[#824ef2]/5 border border-[#824ef2]/20 rounded-md hover:bg-[#824ef2]/10 transition-colors whitespace-nowrap"
        >
          View Details
        </button>,
        <button
          key="review"
          onClick={() => handleReview(payment)}
          className="px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors whitespace-nowrap"
        >
          Review
        </button>,
        <button
          key="contact"
          onClick={() => handleSendReminder(payment)}
          className="px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 transition-colors whitespace-nowrap"
        >
          Contact School
        </button>
      );
    }

    return actions;
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; dot: string }> = {
      paid: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
      pending: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
      overdue: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
      failed: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-[#824ef2] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast notification */}
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
          <h1 className="text-2xl font-bold text-slate-900">Fees & Billing Management</h1>
          <p className="text-slate-500 mt-1">Manage school subscriptions, invoices and payment history</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4" />
            Export Report
          </button>
          <button
            onClick={() => setCreateInvoiceOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-colors"
            style={{ backgroundColor: '#824ef2' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#7040d9')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#824ef2')}
          >
            <Plus className="w-4 h-4" />
            Add Invoice
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <PlatformStatCard
          icon={<DollarSign className="w-5 h-5" />}
          color="green"
          label="Total Revenue"
          value={formatCurrency(metrics?.totalRevenue || 0)}
          trend={{ value: '+12.5%', positive: true }}
        />
        <PlatformStatCard
          icon={<Building2 className="w-5 h-5" />}
          color="blue"
          label="Active Schools"
          value={metrics?.activeSchools || 0}
          subtitle={`${metrics?.newSchoolsThisMonth || 0} new this month`}
        />
        <PlatformStatCard
          icon={<AlertCircle className="w-5 h-5" />}
          color="orange"
          label="Pending Payments"
          value={metrics?.pendingPayments || 0}
          subtitle="Requires attention"
          subtitleColor="orange"
        />
        <PlatformStatCard
          icon={<AlertTriangle className="w-5 h-5" />}
          color="red"
          label="Overdue"
          value={metrics?.overduePayments || 0}
          subtitle="Action needed"
          subtitleColor="red"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px] max-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search schools..."
            className="w-full h-10 pl-9 pr-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          className="h-10 px-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2]"
        >
          <option value="all">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
          <option value="failed">Failed</option>
        </select>
        <select
          value={planFilter}
          onChange={(e) => { setPlanFilter(e.target.value); setCurrentPage(1); }}
          className="h-10 px-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2]"
        >
          <option value="all">All Plans</option>
          <option value="basic">Basic</option>
          <option value="premium">Premium</option>
          <option value="enterprise">Enterprise</option>
        </select>
        {(statusFilter !== 'all' || planFilter !== 'all' || searchQuery) && (
          <button
            onClick={() => { setStatusFilter('all'); setPlanFilter('all'); setSearchQuery(''); setCurrentPage(1); }}
            className="text-sm font-medium text-[#824ef2] hover:underline"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#824ef2] uppercase tracking-wider">Invoice ID</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#824ef2] uppercase tracking-wider">School Name</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#824ef2] uppercase tracking-wider">Plan</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#824ef2] uppercase tracking-wider">Users</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#824ef2] uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#824ef2] uppercase tracking-wider">Next Due</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#824ef2] uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#824ef2] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                    No payments found
                  </td>
                </tr>
              ) : (
                paginatedPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{payment.invoiceId}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-[#824ef2]/10 flex-shrink-0">
                          <Building2 className="w-3.5 h-3.5 text-[#824ef2]" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{payment.schoolName}</p>
                          <p className="text-[11px] text-slate-400">{payment.schoolId.slice(0, 10)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${getPlanBadge(payment.plan)}`}>
                        {payment.plan.charAt(0).toUpperCase() + payment.plan.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{payment.users}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{formatCurrency(payment.amount)}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatDate(payment.nextDue)}</td>
                    <td className="px-4 py-3">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {getRowActions(payment)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredPayments.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to{' '}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredPayments.length)} of{' '}
              <span className="font-medium" style={{ color: '#824ef2' }}>{filteredPayments.length} schools</span>
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
        isOpen={createInvoiceOpen}
        onClose={() => setCreateInvoiceOpen(false)}
        schools={schools}
        onSubmit={(data) => {
          setCreateInvoiceOpen(false);
          setToast({ message: `Invoice created for school`, type: 'success' });
          loadData();
        }}
      />

      {/* School Billing Details Modal */}
      <SchoolBillingModal
        isOpen={billingModalOpen}
        onClose={() => {
          setBillingModalOpen(false);
          setSelectedSchool(null);
        }}
        school={selectedSchool}
        invoiceId={selectedInvoiceId}
      />

      {/* Review Payment Modal */}
      <ReviewPaymentModal
        isOpen={reviewModalOpen}
        onClose={() => {
          setReviewModalOpen(false);
          setSelectedSchool(null);
        }}
        school={selectedSchool}
        invoiceId={selectedInvoiceId}
        paymentStatus={selectedPaymentStatus}
        onAccept={handleAcceptPayment}
        onReject={handleRejectPayment}
        actionLoading={actionLoading}
      />

      {/* Send Reminder Modal */}
      <SendReminderModal
        isOpen={reminderModalOpen}
        onClose={() => setReminderModalOpen(false)}
        overdueCount={metrics?.overduePayments || 0}
        pendingCount={metrics?.pendingPayments || 0}
        overdueAmount={payments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0)}
        schools={schools.map(s => ({ id: s._id, name: s.schoolName }))}
        onSend={handleReminderSend}
      />

      {/* Invoice Details Modal */}
      <InvoiceDetailsModal
        isOpen={invoiceDetailsOpen}
        onClose={() => {
          setInvoiceDetailsOpen(false);
          setSelectedInvoiceData(null);
        }}
        invoice={selectedInvoiceData}
        onDownload={() => setToast({ message: 'Downloading invoice PDF...', type: 'success' })}
        onSendEmail={() => setToast({ message: 'Invoice sent via email', type: 'success' })}
      />

      {/* Payment Receipt Modal */}
      <PaymentReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => {
          setReceiptModalOpen(false);
          setSelectedReceiptData(null);
        }}
        receipt={selectedReceiptData}
        onDownload={() => setToast({ message: 'Downloading receipt PDF...', type: 'success' })}
        onPrint={() => window.print()}
      />
    </div>
  );
}
