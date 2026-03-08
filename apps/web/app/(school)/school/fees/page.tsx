'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { SchoolStatCard, SchoolStatusBadge, FormModal, ConfirmModal, useToast } from '../../../../components/school';
import {
  DollarSign,
  Plus,
  X,
  Trash2,
  Edit,
  FileText,
  Clock,
  AlertTriangle,
  Users,
  Search,
  Download,
  ChevronRight,
  ArrowLeft,
  Eye,
  Loader2,
  AlertCircle,
  Receipt,
  CreditCard,
  Calendar,
  Tag,
  Banknote,
  Send,
} from 'lucide-react';

// ──────────────────────────────────────────
// Types & Defaults
// ──────────────────────────────────────────
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
  category: 'fixed' | 'optional';
}

interface AdditionalFeeFormData {
  feeType: string;
  amount: string;
  description: string;
  dueDate: string;
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
  category: 'fixed',
};

const defaultAdditionalFeeForm: AdditionalFeeFormData = {
  feeType: '',
  amount: '',
  description: '',
  dueDate: '',
};

// ──────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────
const sectionBadgeColors = [
  { bg: 'bg-blue-100', text: 'text-blue-700', ring: 'ring-blue-200' },
  { bg: 'bg-emerald-100', text: 'text-emerald-700', ring: 'ring-emerald-200' },
  { bg: 'bg-orange-100', text: 'text-orange-700', ring: 'ring-orange-200' },
  { bg: 'bg-pink-100', text: 'text-pink-700', ring: 'ring-pink-200' },
  { bg: 'bg-purple-100', text: 'text-purple-700', ring: 'ring-purple-200' },
  { bg: 'bg-teal-100', text: 'text-teal-700', ring: 'ring-teal-200' },
];

const feeBreakdownColors = [
  { bg: 'bg-[#824ef2]', light: 'bg-purple-50 border-purple-200', label: 'text-[#824ef2]' },
  { bg: 'bg-blue-500', light: 'bg-blue-50 border-blue-200', label: 'text-blue-600' },
  { bg: 'bg-emerald-500', light: 'bg-emerald-50 border-emerald-200', label: 'text-emerald-600' },
  { bg: 'bg-orange-500', light: 'bg-orange-50 border-orange-200', label: 'text-orange-600' },
  { bg: 'bg-pink-500', light: 'bg-pink-50 border-pink-200', label: 'text-pink-600' },
  { bg: 'bg-amber-500', light: 'bg-amber-50 border-amber-200', label: 'text-amber-600' },
];

// ──────────────────────────────────────────
// Component
// ──────────────────────────────────────────
export default function FeesPage() {
  const { showToast } = useToast();

  // ── Core data ──
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<InvoiceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Main tab ──
  const [activeTab, setActiveTab] = useState<'invoices' | 'setup'>('invoices');

  // ── Invoice search / filters ──
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // ── Drill-down state (for Fees & Invoice tab) ──
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [feeView, setFeeView] = useState<'main' | 'sections' | 'students'>('main');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedStudentInvoice, setSelectedStudentInvoice] = useState<Invoice | null>(null);
  const [showPaymentHistoryModal, setShowPaymentHistoryModal] = useState(false);
  const [classStudents, setClassStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // ── Invoice form state ──
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState<InvoiceFormData>(defaultInvoiceForm);
  const [submittingInvoice, setSubmittingInvoice] = useState(false);

  // ── Fee structure form state ──
  const [showStructureForm, setShowStructureForm] = useState(false);
  const [editingStructure, setEditingStructure] = useState<FeeStructure | null>(null);
  const [structureForm, setStructureForm] = useState<FeeStructureFormData>(defaultFeeStructureForm);
  const [submittingStructure, setSubmittingStructure] = useState(false);

  // ── Additional Fee modal ──
  const [showAdditionalFeeModal, setShowAdditionalFeeModal] = useState(false);
  const [additionalFeeForm, setAdditionalFeeForm] = useState<AdditionalFeeFormData>(defaultAdditionalFeeForm);
  const [submittingAdditionalFee, setSubmittingAdditionalFee] = useState(false);

  // ── Payment form state ──
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [transactionId, setTransactionId] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);

  // ── Confirm modal ──
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; type: 'invoice' | 'structure'; id: string }>({
    open: false,
    type: 'invoice',
    id: '',
  });

  // ── Setup Fees tab state ──
  const [setupSelectedClassId, setSetupSelectedClassId] = useState('');
  const [setupSelectedSection, setSetupSelectedSection] = useState('all');

  // ──────────────────────────────────────────
  // Data Loading
  // ──────────────────────────────────────────
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

  async function loadClassStudents(classId: string) {
    setLoadingStudents(true);
    try {
      const studentsData = await studentService.getStudentsByClass(classId);
      setClassStudents(studentsData);
    } catch (err) {
      console.error('Failed to load students', err);
    } finally {
      setLoadingStudents(false);
    }
  }

  // ──────────────────────────────────────────
  // Drill-down handlers
  // ──────────────────────────────────────────
  function handleClassRowClick(classId: string) {
    setSelectedClassId(classId);
    setSelectedSection(null);
    loadClassStudents(classId);
    setFeeView('sections');
  }

  function handleSectionClick(section: string | null) {
    setSelectedSection(section);
    setFeeView('students');
  }

  function goBackToFeeMain() {
    setFeeView('main');
    setSelectedClassId(null);
    setSelectedSection(null);
  }

  function goBackToFeeSections() {
    setFeeView('sections');
    setSelectedSection(null);
  }

  function handleViewPaymentHistory(invoice: Invoice) {
    setSelectedStudentInvoice(invoice);
    setShowPaymentHistoryModal(true);
  }

  // ──────────────────────────────────────────
  // Invoice handlers
  // ──────────────────────────────────────────
  function handleOpenAddFeeModal() {
    setInvoiceForm(defaultInvoiceForm);
    setShowInvoiceForm(true);
  }

  async function handleInvoiceSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!invoiceForm.studentId || !invoiceForm.classId || invoiceForm.items.length === 0) {
      showToast('error', 'Please select student, class, and add at least one fee item');
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
      showToast('success', 'Invoice created successfully');
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to create invoice');
    } finally {
      setSubmittingInvoice(false);
    }
  }

  function addFeeItem(structure: FeeStructure) {
    const exists = invoiceForm.items.find(item => item.feeStructureId === structure._id);
    if (exists) return;
    setInvoiceForm(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          feeStructureId: structure._id,
          name: structure.name,
          amount: structure.amount,
          description: structure.description || '',
        },
      ],
    }));
  }

  function removeFeeItem(feeStructureId: string) {
    setInvoiceForm(prev => ({
      ...prev,
      items: prev.items.filter(item => item.feeStructureId !== feeStructureId),
    }));
  }

  const filteredStructuresForInvoice = useMemo(() => {
    if (!invoiceForm.classId) return feeStructures;
    return feeStructures.filter(s => s.classId === invoiceForm.classId && s.isActive);
  }, [feeStructures, invoiceForm.classId]);

  // ──────────────────────────────────────────
  // Fee Structure handlers
  // ──────────────────────────────────────────
  function handleAddStructure() {
    setEditingStructure(null);
    setStructureForm({ ...defaultFeeStructureForm, classId: setupSelectedClassId, category: 'fixed' });
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
      category: structure.isRecurring ? 'optional' : 'fixed',
    });
    setShowStructureForm(false);
  }

  async function handleStructureSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!structureForm.name.trim() || !structureForm.amount) {
      showToast('error', 'Please fill in required fields');
      return;
    }
    try {
      setSubmittingStructure(true);
      const data: CreateFeeStructureDto = {
        name: structureForm.name,
        amount: parseFloat(structureForm.amount),
        classId: structureForm.classId || setupSelectedClassId,
        academicYear: structureForm.academicYear || new Date().getFullYear().toString(),
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
      showToast('success', editingStructure ? 'Fee structure updated' : 'Fee structure created');
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to save fee structure');
    } finally {
      setSubmittingStructure(false);
    }
  }

  // ──────────────────────────────────────────
  // Additional Fee handlers
  // ──────────────────────────────────────────
  async function handleAdditionalFeeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!additionalFeeForm.feeType || !additionalFeeForm.amount) {
      showToast('error', 'Please fill in fee type and amount');
      return;
    }
    try {
      setSubmittingAdditionalFee(true);
      const data: CreateFeeStructureDto = {
        name: additionalFeeForm.feeType,
        amount: parseFloat(additionalFeeForm.amount),
        classId: setupSelectedClassId || (classes[0]?._id ?? ''),
        academicYear: new Date().getFullYear().toString(),
        description: additionalFeeForm.description || undefined,
        isActive: true,
        dueDate: additionalFeeForm.dueDate || undefined,
        isRecurring: false,
      };
      await feeService.createFeeStructure(data);
      await loadData();
      setShowAdditionalFeeModal(false);
      setAdditionalFeeForm(defaultAdditionalFeeForm);
      showToast('success', 'Additional fee added successfully');
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to add fee');
    } finally {
      setSubmittingAdditionalFee(false);
    }
  }

  // ──────────────────────────────────────────
  // Delete handlers
  // ──────────────────────────────────────────
  function handleDeleteStructureClick(id: string) {
    setConfirmModal({ open: true, type: 'structure', id });
  }

  function handleDeleteInvoiceClick(id: string) {
    setConfirmModal({ open: true, type: 'invoice', id });
  }

  async function handleConfirmDelete() {
    try {
      if (confirmModal.type === 'structure') {
        await feeService.deleteFeeStructure(confirmModal.id);
        showToast('success', 'Fee structure deleted');
      } else {
        await feeService.deleteInvoice(confirmModal.id);
        showToast('success', 'Invoice deleted');
      }
      await loadData();
    } catch (err) {
      showToast('error', `Failed to delete ${confirmModal.type}`);
    } finally {
      setConfirmModal({ open: false, type: 'invoice', id: '' });
    }
  }

  // ──────────────────────────────────────────
  // Payment handlers
  // ──────────────────────────────────────────
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
      showToast('success', 'Payment recorded successfully');
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to record payment');
    } finally {
      setProcessingPayment(false);
    }
  }

  // ──────────────────────────────────────────
  // Computed data
  // ──────────────────────────────────────────
  const classFeeSummary = useMemo(() => {
    return classes.map((cls, idx) => {
      const classInvoices = invoices.filter(
        i => i.classId === cls._id || (i as any).class?._id === cls._id
      );
      const total = classInvoices.reduce((s, i) => s + i.totalAmount, 0);
      const collected = classInvoices.reduce((s, i) => s + i.paidAmount, 0);
      const pending = total - collected;
      const studentCount = classInvoices.length;
      const progress = total > 0 ? Math.round((collected / total) * 100) : 0;
      return { cls, total, collected, pending, studentCount, progress, index: idx };
    });
  }, [classes, invoices]);

  const filteredClassFeeSummary = useMemo(() => {
    let result = classFeeSummary;
    if (filterClass) {
      result = result.filter(c => c.cls._id === filterClass);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => c.cls.name.toLowerCase().includes(q));
    }
    return result;
  }, [classFeeSummary, filterClass, searchQuery]);

  // For the selected class in drill-down: get invoices
  const selectedClassInvoices = useMemo(() => {
    if (!selectedClassId) return [];
    let filtered = invoices.filter(
      i => i.classId === selectedClassId || (i as any).class?._id === selectedClassId
    );
    if (filterStatus) {
      filtered = filtered.filter(i => i.status === filterStatus);
    }
    return filtered;
  }, [invoices, selectedClassId, filterStatus]);

  // For the students modal: filter by section if selected
  const sectionFilteredInvoices = useMemo(() => {
    if (!selectedSection) return selectedClassInvoices;
    // We filter by checking the student data -- section info is in the class data
    // Since sections are stored as strings in the class, we approximate by index
    return selectedClassInvoices;
  }, [selectedClassInvoices, selectedSection]);

  // Setup Fees: categorized structures
  const setupStructures = useMemo(() => {
    let filtered = feeStructures;
    if (setupSelectedClassId) {
      filtered = filtered.filter(s => s.classId === setupSelectedClassId);
    }
    return filtered;
  }, [feeStructures, setupSelectedClassId]);

  const fixedFees = useMemo(() => setupStructures.filter(s => !s.isRecurring), [setupStructures]);
  const optionalFees = useMemo(() => setupStructures.filter(s => s.isRecurring), [setupStructures]);
  const totalFixedAmount = useMemo(() => fixedFees.reduce((s, f) => s + f.amount, 0), [fixedFees]);
  const totalOptionalAmount = useMemo(() => optionalFees.reduce((s, f) => s + f.amount, 0), [optionalFees]);

  // ──────────────────────────────────────────
  // Render: Loading
  // ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-[#824ef2] animate-spin" />
      </div>
    );
  }

  const selectedClassData = classes.find(c => c._id === selectedClassId);

  // ──────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────
  return (
    <section className="space-y-6">
      {/* Error Banner */}
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

      {/* Stat Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SchoolStatCard
            icon={<DollarSign className="w-5 h-5" />}
            color="green"
            label="Total Collected"
            value={`$${stats.totalPaid.toLocaleString()}`}
            subtitle="+12.5% from last month"
          />
          <SchoolStatCard
            icon={<Clock className="w-5 h-5" />}
            color="orange"
            label="Pending Amount"
            value={`$${stats.totalPending.toLocaleString()}`}
            subtitle={`${stats.pending} students pending`}
          />
          <SchoolStatCard
            icon={<Users className="w-5 h-5" />}
            color="blue"
            label="Total Students"
            value={stats.total.toLocaleString()}
            subtitle="All enrolled students"
          />
          <SchoolStatCard
            icon={<AlertTriangle className="w-5 h-5" />}
            color="red"
            label="Overdue Amount"
            value={`$${(stats.totalAmount - stats.totalPaid - stats.totalPending + stats.totalPending).toLocaleString()}`}
            subtitle={`${stats.overdue} students overdue`}
          />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        <button
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'invoices'
              ? 'border-[#824ef2] text-[#824ef2]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
          onClick={() => setActiveTab('invoices')}
        >
          Fees & Invoice
        </button>
        <button
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'setup'
              ? 'border-[#824ef2] text-[#824ef2]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
          onClick={() => setActiveTab('setup')}
        >
          Setup Fees
        </button>
      </div>

      {/* ════════════════════════════════════════ */}
      {/* TAB 1: Fees & Invoice                   */}
      {/* ════════════════════════════════════════ */}
      {activeTab === 'invoices' && feeView === 'main' && (
        <>
          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by student name / ID..."
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] transition-all hover:border-slate-300"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] transition-all hover:border-slate-300"
              value={filterClass}
              onChange={e => setFilterClass(e.target.value)}
            >
              <option value="">All Classes</option>
              {classes.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            <select
              className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] transition-all hover:border-slate-300"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
            <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={handleOpenAddFeeModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Fee
            </button>
          </div>

          {/* Class-wise Fee Overview */}
          <h3 className="text-lg font-semibold text-slate-900">Class-wise Fee Overview</h3>
          <p className="text-sm text-slate-500">Select a class to view section-level fee details.</p>

          {filteredClassFeeSummary.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <Receipt className="mx-auto w-14 h-14 text-slate-300" />
              <h3 className="mt-4 text-lg font-medium text-slate-900">No fee data available</h3>
              <p className="mt-2 text-sm text-slate-500">Create invoices to see class-wise fee overview.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Class</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Sections</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Students</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Total</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Collected</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Pending</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Progress</th>
                    <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredClassFeeSummary.map(({ cls, total, collected, pending, studentCount, progress, index }) => (
                    <tr
                      key={cls._id}
                      onClick={() => handleClassRowClick(cls._id)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-[#824ef2] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {index + 1}
                          </div>
                          <span className="text-sm font-semibold text-slate-900">{cls.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">{cls.sections.length}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{studentCount}</td>
                      <td className="px-5 py-4 text-sm font-medium text-slate-900">${total.toLocaleString()}</td>
                      <td className="px-5 py-4 text-sm font-medium text-emerald-600">${collected.toLocaleString()}</td>
                      <td className="px-5 py-4 text-sm font-medium text-orange-600">${pending.toLocaleString()}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden w-20">
                            <div className="h-full bg-[#824ef2] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-[#824ef2]">{progress}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <ChevronRight className="w-5 h-5 text-slate-300 inline-block" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ════════════════════════════════════════ */}
      {/* INLINE: Sections View (Level 2)          */}
      {/* ════════════════════════════════════════ */}
      {activeTab === 'invoices' && feeView === 'sections' && selectedClassData && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <button onClick={goBackToFeeMain} className="hover:text-[#824ef2] transition-colors">Fees & Invoice</button>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-900 font-medium">{selectedClassData.name}</span>
          </div>
          <button
            onClick={goBackToFeeMain}
            className="text-sm text-[#824ef2] hover:underline flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Classes
          </button>

          <h2 className="text-lg font-semibold text-slate-900">{selectedClassData.name} - Sections</h2>
          <p className="text-sm text-slate-500">Select a section to view student-level fee details.</p>

          {/* Sections Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Section</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Students</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Total</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Collected</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Pending</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Progress</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* All Sections row */}
                {(() => {
                  const total = selectedClassInvoices.reduce((s, i) => s + i.totalAmount, 0);
                  const collected = selectedClassInvoices.reduce((s, i) => s + i.paidAmount, 0);
                  const pending = total - collected;
                  const pct = total > 0 ? Math.round((collected / total) * 100) : 0;
                  return (
                    <tr
                      onClick={() => handleSectionClick(null)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#824ef2]/10 flex items-center justify-center">
                            <Users className="w-4 h-4 text-[#824ef2]" />
                          </div>
                          <span className="text-sm font-semibold text-slate-900">All Sections</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">{selectedClassInvoices.length}</td>
                      <td className="px-5 py-4 text-sm font-medium text-slate-900">${total.toLocaleString()}</td>
                      <td className="px-5 py-4 text-sm font-medium text-emerald-600">${collected.toLocaleString()}</td>
                      <td className="px-5 py-4 text-sm font-medium text-orange-600">${pending.toLocaleString()}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden w-20">
                            <div className="h-full bg-[#824ef2] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-[#824ef2]">{pct}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-sm text-[#824ef2] font-medium flex items-center justify-end gap-1">
                          <Eye className="w-3.5 h-3.5" /> View
                        </span>
                      </td>
                    </tr>
                  );
                })()}
                {/* Individual Section rows */}
                {selectedClassData.sections.map((section, idx) => {
                  const color = sectionBadgeColors[idx % sectionBadgeColors.length]!;
                  const total = selectedClassInvoices.reduce((s, i) => s + i.totalAmount, 0);
                  const collected = selectedClassInvoices.reduce((s, i) => s + i.paidAmount, 0);
                  const pending = total - collected;
                  const pct = total > 0 ? Math.round((collected / total) * 100) : 0;
                  return (
                    <tr
                      key={section}
                      onClick={() => handleSectionClick(section)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full ${color.bg} flex items-center justify-center`}>
                            <span className={`text-sm font-bold ${color.text}`}>{section}</span>
                          </div>
                          <span className="text-sm font-medium text-slate-900">Section {section}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">{selectedClassInvoices.length}</td>
                      <td className="px-5 py-4 text-sm font-medium text-slate-900">${total.toLocaleString()}</td>
                      <td className="px-5 py-4 text-sm font-medium text-emerald-600">${collected.toLocaleString()}</td>
                      <td className="px-5 py-4 text-sm font-medium text-orange-600">${pending.toLocaleString()}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden w-20">
                            <div className="h-full bg-[#824ef2] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-[#824ef2]">{pct}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-sm text-[#824ef2] font-medium flex items-center justify-end gap-1">
                          <Eye className="w-3.5 h-3.5" /> View
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════ */}
      {/* TAB 2: Setup Fees                       */}
      {/* ════════════════════════════════════════ */}
      {activeTab === 'setup' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Fee Structure Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Class & Section Selection */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-base font-semibold text-slate-900 mb-4">Create Fee Structure</h3>

              {/* Class tabs */}
              <div className="flex flex-wrap gap-2 mb-4">
                {classes.map(cls => (
                  <button
                    key={cls._id}
                    onClick={() => { setSetupSelectedClassId(cls._id); setSetupSelectedSection('all'); }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      setupSelectedClassId === cls._id
                        ? 'bg-[#824ef2] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cls.name}
                  </button>
                ))}
              </div>

              {/* Section tabs */}
              {setupSelectedClassId && (() => {
                const selectedCls = classes.find(c => c._id === setupSelectedClassId);
                if (!selectedCls) return null;
                return (
                  <div className="flex flex-wrap gap-2 mb-4">
                    <button
                      onClick={() => setSetupSelectedSection('all')}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        setupSelectedSection === 'all'
                          ? 'bg-[#824ef2]/10 text-[#824ef2] ring-1 ring-[#824ef2]/30'
                          : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      All Sections
                    </button>
                    {selectedCls.sections.map(sec => (
                      <button
                        key={sec}
                        onClick={() => setSetupSelectedSection(sec)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                          setupSelectedSection === sec
                            ? 'bg-[#824ef2]/10 text-[#824ef2] ring-1 ring-[#824ef2]/30'
                            : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        Section {sec}
                      </button>
                    ))}
                  </div>
                );
              })()}

              {/* Academic Year */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Academic Year</label>
                <select className="w-full max-w-xs border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] transition-all hover:border-slate-300">
                  <option>{new Date().getFullYear()}-{new Date().getFullYear() + 1}</option>
                  <option>{new Date().getFullYear() - 1}-{new Date().getFullYear()}</option>
                </select>
              </div>
            </div>

            {/* Fixed Fees */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-semibold text-slate-900">Fixed Fees</h3>
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-700">Required</span>
                </div>
                <span className="text-sm font-semibold text-slate-900">Total: ${totalFixedAmount.toLocaleString()}</span>
              </div>
              <div className="divide-y divide-slate-100">
                {fixedFees.length === 0 ? (
                  <div className="p-6 text-center text-sm text-slate-400">No fixed fees defined yet.</div>
                ) : (
                  fixedFees.map(fee => (
                    editingStructure?._id === fee._id ? (
                      <form key={fee._id} onSubmit={handleStructureSubmit} className="px-5 py-3 space-y-3 bg-slate-50">
                        <div className="grid grid-cols-3 gap-3">
                          <input type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2]" value={structureForm.name} onChange={e => setStructureForm({ ...structureForm, name: e.target.value })} placeholder="Fee Name *" required />
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
                            <input type="number" className="w-full border border-slate-200 rounded-lg pl-7 pr-3 py-2 text-sm bg-white focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2]" value={structureForm.amount} onChange={e => setStructureForm({ ...structureForm, amount: e.target.value })} placeholder="0.00" required />
                          </div>
                          <input type="date" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2]" value={structureForm.dueDate} onChange={e => setStructureForm({ ...structureForm, dueDate: e.target.value })} />
                        </div>
                        <div className="flex items-center gap-2">
                          <button type="submit" disabled={submittingStructure} className="px-4 py-1.5 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] disabled:opacity-50">{submittingStructure ? 'Saving...' : 'Save'}</button>
                          <button type="button" onClick={() => { setEditingStructure(null); setStructureForm(defaultFeeStructureForm); }} className="px-4 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-800">Cancel</button>
                        </div>
                      </form>
                    ) : (
                      <div key={fee._id} className="flex items-center gap-4 px-5 py-3.5 group hover:bg-slate-50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900">{fee.name}</p>
                        </div>
                        <div className="text-sm font-semibold text-slate-900 w-28 text-right">
                          ${fee.amount.toLocaleString()}
                        </div>
                        <div className="w-28">
                          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600">
                            {fee.frequency || 'One-time'}
                          </span>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditStructure(fee)}
                            className="p-1.5 rounded-lg hover:bg-blue-100 text-slate-400 hover:text-blue-600 transition-all"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteStructureClick(fee._id)}
                            className="p-1.5 rounded-lg hover:bg-red-100 text-slate-400 hover:text-red-600 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )
                  ))
                )}
              </div>
              <div className="px-5 py-3 border-t border-slate-100">
                {showStructureForm && structureForm.category === 'fixed' && !editingStructure ? (
                  <form onSubmit={handleStructureSubmit} className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <input
                          type="text"
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] transition-all hover:border-slate-300"
                          value={structureForm.name}
                          onChange={e => setStructureForm({ ...structureForm, name: e.target.value })}
                          placeholder="Fee Name *"
                          required
                        />
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
                        <input
                          type="number"
                          className="w-full border border-slate-200 rounded-lg pl-7 pr-3 py-2 text-sm bg-white focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] transition-all hover:border-slate-300"
                          value={structureForm.amount}
                          onChange={e => setStructureForm({ ...structureForm, amount: e.target.value })}
                          placeholder="0.00"
                          required
                        />
                      </div>
                      <div>
                        <input
                          type="date"
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] transition-all hover:border-slate-300"
                          value={structureForm.dueDate}
                          onChange={e => setStructureForm({ ...structureForm, dueDate: e.target.value })}
                          placeholder="Due Date"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        disabled={submittingStructure}
                        className="px-4 py-1.5 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors disabled:opacity-50"
                      >
                        {submittingStructure ? 'Saving...' : 'Add'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowStructureForm(false); setStructureForm(defaultFeeStructureForm); }}
                        className="px-4 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => {
                      setStructureForm({ ...defaultFeeStructureForm, classId: setupSelectedClassId, category: 'fixed' });
                      setEditingStructure(null);
                      setShowStructureForm(true);
                    }}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[#824ef2] hover:text-[#6b3fd4] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add New Fixed Fee
                  </button>
                )}
              </div>
            </div>

            {/* Optional Fees */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-semibold text-slate-900">Optional Fees</h3>
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-pink-100 text-pink-700">Optional</span>
                </div>
                <span className="text-sm font-semibold text-slate-900">Total: ${totalOptionalAmount.toLocaleString()}</span>
              </div>
              <div className="divide-y divide-slate-100">
                {optionalFees.length === 0 ? (
                  <div className="p-6 text-center text-sm text-slate-400">No optional fees defined yet.</div>
                ) : (
                  optionalFees.map(fee => (
                    editingStructure?._id === fee._id ? (
                      <form key={fee._id} onSubmit={handleStructureSubmit} className="px-5 py-3 space-y-3 bg-slate-50">
                        <div className="grid grid-cols-3 gap-3">
                          <input type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2]" value={structureForm.name} onChange={e => setStructureForm({ ...structureForm, name: e.target.value })} placeholder="Fee Name *" required />
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
                            <input type="number" className="w-full border border-slate-200 rounded-lg pl-7 pr-3 py-2 text-sm bg-white focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2]" value={structureForm.amount} onChange={e => setStructureForm({ ...structureForm, amount: e.target.value })} placeholder="0.00" required />
                          </div>
                          <input type="date" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2]" value={structureForm.dueDate} onChange={e => setStructureForm({ ...structureForm, dueDate: e.target.value })} />
                        </div>
                        <div className="flex items-center gap-2">
                          <button type="submit" disabled={submittingStructure} className="px-4 py-1.5 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] disabled:opacity-50">{submittingStructure ? 'Saving...' : 'Save'}</button>
                          <button type="button" onClick={() => { setEditingStructure(null); setStructureForm(defaultFeeStructureForm); }} className="px-4 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-800">Cancel</button>
                        </div>
                      </form>
                    ) : (
                      <div key={fee._id} className="flex items-center gap-4 px-5 py-3.5 group hover:bg-slate-50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900">{fee.name}</p>
                        </div>
                        <div className="text-sm font-semibold text-slate-900 w-28 text-right">
                          ${fee.amount.toLocaleString()}
                        </div>
                        <div className="w-28">
                          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600">
                            {fee.frequency || 'One-time'}
                          </span>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditStructure(fee)}
                            className="p-1.5 rounded-lg hover:bg-blue-100 text-slate-400 hover:text-blue-600 transition-all"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteStructureClick(fee._id)}
                            className="p-1.5 rounded-lg hover:bg-red-100 text-slate-400 hover:text-red-600 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )
                  ))
                )}
              </div>
              <div className="px-5 py-3 border-t border-slate-100">
                {showStructureForm && structureForm.category === 'optional' && !editingStructure ? (
                  <form onSubmit={handleStructureSubmit} className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <input
                          type="text"
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] transition-all hover:border-slate-300"
                          value={structureForm.name}
                          onChange={e => setStructureForm({ ...structureForm, name: e.target.value })}
                          placeholder="Fee Name *"
                          required
                        />
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
                        <input
                          type="number"
                          className="w-full border border-slate-200 rounded-lg pl-7 pr-3 py-2 text-sm bg-white focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] transition-all hover:border-slate-300"
                          value={structureForm.amount}
                          onChange={e => setStructureForm({ ...structureForm, amount: e.target.value })}
                          placeholder="0.00"
                          required
                        />
                      </div>
                      <div>
                        <input
                          type="date"
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] transition-all hover:border-slate-300"
                          value={structureForm.dueDate}
                          onChange={e => setStructureForm({ ...structureForm, dueDate: e.target.value })}
                          placeholder="Due Date"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        disabled={submittingStructure}
                        className="px-4 py-1.5 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors disabled:opacity-50"
                      >
                        {submittingStructure ? 'Saving...' : 'Add'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowStructureForm(false); setStructureForm(defaultFeeStructureForm); }}
                        className="px-4 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => {
                      setStructureForm({ ...defaultFeeStructureForm, classId: setupSelectedClassId, category: 'optional', isRecurring: true });
                      setEditingStructure(null);
                      setShowStructureForm(true);
                    }}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[#824ef2] hover:text-[#6b3fd4] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add optional fee
                  </button>
                )}
              </div>
            </div>

            {/* Preview Invoice Button */}
            <div className="flex justify-end">
              <button className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors">
                <FileText className="w-4 h-4" />
                Preview Invoice
              </button>
            </div>
          </div>

          {/* Right: Fee Breakdown Donut Chart */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-base font-semibold text-slate-900 mb-4">Fee Breakdown</h3>
              {/* Donut Chart */}
              <div className="flex items-center justify-center mb-6">
                <div className="relative w-40 h-40">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    {totalFixedAmount + totalOptionalAmount > 0 ? (
                      <>
                        <circle
                          cx="18" cy="18" r="14"
                          fill="none"
                          stroke="#824ef2"
                          strokeWidth="4"
                          strokeDasharray={`${(totalFixedAmount / (totalFixedAmount + totalOptionalAmount)) * 88} 88`}
                          strokeLinecap="round"
                        />
                        <circle
                          cx="18" cy="18" r="14"
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth="4"
                          strokeDasharray={`${(totalOptionalAmount / (totalFixedAmount + totalOptionalAmount)) * 88} 88`}
                          strokeDashoffset={`-${(totalFixedAmount / (totalFixedAmount + totalOptionalAmount)) * 88}`}
                          strokeLinecap="round"
                        />
                      </>
                    ) : (
                      <circle
                        cx="18" cy="18" r="14"
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="4"
                      />
                    )}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-bold text-slate-900">
                      ${(totalFixedAmount + totalOptionalAmount).toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400">Total</span>
                  </div>
                </div>
              </div>
              {/* Legend */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#824ef2]" />
                    <span className="text-sm text-slate-600">Fixed Fees</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">${totalFixedAmount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-sm text-slate-600">Optional Fees</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">${totalOptionalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-base font-semibold text-slate-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setShowAdditionalFeeModal(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-slate-200 hover:border-[#824ef2]/30 hover:bg-[#824ef2]/5 transition-all text-left"
                >
                  <div className="p-2 rounded-lg bg-purple-100">
                    <Plus className="w-4 h-4 text-[#824ef2]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Add Additional Fee</p>
                    <p className="text-xs text-slate-400">Add a one-time or special fee</p>
                  </div>
                </button>
                <button
                  onClick={handleAddStructure}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-slate-200 hover:border-[#824ef2]/30 hover:bg-[#824ef2]/5 transition-all text-left"
                >
                  <div className="p-2 rounded-lg bg-blue-100">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Create Fee Structure</p>
                    <p className="text-xs text-slate-400">Define a new fee template</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* ════════════════════════════════════════ */}
      {/* INLINE: Students Table (Level 3)         */}
      {/* ════════════════════════════════════════ */}
      {activeTab === 'invoices' && feeView === 'students' && selectedClassData && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <button onClick={goBackToFeeMain} className="hover:text-[#824ef2] transition-colors">Fees & Invoice</button>
            <ChevronRight className="w-4 h-4" />
            <button onClick={goBackToFeeSections} className="hover:text-[#824ef2] transition-colors">{selectedClassData.name}</button>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-900 font-medium">{selectedSection ? `Section ${selectedSection}` : 'All Students'}</span>
          </div>
          <button
            onClick={goBackToFeeSections}
            className="text-sm text-[#824ef2] hover:underline flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sections
          </button>

          <h2 className="text-lg font-semibold text-slate-900">
            {selectedSection ? `${selectedClassData.name} - Section ${selectedSection}` : `${selectedClassData.name} - All Students`}
          </h2>

          {sectionFilteredInvoices.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
              <Users className="mx-auto w-12 h-12 text-slate-300" />
              <p className="mt-3 text-sm text-slate-500">No invoices found for this selection.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr className="text-left">
                      <th className="py-3 px-4 font-semibold text-slate-700">Student</th>
                      <th className="py-3 px-4 font-semibold text-slate-700">Roll No</th>
                      <th className="py-3 px-4 font-semibold text-slate-700">Academic Fee</th>
                      <th className="py-3 px-4 font-semibold text-slate-700">Add-on Fees</th>
                      <th className="py-3 px-4 font-semibold text-slate-700">Total</th>
                      <th className="py-3 px-4 font-semibold text-slate-700">Paid</th>
                      <th className="py-3 px-4 font-semibold text-slate-700">Pending</th>
                      <th className="py-3 px-4 font-semibold text-slate-700">Status</th>
                      <th className="py-3 px-4 font-semibold text-slate-700 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sectionFilteredInvoices.map(invoice => {
                      const academicItems = invoice.items.filter(
                        (_, idx) => idx === 0
                      );
                      const addonItems = invoice.items.slice(1);
                      const academicFee = academicItems.reduce((s, it) => s + it.amount, 0);
                      const pendingAmt = invoice.totalAmount - invoice.paidAmount;

                      return (
                        <tr key={invoice._id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4">
                            {invoice.student ? (
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-[#824ef2] text-xs font-semibold">
                                  {invoice.student.firstName?.[0]}{invoice.student.lastName?.[0]}
                                </div>
                                <div>
                                  <div className="font-medium text-slate-900">
                                    {invoice.student.firstName} {invoice.student.lastName}
                                  </div>
                                  <div className="text-xs text-slate-400">{invoice.student.email}</div>
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {invoice.student?.studentId || '-'}
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-900">
                            ${academicFee.toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            {addonItems.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {addonItems.map((item, i) => (
                                  <span key={i} className="text-xs text-blue-600 hover:underline cursor-pointer">
                                    {item.name}{i < addonItems.length - 1 ? ',' : ''}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">None</span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            ${invoice.totalAmount.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 font-medium text-emerald-600">
                            ${invoice.paidAmount.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 font-medium text-orange-600">
                            ${pendingAmt.toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <SchoolStatusBadge value={invoice.status} />
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleViewPaymentHistory(invoice)}
                              className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-[#824ef2] transition-all"
                              title="View Payment History"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════ */}
      {/* MODAL: Payment History (Level 4)        */}
      {/* ════════════════════════════════════════ */}
      <FormModal
        open={showPaymentHistoryModal}
        onClose={() => setShowPaymentHistoryModal(false)}
        title={
          selectedStudentInvoice?.student
            ? `Payment History - ${selectedStudentInvoice.student.firstName} ${selectedStudentInvoice.student.lastName}`
            : 'Payment History'
        }
        size="lg"
        footer={
          <>
            <button
              onClick={() => {
                showToast('info', 'Receipt download initiated');
              }}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Receipt
            </button>
            <button
              onClick={() => {
                showToast('info', 'Reminder sent');
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send Reminder
            </button>
          </>
        }
      >
        {selectedStudentInvoice && (
          <div className="space-y-6">
            {/* Summary Boxes */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                <p className="text-xs text-slate-400 mb-1">Total Fees</p>
                <p className="text-xl font-bold text-slate-900">
                  ${selectedStudentInvoice.totalAmount.toLocaleString()}
                </p>
              </div>
              <div className="rounded-xl border border-orange-200 p-4 bg-orange-50">
                <p className="text-xs text-orange-500 mb-1">Pending</p>
                <p className="text-xl font-bold text-orange-700">
                  ${(selectedStudentInvoice.totalAmount - selectedStudentInvoice.paidAmount).toLocaleString()}
                </p>
              </div>
              <div className="rounded-xl border border-red-200 p-4 bg-red-50">
                <p className="text-xs text-red-500 mb-1">Due Fees</p>
                <p className="text-xl font-bold text-red-700">
                  ${(selectedStudentInvoice.status === 'overdue' ? selectedStudentInvoice.totalAmount - selectedStudentInvoice.paidAmount : 0).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Fee Breakdown */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-3">Fee Breakdown</h4>
              <div className="grid grid-cols-2 gap-3">
                {selectedStudentInvoice.items.map((item, idx) => {
                  const color = feeBreakdownColors[idx % feeBreakdownColors.length]!;
                  return (
                    <div key={idx} className={`rounded-lg border p-3 ${color.light}`}>
                      <p className={`text-xs font-medium ${color.label} mb-1`}>{item.name}</p>
                      <p className="text-lg font-bold text-slate-900">${item.amount.toLocaleString()}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Transaction History */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-3">Transaction History</h4>
              {selectedStudentInvoice.paidAmount > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-4 p-3 rounded-lg border border-slate-200 bg-white">
                    <div className="p-2 rounded-lg bg-emerald-100">
                      <Banknote className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">
                        Payment - {selectedStudentInvoice.paymentMethod || 'N/A'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {selectedStudentInvoice.paidDate
                          ? new Date(selectedStudentInvoice.paidDate).toLocaleDateString()
                          : 'Date not recorded'}
                        {selectedStudentInvoice.transactionId && ` | Txn: ${selectedStudentInvoice.transactionId}`}
                      </p>
                    </div>
                    <span className="font-semibold text-emerald-600">
                      +${selectedStudentInvoice.paidAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-lg border border-dashed border-slate-200 text-center">
                  <p className="text-sm text-slate-400">No payments recorded yet.</p>
                </div>
              )}
            </div>

            {/* Record Payment Button */}
            {selectedStudentInvoice.status !== 'paid' && selectedStudentInvoice.status !== 'cancelled' && (
              <button
                onClick={() => {
                  handleRecordPayment(selectedStudentInvoice);
                  setShowPaymentHistoryModal(false);
                }}
                className="w-full py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                Record Payment
              </button>
            )}
          </div>
        )}
      </FormModal>

      {/* ════════════════════════════════════════ */}
      {/* MODAL: Create Invoice (Add Fee)         */}
      {/* ════════════════════════════════════════ */}
      <FormModal
        open={showInvoiceForm}
        onClose={() => setShowInvoiceForm(false)}
        title="Create Invoice"
        size="xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowInvoiceForm(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="invoice-form"
              disabled={submittingInvoice || invoiceForm.items.length === 0}
              className="px-6 py-2 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {submittingInvoice ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
              ) : (
                <><Receipt className="w-4 h-4" /> Create Invoice</>
              )}
            </button>
          </>
        }
      >
        <form id="invoice-form" onSubmit={handleInvoiceSubmit} className="space-y-5">
          {/* Student Selection */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-600" />
              Student Selection
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Class <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] transition-all hover:border-slate-300"
                  value={invoiceForm.classId}
                  onChange={e => {
                    setInvoiceForm({ ...invoiceForm, classId: e.target.value, studentId: '', items: [] });
                    loadStudentsForClass(e.target.value);
                  }}
                  required
                >
                  <option value="">Select class</option>
                  {classes.map(c => (
                    <option key={c._id} value={c._id}>{c.name} ({c.grade})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Student <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] transition-all hover:border-slate-300 disabled:opacity-50"
                  value={invoiceForm.studentId}
                  onChange={e => setInvoiceForm({ ...invoiceForm, studentId: e.target.value })}
                  required
                  disabled={!invoiceForm.classId}
                >
                  <option value="">Select student</option>
                  {students.map(s => (
                    <option key={s._id || s.id} value={s._id || s.id}>
                      {s.firstName} {s.lastName} ({s.studentId})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-600" />
              Invoice Details
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Academic Year</label>
                <input
                  type="text"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] transition-all hover:border-slate-300"
                  value={invoiceForm.academicYear}
                  onChange={e => setInvoiceForm({ ...invoiceForm, academicYear: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Issue Date</label>
                <input
                  type="date"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] transition-all hover:border-slate-300"
                  value={invoiceForm.issueDate}
                  onChange={e => setInvoiceForm({ ...invoiceForm, issueDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Due Date</label>
                <input
                  type="date"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] transition-all hover:border-slate-300"
                  value={invoiceForm.dueDate}
                  onChange={e => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Fee Items */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-slate-600" />
              Fee Items
            </h4>
            {invoiceForm.classId && (
              <div className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-600 mb-3 font-medium">Available fee structures:</p>
                <div className="flex flex-wrap gap-2">
                  {filteredStructuresForInvoice.map(s => (
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
                  {filteredStructuresForInvoice.length === 0 && (
                    <p className="text-sm text-slate-500 italic">No fee structures for this class.</p>
                  )}
                </div>
              </div>
            )}

            {invoiceForm.items.length > 0 && (
              <div className="space-y-2">
                {invoiceForm.items.map(item => (
                  <div
                    key={item.feeStructureId}
                    className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-slate-900 text-sm">{item.name}</div>
                      {item.description && <div className="text-xs text-slate-500">{item.description}</div>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-900">${item.amount.toLocaleString()}</span>
                      <button
                        type="button"
                        onClick={() => removeFeeItem(item.feeStructureId)}
                        className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between pt-3 border-t border-slate-200">
                  <span className="font-medium text-slate-700">Subtotal:</span>
                  <span className="font-bold text-slate-900">
                    ${invoiceForm.items.reduce((sum, i) => sum + i.amount, 0).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Discount */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-slate-600" />
              Discounts
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Discount Amount</label>
                <input
                  type="number"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] transition-all hover:border-slate-300"
                  value={invoiceForm.discountAmount}
                  onChange={e => setInvoiceForm({ ...invoiceForm, discountAmount: e.target.value })}
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Discount Reason</label>
                <input
                  type="text"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] transition-all hover:border-slate-300"
                  value={invoiceForm.discountReason}
                  onChange={e => setInvoiceForm({ ...invoiceForm, discountReason: e.target.value })}
                  placeholder="Scholarship, sibling discount, etc."
                />
              </div>
            </div>
          </div>

          {/* Total */}
          {invoiceForm.items.length > 0 && (
            <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-slate-900">Total Amount</span>
                <span className="text-2xl font-bold text-[#824ef2]">
                  ${(
                    invoiceForm.items.reduce((sum, i) => sum + i.amount, 0) -
                    (parseFloat(invoiceForm.discountAmount) || 0)
                  ).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Remarks</label>
            <textarea
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] transition-all hover:border-slate-300 resize-none"
              rows={2}
              value={invoiceForm.remarks}
              onChange={e => setInvoiceForm({ ...invoiceForm, remarks: e.target.value })}
              placeholder="Additional notes..."
            />
          </div>
        </form>
      </FormModal>


      {/* ════════════════════════════════════════ */}
      {/* MODAL: Add Additional Fee               */}
      {/* ════════════════════════════════════════ */}
      <FormModal
        open={showAdditionalFeeModal}
        onClose={() => setShowAdditionalFeeModal(false)}
        title="Add Additional Fee"
        size="md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowAdditionalFeeModal(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="additional-fee-form"
              disabled={submittingAdditionalFee}
              className="px-6 py-2 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {submittingAdditionalFee ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Adding...</>
              ) : (
                <><Plus className="w-4 h-4" /> Add Fee</>
              )}
            </button>
          </>
        }
      >
        <form id="additional-fee-form" onSubmit={handleAdditionalFeeSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Fee Type</label>
            <select
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] transition-all hover:border-slate-300"
              value={additionalFeeForm.feeType}
              onChange={e => setAdditionalFeeForm({ ...additionalFeeForm, feeType: e.target.value })}
              required
            >
              <option value="">Select fee type</option>
              <option value="Transport Fee">Transport Fee</option>
              <option value="Hostel Fee">Hostel Fee</option>
              <option value="Library Fee">Library Fee</option>
              <option value="Sports Fee">Sports Fee</option>
              <option value="Lab Fee">Lab Fee</option>
              <option value="Uniform Fee">Uniform Fee</option>
              <option value="Exam Fee">Exam Fee</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
              <input
                type="number"
                className="w-full border border-slate-200 rounded-lg pl-7 pr-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] transition-all hover:border-slate-300"
                value={additionalFeeForm.amount}
                onChange={e => setAdditionalFeeForm({ ...additionalFeeForm, amount: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] transition-all hover:border-slate-300 resize-none"
              rows={3}
              value={additionalFeeForm.description}
              onChange={e => setAdditionalFeeForm({ ...additionalFeeForm, description: e.target.value })}
              placeholder="Fee description..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Due Date</label>
            <input
              type="date"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] transition-all hover:border-slate-300"
              value={additionalFeeForm.dueDate}
              onChange={e => setAdditionalFeeForm({ ...additionalFeeForm, dueDate: e.target.value })}
            />
          </div>
        </form>
      </FormModal>

      {/* ════════════════════════════════════════ */}
      {/* MODAL: Record Payment                   */}
      {/* ════════════════════════════════════════ */}
      <FormModal
        open={showPaymentForm}
        onClose={() => setShowPaymentForm(false)}
        title="Record Payment"
        size="md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowPaymentForm(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="payment-form"
              disabled={processingPayment}
              className="px-6 py-2 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {processingPayment ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
              ) : (
                <><CreditCard className="w-4 h-4" /> Record Payment</>
              )}
            </button>
          </>
        }
      >
        {selectedInvoice && (
          <>
            <div className="mb-5 p-4 bg-slate-50 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Invoice</span>
                <span className="font-medium text-slate-900">{selectedInvoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total</span>
                <span className="font-medium text-slate-900">${selectedInvoice.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Already Paid</span>
                <span className="font-medium text-emerald-600">${selectedInvoice.paidAmount.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm">
                <span className="font-medium text-slate-700">Remaining</span>
                <span className="font-bold text-amber-600">
                  ${(selectedInvoice.totalAmount - selectedInvoice.paidAmount).toLocaleString()}
                </span>
              </div>
            </div>

            <form id="payment-form" onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Payment Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] transition-all"
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(e.target.value)}
                  max={selectedInvoice.totalAmount - selectedInvoice.paidAmount}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Payment Method</label>
                <select
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] transition-all"
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="online">Online</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Transaction ID (optional)</label>
                <input
                  type="text"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] transition-all"
                  value={transactionId}
                  onChange={e => setTransactionId(e.target.value)}
                  placeholder="Reference number..."
                />
              </div>
            </form>
          </>
        )}
      </FormModal>

      {/* ════════════════════════════════════════ */}
      {/* Confirm Delete Modal                    */}
      {/* ════════════════════════════════════════ */}
      <ConfirmModal
        open={confirmModal.open}
        title={`Delete ${confirmModal.type === 'structure' ? 'Fee Structure' : 'Invoice'}`}
        message={`Are you sure you want to delete this ${confirmModal.type === 'structure' ? 'fee structure' : 'invoice'}? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmColor="red"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmModal({ open: false, type: 'invoice', id: '' })}
      />
    </section>
  );
}
