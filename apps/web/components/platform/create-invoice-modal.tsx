'use client';

import { useEffect, useCallback, useState, useRef, useMemo } from 'react';
import { Portal } from '../portal';
import { X, Search, ChevronDown, Building2, Check } from 'lucide-react';
import { CustomSelect, CustomDateInput } from './custom-select';
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
  const [schoolSearch, setSchoolSearch] = useState('');
  const [schoolDropdownOpen, setSchoolDropdownOpen] = useState(false);
  const schoolDropdownRef = useRef<HTMLDivElement>(null);

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

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (schoolDropdownRef.current && !schoolDropdownRef.current.contains(e.target as Node)) {
        setSchoolDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredSchools = useMemo(() => {
    if (!schoolSearch.trim()) return schools;
    const q = schoolSearch.toLowerCase();
    return schools.filter(s =>
      s.schoolName.toLowerCase().includes(q) ||
      (s.contactEmail || '').toLowerCase().includes(q) ||
      (s._id || '').toLowerCase().includes(q)
    );
  }, [schools, schoolSearch]);

  const selectedSchoolName = schools.find(s => s._id === schoolId)?.schoolName || '';

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
            {/* Select School - Searchable Dropdown */}
            <div ref={schoolDropdownRef} className="relative">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Select School</label>
              <button
                type="button"
                onClick={() => {
                  setSchoolDropdownOpen(!schoolDropdownOpen);
                  setSchoolSearch('');
                }}
                className={`w-full h-11 px-3 border rounded-lg text-sm bg-white text-left flex items-center justify-between transition-colors ${
                  schoolDropdownOpen
                    ? 'border-[#824ef2] ring-2 ring-[#824ef2]/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {schoolId ? (
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="p-1 rounded bg-[#824ef2]/10 flex-shrink-0">
                      <Building2 className="w-3 h-3 text-[#824ef2]" />
                    </div>
                    <span className="text-slate-900 truncate">{selectedSchoolName}</span>
                  </div>
                ) : (
                  <span className="text-slate-400">Select a school...</span>
                )}
                <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${schoolDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {schoolDropdownOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
                  {/* Search Input */}
                  <div className="p-2 border-b border-slate-100">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={schoolSearch}
                        onChange={(e) => setSchoolSearch(e.target.value)}
                        placeholder="Search schools..."
                        autoFocus
                        className="w-full h-9 pl-9 pr-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2]"
                      />
                    </div>
                  </div>

                  {/* School List */}
                  <div className="max-h-48 overflow-y-auto">
                    {filteredSchools.length === 0 ? (
                      <div className="px-4 py-6 text-center text-sm text-slate-400">
                        No schools found
                      </div>
                    ) : (
                      filteredSchools.map(school => (
                        <button
                          key={school._id}
                          type="button"
                          onClick={() => {
                            setSchoolId(school._id);
                            setSchoolDropdownOpen(false);
                            setSchoolSearch('');
                          }}
                          className={`w-full text-left px-3 py-2.5 flex items-center gap-2.5 text-sm transition-colors ${
                            schoolId === school._id
                              ? 'bg-[#824ef2]/5 text-[#824ef2]'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="p-1 rounded bg-[#824ef2]/10 flex-shrink-0">
                            <Building2 className="w-3 h-3 text-[#824ef2]" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">{school.schoolName}</p>
                            <p className="text-[11px] text-slate-400 truncate">{school.contactEmail || school._id.slice(0, 12) + '...'}</p>
                          </div>
                          {schoolId === school._id && (
                            <Check className="w-4 h-4 text-[#824ef2] flex-shrink-0" />
                          )}
                        </button>
                      ))
                    )}
                  </div>

                  {/* Footer count */}
                  <div className="px-3 py-2 border-t border-slate-100 text-[11px] text-slate-400">
                    {filteredSchools.length} of {schools.length} schools
                  </div>
                </div>
              )}
            </div>

            {/* Plan + Users */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Plan</label>
                <CustomSelect
                  value={plan}
                  onChange={setPlan}
                  options={[
                    { value: 'basic', label: 'Basic Plan' },
                    { value: 'premium', label: 'Premium Plan' },
                    { value: 'enterprise', label: 'Enterprise Plan' },
                    { value: 'professional', label: 'Professional Plan' },
                  ]}
                />
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
                <CustomSelect
                  value={billingCycle}
                  onChange={setBillingCycle}
                  options={[
                    { value: 'monthly', label: 'Monthly' },
                    { value: 'quarterly', label: 'Quarterly' },
                    { value: 'annual', label: 'Annual' },
                  ]}
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Payment Method</label>
              <CustomSelect
                value={paymentMethod}
                onChange={setPaymentMethod}
                options={[
                  { value: 'online', label: 'Online Payment' },
                  { value: 'cash', label: 'Cash' },
                  { value: 'bank_transfer', label: 'Bank Transfer' },
                  { value: 'credit_card', label: 'Credit Card' },
                ]}
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Due Date</label>
              <CustomDateInput
                value={dueDate}
                onChange={setDueDate}
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
