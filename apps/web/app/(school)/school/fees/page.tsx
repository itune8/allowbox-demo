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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {banner && (
        <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800 px-4 py-2 rounded animate-fade-in">
          {banner}
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Fees & Billing</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage fee structures, invoices, and payments
          </p>
        </div>
        <Button onClick={activeTab === 'invoices' ? handleCreateInvoice : handleAddStructure}>
          {activeTab === 'invoices' ? '+ Create Invoice' : '+ Add Fee Structure'}
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</div>
            <div className="text-sm text-gray-500">Total Invoices</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="text-2xl font-bold text-green-600">${stats.totalPaid.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Collected</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="text-2xl font-bold text-yellow-600">${stats.totalPending.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Pending</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <div className="text-sm text-gray-500">Overdue</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800">
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'invoices'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('invoices')}
        >
          Invoices ({invoices.length})
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'structures'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('structures')}
        >
          Fee Structures ({feeStructures.length})
        </button>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        {activeTab === 'invoices' ? (
          invoices.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <div className="text-4xl mb-3">💰</div>
              <p>No invoices created yet.</p>
              <Button className="mt-4" onClick={handleCreateInvoice}>Create First Invoice</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr className="text-left text-gray-500 dark:text-gray-400">
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Paid</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {invoices.map((invoice) => (
                    <tr key={invoice._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3 px-4 font-medium">{invoice.invoiceNumber}</td>
                      <td className="py-3 px-4">
                        {invoice.student ? (
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {invoice.student.firstName} {invoice.student.lastName}
                            </div>
                            <div className="text-xs text-gray-500">{invoice.student.studentId}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium">${invoice.totalAmount.toLocaleString()}</td>
                      <td className="py-3 px-4 text-green-600">${invoice.paidAmount.toLocaleString()}</td>
                      <td className="py-3 px-4">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-xs ${statusColors[invoice.status]}`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                            <Button variant="outline" size="sm" onClick={() => handleRecordPayment(invoice)}>
                              Pay
                            </Button>
                          )}
                          <Button variant="outline" size="sm" onClick={() => handleDeleteInvoice(invoice._id)} className="text-red-600">
                            Delete
                          </Button>
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
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <div className="text-4xl mb-3">📋</div>
              <p>No fee structures defined yet.</p>
              <Button className="mt-4" onClick={handleAddStructure}>Add First Fee Structure</Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {feeStructures.map((structure) => (
                <div key={structure._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">{structure.name}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs ${structure.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                          {structure.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {structure.isRecurring && (
                          <span className="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700">
                            Recurring ({structure.frequency})
                          </span>
                        )}
                      </div>
                      {structure.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{structure.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>Class: {structure.class?.name || structure.classId}</span>
                        <span>Year: {structure.academicYear}</span>
                        {structure.term && <span>Term: {structure.term}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900 dark:text-gray-100">${structure.amount.toLocaleString()}</div>
                        {structure.dueDate && (
                          <div className="text-xs text-gray-500">Due: {new Date(structure.dueDate).toLocaleDateString()}</div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditStructure(structure)}>Edit</Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteStructure(structure._id)} className="text-red-600">Delete</Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Create Invoice Modal */}
      {showInvoiceForm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={() => setShowInvoiceForm(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 animate-zoom-in">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Create Invoice</h3>
            <form onSubmit={handleInvoiceSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Class *</label>
                  <select
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
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
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Student *</label>
                  <select
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
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
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Academic Year</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    value={invoiceForm.academicYear}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, academicYear: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Issue Date</label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    value={invoiceForm.issueDate}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, issueDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    value={invoiceForm.dueDate}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Fee Items</h4>
                </div>

                {invoiceForm.classId && (
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Available fee structures for this class:</p>
                    <div className="flex flex-wrap gap-2">
                      {filteredStructures.map((s) => (
                        <button
                          key={s._id}
                          type="button"
                          onClick={() => addFeeItem(s)}
                          disabled={invoiceForm.items.some(i => i.feeStructureId === s._id)}
                          className={`px-3 py-1.5 rounded-lg text-sm ${
                            invoiceForm.items.some(i => i.feeStructureId === s._id)
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                          }`}
                        >
                          {s.name} (${s.amount})
                        </button>
                      ))}
                      {filteredStructures.length === 0 && (
                        <p className="text-sm text-gray-500">No fee structures for this class. Create one first.</p>
                      )}
                    </div>
                  </div>
                )}

                {invoiceForm.items.length > 0 && (
                  <div className="space-y-2">
                    {invoiceForm.items.map((item) => (
                      <div key={item.feeStructureId} className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">{item.name}</div>
                          {item.description && <div className="text-xs text-gray-500">{item.description}</div>}
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-medium">${item.amount.toLocaleString()}</span>
                          <button
                            type="button"
                            onClick={() => removeFeeItem(item.feeStructureId)}
                            className="text-red-500 hover:text-red-700"
                          >
                            X
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span className="font-medium">Subtotal:</span>
                      <span className="font-bold">${invoiceForm.items.reduce((sum, i) => sum + i.amount, 0).toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Discount Amount</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    value={invoiceForm.discountAmount}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, discountAmount: e.target.value })}
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Discount Reason</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    value={invoiceForm.discountReason}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, discountReason: e.target.value })}
                    placeholder="Scholarship, sibling discount, etc."
                  />
                </div>
              </div>

              {invoiceForm.items.length > 0 && (
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                  <div className="flex justify-between text-lg font-bold text-indigo-700 dark:text-indigo-300">
                    <span>Total Amount:</span>
                    <span>
                      ${(invoiceForm.items.reduce((sum, i) => sum + i.amount, 0) - (parseFloat(invoiceForm.discountAmount) || 0)).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Remarks</label>
                <textarea
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  rows={2}
                  value={invoiceForm.remarks}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, remarks: e.target.value })}
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowInvoiceForm(false)}>Cancel</Button>
                <Button type="submit" disabled={submittingInvoice || invoiceForm.items.length === 0}>
                  {submittingInvoice ? 'Creating...' : 'Create Invoice'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fee Structure Form Modal */}
      {showStructureForm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={() => setShowStructureForm(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 animate-zoom-in">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              {editingStructure ? 'Edit Fee Structure' : 'Add Fee Structure'}
            </h3>
            <form onSubmit={handleStructureSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  value={structureForm.name}
                  onChange={(e) => setStructureForm({ ...structureForm, name: e.target.value })}
                  placeholder="e.g., Tuition Fee, Lab Fee, etc."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Amount *</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    value={structureForm.amount}
                    onChange={(e) => setStructureForm({ ...structureForm, amount: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Class *</label>
                  <select
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Academic Year</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    value={structureForm.academicYear}
                    onChange={(e) => setStructureForm({ ...structureForm, academicYear: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    value={structureForm.dueDate}
                    onChange={(e) => setStructureForm({ ...structureForm, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  rows={2}
                  value={structureForm.description}
                  onChange={(e) => setStructureForm({ ...structureForm, description: e.target.value })}
                  placeholder="Fee description..."
                />
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={structureForm.isActive}
                    onChange={(e) => setStructureForm({ ...structureForm, isActive: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={structureForm.isRecurring}
                    onChange={(e) => setStructureForm({ ...structureForm, isRecurring: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Recurring</span>
                </label>
              </div>

              {structureForm.isRecurring && (
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Frequency</label>
                  <select
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    value={structureForm.frequency}
                    onChange={(e) => setStructureForm({ ...structureForm, frequency: e.target.value })}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="semi-annually">Semi-Annually</option>
                    <option value="annually">Annually</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowStructureForm(false)}>Cancel</Button>
                <Button type="submit" disabled={submittingStructure}>
                  {submittingStructure ? 'Saving...' : editingStructure ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showPaymentForm && selectedInvoice && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={() => setShowPaymentForm(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg w-full max-w-md p-6 animate-zoom-in">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Record Payment</h3>
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400">Invoice: {selectedInvoice.invoiceNumber}</div>
              <div className="text-sm">Total: ${selectedInvoice.totalAmount.toLocaleString()}</div>
              <div className="text-sm text-green-600">Already Paid: ${selectedInvoice.paidAmount.toLocaleString()}</div>
              <div className="text-sm font-medium text-indigo-600">
                Remaining: ${(selectedInvoice.totalAmount - selectedInvoice.paidAmount).toLocaleString()}
              </div>
            </div>
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Payment Amount *</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  max={selectedInvoice.totalAmount - selectedInvoice.paidAmount}
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
                <select
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
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
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Transaction ID (optional)</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Reference number..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowPaymentForm(false)}>Cancel</Button>
                <Button type="submit" disabled={processingPayment}>
                  {processingPayment ? 'Processing...' : 'Record Payment'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
