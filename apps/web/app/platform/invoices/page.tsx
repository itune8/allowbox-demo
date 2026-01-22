'use client';

import { useState, useEffect } from 'react';
import { Receipt, FileText, CheckCircle, Clock, XCircle, Download, Search } from 'lucide-react';
import { Button } from '@repo/ui/button';
import { schoolService, type School } from '../../../lib/services/superadmin/school.service';
import { SlideSheet, SheetSection, SheetDetailRow } from '../../../components/ui';

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

export default function PlatformInvoicesPage() {
  const [invoices, setInvoices] = useState<PlatformInvoice[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<PlatformInvoice | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
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
    collectedAmount: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0),
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      paid: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Paid' },
      pending: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Pending' },
      overdue: { bg: 'bg-red-50', text: 'text-red-700', label: 'Overdue' },
      cancelled: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Cancelled' },
    };
    const badge = badges[status] ?? badges.pending;
    return (
      <span className={`text-xs px-2 py-1 rounded-md font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Platform Invoices</h1>
        <p className="text-slate-500 mt-1">View and manage invoices across all schools</p>
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
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-50">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Invoices</p>
              <p className="text-2xl font-semibold text-slate-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-50">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Collected</p>
              <p className="text-2xl font-semibold text-slate-900">{formatCurrency(stats.collectedAmount)}</p>
              <p className="text-xs text-slate-500">{stats.paid} invoices</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-50">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Pending</p>
              <p className="text-2xl font-semibold text-slate-900">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-red-50">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Overdue</p>
              <p className="text-2xl font-semibold text-slate-900">{stats.overdue}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-slate-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by school name or invoice number..."
                className="w-full h-10 pl-10 pr-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Invoice #</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">School</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Plan</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Amount</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Issue Date</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Due Date</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-500">
                      <FileText className="w-12 h-12 text-slate-300" />
                      <span>No invoices found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{invoice.invoiceNumber}</td>
                    <td className="px-4 py-3 text-slate-700">{invoice.schoolName}</td>
                    <td className="px-4 py-3 text-slate-600 capitalize">{invoice.plan}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{formatCurrency(invoice.amount)}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(invoice.issueDate)}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(invoice.dueDate)}</td>
                    <td className="px-4 py-3">{getStatusBadge(invoice.status)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => { setSelectedInvoice(invoice); setShowDetailPanel(true); }}
                        className="text-primary hover:underline font-medium text-sm"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredInvoices.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-200">
            <p className="text-sm text-slate-500">Showing {filteredInvoices.length} of {invoices.length} invoices</p>
          </div>
        )}
      </div>

      {/* Invoice Detail SlideSheet */}
      <SlideSheet
        isOpen={showDetailPanel && selectedInvoice !== null}
        onClose={() => { setShowDetailPanel(false); setSelectedInvoice(null); }}
        title={selectedInvoice ? `Invoice ${selectedInvoice.invoiceNumber}` : ''}
        subtitle={selectedInvoice?.schoolName}
        size="md"
        footer={
          <div className="space-y-3">
            {selectedInvoice?.status !== 'paid' && (
              <Button className="w-full">Record Payment</Button>
            )}
            <Button variant="outline" className="w-full flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
            <Button variant="outline" className="w-full" onClick={() => { setShowDetailPanel(false); setSelectedInvoice(null); }}>
              Close
            </Button>
          </div>
        }
      >
        {selectedInvoice && (
          <>
            <SheetSection>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-slate-500">Status</span>
                {getStatusBadge(selectedInvoice.status)}
              </div>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <p className="text-sm text-slate-500 mb-1">Amount Due</p>
                <p className="text-3xl font-semibold text-slate-900">{formatCurrency(selectedInvoice.amount)}</p>
              </div>
            </SheetSection>

            <SheetSection title="Invoice Details">
              <SheetDetailRow label="Invoice Number" value={selectedInvoice.invoiceNumber} />
              <SheetDetailRow label="School" value={selectedInvoice.schoolName} />
              <SheetDetailRow label="Plan" value={selectedInvoice.plan} valueClassName="capitalize" />
              <SheetDetailRow label="Students" value={selectedInvoice.studentCount.toString()} />
              <SheetDetailRow label="Issue Date" value={formatDate(selectedInvoice.issueDate)} />
              <SheetDetailRow label="Due Date" value={formatDate(selectedInvoice.dueDate)} />
              {selectedInvoice.paidDate && (
                <SheetDetailRow label="Paid Date" value={formatDate(selectedInvoice.paidDate)} valueClassName="text-emerald-600" />
              )}
            </SheetSection>
          </>
        )}
      </SlideSheet>
    </div>
  );
}
