'use client';

import { useState, useEffect } from 'react';
import { Button } from '@repo/ui/button';
import { classService, type Class } from '@/lib/services/class.service';
import { subjectService, type Subject } from '@/lib/services/subject.service';
import { userService, type User } from '@/lib/services/user.service';
import { Portal } from '../portal';

interface AssignTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: User;
  onSuccess?: () => void;
}

interface TeacherAssignment {
  classId: string;
  sections: string[];
  subjectIds: string[];
}

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

  if (!isOpen) return null;

  const selectedClass = classes.find(c => c._id === currentAssignment.classId);
  const getClassName = (classId: string) => classes.find(c => c._id === classId)?.name || 'Unknown';
  const getSubjectName = (subjectId: string) => subjects.find(s => s._id === subjectId)?.name || 'Unknown';

  return (
    <Portal>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-[9999] overflow-y-auto pt-20 pb-20">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Assign Classes & Subjects</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Teacher: {teacher.firstName} {teacher.lastName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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

          {loadingData ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <>
              {/* Current Assignments */}
              {assignments.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Current Assignments ({assignments.length})
                  </h3>
                  <div className="space-y-2">
                    {assignments.map((assignment, index) => (
                      <div
                        key={index}
                        className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {getClassName(assignment.classId)}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <span className="font-medium">Sections:</span> {assignment.sections.join(', ')}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <span className="font-medium">Subjects:</span>{' '}
                            {assignment.subjectIds.map(getSubjectName).join(', ')}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAssignment(index)}
                          className="text-red-500 hover:text-red-700 ml-3"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add New Assignment */}
              <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Add New Assignment
                </h3>

                <div className="space-y-4">
                  {/* Select Class */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Select Class <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={currentAssignment.classId}
                      onChange={(e) => {
                        setCurrentAssignment({
                          classId: e.target.value,
                          sections: [],
                          subjectIds: currentAssignment.subjectIds,
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">Choose a class...</option>
                      {classes.map(cls => (
                        <option key={cls._id} value={cls._id}>
                          {cls.name} (Grade {cls.grade})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Select Sections */}
                  {selectedClass && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Select Sections <span className="text-red-500">*</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {selectedClass.sections.map(section => (
                          <button
                            key={section}
                            type="button"
                            onClick={() => handleSectionToggle(section)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                              currentAssignment.sections.includes(section)
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                          >
                            Section {section}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Select Subjects */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Subjects <span className="text-red-500">*</span>
                    </label>
                    {subjects.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No subjects available. Please create subjects first.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md p-3">
                        {subjects.map(subject => (
                          <label
                            key={subject._id}
                            className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded"
                          >
                            <input
                              type="checkbox"
                              checked={currentAssignment.subjectIds.includes(subject._id)}
                              onChange={() => handleSubjectToggle(subject._id)}
                              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            />
                            <span className="text-sm text-gray-900 dark:text-gray-100">
                              {subject.name} ({subject.code})
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add Assignment Button */}
                  <Button
                    type="button"
                    onClick={handleAddAssignment}
                    variant="outline"
                    className="w-full"
                    disabled={!currentAssignment.classId || currentAssignment.sections.length === 0 || currentAssignment.subjectIds.length === 0}
                  >
                    + Add This Assignment
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-800">
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
                  disabled={loading || assignments.length === 0}
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  {loading ? 'Saving...' : `Save Assignments (${assignments.length})`}
                </Button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
    </Portal>
  );
}
