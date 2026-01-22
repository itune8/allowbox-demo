'use client';

import { useState, useEffect } from 'react';
import { SlideSheet, SheetSection, SheetField } from '../ui/slide-sheet';
import { Button } from '@repo/ui/button';
import { schoolService, type School } from '../../lib/services/superadmin/school.service';
import { Building2, User, CreditCard, AlertCircle } from 'lucide-react';

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
    subscriptionPlan: 'basic',
    subscriptionStatus: 'trial',
    studentCount: '0',
    teacherCount: '0',
  });

  // Reset form when modal opens with editing school data
  useEffect(() => {
    if (isOpen) {
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
          subscriptionPlan: editingSchool.subscriptionPlan || 'basic',
          subscriptionStatus: editingSchool.subscriptionStatus || 'trial',
          studentCount: editingSchool.studentCount?.toString() || '0',
          teacherCount: editingSchool.teacherCount?.toString() || '0',
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
          subscriptionPlan: 'basic',
          subscriptionStatus: 'trial',
          studentCount: '0',
          teacherCount: '0',
        });
      }
      setError(null);
    }
  }, [isOpen, editingSchool]);

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
        const createPayload: any = {
          schoolName: formData.schoolName,
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
        // Only include tenantId if provided (otherwise backend auto-generates)
        if (formData.tenantId.trim()) {
          createPayload.tenantId = formData.tenantId.trim();
        }
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

  const inputClassName = "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const selectClassName = "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors";

  return (
    <SlideSheet
      isOpen={isOpen}
      onClose={onClose}
      title={editingSchool ? 'Edit School' : 'Add New School'}
      subtitle={editingSchool ? 'Update school information' : 'Create a new school account'}
      size="lg"
      footer={
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Saving...' : editingSchool ? 'Update School' : 'Create School'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* School Information */}
        <SheetSection title="School Information" icon={<Building2 className="w-4 h-4 text-slate-500" />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SheetField label="School Name" required>
              <input
                type="text"
                name="schoolName"
                value={formData.schoolName}
                onChange={handleChange}
                required
                placeholder="Enter school name"
                className={inputClassName}
              />
            </SheetField>

            {editingSchool ? (
              <SheetField label="Tenant ID">
                <input
                  type="text"
                  name="tenantId"
                  value={formData.tenantId}
                  disabled
                  className={`${inputClassName} bg-slate-50`}
                />
              </SheetField>
            ) : (
              <SheetField label="Tenant ID">
                <input
                  type="text"
                  name="tenantId"
                  value={formData.tenantId}
                  onChange={handleChange}
                  placeholder="Auto-generated if empty"
                  className={inputClassName}
                />
                <p className="text-xs text-slate-500 mt-1">Leave empty to auto-generate</p>
              </SheetField>
            )}

            <SheetField label="Domain" required>
              <input
                type="text"
                name="domain"
                value={formData.domain}
                onChange={handleChange}
                required
                placeholder="school.allowbox.app"
                className={inputClassName}
              />
            </SheetField>

            <SheetField label="Address">
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="School address"
                className={inputClassName}
              />
            </SheetField>
          </div>
        </SheetSection>

        {/* Admin Information */}
        <SheetSection title="Admin Information" icon={<User className="w-4 h-4 text-slate-500" />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SheetField label="Admin Name" required>
              <input
                type="text"
                name="adminName"
                value={formData.adminName}
                onChange={handleChange}
                required
                placeholder="Full name"
                className={inputClassName}
              />
            </SheetField>

            <SheetField label="Admin Email" required>
              <input
                type="email"
                name="adminEmail"
                value={formData.adminEmail}
                onChange={handleChange}
                required
                placeholder="admin@school.com"
                className={inputClassName}
              />
            </SheetField>

            <SheetField label="Admin Phone">
              <input
                type="tel"
                name="adminPhone"
                value={formData.adminPhone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                className={inputClassName}
              />
            </SheetField>

            <SheetField label="Contact Email">
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                placeholder="contact@school.com"
                className={inputClassName}
              />
            </SheetField>
          </div>
        </SheetSection>

        {/* Subscription & Stats */}
        <SheetSection title="Subscription & Stats" icon={<CreditCard className="w-4 h-4 text-slate-500" />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SheetField label="Subscription Plan" required>
              <select
                name="subscriptionPlan"
                value={formData.subscriptionPlan}
                onChange={handleChange}
                required
                className={selectClassName}
              >
                <option value="free">Free</option>
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </SheetField>

            <SheetField label="Status" required>
              <select
                name="subscriptionStatus"
                value={formData.subscriptionStatus}
                onChange={handleChange}
                required
                className={selectClassName}
              >
                <option value="trial">Trial</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </SheetField>

            <SheetField label="Student Count">
              <input
                type="number"
                name="studentCount"
                value={formData.studentCount}
                onChange={handleChange}
                min="0"
                placeholder="0"
                className={inputClassName}
              />
            </SheetField>

            <SheetField label="Teacher Count">
              <input
                type="number"
                name="teacherCount"
                value={formData.teacherCount}
                onChange={handleChange}
                min="0"
                placeholder="0"
                className={inputClassName}
              />
            </SheetField>
          </div>
        </SheetSection>
      </form>
    </SlideSheet>
  );
}
