'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@repo/ui/button';
import { Portal } from '../portal';
import {
  UserPlus,
  User,
  Mail,
  Lock,
  Phone,
  Briefcase,
  Calendar,
  Award,
  X,
  Loader2,
  Shield,
} from 'lucide-react';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: UserFormData) => Promise<void>;
}

export interface UserFormData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: string;
  phoneNumber?: string;
  employeeId?: string;
  joiningDate?: string;
  qualification?: string;
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
  hint,
  delay = 0,
  ...props
}: {
  icon?: any;
  label: string;
  required?: boolean;
  hint?: string;
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
    {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
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
          hover:border-gray-300 transition-all duration-200 appearance-none cursor-pointer`}
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

// Role badge component
const RoleBadge = ({ role }: { role: string }) => {
  const roleConfig: Record<string, { gradient: string; label: string; icon: any }> = {
    teacher: { gradient: 'from-blue-500 to-cyan-500', label: 'Teacher', icon: User },
    tenant_admin: { gradient: 'from-purple-500 to-pink-500', label: 'School Admin', icon: Shield },
    parent: { gradient: 'from-emerald-500 to-teal-500', label: 'Parent', icon: User },
  };
  const config = (roleConfig[role] || roleConfig.teacher)!;
  const IconComponent = config.icon;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r ${config.gradient} text-white text-sm font-medium shadow-lg`}
    >
      <IconComponent className="w-4 h-4" />
      {config.label}
    </motion.div>
  );
};

export function CreateUserModal({ isOpen, onClose, onSubmit }: CreateUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    role: 'teacher',
    phoneNumber: '',
    employeeId: '',
    joiningDate: '',
    qualification: '',
  });

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
        email: '',
        firstName: '',
        lastName: '',
        password: '',
        role: 'teacher',
        phoneNumber: '',
        employeeId: '',
        joiningDate: '',
        qualification: '',
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
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
              <div className="sticky top-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 px-6 py-5 z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                      className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg"
                    >
                      <UserPlus className="w-6 h-6 text-white" />
                    </motion.div>
                    <div>
                      <motion.h2
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl font-bold text-white"
                      >
                        Add New Staff Member
                      </motion.h2>
                      <motion.p
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-white/80 text-sm"
                      >
                        Fill in the staff details below
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

                {/* Section: Role Selection */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mb-6"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Icon3D gradient="from-violet-500 to-purple-500" size="sm">
                      <Shield className="w-4 h-4" />
                    </Icon3D>
                    <h3 className="font-semibold text-gray-900">Role Selection</h3>
                    <div className="ml-auto">
                      <RoleBadge role={formData.role} />
                    </div>
                  </div>
                  <div className="pl-10">
                    <FormSelect
                      icon={Shield}
                      label="Role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      required
                      delay={0.1}
                    >
                      <option value="teacher">Teacher</option>
                      <option value="tenant_admin">School Admin</option>
                      <option value="parent">Parent</option>
                    </FormSelect>
                  </div>
                </motion.div>

                {/* Section: Personal Info */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mb-6"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Icon3D gradient="from-blue-500 to-cyan-500" size="sm">
                      <User className="w-4 h-4" />
                    </Icon3D>
                    <h3 className="font-semibold text-gray-900">Personal Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-10">
                    <FormInput
                      icon={User}
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      delay={0.1}
                    />
                    <FormInput
                      icon={User}
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      delay={0.15}
                    />
                    <FormInput
                      icon={Phone}
                      label="Phone Number"
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      delay={0.2}
                    />
                  </div>
                </motion.div>

                {/* Section: Account Info */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mb-6"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Icon3D gradient="from-emerald-500 to-teal-500" size="sm">
                      <Mail className="w-4 h-4" />
                    </Icon3D>
                    <h3 className="font-semibold text-gray-900">Account Credentials</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-10">
                    <FormInput
                      icon={Mail}
                      label="Email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      delay={0.1}
                    />
                    <FormInput
                      icon={Lock}
                      label="Password"
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={8}
                      hint="Minimum 8 characters"
                      delay={0.15}
                    />
                  </div>
                </motion.div>

                {/* Section: Employment Info (for teachers/admins) */}
                <AnimatePresence>
                  {(formData.role === 'teacher' || formData.role === 'tenant_admin') && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mb-6 overflow-hidden"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <Icon3D gradient="from-orange-500 to-amber-500" size="sm">
                          <Briefcase className="w-4 h-4" />
                        </Icon3D>
                        <h3 className="font-semibold text-gray-900">Employment Details</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-10">
                        <FormInput
                          icon={Briefcase}
                          label="Employee ID"
                          name="employeeId"
                          value={formData.employeeId}
                          onChange={handleChange}
                          placeholder="Auto-generated if empty"
                          delay={0.1}
                        />
                        <FormInput
                          icon={Calendar}
                          label="Joining Date"
                          type="date"
                          name="joiningDate"
                          value={formData.joiningDate}
                          onChange={handleChange}
                          delay={0.15}
                        />
                        <div className="md:col-span-2">
                          <FormInput
                            icon={Award}
                            label="Qualification"
                            name="qualification"
                            value={formData.qualification}
                            onChange={handleChange}
                            placeholder="e.g., M.Ed, B.Sc, etc."
                            delay={0.2}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
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
                      className="px-6 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white shadow-lg shadow-violet-500/25"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Creating...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <UserPlus className="w-4 h-4" />
                          Create User
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
