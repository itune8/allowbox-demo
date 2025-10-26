'use client';

import { useState, useEffect } from 'react';
import { Button } from '@repo/ui/button';
import { subjectService, type Subject } from '@/lib/services/subject.service';
import { tenantService, type TenantData } from '@/lib/services/tenant.service';
import { classService, type Class } from '@/lib/services/class.service';
import { CreateSubjectModal, type SubjectFormData } from '@/components/modals/create-subject-modal';

export default function SettingsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [schoolInfo, setSchoolInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [editingSchool, setEditingSchool] = useState(false);

  useEffect(() => {
    fetchSubjects();
    fetchSchoolInfo();
    fetchClasses();
  }, []);

  const fetchSubjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await subjectService.getSubjects();
      setSubjects(data);
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
      setError('Failed to load subjects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSchoolInfo = async () => {
    try {
      const data = await tenantService.getCurrentTenant();
      setSchoolInfo({
        name: data.schoolName || '',
        email: data.contactEmail || '',
        phone: data.contactPhone || '',
        address: data.address || '',
      });
    } catch (err) {
      console.error('Failed to fetch school info:', err);
    }
  };

  const fetchClasses = async () => {
    try {
      const data = await classService.getClasses();
      setClasses(data);
    } catch (err) {
      console.error('Failed to fetch classes:', err);
    }
  };

  const getClassNamesForSubject = (subjectClasses?: string[]): string => {
    if (!subjectClasses || subjectClasses.length === 0) {
      return 'All classes';
    }
    const classNames = classes
      .filter(cls => subjectClasses.includes(cls._id))
      .map(cls => cls.name);
    return classNames.length > 0 ? classNames.join(', ') : 'N/A';
  };

  const handleUpdateSchoolInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await tenantService.updateTenant({
        schoolName: schoolInfo.name,
        contactEmail: schoolInfo.email,
        contactPhone: schoolInfo.phone,
        address: schoolInfo.address,
      });
      setBanner('School information updated successfully!');
      setTimeout(() => setBanner(null), 3000);
      setEditingSchool(false);
      await fetchSchoolInfo();
    } catch (err) {
      console.error('Failed to update school info:', err);
      alert('Failed to update school information');
    }
  };

  const handleCreateSubject = async (subjectData: SubjectFormData) => {
    try {
      if (editingSubject) {
        await subjectService.updateSubject(editingSubject._id, subjectData);
        setBanner('Subject updated successfully!');
      } else {
        await subjectService.createSubject(subjectData);
        setBanner('Subject created successfully!');
      }
      setTimeout(() => setBanner(null), 3000);
      setIsSubjectModalOpen(false);
      setEditingSubject(null);
      await fetchSubjects();
    } catch (error) {
      console.error('Failed to save subject:', error);
      throw error;
    }
  };

  const handleEditSubject = (subject: Subject, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSubject(subject);
    setIsSubjectModalOpen(true);
  };

  const handleDeleteSubject = async (subjectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this subject?')) return;

    try {
      await subjectService.deleteSubject(subjectId);
      setSubjects(prev => prev.filter(s => s._id !== subjectId));
      setBanner('Subject deleted successfully');
      setTimeout(() => setBanner(null), 3000);
    } catch (err) {
      console.error('Failed to delete subject:', err);
      alert('Failed to delete subject. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      {banner && (
        <div className="animate-fade-in">
          <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            {banner}
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">School Settings</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Manage subjects and other school configurations
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Subjects Section */}
      <section className="animate-slide-in-left">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Subjects {!loading && `(${subjects.length})`}
          </h2>
          <Button
            size="sm"
            onClick={() => {
              setEditingSubject(null);
              setIsSubjectModalOpen(true);
            }}
          >
            + Add Subject
          </Button>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
              <div className="text-gray-500">Loading subjects...</div>
            </div>
          ) : subjects.length === 0 ? (
            <div className="py-10 text-center text-gray-500 space-y-3">
              <div className="text-5xl">📚</div>
              <div>No subjects added yet</div>
              <Button onClick={() => setIsSubjectModalOpen(true)}>Add Your First Subject</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((subject) => (
                <div
                  key={subject._id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                        {subject.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                        Code: {subject.code}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        title="Edit Subject"
                        className="p-1 text-gray-400 hover:text-indigo-500 transition-colors"
                        onClick={(e) => handleEditSubject(subject, e)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        title="Delete Subject"
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        onClick={(e) => handleDeleteSubject(subject._id, e)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {subject.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {subject.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                    <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                      <div className="text-gray-500 dark:text-gray-400">Max Marks</div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {subject.maxMarks || 'N/A'}
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                      <div className="text-gray-500 dark:text-gray-400">Pass Marks</div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {subject.passingMarks || 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Assigned Classes */}
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded text-xs">
                    <div className="text-indigo-700 dark:text-indigo-300 font-medium mb-1">Assigned to:</div>
                    <div className="text-indigo-600 dark:text-indigo-400">
                      {getClassNamesForSubject(subject.classes)}
                    </div>
                  </div>

                  {subject.isActive !== undefined && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          subject.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                        }`}
                      >
                        {subject.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* School Information Section */}
      <section className="animate-slide-in-left">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            School Information
          </h2>
          {!editingSchool && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditingSchool(true)}
            >
              Edit Information
            </Button>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
          {editingSchool ? (
            <form onSubmit={handleUpdateSchoolInfo} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  School Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={schoolInfo.name}
                  onChange={(e) => setSchoolInfo({ ...schoolInfo, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={schoolInfo.email}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={schoolInfo.phone}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Address
                </label>
                <textarea
                  value={schoolInfo.address}
                  onChange={(e) => setSchoolInfo({ ...schoolInfo, address: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingSchool(false);
                    fetchSchoolInfo();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">School Name</div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {schoolInfo.name || 'Not set'}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Contact Email</div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {schoolInfo.email || 'Not set'}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Contact Phone</div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {schoolInfo.phone || 'Not set'}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg md:col-span-2">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Address</div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {schoolInfo.address || 'Not set'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Additional Settings Sections */}
      <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          System Settings
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">Academic Year</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Configure academic calendar and terms</div>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">Grading Scale</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Define grading criteria and pass marks</div>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">Notifications</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Email and SMS notification settings</div>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">Backup & Export</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Download data backups and export reports</div>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </section>

      {/* Create/Edit Subject Modal */}
      <CreateSubjectModal
        isOpen={isSubjectModalOpen}
        onClose={() => {
          setIsSubjectModalOpen(false);
          setEditingSubject(null);
        }}
        onSubmit={handleCreateSubject}
        initialData={editingSubject || undefined}
      />
    </div>
  );
}
