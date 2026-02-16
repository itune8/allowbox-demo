'use client';

import { useEffect, useCallback, useState } from 'react';
import { Portal } from '../portal';
import { X } from 'lucide-react';
import type { School } from '../../lib/services/superadmin/school.service';

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  schools: School[];
  onSubmit?: (data: {
    schoolId: string;
    plan: string;
    users: number;
    amount: number;
    billingCycle: string;
    paymentMethod: string;
    dueDate: string;
  }) => void;
}

export function CreateInvoiceModal({
  isOpen,
  onClose,
  schools,
  onSubmit,
}: CreateInvoiceModalProps) {
  const [schoolId, setSchoolId] = useState('');
  const [plan, setPlan] = useState('basic');
  const [users, setUsers] = useState('');
  const [amount, setAmount] = useState('');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      // Reset form
      setSchoolId('');
      setPlan('basic');
      setUsers('');
      setAmount('');
      setBillingCycle('monthly');
      setPaymentMethod('online');
      setDueDate('');
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  // Auto-fill plan, users, amount when school is selected
  useEffect(() => {
    if (schoolId) {
      const school = schools.find(s => s._id === schoolId);
      if (school) {
        setPlan(school.subscriptionPlan || 'basic');
        setUsers(String((school.studentCount || 0) + (school.teacherCount || 0)));
        setAmount(String(school.mrr || 0));
      }
    }
  }, [schoolId, schools]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!schoolId || !amount || !dueDate) return;
    setSubmitting(true);
    await onSubmit?.({
      schoolId,
      plan,
      users: parseInt(users) || 0,
      amount: parseFloat(amount) || 0,
      billingCycle,
      paymentMethod,
      dueDate,
    });
    setSubmitting(false);
  };

  return (
    <Portal>
      <div
        className="fixed inset-0 bg-slate-900/50 z-[9998] transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-6">
        <div
          className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-[520px] max-h-[92vh] sm:max-h-[85vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Create New Invoice</h2>
            <button
              onClick={onClose}
              className="p-2 -mr-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {/* Select School */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Select School</label>
              <select
                value={schoolId}
                onChange={(e) => setSchoolId(e.target.value)}
                className="w-full h-11 px-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2]"
              >
                <option value="">Select a school...</option>
                {schools.map(school => (
                  <option key={school._id} value={school._id}>
                    {school.schoolName}
                  </option>
                ))}
              </select>
            </div>

            {/* Plan + Users */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Plan</label>
                <select
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  className="w-full h-11 px-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2]"
                >
                  <option value="basic">Basic Plan</option>
                  <option value="premium">Premium Plan</option>
                  <option value="enterprise">Enterprise Plan</option>
                  <option value="professional">Professional Plan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Users</label>
                <input
                  type="number"
                  value={users}
                  onChange={(e) => setUsers(e.target.value)}
                  placeholder="250"
                  className="w-full h-11 px-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2]"
                />
              </div>
            </div>

            {/* Amount + Billing Cycle */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Amount</label>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="$1,250"
                  className="w-full h-11 px-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Billing Cycle</label>
                <select
                  value={billingCycle}
                  onChange={(e) => setBillingCycle(e.target.value)}
                  className="w-full h-11 px-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2]"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annual">Annual</option>
                </select>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full h-11 px-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2]"
              >
                <option value="online">Online Payment</option>
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="credit_card">Credit Card</option>
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full h-11 px-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2]"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !schoolId || !amount || !dueDate}
              className="px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#824ef2' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#7040d9')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#824ef2')}
            >
              {submitting ? 'Creating...' : 'Create Invoice'}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
