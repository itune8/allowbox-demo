'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@repo/ui/button';
import { classService, type Class } from '@/lib/services/class.service';
import { Portal } from '../portal';
import {
  GraduationCap,
  User,
  Mail,
  Calendar,
  Users,
  Droplet,
  MapPin,
  Phone,
  UserPlus,
  X,
  BookOpen,
  Loader2,
} from 'lucide-react';

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

// 3D Icon wrapper component
const Icon3D = ({ children, gradient, size = 'md' }: { children: React.ReactNode; gradient: string; size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };
  return (
    <motion.div
      whileHover={{ scale: 1.05, rotate: 5 }}
      className={`relative ${sizeClasses[size]} rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}
      style={{ boxShadow: `0 8px 24px -4px rgba(99, 102, 241, 0.3)` }}
    >
      <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/25 to-transparent" />
      <div className="relative text-white">{children}</div>
    </motion.div>
  );
};

// Enhanced Input component
const FormInput = ({
  icon: IconComponent,
  label,
  required,
  delay = 0,
  ...props
}: {
  icon?: any;
  label: string;
  required?: boolean;
  delay?: number;
} & React.InputHTMLAttributes<HTMLInputElement>) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.3 }}
  >
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <div className="relative group">
      {IconComponent && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
          <IconComponent className="w-4 h-4" />
        </div>
      )}
      <input
        {...props}
        className={`w-full ${IconComponent ? 'pl-10' : 'pl-4'} pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white/80 backdrop-blur-sm
          focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400
          hover:border-gray-300 transition-all duration-200
          placeholder:text-gray-400`}
      />
    </div>
  </motion.div>
);

// Enhanced Select component
const FormSelect = ({
  icon: IconComponent,
  label,
  required,
  children,
  delay = 0,
  ...props
}: {
  icon?: any;
  label: string;
  required?: boolean;
  children: React.ReactNode;
  delay?: number;
} & React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.3 }}
  >
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <div className="relative group">
      {IconComponent && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors z-10">
          <IconComponent className="w-4 h-4" />
        </div>
      )}
      <select
        {...props}
        className={`w-full ${IconComponent ? 'pl-10' : 'pl-4'} pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white/80 backdrop-blur-sm
          focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400
          hover:border-gray-300 transition-all duration-200 appearance-none cursor-pointer
          disabled:bg-gray-50 disabled:cursor-not-allowed`}
      >
        {children}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  </motion.div>
);

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

  return (
    <AnimatePresence>
      {isOpen && (
        <Portal>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-[9999] overflow-y-auto pt-10 pb-10"
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with gradient */}
              <div className="sticky top-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-5 z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                      className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg"
                    >
                      <GraduationCap className="w-6 h-6 text-white" />
                    </motion.div>
                    <div>
                      <motion.h2
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl font-bold text-white"
                      >
                        {initialData ? 'Edit Student' : 'Add New Student'}
                      </motion.h2>
                      <motion.p
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-white/80 text-sm"
                      >
                        Fill in the student details below
                      </motion.p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                    type="button"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                {/* Error message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="mb-6 p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl"
                    >
                      <p className="text-sm text-red-700 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                          <X className="w-3 h-3 text-red-600" />
                        </span>
                        {error}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Section: Basic Info */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mb-6"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Icon3D gradient="from-blue-500 to-cyan-500" size="sm">
                      <User className="w-4 h-4" />
                    </Icon3D>
                    <h3 className="font-semibold text-gray-900">Basic Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-10">
                    <FormInput
                      icon={User}
                      label="Student ID"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleChange}
                      placeholder="Auto-generated if empty"
                      delay={0.1}
                    />
                    <FormInput
                      icon={User}
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      delay={0.15}
                    />
                    <FormInput
                      icon={User}
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      delay={0.2}
                    />
                    <FormInput
                      icon={Mail}
                      label="Email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      delay={0.25}
                    />
                  </div>
                </motion.div>

                {/* Section: Personal Details */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mb-6"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Icon3D gradient="from-purple-500 to-pink-500" size="sm">
                      <Calendar className="w-4 h-4" />
                    </Icon3D>
                    <h3 className="font-semibold text-gray-900">Personal Details</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-10">
                    <FormInput
                      icon={Calendar}
                      label="Date of Birth"
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      required
                      delay={0.1}
                    />
                    <FormSelect
                      icon={Users}
                      label="Gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      required
                      delay={0.15}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </FormSelect>
                    <FormSelect
                      icon={Droplet}
                      label="Blood Group"
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleChange}
                      delay={0.2}
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
                    </FormSelect>
                    <FormInput
                      icon={Phone}
                      label="Phone Number"
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      delay={0.25}
                    />
                  </div>
                </motion.div>

                {/* Section: Academic Info */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mb-6"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Icon3D gradient="from-emerald-500 to-teal-500" size="sm">
                      <BookOpen className="w-4 h-4" />
                    </Icon3D>
                    <h3 className="font-semibold text-gray-900">Academic Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-10">
                    <FormSelect
                      icon={BookOpen}
                      label="Class"
                      name="classId"
                      value={formData.classId}
                      onChange={handleChange}
                      required
                      disabled={loadingClasses}
                      delay={0.1}
                    >
                      <option value="">
                        {loadingClasses ? 'Loading classes...' : 'Select class...'}
                      </option>
                      {classes.map(cls => (
                        <option key={cls._id} value={cls._id}>
                          {cls.name} (Grade {cls.grade})
                        </option>
                      ))}
                    </FormSelect>
                    <FormSelect
                      icon={Users}
                      label="Section"
                      name="section"
                      value={formData.section}
                      onChange={handleChange}
                      required
                      disabled={!selectedClass || !selectedClass.sections.length}
                      delay={0.15}
                    >
                      <option value="">
                        {!formData.classId ? 'Select class first...' : 'Select section...'}
                      </option>
                      {selectedClass?.sections.map(section => (
                        <option key={section} value={section}>
                          Section {section}
                        </option>
                      ))}
                    </FormSelect>
                  </div>
                </motion.div>

                {/* Section: Address */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mb-6"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Icon3D gradient="from-orange-500 to-amber-500" size="sm">
                      <MapPin className="w-4 h-4" />
                    </Icon3D>
                    <h3 className="font-semibold text-gray-900">Address</h3>
                  </div>
                  <div className="pl-10">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Full Address
                      </label>
                      <div className="relative group">
                        <div className="absolute left-3 top-3 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          rows={2}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white/80 backdrop-blur-sm
                            focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400
                            hover:border-gray-300 transition-all duration-200 resize-none"
                        />
                      </div>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Section: Parent Info */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mb-6"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Icon3D gradient="from-rose-500 to-pink-500" size="sm">
                      <UserPlus className="w-4 h-4" />
                    </Icon3D>
                    <h3 className="font-semibold text-gray-900">Parent/Guardian Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-10">
                    <FormInput
                      icon={Mail}
                      label="Parent Email"
                      type="email"
                      name="parentEmail"
                      value={formData.parentEmail}
                      onChange={handleChange}
                      delay={0.1}
                    />
                    <FormInput
                      icon={Phone}
                      label="Parent Phone"
                      type="tel"
                      name="parentPhone"
                      value={formData.parentPhone}
                      onChange={handleChange}
                      delay={0.15}
                    />
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex justify-end gap-3 pt-4 border-t border-gray-100"
                >
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="button"
                      onClick={onClose}
                      variant="outline"
                      disabled={loading}
                      className="px-6"
                    >
                      Cancel
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="px-6 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg shadow-indigo-500/25"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {initialData ? 'Updating...' : 'Creating...'}
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4" />
                          {initialData ? 'Update Student' : 'Create Student'}
                        </span>
                      )}
                    </Button>
                  </motion.div>
                </motion.div>
              </form>
            </motion.div>
          </motion.div>
        </Portal>
      )}
    </AnimatePresence>
  );
}
