'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@repo/ui/button';
import { userService, type User as UserType } from '@/lib/services/user.service';
import { Portal } from '../portal';
import {
  Users,
  User,
  Mail,
  Phone,
  MapPin,
  Search,
  Link2,
  X,
  Loader2,
  Check,
  UserPlus,
  Info,
  Key,
} from 'lucide-react';

interface LinkParentModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
  onSuccess?: () => void;
}

type ModalMode = 'search' | 'create';

interface ParentFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
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

// Enhanced Textarea component
const FormTextarea = ({
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
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
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
        <div className="absolute left-3 top-3 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
          <IconComponent className="w-4 h-4" />
        </div>
      )}
      <textarea
        {...props}
        className={`w-full ${IconComponent ? 'pl-10' : 'pl-4'} pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white/80 backdrop-blur-sm
          focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400
          hover:border-gray-300 transition-all duration-200 resize-none
          placeholder:text-gray-400`}
      />
    </div>
  </motion.div>
);

export function LinkParentModal({
  isOpen,
  onClose,
  studentId,
  studentName,
  onSuccess,
}: LinkParentModalProps) {
  const [mode, setMode] = useState<ModalMode>('search');
  const [parents, setParents] = useState<UserType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<ParentFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
  });

  useEffect(() => {
    if (isOpen) {
      fetchParents();
    }
  }, [isOpen]);

  const fetchParents = async () => {
    setLoading(true);
    setError('');
    try {
      const parentUsers = await userService.getUsersByRole('parent');
      setParents(parentUsers);
    } catch (err) {
      console.error('Failed to fetch parents:', err);
      setError('Failed to load parents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLink = async () => {
    if (!selectedParentId) {
      setError('Please select a parent to link.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await userService.linkParentToChild(selectedParentId, studentId);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Failed to link parent:', err);
      setError(err.response?.data?.message || 'Failed to link parent. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleShowCredentials = (parentEmail: string, parentName: string) => {
    alert(
      `PASSWORD INFORMATION for ${parentName}\n\n` +
      `Email: ${parentEmail}\n\n` +
      `Default passwords to try:\n` +
      `* parent123 (if created via Link Parent)\n` +
      `* teacher123 (if created via Staff page)\n\n` +
      `If these don't work:\n` +
      `1. Create a new parent account using "Create New Parent"\n` +
      `2. Link the new parent to the student\n` +
      `3. Delete the old parent account if needed`
    );
  };

  const filteredParents = parents.filter(
    (parent) =>
      parent.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateAndLink = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      setError('Please fill in all required fields (First Name, Last Name, Email).');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const defaultPassword = 'parent123';

      // Create the parent user
      const newParent = await userService.createUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        role: 'parent',
        password: defaultPassword,
      });

      // Link the newly created parent to the student
      await userService.linkParentToChild(newParent.id || newParent._id || '', studentId);

      // Show success message with credentials
      alert(
        `Parent created and linked successfully!\n\n` +
        `LOGIN CREDENTIALS:\n` +
        `Email: ${formData.email}\n` +
        `Password: ${defaultPassword}\n\n` +
        `Please share these credentials with the parent.\n` +
        `They should change the password on first login.`
      );

      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Failed to create and link parent:', err);
      setError(err.response?.data?.message || 'Failed to create parent. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setMode('search');
    setSearchTerm('');
    setSelectedParentId(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      address: '',
    });
    setError('');
    onClose();
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
            onClick={handleClose}
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
                      <Link2 className="w-6 h-6 text-white" />
                    </motion.div>
                    <div>
                      <motion.h2
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl font-bold text-white"
                      >
                        Link Parent to {studentName}
                      </motion.h2>
                      <motion.p
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-white/80 text-sm"
                      >
                        Search existing or create new parent
                      </motion.p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleClose}
                    className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                    type="button"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              <div className="p-6">
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

                {/* Mode Toggle */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex gap-2 p-1.5 bg-gray-100/80 backdrop-blur-sm rounded-xl mb-6"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setMode('search')}
                    className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                      mode === 'search'
                        ? 'bg-white text-indigo-600 shadow-md'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Search className="w-4 h-4" />
                    Search Existing
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setMode('create')}
                    className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                      mode === 'create'
                        ? 'bg-white text-indigo-600 shadow-md'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <UserPlus className="w-4 h-4" />
                    Create New Parent
                  </motion.button>
                </motion.div>

                <AnimatePresence mode="wait">
                  {mode === 'search' ? (
                    <motion.div
                      key="search-mode"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                      {/* Search Section */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <Icon3D gradient="from-blue-500 to-cyan-500" size="sm">
                            <Search className="w-4 h-4" />
                          </Icon3D>
                          <h3 className="font-semibold text-gray-900">Search Parent</h3>
                        </div>
                        <div className="pl-10">
                          <div className="relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                              <Search className="w-4 h-4" />
                            </div>
                            <input
                              type="text"
                              placeholder="Search by name or email..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white/80 backdrop-blur-sm
                                focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400
                                hover:border-gray-300 transition-all duration-200
                                placeholder:text-gray-400"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Parent List Section */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <Icon3D gradient="from-purple-500 to-pink-500" size="sm">
                            <Users className="w-4 h-4" />
                          </Icon3D>
                          <h3 className="font-semibold text-gray-900">Select Parent</h3>
                        </div>
                        <div className="pl-10">
                          {loading ? (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-center py-8"
                            >
                              <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto mb-2" />
                              <p className="text-gray-500 text-sm">Loading parents...</p>
                            </motion.div>
                          ) : filteredParents.length === 0 ? (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-center py-8 text-gray-500"
                            >
                              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                              <p className="text-sm">
                                {parents.length === 0
                                  ? 'No parents found in the system.'
                                  : 'No parents match your search.'}
                              </p>
                            </motion.div>
                          ) : (
                            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm">
                              {filteredParents.map((parent, index) => (
                                <motion.button
                                  key={parent.id || parent._id}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                  onClick={() => setSelectedParentId(parent.id || parent._id || '')}
                                  className={`w-full text-left px-4 py-3 border-b border-gray-100 last:border-b-0 transition-all duration-200 ${
                                    selectedParentId === (parent.id || parent._id)
                                      ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-l-indigo-500'
                                      : 'hover:bg-gray-50'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <div className="font-medium text-gray-900 flex items-center gap-2">
                                        <User className="w-4 h-4 text-gray-400" />
                                        {parent.firstName} {parent.lastName}
                                      </div>
                                      <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                        <Mail className="w-3 h-3" />
                                        {parent.email}
                                      </div>
                                      {parent.phoneNumber && (
                                        <div className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                                          <Phone className="w-3 h-3" />
                                          {parent.phoneNumber}
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleShowCredentials(
                                            parent.email,
                                            `${parent.firstName} ${parent.lastName}`
                                          );
                                        }}
                                        className="px-3 py-1.5 text-xs bg-gradient-to-r from-blue-100 to-cyan-100 hover:from-blue-200 hover:to-cyan-200 text-blue-700 rounded-lg transition-all duration-200 flex items-center gap-1"
                                        title="Show password information"
                                      >
                                        <Key className="w-3 h-3" />
                                        Show Password
                                      </motion.button>
                                      <AnimatePresence>
                                        {selectedParentId === (parent.id || parent._id) && (
                                          <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                            className="w-6 h-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center"
                                          >
                                            <Check className="w-4 h-4 text-white" />
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  </div>
                                </motion.button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex justify-end gap-3 pt-4 border-t border-gray-100"
                      >
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            variant="outline"
                            onClick={handleClose}
                            disabled={submitting}
                            className="px-6"
                          >
                            Cancel
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            onClick={handleLink}
                            disabled={!selectedParentId || submitting}
                            className="px-6 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg shadow-indigo-500/25"
                          >
                            {submitting ? (
                              <span className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Linking...
                              </span>
                            ) : (
                              <span className="flex items-center gap-2">
                                <Link2 className="w-4 h-4" />
                                Link Parent
                              </span>
                            )}
                          </Button>
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="create-mode"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                      {/* Create New Parent Form */}
                      {/* Section: Basic Info */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
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
                            label="First Name"
                            required
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            placeholder="John"
                            delay={0.1}
                          />
                          <FormInput
                            icon={User}
                            label="Last Name"
                            required
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            placeholder="Doe"
                            delay={0.15}
                          />
                        </div>
                      </motion.div>

                      {/* Section: Contact Info */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <Icon3D gradient="from-purple-500 to-pink-500" size="sm">
                            <Mail className="w-4 h-4" />
                          </Icon3D>
                          <h3 className="font-semibold text-gray-900">Contact Information</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-10">
                          <FormInput
                            icon={Mail}
                            label="Email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="parent@example.com"
                            delay={0.1}
                          />
                          <FormInput
                            icon={Phone}
                            label="Phone Number"
                            type="tel"
                            value={formData.phoneNumber}
                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                            placeholder="+1234567890"
                            delay={0.15}
                          />
                        </div>
                      </motion.div>

                      {/* Section: Address */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <Icon3D gradient="from-orange-500 to-amber-500" size="sm">
                            <MapPin className="w-4 h-4" />
                          </Icon3D>
                          <h3 className="font-semibold text-gray-900">Address</h3>
                        </div>
                        <div className="pl-10">
                          <FormTextarea
                            icon={MapPin}
                            label="Full Address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            rows={3}
                            placeholder="Enter address..."
                            delay={0.1}
                          />
                        </div>
                      </motion.div>

                      {/* Credentials Info Box */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-200"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg flex-shrink-0">
                            <Info className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-indigo-700 mb-1">
                              Default Login Credentials
                            </p>
                            <p className="text-sm text-indigo-600">
                              <strong>Email:</strong> (as entered above)
                              <br />
                              <strong>Password:</strong>{' '}
                              <code className="bg-indigo-100 px-2 py-0.5 rounded-md text-indigo-700">
                                parent123
                              </code>
                              <br />
                              <span className="text-xs mt-1 inline-block text-indigo-500">
                                You'll receive these credentials in a popup after creation. Share them with the parent securely.
                              </span>
                            </p>
                          </div>
                        </div>
                      </motion.div>

                      {/* Action Buttons */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex justify-end gap-3 pt-4 border-t border-gray-100"
                      >
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            variant="outline"
                            onClick={handleClose}
                            disabled={submitting}
                            className="px-6"
                          >
                            Cancel
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            onClick={handleCreateAndLink}
                            disabled={submitting}
                            className="px-6 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg shadow-indigo-500/25"
                          >
                            {submitting ? (
                              <span className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Creating...
                              </span>
                            ) : (
                              <span className="flex items-center gap-2">
                                <UserPlus className="w-4 h-4" />
                                Create & Link Parent
                              </span>
                            )}
                          </Button>
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        </Portal>
      )}
    </AnimatePresence>
  );
}
