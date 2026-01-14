'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@repo/ui/button';
import { Portal } from '../portal';
import {
  BookOpen,
  GraduationCap,
  Layers,
  Users,
  FileText,
  X,
  Plus,
  Loader2,
} from 'lucide-react';

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (classData: ClassFormData) => Promise<void>;
}

export interface ClassFormData {
  name: string;
  grade: string;
  sections: string[];
  description?: string;
  capacity?: number;
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

export function CreateClassModal({ isOpen, onClose, onSubmit }: CreateClassModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sectionInput, setSectionInput] = useState('');
  const [formData, setFormData] = useState<ClassFormData>({
    name: '',
    grade: '',
    sections: [],
    description: '',
    capacity: undefined,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'capacity' ? (value ? parseInt(value) : undefined) : value,
    }));
  };

  const handleAddSection = () => {
    const trimmed = sectionInput.trim().toUpperCase();
    if (trimmed && !formData.sections.includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        sections: [...prev.sections, trimmed],
      }));
      setSectionInput('');
    }
  };

  const handleRemoveSection = (section: string) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s !== section),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.sections.length === 0) {
      setError('Please add at least one section');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        name: '',
        grade: '',
        sections: [],
        description: '',
        capacity: undefined,
      });
      setSectionInput('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create class');
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
              <div className="sticky top-0 bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 px-6 py-5 z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                      className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg"
                    >
                      <BookOpen className="w-6 h-6 text-white" />
                    </motion.div>
                    <div>
                      <motion.h2
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl font-bold text-white"
                      >
                        Add New Class
                      </motion.h2>
                      <motion.p
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-white/80 text-sm"
                      >
                        Create a new class with sections
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

                {/* Section: Class Info */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mb-6"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Icon3D gradient="from-violet-500 to-purple-500" size="sm">
                      <GraduationCap className="w-4 h-4" />
                    </Icon3D>
                    <h3 className="font-semibold text-gray-900">Class Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-10">
                    <FormInput
                      icon={BookOpen}
                      label="Class Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="e.g., Class 10, Grade 5"
                      delay={0.1}
                    />
                    <FormInput
                      icon={GraduationCap}
                      label="Grade/Level"
                      name="grade"
                      value={formData.grade}
                      onChange={handleChange}
                      required
                      placeholder="e.g., 10, 5, 12"
                      delay={0.15}
                    />
                  </div>
                </motion.div>

                {/* Section: Sections */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mb-6"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Icon3D gradient="from-blue-500 to-cyan-500" size="sm">
                      <Layers className="w-4 h-4" />
                    </Icon3D>
                    <h3 className="font-semibold text-gray-900">Sections</h3>
                  </div>
                  <div className="pl-10">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Add Sections <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex gap-2 mb-3">
                      <div className="relative group flex-1">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                          <Layers className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          value={sectionInput}
                          onChange={(e) => setSectionInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddSection();
                            }
                          }}
                          placeholder="e.g., A, B, C"
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white/80 backdrop-blur-sm
                            focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400
                            hover:border-gray-300 transition-all duration-200"
                        />
                      </div>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          type="button"
                          onClick={handleAddSection}
                          variant="outline"
                          className="px-4"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                      </motion.div>
                    </div>
                    <AnimatePresence>
                      {formData.sections.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex flex-wrap gap-2"
                        >
                          {formData.sections.map((section, index) => (
                            <motion.span
                              key={section}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              transition={{ delay: index * 0.05 }}
                              className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 rounded-lg text-sm font-medium border border-indigo-100"
                            >
                              <Layers className="w-3.5 h-3.5" />
                              Section {section}
                              <motion.button
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                                type="button"
                                onClick={() => handleRemoveSection(section)}
                                className="text-indigo-400 hover:text-red-500 transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                              </motion.button>
                            </motion.span>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>

                {/* Section: Capacity */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mb-6"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Icon3D gradient="from-emerald-500 to-teal-500" size="sm">
                      <Users className="w-4 h-4" />
                    </Icon3D>
                    <h3 className="font-semibold text-gray-900">Capacity</h3>
                  </div>
                  <div className="pl-10">
                    <FormInput
                      icon={Users}
                      label="Total Capacity (Optional)"
                      type="number"
                      name="capacity"
                      value={formData.capacity || ''}
                      onChange={handleChange}
                      min={1}
                      placeholder="Maximum number of students"
                      delay={0.1}
                    />
                  </div>
                </motion.div>

                {/* Section: Description */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mb-6"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Icon3D gradient="from-orange-500 to-amber-500" size="sm">
                      <FileText className="w-4 h-4" />
                    </Icon3D>
                    <h3 className="font-semibold text-gray-900">Description</h3>
                  </div>
                  <div className="pl-10">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Description (Optional)
                      </label>
                      <div className="relative group">
                        <div className="absolute left-3 top-3 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                          <FileText className="w-4 h-4" />
                        </div>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          rows={3}
                          placeholder="Additional information about this class"
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white/80 backdrop-blur-sm
                            focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400
                            hover:border-gray-300 transition-all duration-200 resize-none"
                        />
                      </div>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
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
                          <BookOpen className="w-4 h-4" />
                          Create Class
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
