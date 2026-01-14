'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { GlassCard, AnimatedStatCard, Icon3D } from '../../../../components/ui';
import { Portal } from '../../../../components/portal';
import {
  DollarSign,
  Receipt,
  CreditCard,
  Plus,
  X,
  Filter,
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
  Hash,
  Percent,
  Banknote,
  Sparkles,
  Building2,
  BookOpen,
  RefreshCw,
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
    pending: 'bg-yellow-100 text-yellow-700',
    paid: 'bg-green-100 text-green-700',
    partial: 'bg-blue-100 text-blue-700',
    overdue: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-700',
  };

  const filteredStructures = useMemo(() => {
    if (!invoiceForm.classId) return feeStructures;
    return feeStructures.filter(s => s.classId === invoiceForm.classId && s.isActive);
  }, [feeStructures, invoiceForm.classId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      {/* Banner */}
      <AnimatePresence>
        {banner && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="glass-strong rounded-xl border border-green-200 px-4 py-3 flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-green-800 font-medium">{banner}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-strong rounded-xl border border-red-200 px-4 py-3 text-red-700 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="p-1 hover:bg-red-100 rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Icon3D gradient="from-yellow-500 to-amber-500" size="lg">
            <DollarSign className="w-6 h-6" />
          </Icon3D>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Fees & Billing</h1>
            <p className="text-sm text-gray-500">Manage fee structures, invoices, and payments</p>
          </div>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={activeTab === 'invoices' ? handleCreateInvoice : handleAddStructure}
            className="shadow-lg shadow-amber-500/25"
          >
            <Plus className="w-4 h-4 mr-2" />
            {activeTab === 'invoices' ? 'Create Invoice' : 'Add Fee Structure'}
          </Button>
        </motion.div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <AnimatedStatCard
            title="Total Invoices"
            value={stats.total}
            icon={<FileText className="w-5 h-5 text-amber-600" />}
            iconBgColor="bg-amber-100"
            delay={0}
          />
          <AnimatedStatCard
            title="Collected"
            value={`$${stats.totalPaid.toLocaleString()}`}
            icon={<CheckCircle className="w-5 h-5 text-green-600" />}
            iconBgColor="bg-green-100"
            delay={1}
          />
          <AnimatedStatCard
            title="Pending"
            value={`$${stats.totalPending.toLocaleString()}`}
            icon={<Clock className="w-5 h-5 text-yellow-600" />}
            iconBgColor="bg-yellow-100"
            delay={2}
          />
          <AnimatedStatCard
            title="Overdue"
            value={stats.overdue}
            icon={<AlertCircle className="w-5 h-5 text-red-600" />}
            iconBgColor="bg-red-100"
            delay={3}
          />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'invoices'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('invoices')}
        >
          <Receipt className="w-4 h-4" />
          Invoices ({invoices.length})
        </motion.button>
        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'structures'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('structures')}
        >
          <Wallet className="w-4 h-4" />
          Fee Structures ({feeStructures.length})
        </motion.button>
      </div>

      {/* Content */}
      <GlassCard hover={false} className="overflow-hidden">
        {activeTab === 'invoices' ? (
          invoices.length === 0 ? (
            <div className="p-12 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <Receipt className="mx-auto w-16 h-16 text-gray-300" />
              </motion.div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No invoices created yet</h3>
              <p className="mt-2 text-sm text-gray-500">Get started by creating your first invoice.</p>
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
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100/80">
                  <tr className="text-left">
                    <th className="py-4 px-4 font-semibold text-gray-700">Invoice #</th>
                    <th className="py-4 px-4 font-semibold text-gray-700">Student</th>
                    <th className="py-4 px-4 font-semibold text-gray-700">Amount</th>
                    <th className="py-4 px-4 font-semibold text-gray-700">Paid</th>
                    <th className="py-4 px-4 font-semibold text-gray-700">Due Date</th>
                    <th className="py-4 px-4 font-semibold text-gray-700">Status</th>
                    <th className="py-4 px-4 font-semibold text-gray-700 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invoices.map((invoice, index) => (
                    <motion.tr
                      key={invoice._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      whileHover={{ backgroundColor: 'rgba(249, 250, 251, 0.8)' }}
                      className="group transition-all"
                    >
                      <td className="py-4 px-4 font-medium font-mono text-gray-900">{invoice.invoiceNumber}</td>
                      <td className="py-4 px-4">
                        {invoice.student ? (
                          <div>
                            <div className="font-medium text-gray-900">
                              {invoice.student.firstName} {invoice.student.lastName}
                            </div>
                            <div className="text-xs text-gray-500">{invoice.student.studentId}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4 font-semibold text-gray-900">${invoice.totalAmount.toLocaleString()}</td>
                      <td className="py-4 px-4 text-green-600 font-medium">${invoice.paidAmount.toLocaleString()}</td>
                      <td className="py-4 px-4 text-gray-600">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${statusColors[invoice.status]}`}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleRecordPayment(invoice)}
                              className="px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-1"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              Pay
                            </motion.button>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDeleteInvoice(invoice._id)}
                            className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          feeStructures.length === 0 ? (
            <div className="p-12 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <Wallet className="mx-auto w-16 h-16 text-gray-300" />
              </motion.div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No fee structures defined yet</h3>
              <p className="mt-2 text-sm text-gray-500">Create fee structures to start generating invoices.</p>
              <div className="mt-6">
                <Button onClick={handleAddStructure}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Fee Structure
                </Button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {feeStructures.map((structure, index) => (
                <motion.div
                  key={structure._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ backgroundColor: 'rgba(249, 250, 251, 0.8)' }}
                  className="p-5 group transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900 group-hover:text-amber-600 transition-colors">
                          {structure.name}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${structure.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
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
                        <p className="text-sm text-gray-600 mb-2">{structure.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
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
                        <div className="text-2xl font-bold text-gray-900">${structure.amount.toLocaleString()}</div>
                        {structure.dueDate && (
                          <div className="text-xs text-gray-500 flex items-center gap-1 justify-end">
                            <Clock className="w-3 h-3" />
                            Due: {new Date(structure.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleEditStructure(structure)}
                          className="p-2 rounded-lg hover:bg-blue-100 text-gray-400 hover:text-blue-600 transition-all"
                        >
                          <Edit className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDeleteStructure(structure._id)}
                          className="p-2 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-600 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )
        )}
      </GlassCard>

      {/* Create Invoice Modal */}
      <AnimatePresence>
        {showInvoiceForm && (
          <Portal>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] flex items-start justify-center overflow-y-auto pt-10 pb-10"
              onClick={() => setShowInvoiceForm(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="relative w-full max-w-3xl mx-4 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Glass morphism container */}
                <div className="relative rounded-3xl bg-white/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/20 overflow-hidden">
                  {/* Gradient Header */}
                  <div className="relative bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 px-6 py-5 overflow-hidden">
                    {/* Animated background patterns */}
                    <motion.div
                      className="absolute inset-0 opacity-30"
                      initial={{ backgroundPosition: '0% 0%' }}
                      animate={{ backgroundPosition: '100% 100%' }}
                      transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
                      style={{
                        backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.2) 0%, transparent 50%)',
                        backgroundSize: '100% 100%',
                      }}
                    />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <motion.div
                          initial={{ rotate: -10, scale: 0 }}
                          animate={{ rotate: 0, scale: 1 }}
                          transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                          className="relative"
                        >
                          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/30 transform rotate-3">
                            <Receipt className="w-7 h-7 text-white drop-shadow-md" />
                          </div>
                          <motion.div
                            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white/30 flex items-center justify-center"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Sparkles className="w-3 h-3 text-white" />
                          </motion.div>
                        </motion.div>
                        <div>
                          <motion.h3
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl font-bold text-white drop-shadow-sm"
                          >
                            Create Invoice
                          </motion.h3>
                          <motion.p
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-sm text-white/80"
                          >
                            Generate a new fee invoice for a student
                          </motion.p>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowInvoiceForm(false)}
                        className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all border border-white/30"
                      >
                        <X className="w-5 h-5 text-white" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Form Content */}
                  <form onSubmit={handleInvoiceSubmit} className="p-6 space-y-6">
                    {/* Student Selection Section */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <Icon3D gradient="from-blue-500 to-cyan-500" size="sm">
                          <Users className="w-4 h-4" />
                        </Icon3D>
                        <h4 className="font-semibold text-gray-900">Student Selection</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="relative group">
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Class *</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <GraduationCap className="w-4 h-4 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
                            </div>
                            <select
                              className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm bg-white/80 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-300 transition-all hover:border-gray-300 appearance-none cursor-pointer"
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
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <motion.div
                                animate={{ rotate: invoiceForm.classId ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </motion.div>
                            </div>
                          </div>
                        </div>
                        <div className="relative group">
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Student *</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <Users className="w-4 h-4 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
                            </div>
                            <select
                              className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm bg-white/80 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-300 transition-all hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer"
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
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Date Information Section */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <Icon3D gradient="from-purple-500 to-pink-500" size="sm">
                          <Calendar className="w-4 h-4" />
                        </Icon3D>
                        <h4 className="font-semibold text-gray-900">Invoice Details</h4>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="relative group">
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Academic Year</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <BookOpen className="w-4 h-4 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                            </div>
                            <input
                              type="text"
                              className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm bg-white/80 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-300 transition-all hover:border-gray-300"
                              value={invoiceForm.academicYear}
                              onChange={(e) => setInvoiceForm({ ...invoiceForm, academicYear: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="relative group">
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Issue Date</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <Calendar className="w-4 h-4 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                            </div>
                            <input
                              type="date"
                              className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm bg-white/80 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-300 transition-all hover:border-gray-300"
                              value={invoiceForm.issueDate}
                              onChange={(e) => setInvoiceForm({ ...invoiceForm, issueDate: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="relative group">
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Due Date</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <Clock className="w-4 h-4 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                            </div>
                            <input
                              type="date"
                              className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm bg-white/80 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-300 transition-all hover:border-gray-300"
                              value={invoiceForm.dueDate}
                              onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Fee Items Section */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="border-t border-gray-100 pt-6"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <Icon3D gradient="from-amber-500 to-orange-500" size="sm">
                          <Receipt className="w-4 h-4" />
                        </Icon3D>
                        <h4 className="font-semibold text-gray-900">Fee Items</h4>
                      </div>

                      {invoiceForm.classId && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mb-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl border border-gray-100"
                        >
                          <p className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            Available fee structures for this class:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {filteredStructures.map((s, index) => (
                              <motion.button
                                key={s._id}
                                type="button"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => addFeeItem(s)}
                                disabled={invoiceForm.items.some(i => i.feeStructureId === s._id)}
                                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm ${
                                  invoiceForm.items.some(i => i.feeStructureId === s._id)
                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed shadow-none'
                                    : 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 hover:from-amber-200 hover:to-yellow-200 border border-amber-200/50'
                                }`}
                              >
                                <Plus className="w-3.5 h-3.5 inline mr-1.5" />
                                {s.name} (${s.amount})
                              </motion.button>
                            ))}
                            {filteredStructures.length === 0 && (
                              <p className="text-sm text-gray-500 italic">No fee structures for this class. Create one first.</p>
                            )}
                          </div>
                        </motion.div>
                      )}

                      <AnimatePresence mode="popLayout">
                        {invoiceForm.items.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-2"
                          >
                            {invoiceForm.items.map((item, index) => (
                              <motion.div
                                key={item.feeStructureId}
                                initial={{ opacity: 0, x: -20, height: 0 }}
                                animate={{ opacity: 1, x: 0, height: 'auto' }}
                                exit={{ opacity: 0, x: 20, height: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl group hover:border-amber-300 hover:shadow-md transition-all"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-yellow-100 flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-amber-600" />
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900">{item.name}</div>
                                    {item.description && <div className="text-xs text-gray-500">{item.description}</div>}
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className="font-bold text-gray-900 text-lg">${item.amount.toLocaleString()}</span>
                                  <motion.button
                                    type="button"
                                    whileHover={{ scale: 1.2, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => removeFeeItem(item.feeStructureId)}
                                    className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                  >
                                    <X className="w-4 h-4" />
                                  </motion.button>
                                </div>
                              </motion.div>
                            ))}
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="flex justify-between pt-4 border-t border-gray-200"
                            >
                              <span className="font-medium text-gray-700">Subtotal:</span>
                              <span className="font-bold text-gray-900 text-lg">${invoiceForm.items.reduce((sum, i) => sum + i.amount, 0).toLocaleString()}</span>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    {/* Discount Section */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <Icon3D gradient="from-green-500 to-emerald-500" size="sm">
                          <Percent className="w-4 h-4" />
                        </Icon3D>
                        <h4 className="font-semibold text-gray-900">Discounts</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="relative group">
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Discount Amount</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <DollarSign className="w-4 h-4 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                            </div>
                            <input
                              type="number"
                              className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm bg-white/80 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-green-500/50 focus:border-green-300 transition-all hover:border-gray-300"
                              value={invoiceForm.discountAmount}
                              onChange={(e) => setInvoiceForm({ ...invoiceForm, discountAmount: e.target.value })}
                              min="0"
                            />
                          </div>
                        </div>
                        <div className="relative group">
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Discount Reason</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <Tag className="w-4 h-4 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                            </div>
                            <input
                              type="text"
                              className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm bg-white/80 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-green-500/50 focus:border-green-300 transition-all hover:border-gray-300"
                              value={invoiceForm.discountReason}
                              onChange={(e) => setInvoiceForm({ ...invoiceForm, discountReason: e.target.value })}
                              placeholder="Scholarship, sibling discount, etc."
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Total Amount Display */}
                    <AnimatePresence>
                      {invoiceForm.items.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 20, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -20, scale: 0.95 }}
                          className="relative p-5 rounded-2xl overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 opacity-10" />
                          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-yellow-50" />
                          <motion.div
                            className="absolute inset-0 opacity-50"
                            animate={{
                              background: [
                                'radial-gradient(circle at 0% 0%, rgba(251,191,36,0.3) 0%, transparent 50%)',
                                'radial-gradient(circle at 100% 100%, rgba(251,191,36,0.3) 0%, transparent 50%)',
                                'radial-gradient(circle at 0% 0%, rgba(251,191,36,0.3) 0%, transparent 50%)',
                              ],
                            }}
                            transition={{ duration: 4, repeat: Infinity }}
                          />
                          <div className="relative flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                                <DollarSign className="w-6 h-6 text-white" />
                              </div>
                              <span className="text-lg font-semibold text-amber-800">Total Amount</span>
                            </div>
                            <motion.span
                              key={invoiceForm.items.reduce((sum, i) => sum + i.amount, 0) - (parseFloat(invoiceForm.discountAmount) || 0)}
                              initial={{ scale: 1.2, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="text-2xl font-bold text-amber-700"
                            >
                              ${(invoiceForm.items.reduce((sum, i) => sum + i.amount, 0) - (parseFloat(invoiceForm.discountAmount) || 0)).toLocaleString()}
                            </motion.span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Remarks Section */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <Icon3D gradient="from-gray-500 to-slate-500" size="sm">
                          <MessageSquare className="w-4 h-4" />
                        </Icon3D>
                        <h4 className="font-semibold text-gray-900">Additional Notes</h4>
                      </div>
                      <div className="relative group">
                        <div className="absolute top-3.5 left-3.5 pointer-events-none">
                          <MessageSquare className="w-4 h-4 text-gray-400 group-focus-within:text-gray-500 transition-colors" />
                        </div>
                        <textarea
                          className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm bg-white/80 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-gray-500/50 focus:border-gray-300 transition-all hover:border-gray-300 resize-none"
                          rows={3}
                          value={invoiceForm.remarks}
                          onChange={(e) => setInvoiceForm({ ...invoiceForm, remarks: e.target.value })}
                          placeholder="Additional notes or remarks..."
                        />
                      </div>
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      className="flex justify-end gap-3 pt-6 border-t border-gray-100"
                    >
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowInvoiceForm(false)}
                        className="px-6 py-3 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        type="submit"
                        disabled={submittingInvoice || invoiceForm.items.length === 0}
                        whileHover={{ scale: 1.02, boxShadow: '0 10px 40px rgba(251, 191, 36, 0.3)' }}
                        whileTap={{ scale: 0.98 }}
                        className="relative px-8 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-500/25 overflow-hidden group"
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                          initial={{ x: '-100%' }}
                          whileHover={{ x: '100%' }}
                          transition={{ duration: 0.5 }}
                        />
                        <span className="relative flex items-center gap-2">
                          {submittingInvoice ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              >
                                <RefreshCw className="w-4 h-4" />
                              </motion.div>
                              Creating...
                            </>
                          ) : (
                            <>
                              <Receipt className="w-4 h-4" />
                              Create Invoice
                            </>
                          )}
                        </span>
                      </motion.button>
                    </motion.div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>

      {/* Fee Structure Form Modal */}
      <AnimatePresence>
        {showStructureForm && (
          <Portal>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] flex items-start justify-center overflow-y-auto pt-20 pb-20"
              onClick={() => setShowStructureForm(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="relative w-full max-w-xl mx-4 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Glass morphism container */}
                <div className="relative rounded-3xl bg-white/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/20 overflow-hidden">
                  {/* Gradient Header */}
                  <div className="relative bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 px-6 py-5 overflow-hidden">
                    {/* Animated background patterns */}
                    <motion.div
                      className="absolute inset-0 opacity-30"
                      animate={{
                        backgroundPosition: ['0% 0%', '100% 100%'],
                      }}
                      transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
                      style={{
                        backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(255,255,255,0.2) 0%, transparent 50%)',
                        backgroundSize: '100% 100%',
                      }}
                    />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <motion.div
                          initial={{ rotate: -10, scale: 0 }}
                          animate={{ rotate: 0, scale: 1 }}
                          transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                          className="relative"
                        >
                          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/30 transform -rotate-3">
                            <Wallet className="w-7 h-7 text-white drop-shadow-md" />
                          </div>
                          <motion.div
                            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white/30 flex items-center justify-center"
                            animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                            transition={{ duration: 3, repeat: Infinity }}
                          >
                            <Sparkles className="w-3 h-3 text-white" />
                          </motion.div>
                        </motion.div>
                        <div>
                          <motion.h3
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl font-bold text-white drop-shadow-sm"
                          >
                            {editingStructure ? 'Edit Fee Structure' : 'Add Fee Structure'}
                          </motion.h3>
                          <motion.p
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-sm text-white/80"
                          >
                            {editingStructure ? 'Update fee structure details' : 'Define a new fee type for your school'}
                          </motion.p>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowStructureForm(false)}
                        className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all border border-white/30"
                      >
                        <X className="w-5 h-5 text-white" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Form Content */}
                  <form onSubmit={handleStructureSubmit} className="p-6 space-y-5">
                    {/* Basic Info Section */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <Icon3D gradient="from-violet-500 to-purple-500" size="sm">
                          <FileText className="w-4 h-4" />
                        </Icon3D>
                        <h4 className="font-semibold text-gray-900">Basic Information</h4>
                      </div>
                      <div className="relative group">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Fee Name *</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <Tag className="w-4 h-4 text-gray-400 group-focus-within:text-violet-500 transition-colors" />
                          </div>
                          <input
                            type="text"
                            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm bg-white/80 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-300 transition-all hover:border-gray-300"
                            value={structureForm.name}
                            onChange={(e) => setStructureForm({ ...structureForm, name: e.target.value })}
                            placeholder="e.g., Tuition Fee, Lab Fee, etc."
                            required
                          />
                        </div>
                      </div>
                    </motion.div>

                    {/* Amount & Class Section */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <Icon3D gradient="from-emerald-500 to-green-500" size="sm">
                          <DollarSign className="w-4 h-4" />
                        </Icon3D>
                        <h4 className="font-semibold text-gray-900">Pricing & Assignment</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="relative group">
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount *</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <Banknote className="w-4 h-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                            </div>
                            <input
                              type="number"
                              className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm bg-white/80 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-300 transition-all hover:border-gray-300"
                              value={structureForm.amount}
                              onChange={(e) => setStructureForm({ ...structureForm, amount: e.target.value })}
                              placeholder="0.00"
                              required
                            />
                          </div>
                        </div>
                        <div className="relative group">
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Class *</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <GraduationCap className="w-4 h-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                            </div>
                            <select
                              className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm bg-white/80 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-300 transition-all hover:border-gray-300 appearance-none cursor-pointer"
                              value={structureForm.classId}
                              onChange={(e) => setStructureForm({ ...structureForm, classId: e.target.value })}
                              required
                            >
                              <option value="">Select class</option>
                              {classes.map((c) => (
                                <option key={c._id} value={c._id}>{c.name} ({c.grade})</option>
                              ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Schedule Section */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <Icon3D gradient="from-blue-500 to-cyan-500" size="sm">
                          <Calendar className="w-4 h-4" />
                        </Icon3D>
                        <h4 className="font-semibold text-gray-900">Schedule</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="relative group">
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Academic Year</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <BookOpen className="w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            <input
                              type="text"
                              className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm bg-white/80 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 transition-all hover:border-gray-300"
                              value={structureForm.academicYear}
                              onChange={(e) => setStructureForm({ ...structureForm, academicYear: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="relative group">
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Due Date</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <Clock className="w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            <input
                              type="date"
                              className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm bg-white/80 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 transition-all hover:border-gray-300"
                              value={structureForm.dueDate}
                              onChange={(e) => setStructureForm({ ...structureForm, dueDate: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Description Section */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <Icon3D gradient="from-gray-500 to-slate-500" size="sm">
                          <MessageSquare className="w-4 h-4" />
                        </Icon3D>
                        <h4 className="font-semibold text-gray-900">Description</h4>
                      </div>
                      <div className="relative group">
                        <div className="absolute top-3.5 left-3.5 pointer-events-none">
                          <MessageSquare className="w-4 h-4 text-gray-400 group-focus-within:text-gray-500 transition-colors" />
                        </div>
                        <textarea
                          className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm bg-white/80 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-gray-500/50 focus:border-gray-300 transition-all hover:border-gray-300 resize-none"
                          rows={2}
                          value={structureForm.description}
                          onChange={(e) => setStructureForm({ ...structureForm, description: e.target.value })}
                          placeholder="Fee description..."
                        />
                      </div>
                    </motion.div>

                    {/* Options Section */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="p-4 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl border border-gray-100"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <Icon3D gradient="from-amber-500 to-orange-500" size="sm">
                          <Sparkles className="w-4 h-4" />
                        </Icon3D>
                        <h4 className="font-semibold text-gray-900">Options</h4>
                      </div>
                      <div className="flex items-center gap-6">
                        <motion.label
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-white border border-gray-200 hover:border-green-300 transition-all"
                        >
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={structureForm.isActive}
                              onChange={(e) => setStructureForm({ ...structureForm, isActive: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-green-400 peer-checked:to-emerald-500 transition-all" />
                            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm peer-checked:translate-x-4 transition-transform" />
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className={`w-4 h-4 ${structureForm.isActive ? 'text-green-500' : 'text-gray-400'}`} />
                            <span className="text-sm font-medium text-gray-700">Active</span>
                          </div>
                        </motion.label>
                        <motion.label
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-white border border-gray-200 hover:border-blue-300 transition-all"
                        >
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={structureForm.isRecurring}
                              onChange={(e) => setStructureForm({ ...structureForm, isRecurring: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-blue-400 peer-checked:to-cyan-500 transition-all" />
                            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm peer-checked:translate-x-4 transition-transform" />
                          </div>
                          <div className="flex items-center gap-2">
                            <RefreshCw className={`w-4 h-4 ${structureForm.isRecurring ? 'text-blue-500' : 'text-gray-400'}`} />
                            <span className="text-sm font-medium text-gray-700">Recurring</span>
                          </div>
                        </motion.label>
                      </div>
                    </motion.div>

                    <AnimatePresence>
                      {structureForm.isRecurring && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="flex items-center gap-2 mb-4">
                            <Icon3D gradient="from-cyan-500 to-blue-500" size="sm">
                              <TrendingUp className="w-4 h-4" />
                            </Icon3D>
                            <h4 className="font-semibold text-gray-900">Frequency</h4>
                          </div>
                          <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <RefreshCw className="w-4 h-4 text-gray-400 group-focus-within:text-cyan-500 transition-colors" />
                            </div>
                            <select
                              className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm bg-white/80 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-300 transition-all hover:border-gray-300 appearance-none cursor-pointer"
                              value={structureForm.frequency}
                              onChange={(e) => setStructureForm({ ...structureForm, frequency: e.target.value })}
                            >
                              <option value="monthly">Monthly</option>
                              <option value="quarterly">Quarterly</option>
                              <option value="semi-annually">Semi-Annually</option>
                              <option value="annually">Annually</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Action Buttons */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      className="flex justify-end gap-3 pt-6 border-t border-gray-100"
                    >
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowStructureForm(false)}
                        className="px-6 py-3 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        type="submit"
                        disabled={submittingStructure}
                        whileHover={{ scale: 1.02, boxShadow: '0 10px 40px rgba(139, 92, 246, 0.3)' }}
                        whileTap={{ scale: 0.98 }}
                        className="relative px-8 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-500/25 overflow-hidden group"
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                          initial={{ x: '-100%' }}
                          whileHover={{ x: '100%' }}
                          transition={{ duration: 0.5 }}
                        />
                        <span className="relative flex items-center gap-2">
                          {submittingStructure ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              >
                                <RefreshCw className="w-4 h-4" />
                              </motion.div>
                              Saving...
                            </>
                          ) : (
                            <>
                              {editingStructure ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                              {editingStructure ? 'Update' : 'Create'}
                            </>
                          )}
                        </span>
                      </motion.button>
                    </motion.div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>

      {/* Record Payment Modal */}
      <AnimatePresence>
        {showPaymentForm && selectedInvoice && (
          <Portal>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center"
              onClick={() => setShowPaymentForm(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="relative glass-strong rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Icon3D gradient="from-green-500 to-emerald-500" size="md">
                      <CreditCard className="w-5 h-5" />
                    </Icon3D>
                    <h3 className="text-lg font-bold text-gray-900">Record Payment</h3>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowPaymentForm(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </motion.button>
                </div>

                <div className="mb-5 p-4 bg-gray-50 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Invoice:</span>
                    <span className="font-mono font-medium">{selectedInvoice.invoiceNumber}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-medium">${selectedInvoice.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Already Paid:</span>
                    <span className="font-medium text-green-600">${selectedInvoice.paidAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200">
                    <span className="font-medium text-gray-700">Remaining:</span>
                    <span className="font-bold text-amber-600">
                      ${(selectedInvoice.totalAmount - selectedInvoice.paidAmount).toLocaleString()}
                    </span>
                  </div>
                </div>

                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Payment Amount *</label>
                    <input
                      type="number"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white/80 text-gray-900 focus:ring-2 focus:ring-green-500/50 focus:border-green-300 transition-all"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      max={selectedInvoice.totalAmount - selectedInvoice.paidAmount}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Payment Method</label>
                    <select
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white/80 text-gray-900 focus:ring-2 focus:ring-green-500/50 focus:border-green-300 transition-all"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="online">Online</option>
                      <option value="cheque">Cheque</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Transaction ID (optional)</label>
                    <input
                      type="text"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white/80 text-gray-900 focus:ring-2 focus:ring-green-500/50 focus:border-green-300 transition-all"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="Reference number..."
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <Button type="button" variant="outline" onClick={() => setShowPaymentForm(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={processingPayment}>
                      {processingPayment ? 'Processing...' : 'Record Payment'}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
