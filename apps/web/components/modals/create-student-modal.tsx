'use client';

import { useState, useEffect } from 'react';
import { Button } from '@repo/ui/button';
import { classService, type Class } from '@/lib/services/class.service';
import { Portal } from '../portal';

interface CreateStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (studentData: StudentFormData) => Promise<void>;
  initialData?: Partial<StudentFormData>;
}

export interface StudentFormData {
  firstName: string;
  lastName: string;
  email?: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup?: string;
  address?: string;
  phoneNumber?: string;
  parentEmail?: string;
  parentPhone?: string;
  studentId?: string;
  classId?: string;
  section?: string;
}

export function CreateStudentModal({ isOpen, onClose, onSubmit, initialData }: CreateStudentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [classes, setClasses] = useState<Class[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [formData, setFormData] = useState<StudentFormData>({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    email: initialData?.email || '',
    dateOfBirth: initialData?.dateOfBirth || '',
    gender: initialData?.gender || 'male',
    bloodGroup: initialData?.bloodGroup || '',
    address: initialData?.address || '',
    phoneNumber: initialData?.phoneNumber || '',
    parentEmail: initialData?.parentEmail || '',
    parentPhone: initialData?.parentPhone || '',
    studentId: initialData?.studentId || '',
    classId: initialData?.classId || '',
    section: initialData?.section || '',
  });

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        email: initialData.email || '',
        dateOfBirth: initialData.dateOfBirth || '',
        gender: initialData.gender || 'male',
        bloodGroup: initialData.bloodGroup || '',
        address: initialData.address || '',
        phoneNumber: initialData.phoneNumber || '',
        parentEmail: initialData.parentEmail || '',
        parentPhone: initialData.parentPhone || '',
        studentId: initialData.studentId || '',
        classId: initialData.classId || '',
        section: initialData.section || '',
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        dateOfBirth: '',
        gender: 'male',
        bloodGroup: '',
        address: '',
        phoneNumber: '',
        parentEmail: '',
        parentPhone: '',
        studentId: '',
        classId: '',
        section: '',
      });
    }
  }, [initialData]);

  // Fetch classes when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchClasses();
    }
  }, [isOpen]);

  // Update selected class when classId changes
  useEffect(() => {
    if (formData.classId) {
      const foundClass = classes.find(c => c._id === formData.classId);
      setSelectedClass(foundClass || null);
      // Reset section if class changes
      if (!foundClass?.sections.includes(formData.section || '')) {
        setFormData(prev => ({ ...prev, section: '' }));
      }
    } else {
      setSelectedClass(null);
    }
  }, [formData.classId, classes]);

  const fetchClasses = async () => {
    setLoadingClasses(true);
    try {
      const fetchedClasses = await classService.getClasses();
      setClasses(fetchedClasses);
    } catch (err) {
      console.error('Failed to fetch classes:', err);
    } finally {
      setLoadingClasses(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        dateOfBirth: '',
        gender: 'male',
        bloodGroup: '',
        address: '',
        phoneNumber: '',
        parentEmail: '',
        parentPhone: '',
        studentId: '',
        classId: '',
        section: '',
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create student');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-[9999] overflow-y-auto pt-20 pb-20" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center z-10 rounded-t-lg">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Add New Student</h2>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Student ID */}
            <div>
              <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-1">
                Student ID
              </label>
              <input
                type="text"
                id="studentId"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white text-gray-900"
                placeholder="Auto-generated if empty"
              />
            </div>

            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white text-gray-900"
              />
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white text-gray-900"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white text-gray-900"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white text-gray-900"
              />
            </div>

            {/* Gender */}
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white text-gray-900"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Blood Group */}
            <div>
              <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700 mb-1">
                Blood Group
              </label>
              <select
                id="bloodGroup"
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white text-gray-900"
              >
                <option value="">Select...</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            {/* Class */}
            <div>
              <label htmlFor="classId" className="block text-sm font-medium text-gray-700 mb-1">
                Class <span className="text-red-500">*</span>
              </label>
              <select
                id="classId"
                name="classId"
                value={formData.classId}
                onChange={handleChange}
                required
                disabled={loadingClasses}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white text-gray-900 disabled:bg-gray-100"
              >
                <option value="">
                  {loadingClasses ? 'Loading classes...' : 'Select class...'}
                </option>
                {classes.map(cls => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name} (Grade {cls.grade})
                  </option>
                ))}
              </select>
            </div>

            {/* Section */}
            <div>
              <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-1">
                Section <span className="text-red-500">*</span>
              </label>
              <select
                id="section"
                name="section"
                value={formData.section}
                onChange={handleChange}
                required
                disabled={!selectedClass || !selectedClass.sections.length}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white text-gray-900 disabled:bg-gray-100"
              >
                <option value="">
                  {!formData.classId ? 'Select class first...' : 'Select section...'}
                </option>
                {selectedClass?.sections.map(section => (
                  <option key={section} value={section}>
                    Section {section}
                  </option>
                ))}
              </select>
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white text-gray-900"
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white text-gray-900"
              />
            </div>

            {/* Parent Email */}
            <div>
              <label htmlFor="parentEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Parent Email
              </label>
              <input
                type="email"
                id="parentEmail"
                name="parentEmail"
                value={formData.parentEmail}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white text-gray-900"
              />
            </div>

            {/* Parent Phone */}
            <div>
              <label htmlFor="parentPhone" className="block text-sm font-medium text-gray-700 mb-1">
                Parent Phone
              </label>
              <input
                type="tel"
                id="parentPhone"
                name="parentPhone"
                value={formData.parentPhone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white text-gray-900"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {loading ? 'Creating...' : 'Create Student'}
            </Button>
          </div>
        </form>
      </div>
    </div>
    </Portal>
  );
}
