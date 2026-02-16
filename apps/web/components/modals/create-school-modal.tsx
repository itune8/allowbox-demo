'use client';

import { useState, useEffect, useCallback } from 'react';
import { Portal } from '../portal';
import { schoolService, type School } from '../../lib/services/superadmin/school.service';
import { X, AlertCircle } from 'lucide-react';

interface CreateSchoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingSchool?: School | null;
}

export function CreateSchoolModal({ isOpen, onClose, onSuccess, editingSchool }: CreateSchoolModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    schoolName: '',
    tenantId: '',
    domain: '',
    adminEmail: '',
    adminName: '',
    adminPhone: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    subscriptionPlan: 'basic',
    billingCycle: 'monthly',
    subscriptionStatus: 'trial',
    numberOfUsers: '50',
  });

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

      if (editingSchool) {
        setFormData({
          schoolName: editingSchool.schoolName || '',
          tenantId: editingSchool.tenantId || '',
          domain: editingSchool.domain || '',
          adminEmail: editingSchool.adminId?.email || '',
          adminName: editingSchool.adminId ? `${editingSchool.adminId.firstName} ${editingSchool.adminId.lastName}` : '',
          adminPhone: '',
          contactEmail: editingSchool.contactEmail || '',
          contactPhone: editingSchool.contactPhone || '',
          address: editingSchool.address || '',
          city: editingSchool.city || '',
          state: editingSchool.state || '',
          postalCode: editingSchool.postalCode || '',
          country: editingSchool.country || 'United States',
          subscriptionPlan: editingSchool.subscriptionPlan || 'basic',
          billingCycle: 'monthly',
          subscriptionStatus: editingSchool.subscriptionStatus || 'trial',
          numberOfUsers: String(editingSchool.maxUsers || 50),
        });
      } else {
        setFormData({
          schoolName: '',
          tenantId: '',
          domain: '',
          adminEmail: '',
          adminName: '',
          adminPhone: '',
          contactEmail: '',
          contactPhone: '',
          address: '',
          city: '',
          state: '',
          postalCode: '',
          country: 'United States',
          subscriptionPlan: 'basic',
          billingCycle: 'monthly',
          subscriptionStatus: 'trial',
          numberOfUsers: '50',
        });
      }
      setError(null);
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, editingSchool, handleEscape]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (editingSchool) {
        const updatePayload = {
          schoolName: formData.schoolName,
          domain: formData.domain,
          contactEmail: formData.contactEmail || formData.adminEmail,
          contactPhone: formData.contactPhone || formData.adminPhone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
          subscriptionPlan: formData.subscriptionPlan as 'free' | 'basic' | 'premium' | 'enterprise',
          subscriptionStatus: formData.subscriptionStatus as 'trial' | 'active' | 'suspended' | 'cancelled',
        };
        await schoolService.updateSchool(editingSchool._id, updatePayload);
        onSuccess();
        onClose();
      } else {
        const createPayload: any = {
          schoolName: formData.schoolName,
          domain: formData.domain,
          contactEmail: formData.contactEmail || formData.adminEmail,
          contactPhone: formData.contactPhone || formData.adminPhone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
          subscriptionPlan: formData.subscriptionPlan as 'free' | 'basic' | 'premium' | 'enterprise',
          subscriptionStatus: formData.subscriptionStatus as 'trial' | 'active' | 'suspended' | 'cancelled',
          adminEmail: formData.adminEmail,
          adminName: formData.adminName,
          adminPhone: formData.adminPhone,
        };
        if (formData.tenantId.trim()) {
          createPayload.tenantId = formData.tenantId.trim();
        }
        const result = await schoolService.createSchool(createPayload);

        if ((result as any).adminCredentials) {
          const creds = (result as any).adminCredentials;
          alert(`School created successfully!\n\nAdmin Login Credentials:\nEmail: ${creds.email}\nPassword: ${creds.defaultPassword}\n\nNote: Password must be changed on first login.`);
        }

        onSuccess();
        onClose();
      }
    } catch (err: any) {
      console.error('Failed to save school:', err);
      setError(err.response?.data?.message || 'Failed to save school. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const inputClass =
    'w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] transition-colors placeholder:text-slate-400 disabled:opacity-50 disabled:bg-slate-50';
  const selectClass =
    'w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] transition-colors appearance-none';
  const labelClass = 'block text-sm font-medium text-slate-700 mb-1.5';

  return (
    <Portal>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 z-[9998] transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-6">
        <div
          className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-[640px] max-h-[92vh] sm:max-h-[85vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">
              {editingSchool ? 'Edit School' : 'Add New School'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 -mr-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <form id="create-school-form" onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* School Information */}
              <div>
                <h3 className="text-base font-semibold text-slate-900 mb-4">School Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>
                      School Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="schoolName"
                      value={formData.schoolName}
                      onChange={handleChange}
                      required
                      placeholder="Enter school name"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>School ID</label>
                    <input
                      type="text"
                      name="tenantId"
                      value={formData.tenantId}
                      onChange={handleChange}
                      placeholder="Auto-generated"
                      disabled={!!editingSchool}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-base font-semibold text-slate-900 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="adminEmail"
                      value={formData.adminEmail}
                      onChange={handleChange}
                      required
                      placeholder="admin@school.edu"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="adminPhone"
                      value={formData.adminPhone}
                      onChange={handleChange}
                      placeholder="+1 (555) 000-0000"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <h3 className="text-base font-semibold text-slate-900 mb-4">Address</h3>
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="123 Education Street"
                      className={inputClass}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className={labelClass}>
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="New York"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>
                        State/Province <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="NY"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>
                        ZIP/Postal Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        placeholder="10001"
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Country <span className="text-red-500">*</span></label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className={selectClass}
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Australia">Australia</option>
                      <option value="India">India</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Subscription Plan */}
              <div>
                <h3 className="text-base font-semibold text-slate-900 mb-4">Subscription Plan</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>
                      Plan Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="subscriptionPlan"
                      value={formData.subscriptionPlan}
                      onChange={handleChange}
                      required
                      className={selectClass}
                    >
                      <option value="free">Trial (14 days free)</option>
                      <option value="basic">Basic</option>
                      <option value="premium">Premium</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>
                      Billing Cycle <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="billingCycle"
                      value={formData.billingCycle}
                      onChange={handleChange}
                      className={selectClass}
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="annual">Annual</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>
                      Number of Users <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="numberOfUsers"
                      value={formData.numberOfUsers}
                      onChange={handleChange}
                      min="1"
                      placeholder="50"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      Initial Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="subscriptionStatus"
                      value={formData.subscriptionStatus}
                      onChange={handleChange}
                      required
                      className={selectClass}
                    >
                      <option value="trial">Pending</option>
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="create-school-form"
              disabled={loading}
              className="px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#824ef2' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#7040d9')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#824ef2')}
            >
              {loading ? 'Saving...' : editingSchool ? 'Update School' : 'Add School'}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
