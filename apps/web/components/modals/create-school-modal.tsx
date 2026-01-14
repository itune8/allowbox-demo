'use client';

import { useState } from 'react';
import { Portal } from '../portal';
import { schoolService, type School } from '../../lib/services/superadmin/school.service';

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
    schoolName: editingSchool?.schoolName || '',
    tenantId: editingSchool?.tenantId || '',
    domain: editingSchool?.domain || '',
    adminEmail: editingSchool?.adminId?.email || '',
    adminName: editingSchool?.adminId ? `${editingSchool.adminId.firstName} ${editingSchool.adminId.lastName}` : '',
    adminPhone: '',
    contactEmail: editingSchool?.contactEmail || '',
    contactPhone: editingSchool?.contactPhone || '',
    address: editingSchool?.address || '',
    subscriptionPlan: editingSchool?.subscriptionPlan || 'basic',
    subscriptionStatus: editingSchool?.subscriptionStatus || 'trial',
    studentCount: editingSchool?.studentCount?.toString() || '0',
    teacherCount: editingSchool?.teacherCount?.toString() || '0',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (editingSchool) {
        // Update existing school - don't send admin fields
        const updatePayload = {
          schoolName: formData.schoolName,
          domain: formData.domain,
          contactEmail: formData.contactEmail || formData.adminEmail,
          contactPhone: formData.contactPhone || formData.adminPhone,
          address: formData.address,
          subscriptionPlan: formData.subscriptionPlan as 'free' | 'basic' | 'premium' | 'enterprise',
          subscriptionStatus: formData.subscriptionStatus as 'trial' | 'active' | 'suspended' | 'cancelled',
        };
        await schoolService.updateSchool(editingSchool._id, updatePayload);
        onSuccess();
        onClose();
      } else {
        // Create new school - include admin fields for automatic user creation
        const createPayload = {
          schoolName: formData.schoolName,
          tenantId: formData.tenantId,
          domain: formData.domain,
          contactEmail: formData.contactEmail || formData.adminEmail,
          contactPhone: formData.contactPhone || formData.adminPhone,
          address: formData.address,
          subscriptionPlan: formData.subscriptionPlan as 'free' | 'basic' | 'premium' | 'enterprise',
          subscriptionStatus: formData.subscriptionStatus as 'trial' | 'active' | 'suspended' | 'cancelled',
          // Admin fields for automatic user creation
          adminEmail: formData.adminEmail,
          adminName: formData.adminName,
          adminPhone: formData.adminPhone,
        };
        const result = await schoolService.createSchool(createPayload);

        // Show admin credentials if created
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

  return (
    <Portal>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-[9999] overflow-y-auto pt-20 pb-20" onClick={onClose}>
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 animate-zoom-in" onClick={(e) => e.stopPropagation()}>
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10 rounded-t-lg">
            <h2 className="text-xl font-bold text-gray-900">
              {editingSchool ? 'Edit School' : 'Add New School'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              type="button"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              {/* School Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">School Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="schoolName" className="block text-sm font-medium text-gray-700 mb-1">
                      School Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="schoolName"
                      name="schoolName"
                      value={formData.schoolName}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                    />
                  </div>

                  <div>
                    <label htmlFor="tenantId" className="block text-sm font-medium text-gray-700 mb-1">
                      Tenant ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="tenantId"
                      name="tenantId"
                      value={formData.tenantId}
                      onChange={handleChange}
                      required
                      disabled={!!editingSchool}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-1">
                      Domain <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="domain"
                      name="domain"
                      value={formData.domain}
                      onChange={handleChange}
                      required
                      placeholder="school.allowbox.app"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                    />
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                    />
                  </div>
                </div>
              </div>

              {/* Admin Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="adminName" className="block text-sm font-medium text-gray-700 mb-1">
                      Admin Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="adminName"
                      name="adminName"
                      value={formData.adminName}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                    />
                  </div>

                  <div>
                    <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700 mb-1">
                      Admin Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="adminEmail"
                      name="adminEmail"
                      value={formData.adminEmail}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                    />
                  </div>

                  <div>
                    <label htmlFor="adminPhone" className="block text-sm font-medium text-gray-700 mb-1">
                      Admin Phone
                    </label>
                    <input
                      type="tel"
                      id="adminPhone"
                      name="adminPhone"
                      value={formData.adminPhone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                    />
                  </div>

                  <div>
                    <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      id="contactEmail"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                    />
                  </div>
                </div>
              </div>

              {/* Subscription & Stats */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription & Stats</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="subscriptionPlan" className="block text-sm font-medium text-gray-700 mb-1">
                      Subscription Plan <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="subscriptionPlan"
                      name="subscriptionPlan"
                      value={formData.subscriptionPlan}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                    >
                      <option value="free">Free</option>
                      <option value="basic">Basic</option>
                      <option value="premium">Premium</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="subscriptionStatus" className="block text-sm font-medium text-gray-700 mb-1">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="subscriptionStatus"
                      name="subscriptionStatus"
                      value={formData.subscriptionStatus}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                    >
                      <option value="trial">Trial</option>
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="studentCount" className="block text-sm font-medium text-gray-700 mb-1">
                      Student Count
                    </label>
                    <input
                      type="number"
                      id="studentCount"
                      name="studentCount"
                      value={formData.studentCount}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                    />
                  </div>

                  <div>
                    <label htmlFor="teacherCount" className="block text-sm font-medium text-gray-700 mb-1">
                      Teacher Count
                    </label>
                    <input
                      type="number"
                      id="teacherCount"
                      name="teacherCount"
                      value={formData.teacherCount}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Saving...' : editingSchool ? 'Update School' : 'Create School'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
}
