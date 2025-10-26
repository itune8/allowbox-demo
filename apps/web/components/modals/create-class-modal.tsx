'use client';

import { useState } from 'react';
import { Button } from '@repo/ui/button';
import { Portal } from '../portal';

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

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-[9999] overflow-y-auto pt-20 pb-20" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Add New Class</h2>
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

          <div className="space-y-4">
            {/* Class Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Class Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., Class 10, Grade 5, Year 12"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white text-gray-900"
              />
            </div>

            {/* Grade */}
            <div>
              <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">
                Grade/Level <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="grade"
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                required
                placeholder="e.g., 10, 5, 12"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white text-gray-900"
              />
            </div>

            {/* Sections */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sections <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2 mb-2">
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
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white text-gray-900"
                />
                <Button
                  type="button"
                  onClick={handleAddSection}
                  variant="outline"
                >
                  Add Section
                </Button>
              </div>
              {formData.sections.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.sections.map(section => (
                    <span
                      key={section}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      Section {section}
                      <button
                        type="button"
                        onClick={() => handleRemoveSection(section)}
                        className="text-gray-500 hover:text-red-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Capacity */}
            <div>
              <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
                Total Capacity (Optional)
              </label>
              <input
                type="number"
                id="capacity"
                name="capacity"
                value={formData.capacity || ''}
                onChange={handleChange}
                min="1"
                placeholder="Maximum number of students"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white text-gray-900"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Additional information about this class"
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
              {loading ? 'Creating...' : 'Create Class'}
            </Button>
          </div>
        </form>
      </div>
    </div>
    </Portal>
  );
}
