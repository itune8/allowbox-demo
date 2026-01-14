'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Receipt, FileText, DollarSign, Clock, CheckCircle, XCircle, Download } from 'lucide-react';
import { Button } from '@repo/ui/button';
import { schoolService, type School } from '../../../lib/services/superadmin/school.service';
import { GlassCard } from '../../../components/ui/glass-card';
import { AnimatedStatCard } from '../../../components/ui/animated-stat-card';
import { Icon3D } from '../../../components/ui/icon-3d';

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
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function PlatformInvoicesPage() {
  const [invoices, setInvoices] = useState<PlatformInvoice[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<PlatformInvoice | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const schoolsData = await schoolService.getSchools();
      setSchools(schoolsData);

      // Generate invoices from school data
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
    const invoices: PlatformInvoice[] = [];
    let invoiceCounter = 1000;

    schoolsData.forEach((school, idx) => {
      // Current billing period invoice
      if (school.subscriptionPlan !== 'free') {
        const now = new Date();
        const dueDate = school.nextBillingDate ? new Date(school.nextBillingDate) : new Date(now.setMonth(now.getMonth() + 1));
        const isPastDue = new Date() > dueDate;

        invoices.push({
          id: `inv-current-${idx}`,
          invoiceNumber: `INV-${invoiceCounter++}`,
          schoolId: school._id,
          schoolName: school.schoolName,
          amount: school.mrr || 0,
          status: school.outstandingBalance > 0 ? (isPastDue ? 'overdue' : 'pending') : 'paid',
          issueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          dueDate: dueDate.toISOString(),
          paidDate: school.outstandingBalance === 0 ? school.lastPaymentDate : undefined,
          plan: school.subscriptionPlan,
          studentCount: school.studentCount || 0,
        });
      }

      // Historical invoice (if has payment history)
      if (school.lastPaymentDate) {
        invoices.push({
          id: `inv-hist-${idx}`,
          invoiceNumber: `INV-${invoiceCounter++}`,
          schoolId: school._id,
          schoolName: school.schoolName,
          amount: school.mrr || 0,
          status: 'paid',
          issueDate: new Date(new Date(school.lastPaymentDate).setMonth(new Date(school.lastPaymentDate).getMonth() - 1)).toISOString(),
          dueDate: school.lastPaymentDate,
          paidDate: school.lastPaymentDate,
          plan: school.subscriptionPlan,
          studentCount: school.studentCount || 0,
        });
      }
    });

    return invoices.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    const matchesSearch = searchQuery === '' ||
      inv.schoolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: invoices.length,
    paid: invoices.filter(i => i.status === 'paid').length,
    pending: invoices.filter(i => i.status === 'pending').length,
    overdue: invoices.filter(i => i.status === 'overdue').length,
    totalAmount: invoices.reduce((sum, i) => sum + i.amount, 0),
    collectedAmount: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0),
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      paid: { bg: 'bg-green-100', text: 'text-green-700', label: 'Paid' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
      overdue: { bg: 'bg-red-100', text: 'text-red-700', label: 'Overdue' },
      cancelled: { bg: 'bg-gray-100/30', text: 'text-gray-700', label: 'Cancelled' },
    };
    const badge = badges[status] ?? { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' };
    return (
      <span className={`text-xs px-2 py-1 rounded font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleViewInvoice = (invoice: PlatformInvoice) => {
    setSelectedInvoice(invoice);
    setShowDetailPanel(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-amber-200 border-t-amber-500 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-white to-gray-50 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-start gap-4">
          <Icon3D gradient="from-amber-500 to-orange-500" size="lg">
            <Receipt className="w-6 h-6" />
          </Icon3D>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Platform Invoices
            </h2>
            <p className="text-gray-600 mt-1">
              View and manage invoices across all schools
            </p>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-center justify-between"
          >
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <AnimatedStatCard
          title="Total Invoices"
          value={stats.total}
          icon={<FileText className="w-6 h-6" />}
          gradient="from-amber-500 to-orange-500"
          delay={0}
        />

        <AnimatedStatCard
          title="Collected"
          value={formatCurrency(stats.collectedAmount)}
          icon={<CheckCircle className="w-6 h-6" />}
          gradient="from-orange-500 to-red-500"
          trend={{ value: `${stats.paid} invoices`, isPositive: true }}
          delay={1}
        />

        <AnimatedStatCard
          title="Pending"
          value={stats.pending}
          icon={<Clock className="w-6 h-6" />}
          gradient="from-yellow-500 to-amber-500"
          delay={2}
        />

        <AnimatedStatCard
          title="Overdue"
          value={stats.overdue}
          icon={<XCircle className="w-6 h-6" />}
          gradient="from-red-500 to-rose-500"
          delay={3}
        />
      </motion.div>

      {/* Filters */}
      <GlassCard className="bg-white p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              id="search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by school name or invoice number..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <motion.select
              whileTap={{ scale: 0.98 }}
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </motion.select>
          </div>
        </motion.div>
      </GlassCard>

      {/* Invoices Table */}
      <GlassCard className="bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-amber-50/50 to-orange-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  School
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issue Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <AnimatePresence mode="popLayout">
                {filteredInvoices.length === 0 ? (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                      >
                        <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        No invoices found
                      </motion.div>
                    </td>
                  </motion.tr>
                ) : (
                  filteredInvoices.map((invoice, idx) => (
                    <motion.tr
                      key={invoice.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ backgroundColor: 'rgba(251, 191, 36, 0.05)' }}
                      className="transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {invoice.schoolName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                        {invoice.plan}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {formatCurrency(invoice.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(invoice.issueDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(invoice.dueDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {getStatusBadge(invoice.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleViewInvoice(invoice)}
                          className="text-amber-600 hover:text-amber-900 font-medium"
                        >
                          View
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filteredInvoices.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-6 py-4 border-t border-gray-100"
          >
            <p className="text-sm text-gray-500">
              Showing {filteredInvoices.length} of {invoices.length} invoices
            </p>
          </motion.div>
        )}
      </GlassCard>

      {/* Invoice Detail Slide-in Panel */}
      <AnimatePresence>
        {showDetailPanel && selectedInvoice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex justify-end"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40"
              onClick={() => { setShowDetailPanel(false); setSelectedInvoice(null); }}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative bg-white w-full max-w-lg h-full overflow-y-auto shadow-xl border-l border-gray-200"
            >
              <div className="sticky top-0 bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Icon3D gradient="from-amber-500 to-orange-500" size="sm">
                      <Receipt className="w-3.5 h-3.5" />
                    </Icon3D>
                    Invoice {selectedInvoice.invoiceNumber}
                  </h3>
                  <p className="text-sm text-gray-500">{selectedInvoice.schoolName}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => { setShowDetailPanel(false); setSelectedInvoice(null); }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 space-y-6"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  {getStatusBadge(selectedInvoice.status)}
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-100"
                >
                  <p className="text-sm text-gray-500 mb-1">Amount Due</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency(selectedInvoice.amount)}
                  </p>
                </motion.div>

                <div className="space-y-4">
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Invoice Number</span>
                    <span className="text-sm font-medium text-gray-900">{selectedInvoice.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600">School</span>
                    <span className="text-sm font-medium text-gray-900">{selectedInvoice.schoolName}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Plan</span>
                    <span className="text-sm font-medium text-gray-900 capitalize">{selectedInvoice.plan}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Students</span>
                    <span className="text-sm font-medium text-gray-900">{selectedInvoice.studentCount}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Issue Date</span>
                    <span className="text-sm font-medium text-gray-900">{formatDate(selectedInvoice.issueDate)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Due Date</span>
                    <span className="text-sm font-medium text-gray-900">{formatDate(selectedInvoice.dueDate)}</span>
                  </div>
                  {selectedInvoice.paidDate && (
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-sm text-gray-600">Paid Date</span>
                      <span className="text-sm font-medium text-green-600">{formatDate(selectedInvoice.paidDate)}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 space-y-3">
                  {selectedInvoice.status !== 'paid' && (
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                        Record Payment
                      </Button>
                    </motion.div>
                  )}
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" />
                      Download PDF
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => { setShowDetailPanel(false); setSelectedInvoice(null); }}
                    >
                      Close
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
