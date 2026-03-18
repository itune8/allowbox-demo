'use client';

import { useEffect, useCallback, useState } from 'react';
import { Portal } from '../portal';
import { X, AlertCircle, ChevronDown, Check } from 'lucide-react';

type UserRole = 'super_admin' | 'sales' | 'support' | 'finance';

interface AddTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    role: UserRole;
    permissions: { create: boolean; read: boolean; update: boolean; delete: boolean };
  }) => Promise<void>;
  submitting?: boolean;
}

export function AddTeamMemberModal({ isOpen, onClose, onSubmit, submitting }: AddTeamMemberModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole | ''>('');
  const [permissions, setPermissions] = useState({ create: false, read: false, update: false, delete: false });
  const [error, setError] = useState<string | null>(null);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

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
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setPhone('');
      setRole('');
      setPermissions({ create: false, read: false, update: false, delete: false });
      setError(null);
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password || !role) {
      setError('Please fill in all required fields');
      return;
    }
    setError(null);
    try {
      await onSubmit({
        firstName,
        lastName,
        email,
        password,
        phone,
        role: role as UserRole,
        permissions,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create team member');
    }
  };

  if (!isOpen) return null;

  const inputClass =
    'w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] transition-colors placeholder:text-slate-400';
  const labelClass = 'block text-sm font-medium text-slate-700 mb-1.5';

  return (
    <Portal>
      <div
        className="fixed inset-0 bg-slate-900/50 z-[9998] transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-6">
        <div
          className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-[480px] max-h-[92vh] sm:max-h-[85vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Add Team Member</h2>
            <button
              onClick={onClose}
              className="p-2 -mr-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <form id="add-team-member-form" onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>First Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter first name"
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Last Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter last name"
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className={labelClass}>Email Address <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@schoolhub.com"
                  className={inputClass}
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className={labelClass}>Password <span className="text-red-500">*</span></label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className={inputClass}
                  required
                  minLength={8}
                />
              </div>

              {/* Phone */}
              <div>
                <label className={labelClass}>Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className={inputClass}
                />
              </div>

              {/* Role */}
              <div className="relative">
                <label className={labelClass}>Role <span className="text-red-500">*</span></label>
                <button
                  type="button"
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  className={`${inputClass} flex items-center justify-between text-left ${!role ? 'text-slate-400' : 'text-slate-900'}`}
                >
                  <span>{role ? { super_admin: 'Admin', sales: 'Sales', finance: 'Finance', support: 'Support' }[role] : 'Select role'}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${roleDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {roleDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg py-1">
                    {([
                      { value: 'super_admin' as UserRole, label: 'Admin' },
                      { value: 'sales' as UserRole, label: 'Sales' },
                      { value: 'finance' as UserRole, label: 'Finance' },
                      { value: 'support' as UserRole, label: 'Support' },
                    ]).map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setRole(option.value);
                          setRoleDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2.5 text-sm text-left flex items-center justify-between transition-colors ${
                          role === option.value
                            ? 'bg-[#824ef2]/5 text-[#824ef2] font-medium'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {option.label}
                        {role === option.value && <Check className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Permissions */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Permissions</label>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { key: 'create' as const, label: 'Create', desc: 'Add new records' },
                    { key: 'read' as const, label: 'Read', desc: 'View all data' },
                    { key: 'update' as const, label: 'Update', desc: 'Edit existing records' },
                    { key: 'delete' as const, label: 'Delete', desc: 'Remove records' },
                  ]).map(({ key, label, desc }) => (
                    <label
                      key={key}
                      className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        permissions[key]
                          ? 'border-[#824ef2]/30 bg-[#824ef2]/5'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={permissions[key]}
                        onChange={(e) => setPermissions(prev => ({ ...prev, [key]: e.target.checked }))}
                        className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#824ef2] focus:ring-[#824ef2]"
                      />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{label}</p>
                        <p className="text-xs text-slate-500">{desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="add-team-member-form"
              disabled={submitting}
              className="px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#824ef2' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#7040d9')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#824ef2')}
            >
              {submitting ? 'Adding...' : 'Add Team Member'}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
