'use client';

import { useState, useEffect } from 'react';
import { Button } from '@repo/ui/button';
import { classService, type Class } from '@/lib/services/class.service';
import { Portal } from '../portal';

interface CreateSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (subjectData: SubjectFormData) => Promise<void>;
  initialData?: Partial<SubjectFormData>;
}

export interface SubjectFormData {
  name: string;
  code: string;
  description?: string;
  maxMarks?: number;
  passingMarks?: number;
  classes?: string[];
}

export function CreateSubjectModal({ isOpen, onClose, onSubmit, initialData }: CreateSubjectModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [classes, setClasses] = useState<Class[]>([]);
  const [formData, setFormData] = useState<SubjectFormData>({
    name: initialData?.name || '',
    code: initialData?.code || '',
    description: initialData?.description || '',
    maxMarks: initialData?.maxMarks || 100,
    passingMarks: initialData?.passingMarks || 40,
    classes: initialData?.classes || [],
  });

  // Fetch classes on mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const fetchedClasses = await classService.getClasses();
        setClasses(fetchedClasses);
      } catch (err) {
        console.error('Failed to fetch classes:', err);
      }
    };
    if (isOpen) {
      fetchClasses();
    }
  }, [isOpen]);

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        code: initialData.code || '',
        description: initialData.description || '',
        maxMarks: initialData.maxMarks || 100,
        passingMarks: initialData.passingMarks || 40,
        classes: initialData.classes || [],
      });
    } else {
      setFormData({
        name: '',
        code: '',
        description: '',
        maxMarks: 100,
        passingMarks: 40,
        classes: [],
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'maxMarks' || name === 'passingMarks')
        ? (value ? parseInt(value) : undefined)
        : value,
    }));
  };

  const handleClassToggle = (classId: string) => {
    setFormData(prev => {
      const currentClasses = prev.classes || [];
      const isSelected = currentClasses.includes(classId);

      return {
        ...prev,
        classes: isSelected
          ? currentClasses.filter(id => id !== classId)
          : [...currentClasses, classId],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.maxMarks && formData.passingMarks && formData.passingMarks > formData.maxMarks) {
      setError('Passing marks cannot be greater than maximum marks');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        name: '',
        code: '',
        description: '',
        maxMarks: 100,
        passingMarks: 40,
        classes: [],
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create subject');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-[9999] overflow-y-auto pt-20 pb-20" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {initialData ? 'Edit Subject' : 'Add New Subject'}
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
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Subject Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subject Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., Mathematics, Physics, English"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Subject Code */}
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subject Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                placeholder="e.g., MATH101, PHY201, ENG301"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Max Marks */}
            <div>
              <label htmlFor="maxMarks" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Maximum Marks
              </label>
              <input
                type="number"
                id="maxMarks"
                name="maxMarks"
                value={formData.maxMarks || ''}
                onChange={handleChange}
                min="1"
                placeholder="100"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Passing Marks */}
            <div>
              <label htmlFor="passingMarks" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Passing Marks
              </label>
              <input
                type="number"
                id="passingMarks"
                name="passingMarks"
                value={formData.passingMarks || ''}
                onChange={handleChange}
                min="1"
                max={formData.maxMarks}
                placeholder="40"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Additional information about this subject"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Assign to Classes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Assign to Classes (Optional)
              </label>
              {classes.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No classes available. Create classes first.</p>
              ) : (
                <div className="max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-700 rounded-md p-3 space-y-2">
                  {classes.map((cls) => (
                    <label
                      key={cls._id}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={formData.classes?.includes(cls._id) || false}
                        onChange={() => handleClassToggle(cls._id)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {cls.name} (Grade {cls.grade})
                      </span>
                    </label>
                  ))}
                </div>
              )}
              {formData.classes && formData.classes.length > 0 && (
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Selected {formData.classes.length} class{formData.classes.length > 1 ? 'es' : ''}
                </p>
              )}
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
              {loading ? (initialData ? 'Updating...' : 'Creating...') : (initialData ? 'Update Subject' : 'Create Subject')}
            </Button>
          </div>
        </form>
      </div>
    </div>
    </Portal>
  );
}
