'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@repo/ui/button';
import {
  feeService,
  Invoice,
  FeeStructure,
  InvoiceStats,
  InvoiceStatus,
  PaymentMethod,
  CreateInvoiceDto,
  CreateFeeStructureDto,
} from '../../../../lib/services/fee.service';
import { classService, Class } from '../../../../lib/services/class.service';
import { studentService, Student } from '../../../../lib/services/student.service';
import { SlideSheet, SheetSection, SheetField, SheetDetailRow } from '../../../../components/ui/slide-sheet';
import {
  DollarSign,
  Receipt,
  CreditCard,
  Plus,
  X,
  Trash2,
  Edit,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Wallet,
  GraduationCap,
  Users,
  Calendar,
  Tag,
  MessageSquare,
  Banknote,
  BookOpen,
  Loader2,
} from 'lucide-react';

interface InvoiceFormData {
  studentId: string;
  classId: string;
  academicYear: string;
  term: string;
  items: { feeStructureId: string; name: string; amount: number; description: string }[];
  discountAmount: string;
  discountReason: string;
  issueDate: string;
  dueDate: string;
  remarks: string;
}

interface FeeStructureFormData {
  name: string;
  amount: string;
  classId: string;
  academicYear: string;
  term: string;
  description: string;
  isActive: boolean;
  dueDate: string;
  isRecurring: boolean;
  frequency: string;
}

const defaultInvoiceForm: InvoiceFormData = {
  studentId: '',
  classId: '',
  academicYear: new Date().getFullYear().toString(),
  term: '1',
  items: [],
  discountAmount: '0',
  discountReason: '',
  issueDate: new Date().toISOString().split('T')[0] ?? '',
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] ?? '',
  remarks: '',
};

const defaultFeeStructureForm: FeeStructureFormData = {
  name: '',
  amount: '',
  classId: '',
  academicYear: new Date().getFullYear().toString(),
  term: '',
  description: '',
  isActive: true,
  dueDate: '',
  isRecurring: false,
  frequency: 'monthly',
};

export default function FeesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<InvoiceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'invoices' | 'structures'>('invoices');

  // Invoice form state
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState<InvoiceFormData>(defaultInvoiceForm);
  const [submittingInvoice, setSubmittingInvoice] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Fee structure form state
  const [showStructureForm, setShowStructureForm] = useState(false);
  const [editingStructure, setEditingStructure] = useState<FeeStructure | null>(null);
  const [structureForm, setStructureForm] = useState<FeeStructureFormData>(defaultFeeStructureForm);
  const [submittingStructure, setSubmittingStructure] = useState(false);

  // Payment form state
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [transactionId, setTransactionId] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [invoicesData, structuresData, classesData, statsData] = await Promise.all([
        feeService.getInvoices(),
        feeService.getFeeStructures(),
        classService.getClasses(),
        feeService.getInvoiceStats(),
      ]);
      setInvoices(invoicesData);
      setFeeStructures(structuresData);
      setClasses(classesData);
      setStats(statsData);
    } catch (err) {
      setError('Failed to load fee data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function loadStudentsForClass(classId: string) {
    if (!classId) {
      setStudents([]);
      return;
    }
    try {
      const studentsData = await studentService.getStudentsByClass(classId);
      setStudents(studentsData);
    } catch (err) {
      console.error('Failed to load students', err);
    }
  }

  // Invoice handlers
  function handleCreateInvoice() {
    setInvoiceForm(defaultInvoiceForm);
    setShowInvoiceForm(true);
  }

  async function handleInvoiceSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!invoiceForm.studentId || !invoiceForm.classId || invoiceForm.items.length === 0) {
      setError('Please select student, class, and add at least one fee item');
      return;
    }

    try {
      setSubmittingInvoice(true);
      const totalAmount = invoiceForm.items.reduce((sum, item) => sum + item.amount, 0);
      const discountAmount = parseFloat(invoiceForm.discountAmount) || 0;

      const data: CreateInvoiceDto = {
        studentId: invoiceForm.studentId,
        classId: invoiceForm.classId,
        academicYear: invoiceForm.academicYear,
        term: invoiceForm.term || undefined,
        items: invoiceForm.items,
        totalAmount: totalAmount - discountAmount,
        paidAmount: 0,
        discountAmount,
        discountReason: invoiceForm.discountReason || undefined,
        status: 'pending',
        issueDate: invoiceForm.issueDate,
        dueDate: invoiceForm.dueDate,
        remarks: invoiceForm.remarks || undefined,
      };

      await feeService.createInvoice(data);
      await loadData();
      setShowInvoiceForm(false);
      setInvoiceForm(defaultInvoiceForm);
      setBanner('Invoice created successfully');
      setTimeout(() => setBanner(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create invoice');
    } finally {
      setSubmittingInvoice(false);
    }
  }

  function addFeeItem(structure: FeeStructure) {
    const exists = invoiceForm.items.find(item => item.feeStructureId === structure._id);
    if (exists) return;

    setInvoiceForm(prev => ({
      ...prev,
      items: [...prev.items, {
        feeStructureId: structure._id,
        name: structure.name,
        amount: structure.amount,
        description: structure.description || '',
      }],
    }));
  }

  function removeFeeItem(feeStructureId: string) {
    setInvoiceForm(prev => ({
      ...prev,
      items: prev.items.filter(item => item.feeStructureId !== feeStructureId),
    }));
  }

  // Fee Structure handlers
  function handleAddStructure() {
    setEditingStructure(null);
    setStructureForm(defaultFeeStructureForm);
    setShowStructureForm(true);
  }

  function handleEditStructure(structure: FeeStructure) {
    setEditingStructure(structure);
    setStructureForm({
      name: structure.name,
      amount: structure.amount.toString(),
      classId: structure.classId,
      academicYear: structure.academicYear,
      term: structure.term || '',
      description: structure.description || '',
      isActive: structure.isActive,
      dueDate: (structure.dueDate?.split('T')[0] ?? '') || '',
      isRecurring: structure.isRecurring,
      frequency: structure.frequency || 'monthly',
    });
    setShowStructureForm(true);
  }

  async function handleStructureSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!structureForm.name.trim() || !structureForm.amount || !structureForm.classId) {
      setError('Please fill in required fields');
      return;
    }

    try {
      setSubmittingStructure(true);
      const data: CreateFeeStructureDto = {
        name: structureForm.name,
        amount: parseFloat(structureForm.amount),
        classId: structureForm.classId,
        academicYear: structureForm.academicYear,
        term: structureForm.term || undefined,
        description: structureForm.description || undefined,
        isActive: structureForm.isActive,
        dueDate: structureForm.dueDate || undefined,
        isRecurring: structureForm.isRecurring,
        frequency: structureForm.isRecurring ? structureForm.frequency : undefined,
      };

      if (editingStructure) {
        await feeService.updateFeeStructure(editingStructure._id, data);
      } else {
        await feeService.createFeeStructure(data);
      }

      await loadData();
      setShowStructureForm(false);
      setStructureForm(defaultFeeStructureForm);
      setEditingStructure(null);
      setBanner(editingStructure ? 'Fee structure updated' : 'Fee structure created');
      setTimeout(() => setBanner(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save fee structure');
    } finally {
      setSubmittingStructure(false);
    }
  }

  async function handleDeleteStructure(id: string) {
    if (!confirm('Are you sure you want to delete this fee structure?')) return;
    try {
      await feeService.deleteFeeStructure(id);
      await loadData();
    } catch (err) {
      setError('Failed to delete fee structure');
    }
  }

  // Payment handlers
  function handleRecordPayment(invoice: Invoice) {
    setSelectedInvoice(invoice);
    setPaymentAmount((invoice.totalAmount - invoice.paidAmount).toString());
    setPaymentMethod('cash');
    setTransactionId('');
    setShowPaymentForm(true);
  }

  async function handlePaymentSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedInvoice || !paymentAmount) return;

    try {
      setProcessingPayment(true);
      await feeService.recordPayment(
        selectedInvoice._id,
        parseFloat(paymentAmount),
        paymentMethod,
        transactionId || undefined
      );
      await loadData();
      setShowPaymentForm(false);
      setSelectedInvoice(null);
      setBanner('Payment recorded successfully');
      setTimeout(() => setBanner(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setProcessingPayment(false);
    }
  }

  async function handleDeleteInvoice(id: string) {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    try {
      await feeService.deleteInvoice(id);
      await loadData();
    } catch (err) {
      setError('Failed to delete invoice');
    }
  }

  const { pendingInvoices, paidInvoices } = useMemo(() => {
    const pendingInvoices = invoices.filter(i => i.status === 'pending' || i.status === 'partial' || i.status === 'overdue');
    const paidInvoices = invoices.filter(i => i.status === 'paid');
    return { pendingInvoices, paidInvoices };
  }, [invoices]);

  const statusColors: Record<InvoiceStatus, string> = {
    pending: 'bg-amber-100 text-amber-700',
    paid: 'bg-emerald-100 text-emerald-700',
    partial: 'bg-blue-100 text-blue-700',
    overdue: 'bg-red-100 text-red-700',
    cancelled: 'bg-slate-100 text-slate-700',
  };

  const filteredStructures = useMemo(() => {
    if (!invoiceForm.classId) return feeStructures;
    return feeStructures.filter(s => s.classId === invoiceForm.classId && s.isActive);
  }, [feeStructures, invoiceForm.classId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Banner */}
      {banner && (
        <div className="bg-white rounded-xl border border-emerald-200 px-4 py-3 flex items-center gap-3 shadow-sm">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <span className="text-emerald-800 font-medium">{banner}</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-white rounded-xl border border-red-200 px-4 py-3 text-red-700 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="p-1 hover:bg-red-100 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Fees & Billing</h1>
            <p className="text-sm text-slate-500">Manage fee structures, invoices, and payments</p>
          </div>
        </div>
        <Button onClick={activeTab === 'invoices' ? handleCreateInvoice : handleAddStructure}>
          <Plus className="w-4 h-4 mr-2" />
          {activeTab === 'invoices' ? 'Create Invoice' : 'Add Fee Structure'}
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Total Invoices</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-slate-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Collected</p>
                <p className="text-2xl font-bold text-slate-900">${stats.totalPaid.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Pending</p>
                <p className="text-2xl font-bold text-slate-900">${stats.totalPending.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Overdue</p>
                <p className="text-2xl font-bold text-slate-900">{stats.overdue}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'invoices'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
          onClick={() => setActiveTab('invoices')}
        >
          <Receipt className="w-4 h-4" />
          Invoices ({invoices.length})
        </button>
        <button
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'structures'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
          onClick={() => setActiveTab('structures')}
        >
          <Wallet className="w-4 h-4" />
          Fee Structures ({feeStructures.length})
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {activeTab === 'invoices' ? (
          invoices.length === 0 ? (
            <div className="p-12 text-center">
              <Receipt className="mx-auto w-16 h-16 text-slate-300" />
              <h3 className="mt-4 text-lg font-medium text-slate-900">No invoices created yet</h3>
              <p className="mt-2 text-sm text-slate-500">Get started by creating your first invoice.</p>
              <div className="mt-6">
                <Button onClick={handleCreateInvoice}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Invoice
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-left">
                    <th className="py-4 px-4 font-semibold text-slate-700">Invoice #</th>
                    <th className="py-4 px-4 font-semibold text-slate-700">Student</th>
                    <th className="py-4 px-4 font-semibold text-slate-700">Amount</th>
                    <th className="py-4 px-4 font-semibold text-slate-700">Paid</th>
                    <th className="py-4 px-4 font-semibold text-slate-700">Due Date</th>
                    <th className="py-4 px-4 font-semibold text-slate-700">Status</th>
                    <th className="py-4 px-4 font-semibold text-slate-700 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map((invoice) => (
                    <tr key={invoice._id} className="group hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4 font-medium font-mono text-slate-900">{invoice.invoiceNumber}</td>
                      <td className="py-4 px-4">
                        {invoice.student ? (
                          <div>
                            <div className="font-medium text-slate-900">
                              {invoice.student.firstName} {invoice.student.lastName}
                            </div>
                            <div className="text-xs text-slate-500">{invoice.student.studentId}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-900">${invoice.totalAmount.toLocaleString()}</td>
                      <td className="py-4 px-4 text-emerald-600 font-medium">${invoice.paidAmount.toLocaleString()}</td>
                      <td className="py-4 px-4 text-slate-600">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${statusColors[invoice.status]}`}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                            <button
                              onClick={() => handleRecordPayment(invoice)}
                              className="px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              Pay
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteInvoice(invoice._id)}
                            className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          feeStructures.length === 0 ? (
            <div className="p-12 text-center">
              <Wallet className="mx-auto w-16 h-16 text-slate-300" />
              <h3 className="mt-4 text-lg font-medium text-slate-900">No fee structures defined yet</h3>
              <p className="mt-2 text-sm text-slate-500">Create fee structures to start generating invoices.</p>
              <div className="mt-6">
                <Button onClick={handleAddStructure}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Fee Structure
                </Button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {feeStructures.map((structure) => (
                <div key={structure._id} className="p-5 group hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-slate-900">
                          {structure.name}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${structure.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                          {structure.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {structure.isRecurring && (
                          <span className="px-2 py-0.5 rounded-lg text-xs font-medium bg-blue-100 text-blue-700 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {structure.frequency}
                          </span>
                        )}
                      </div>
                      {structure.description && (
                        <p className="text-sm text-slate-600 mb-2">{structure.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" />
                          {structure.class?.name || structure.classId}
                        </span>
                        <span>Year: {structure.academicYear}</span>
                        {structure.term && <span>Term: {structure.term}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-slate-900">${structure.amount.toLocaleString()}</div>
                        {structure.dueDate && (
                          <div className="text-xs text-slate-500 flex items-center gap-1 justify-end">
                            <Clock className="w-3 h-3" />
                            Due: {new Date(structure.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditStructure(structure)}
                          className="p-2 rounded-lg hover:bg-blue-100 text-slate-400 hover:text-blue-600 transition-all"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStructure(structure._id)}
                          className="p-2 rounded-lg hover:bg-red-100 text-slate-400 hover:text-red-600 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Create Invoice SlideSheet */}
      <SlideSheet
        isOpen={showInvoiceForm}
        onClose={() => setShowInvoiceForm(false)}
        title="Create Invoice"
        subtitle="Generate a new fee invoice for a student"
        size="xl"
        footer={
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowInvoiceForm(false)}
              className="px-6 py-2.5 rounded-lg text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="invoice-form"
              disabled={submittingInvoice || invoiceForm.items.length === 0}
              className="px-8 py-2.5 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {submittingInvoice ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Receipt className="w-4 h-4" />
                  Create Invoice
                </>
              )}
            </button>
          </div>
        }
      >
        <form id="invoice-form" onSubmit={handleInvoiceSubmit} className="space-y-6">
          {/* Student Selection Section */}
          <SheetSection icon={<Users className="w-4 h-4" />} title="Student Selection">
            <div className="grid grid-cols-2 gap-4">
              <SheetField label="Class" required>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <GraduationCap className="w-4 h-4 text-slate-400" />
                  </div>
                  <select
                    className="w-full border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all hover:border-slate-300 appearance-none cursor-pointer"
                    value={invoiceForm.classId}
                    onChange={(e) => {
                      setInvoiceForm({ ...invoiceForm, classId: e.target.value, studentId: '', items: [] });
                      loadStudentsForClass(e.target.value);
                    }}
                    required
                  >
                    <option value="">Select class</option>
                    {classes.map((c) => (
                      <option key={c._id} value={c._id}>{c.name} ({c.grade})</option>
                    ))}
                  </select>
                </div>
              </SheetField>
              <SheetField label="Student" required>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Users className="w-4 h-4 text-slate-400" />
                  </div>
                  <select
                    className="w-full border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer"
                    value={invoiceForm.studentId}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, studentId: e.target.value })}
                    required
                    disabled={!invoiceForm.classId}
                  >
                    <option value="">Select student</option>
                    {students.map((s) => (
                      <option key={s._id} value={s._id}>{s.firstName} {s.lastName} ({s.studentId})</option>
                    ))}
                  </select>
                </div>
              </SheetField>
            </div>
          </SheetSection>

          {/* Invoice Details Section */}
          <SheetSection icon={<Calendar className="w-4 h-4" />} title="Invoice Details">
            <div className="grid grid-cols-3 gap-4">
              <SheetField label="Academic Year">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <BookOpen className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    className="w-full border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all hover:border-slate-300"
                    value={invoiceForm.academicYear}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, academicYear: e.target.value })}
                  />
                </div>
              </SheetField>
              <SheetField label="Issue Date">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Calendar className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="date"
                    className="w-full border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all hover:border-slate-300"
                    value={invoiceForm.issueDate}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, issueDate: e.target.value })}
                  />
                </div>
              </SheetField>
              <SheetField label="Due Date">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Clock className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="date"
                    className="w-full border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all hover:border-slate-300"
                    value={invoiceForm.dueDate}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                  />
                </div>
              </SheetField>
            </div>
          </SheetSection>

          {/* Fee Items Section */}
          <SheetSection icon={<Receipt className="w-4 h-4" />} title="Fee Items">
            {invoiceForm.classId && (
              <div className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-600 mb-3 font-medium">
                  Available fee structures for this class:
                </p>
                <div className="flex flex-wrap gap-2">
                  {filteredStructures.map((s) => (
                    <button
                      key={s._id}
                      type="button"
                      onClick={() => addFeeItem(s)}
                      disabled={invoiceForm.items.some(i => i.feeStructureId === s._id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        invoiceForm.items.some(i => i.feeStructureId === s._id)
                          ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5 inline mr-1.5" />
                      {s.name} (${s.amount})
                    </button>
                  ))}
                  {filteredStructures.length === 0 && (
                    <p className="text-sm text-slate-500 italic">No fee structures for this class. Create one first.</p>
                  )}
                </div>
              </div>
            )}

            {invoiceForm.items.length > 0 && (
              <div className="space-y-2">
                {invoiceForm.items.map((item) => (
                  <div
                    key={item.feeStructureId}
                    className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg group hover:border-slate-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{item.name}</div>
                        {item.description && <div className="text-xs text-slate-500">{item.description}</div>}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-slate-900 text-lg">${item.amount.toLocaleString()}</span>
                      <button
                        type="button"
                        onClick={() => removeFeeItem(item.feeStructureId)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between pt-4 border-t border-slate-200">
                  <span className="font-medium text-slate-700">Subtotal:</span>
                  <span className="font-bold text-slate-900 text-lg">${invoiceForm.items.reduce((sum, i) => sum + i.amount, 0).toLocaleString()}</span>
                </div>
              </div>
            )}
          </SheetSection>

          {/* Discount Section */}
          <SheetSection icon={<Tag className="w-4 h-4" />} title="Discounts">
            <div className="grid grid-cols-2 gap-4">
              <SheetField label="Discount Amount">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <DollarSign className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="number"
                    className="w-full border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all hover:border-slate-300"
                    value={invoiceForm.discountAmount}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, discountAmount: e.target.value })}
                    min="0"
                  />
                </div>
              </SheetField>
              <SheetField label="Discount Reason">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Tag className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    className="w-full border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all hover:border-slate-300"
                    value={invoiceForm.discountReason}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, discountReason: e.target.value })}
                    placeholder="Scholarship, sibling discount, etc."
                  />
                </div>
              </SheetField>
            </div>
          </SheetSection>

          {/* Total Amount Display */}
          {invoiceForm.items.length > 0 && (
            <div className="p-5 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-lg font-semibold text-slate-900">Total Amount</span>
                </div>
                <span className="text-2xl font-bold text-primary">
                  ${(invoiceForm.items.reduce((sum, i) => sum + i.amount, 0) - (parseFloat(invoiceForm.discountAmount) || 0)).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Remarks Section */}
          <SheetSection icon={<MessageSquare className="w-4 h-4" />} title="Additional Notes">
            <div className="relative">
              <div className="absolute top-3 left-3.5 pointer-events-none">
                <MessageSquare className="w-4 h-4 text-slate-400" />
              </div>
              <textarea
                className="w-full border border-slate-200 rounded-lg pl-10 pr-4 py-3 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all hover:border-slate-300 resize-none"
                rows={3}
                value={invoiceForm.remarks}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, remarks: e.target.value })}
                placeholder="Additional notes or remarks..."
              />
            </div>
          </SheetSection>
        </form>
      </SlideSheet>

      {/* Fee Structure Form SlideSheet */}
      <SlideSheet
        isOpen={showStructureForm}
        onClose={() => setShowStructureForm(false)}
        title={editingStructure ? 'Edit Fee Structure' : 'Add Fee Structure'}
        subtitle={editingStructure ? 'Update fee structure details' : 'Define a new fee type for your school'}
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowStructureForm(false)}
              className="px-6 py-2.5 rounded-lg text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="structure-form"
              disabled={submittingStructure}
              className="px-8 py-2.5 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {submittingStructure ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  {editingStructure ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {editingStructure ? 'Update' : 'Create'}
                </>
              )}
            </button>
          </div>
        }
      >
        <form id="structure-form" onSubmit={handleStructureSubmit} className="space-y-5">
          {/* Basic Info Section */}
          <SheetSection icon={<FileText className="w-4 h-4" />} title="Basic Information">
            <SheetField label="Fee Name" required>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Tag className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  className="w-full border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all hover:border-slate-300"
                  value={structureForm.name}
                  onChange={(e) => setStructureForm({ ...structureForm, name: e.target.value })}
                  placeholder="e.g., Tuition Fee, Lab Fee, etc."
                  required
                />
              </div>
            </SheetField>
          </SheetSection>

          {/* Amount & Class Section */}
          <SheetSection icon={<DollarSign className="w-4 h-4" />} title="Pricing & Assignment">
            <div className="grid grid-cols-2 gap-4">
              <SheetField label="Amount" required>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Banknote className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="number"
                    className="w-full border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all hover:border-slate-300"
                    value={structureForm.amount}
                    onChange={(e) => setStructureForm({ ...structureForm, amount: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>
              </SheetField>
              <SheetField label="Class" required>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <GraduationCap className="w-4 h-4 text-slate-400" />
                  </div>
                  <select
                    className="w-full border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all hover:border-slate-300 appearance-none cursor-pointer"
                    value={structureForm.classId}
                    onChange={(e) => setStructureForm({ ...structureForm, classId: e.target.value })}
                    required
                  >
                    <option value="">Select class</option>
                    {classes.map((c) => (
                      <option key={c._id} value={c._id}>{c.name} ({c.grade})</option>
                    ))}
                  </select>
                </div>
              </SheetField>
            </div>
          </SheetSection>

          {/* Schedule Section */}
          <SheetSection icon={<Calendar className="w-4 h-4" />} title="Schedule">
            <div className="grid grid-cols-2 gap-4">
              <SheetField label="Academic Year">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <BookOpen className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    className="w-full border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all hover:border-slate-300"
                    value={structureForm.academicYear}
                    onChange={(e) => setStructureForm({ ...structureForm, academicYear: e.target.value })}
                  />
                </div>
              </SheetField>
              <SheetField label="Due Date">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Clock className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="date"
                    className="w-full border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all hover:border-slate-300"
                    value={structureForm.dueDate}
                    onChange={(e) => setStructureForm({ ...structureForm, dueDate: e.target.value })}
                  />
                </div>
              </SheetField>
            </div>
          </SheetSection>

          {/* Description Section */}
          <SheetSection icon={<MessageSquare className="w-4 h-4" />} title="Description">
            <div className="relative">
              <div className="absolute top-3 left-3.5 pointer-events-none">
                <MessageSquare className="w-4 h-4 text-slate-400" />
              </div>
              <textarea
                className="w-full border border-slate-200 rounded-lg pl-10 pr-4 py-3 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all hover:border-slate-300 resize-none"
                rows={2}
                value={structureForm.description}
                onChange={(e) => setStructureForm({ ...structureForm, description: e.target.value })}
                placeholder="Fee description..."
              />
            </div>
          </SheetSection>

          {/* Options Section */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-amber-600" />
              </div>
              <h4 className="font-semibold text-slate-900">Options</h4>
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg bg-white border border-slate-200 hover:border-emerald-300 transition-all">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={structureForm.isActive}
                    onChange={(e) => setStructureForm({ ...structureForm, isActive: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-slate-200 rounded-full peer peer-checked:bg-emerald-500 transition-all" />
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm peer-checked:translate-x-4 transition-transform" />
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className={`w-4 h-4 ${structureForm.isActive ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <span className="text-sm font-medium text-slate-700">Active</span>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg bg-white border border-slate-200 hover:border-blue-300 transition-all">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={structureForm.isRecurring}
                    onChange={(e) => setStructureForm({ ...structureForm, isRecurring: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-slate-200 rounded-full peer peer-checked:bg-blue-500 transition-all" />
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm peer-checked:translate-x-4 transition-transform" />
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className={`w-4 h-4 ${structureForm.isRecurring ? 'text-blue-500' : 'text-slate-400'}`} />
                  <span className="text-sm font-medium text-slate-700">Recurring</span>
                </div>
              </label>
            </div>
          </div>

          {structureForm.isRecurring && (
            <SheetSection icon={<TrendingUp className="w-4 h-4" />} title="Frequency">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <TrendingUp className="w-4 h-4 text-slate-400" />
                </div>
                <select
                  className="w-full border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all hover:border-slate-300 appearance-none cursor-pointer"
                  value={structureForm.frequency}
                  onChange={(e) => setStructureForm({ ...structureForm, frequency: e.target.value })}
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="semi-annually">Semi-Annually</option>
                  <option value="annually">Annually</option>
                </select>
              </div>
            </SheetSection>
          )}
        </form>
      </SlideSheet>

      {/* Record Payment SlideSheet */}
      <SlideSheet
        isOpen={showPaymentForm}
        onClose={() => setShowPaymentForm(false)}
        title="Record Payment"
        subtitle={selectedInvoice ? `Invoice: ${selectedInvoice.invoiceNumber}` : ''}
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowPaymentForm(false)}
              className="px-6 py-2.5 rounded-lg text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="payment-form"
              disabled={processingPayment}
              className="px-8 py-2.5 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {processingPayment ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  Record Payment
                </>
              )}
            </button>
          </div>
        }
      >
        {selectedInvoice && (
          <>
            <div className="mb-5 p-4 bg-slate-50 rounded-lg space-y-2">
              <SheetDetailRow label="Invoice" value={selectedInvoice.invoiceNumber} />
              <SheetDetailRow label="Total" value={`$${selectedInvoice.totalAmount.toLocaleString()}`} />
              <SheetDetailRow
                label="Already Paid"
                value={`$${selectedInvoice.paidAmount.toLocaleString()}`}
                valueClassName="text-emerald-600"
              />
              <div className="pt-2 border-t border-slate-200">
                <SheetDetailRow
                  label="Remaining"
                  value={`$${(selectedInvoice.totalAmount - selectedInvoice.paidAmount).toLocaleString()}`}
                  labelClassName="font-medium text-slate-700"
                  valueClassName="font-bold text-amber-600"
                />
              </div>
            </div>

            <form id="payment-form" onSubmit={handlePaymentSubmit} className="space-y-4">
              <SheetField label="Payment Amount" required>
                <input
                  type="number"
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  max={selectedInvoice.totalAmount - selectedInvoice.paidAmount}
                  required
                />
              </SheetField>
              <SheetField label="Payment Method">
                <select
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="online">Online</option>
                  <option value="cheque">Cheque</option>
                </select>
              </SheetField>
              <SheetField label="Transaction ID (optional)">
                <input
                  type="text"
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Reference number..."
                />
              </SheetField>
            </form>
          </>
        )}
      </SlideSheet>
    </section>
  );
}
