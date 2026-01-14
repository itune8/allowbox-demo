'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@repo/ui/button';
import { classService, type Class } from '@/lib/services/class.service';
import { subjectService, type Subject } from '@/lib/services/subject.service';
import { userService, type User as UserType } from '@/lib/services/user.service';
import { Portal } from '../portal';
import {
  UserCheck,
  User,
  BookOpen,
  GraduationCap,
  Layers,
  Plus,
  X,
  Loader2,
  Check,
  Trash2,
  ChevronDown,
} from 'lucide-react';

interface AssignTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: UserType;
  onSuccess?: () => void;
}

interface TeacherAssignment {
  classId: string;
  sections: string[];
  subjectIds: string[];
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
        className={`w-full ${IconComponent ? 'pl-10' : 'pl-4'} pr-10 py-2.5 border border-gray-200 rounded-xl text-sm bg-white/80 backdrop-blur-sm
          focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400
          hover:border-gray-300 transition-all duration-200 appearance-none cursor-pointer
          disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-900`}
      >
        {children}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
        <ChevronDown className="w-4 h-4" />
      </div>
    </div>
  </motion.div>
);

// Section toggle button component
const SectionToggle = ({
  section,
  isSelected,
  onToggle,
  delay = 0,
}: {
  section: string;
  isSelected: boolean;
  onToggle: () => void;
  delay?: number;
}) => (
  <motion.button
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.2 }}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    type="button"
    onClick={onToggle}
    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2
      ${isSelected
        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25'
        : 'bg-white/80 backdrop-blur-sm text-gray-700 border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
      }`}
  >
    {isSelected && <Check className="w-3.5 h-3.5" />}
    Section {section}
  </motion.button>
);

// Subject checkbox component
const SubjectCheckbox = ({
  subject,
  isChecked,
  onToggle,
  delay = 0,
}: {
  subject: Subject;
  isChecked: boolean;
  onToggle: () => void;
  delay?: number;
}) => (
  <motion.label
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.2 }}
    whileHover={{ x: 4 }}
    className={`flex items-center space-x-3 cursor-pointer p-3 rounded-xl transition-all duration-200
      ${isChecked
        ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200'
        : 'bg-white/60 backdrop-blur-sm hover:bg-gray-50 border border-transparent hover:border-gray-200'
      }`}
  >
    <div className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all duration-200 ${
      isChecked
        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 shadow-md shadow-indigo-500/30'
        : 'border-2 border-gray-300 bg-white'
    }`}>
      {isChecked && <Check className="w-3 h-3 text-white" />}
    </div>
    <input
      type="checkbox"
      checked={isChecked}
      onChange={onToggle}
      className="sr-only"
    />
    <span className={`text-sm font-medium ${isChecked ? 'text-indigo-700' : 'text-gray-700'}`}>
      {subject.name} <span className="text-gray-400">({subject.code})</span>
    </span>
  </motion.label>
);

// Assignment card component
const AssignmentCard = ({
  assignment,
  index,
  getClassName,
  getSubjectName,
  onRemove,
}: {
  assignment: TeacherAssignment;
  index: number;
  getClassName: (id: string) => string;
  getSubjectName: (id: string) => string;
  onRemove: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, x: -100, scale: 0.9 }}
    transition={{ duration: 0.3 }}
    className="relative p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 group"
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
            {index + 1}
          </div>
          <span className="font-semibold text-gray-900">{getClassName(assignment.classId)}</span>
        </div>
        <div className="ml-10 space-y-1.5">
          <div className="flex items-center gap-2 text-sm">
            <Layers className="w-4 h-4 text-indigo-500" />
            <span className="text-gray-600">Sections:</span>
            <div className="flex gap-1.5 flex-wrap">
              {assignment.sections.map(section => (
                <span key={section} className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-md text-xs font-medium">
                  {section}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <BookOpen className="w-4 h-4 text-purple-500" />
            <span className="text-gray-600">Subjects:</span>
            <div className="flex gap-1.5 flex-wrap">
              {assignment.subjectIds.map(id => (
                <span key={id} className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-md text-xs font-medium">
                  {getSubjectName(id)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        type="button"
        onClick={onRemove}
        className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-100"
      >
        <Trash2 className="w-4 h-4" />
      </motion.button>
    </div>
  </motion.div>
);

export function AssignTeacherModal({ isOpen, onClose, teacher, onSuccess }: AssignTeacherModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [currentAssignment, setCurrentAssignment] = useState<TeacherAssignment>({
    classId: '',
    sections: [],
    subjectIds: [],
  });

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const [fetchedClasses, fetchedSubjects] = await Promise.all([
        classService.getClasses(),
        subjectService.getSubjects(),
      ]);
      setClasses(fetchedClasses);
      setSubjects(fetchedSubjects);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load classes and subjects');
    } finally {
      setLoadingData(false);
    }
  };

  const handleAddAssignment = () => {
    if (!currentAssignment.classId || currentAssignment.sections.length === 0 || currentAssignment.subjectIds.length === 0) {
      setError('Please select class, at least one section, and at least one subject');
      return;
    }

    // Check for duplicate
    const isDuplicate = assignments.some(
      a => a.classId === currentAssignment.classId &&
           a.sections.some(s => currentAssignment.sections.includes(s))
    );

    if (isDuplicate) {
      setError('This class and section combination is already assigned');
      return;
    }

    setAssignments([...assignments, { ...currentAssignment }]);
    setCurrentAssignment({
      classId: '',
      sections: [],
      subjectIds: [],
    });
    setError('');
  };

  const handleRemoveAssignment = (index: number) => {
    setAssignments(assignments.filter((_, i) => i !== index));
  };

  const handleSectionToggle = (section: string) => {
    setCurrentAssignment(prev => ({
      ...prev,
      sections: prev.sections.includes(section)
        ? prev.sections.filter(s => s !== section)
        : [...prev.sections, section],
    }));
  };

  const handleSubjectToggle = (subjectId: string) => {
    setCurrentAssignment(prev => ({
      ...prev,
      subjectIds: prev.subjectIds.includes(subjectId)
        ? prev.subjectIds.filter(id => id !== subjectId)
        : [...prev.subjectIds, subjectId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Collect all unique subject IDs from all assignments
      const allSubjectIds = Array.from(
        new Set(assignments.flatMap(a => a.subjectIds))
      );

      // Update teacher with assigned subjects
      await userService.updateUser(teacher.id, {
        subjects: allSubjectIds,
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign teacher');
    } finally {
      setLoading(false);
    }
  };

  const selectedClass = classes.find(c => c._id === currentAssignment.classId);
  const getClassName = (classId: string) => classes.find(c => c._id === classId)?.name || 'Unknown';
  const getSubjectName = (subjectId: string) => subjects.find(s => s._id === subjectId)?.name || 'Unknown';

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
              className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-3xl w-full mx-4 overflow-hidden"
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
                      <UserCheck className="w-6 h-6 text-white" />
                    </motion.div>
                    <div>
                      <motion.h2
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl font-bold text-white"
                      >
                        Assign Classes & Subjects
                      </motion.h2>
                      <motion.p
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-white/80 text-sm flex items-center gap-2"
                      >
                        <User className="w-4 h-4" />
                        {teacher.firstName} {teacher.lastName}
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

                {loadingData ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-16"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Loader2 className="w-12 h-12 text-indigo-500" />
                    </motion.div>
                    <p className="mt-4 text-gray-500 text-sm">Loading classes and subjects...</p>
                  </motion.div>
                ) : (
                  <>
                    {/* Current Assignments Section */}
                    <AnimatePresence>
                      {assignments.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mb-6"
                        >
                          <div className="flex items-center gap-2 mb-4">
                            <Icon3D gradient="from-emerald-500 to-teal-500" size="sm">
                              <Check className="w-4 h-4" />
                            </Icon3D>
                            <h3 className="font-semibold text-gray-900">
                              Current Assignments ({assignments.length})
                            </h3>
                          </div>
                          <div className="space-y-3 pl-10">
                            <AnimatePresence mode="popLayout">
                              {assignments.map((assignment, index) => (
                                <AssignmentCard
                                  key={`${assignment.classId}-${assignment.sections.join(',')}`}
                                  assignment={assignment}
                                  index={index}
                                  getClassName={getClassName}
                                  getSubjectName={getSubjectName}
                                  onRemove={() => handleRemoveAssignment(index)}
                                />
                              ))}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Add New Assignment Section */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className={`${assignments.length > 0 ? 'border-t border-gray-200 pt-6' : ''}`}
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <Icon3D gradient="from-indigo-500 to-purple-500" size="sm">
                          <Plus className="w-4 h-4" />
                        </Icon3D>
                        <h3 className="font-semibold text-gray-900">Add New Assignment</h3>
                      </div>

                      <div className="space-y-5 pl-10">
                        {/* Select Class */}
                        <FormSelect
                          icon={GraduationCap}
                          label="Select Class"
                          required
                          value={currentAssignment.classId}
                          onChange={(e) => {
                            setCurrentAssignment({
                              classId: e.target.value,
                              sections: [],
                              subjectIds: currentAssignment.subjectIds,
                            });
                          }}
                          delay={0.1}
                        >
                          <option value="">Choose a class...</option>
                          {classes.map(cls => (
                            <option key={cls._id} value={cls._id}>
                              {cls.name} (Grade {cls.grade})
                            </option>
                          ))}
                        </FormSelect>

                        {/* Select Sections */}
                        <AnimatePresence>
                          {selectedClass && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Sections <span className="text-rose-500">*</span>
                              </label>
                              <div className="flex flex-wrap gap-2">
                                {selectedClass.sections.map((section, idx) => (
                                  <SectionToggle
                                    key={section}
                                    section={section}
                                    isSelected={currentAssignment.sections.includes(section)}
                                    onToggle={() => handleSectionToggle(section)}
                                    delay={idx * 0.05}
                                  />
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Select Subjects */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Subjects <span className="text-rose-500">*</span>
                          </label>
                          {subjects.length === 0 ? (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="p-4 bg-gray-50 rounded-xl text-center"
                            >
                              <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                              <p className="text-sm text-gray-500">
                                No subjects available. Please create subjects first.
                              </p>
                            </motion.div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200">
                              {subjects.map((subject, idx) => (
                                <SubjectCheckbox
                                  key={subject._id}
                                  subject={subject}
                                  isChecked={currentAssignment.subjectIds.includes(subject._id)}
                                  onToggle={() => handleSubjectToggle(subject._id)}
                                  delay={idx * 0.03}
                                />
                              ))}
                            </div>
                          )}
                        </motion.div>

                        {/* Add Assignment Button */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            type="button"
                            onClick={handleAddAssignment}
                            disabled={!currentAssignment.classId || currentAssignment.sections.length === 0 || currentAssignment.subjectIds.length === 0}
                            className="w-full py-3 px-4 rounded-xl text-sm font-medium border-2 border-dashed border-indigo-300 text-indigo-600
                              hover:bg-indigo-50 hover:border-indigo-400 transition-all duration-200
                              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-indigo-300
                              flex items-center justify-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Add This Assignment
                          </motion.button>
                        </motion.div>
                      </div>
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100"
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
                          disabled={loading || assignments.length === 0}
                          className="px-6 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg shadow-indigo-500/25"
                        >
                          {loading ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Saving...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <UserCheck className="w-4 h-4" />
                              Save Assignments ({assignments.length})
                            </span>
                          )}
                        </Button>
                      </motion.div>
                    </motion.div>
                  </>
                )}
              </form>
            </motion.div>
          </motion.div>
        </Portal>
      )}
    </AnimatePresence>
  );
}
