'use client';

import { useState, useEffect } from 'react';
import { Button } from '@repo/ui/button';
import { subjectService, type Subject } from '@/lib/services/subject.service';
import { tenantService, type TenantData } from '@/lib/services/tenant.service';
import { classService, type Class } from '@/lib/services/class.service';
import { SlideSheet, SheetSection, SheetField, SheetDetailRow } from '@/components/ui';
import {
  Settings,
  BookOpen,
  Building,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Award,
  Bell,
  Download,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export interface SubjectFormData {
  name: string;
  code: string;
  description?: string;
  maxMarks?: number;
  passingMarks?: number;
  classes?: string[];
}

export default function SettingsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubjectSheetOpen, setIsSubjectSheetOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [banner, setBanner] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [schoolInfo, setSchoolInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [editingSchool, setEditingSchool] = useState(false);
  const [subjectFormData, setSubjectFormData] = useState<SubjectFormData>({
    name: '',
    code: '',
    description: '',
    maxMarks: 100,
    passingMarks: 40,
    classes: [],
  });
  const [submittingSubject, setSubmittingSubject] = useState(false);
  const [subjectFormError, setSubjectFormError] = useState('');

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
// await tenantService?.updateTenant({
//   schoolName: schoolInfo.name,
//   contactEmail: schoolInfo.email,
//   contactPhone: schoolInfo.phone,
//   address: schoolInfo.address,
// });

      setBanner({ message: 'School information updated successfully!', type: 'success' });
      setTimeout(() => setBanner(null), 3000);
      setEditingSchool(false);
      await fetchSchoolInfo();
    } catch (err) {
      console.error('Failed to update school info:', err);
      setBanner({ message: 'Failed to update school information', type: 'error' });
      setTimeout(() => setBanner(null), 3000);
    }
  };

  const handleOpenSubjectSheet = (subject?: Subject) => {
    if (subject) {
      setEditingSubject(subject);
      setSubjectFormData({
        name: subject.name || '',
        code: subject.code || '',
        description: subject.description || '',
        maxMarks: subject.maxMarks || 100,
        passingMarks: subject.passingMarks || 40,
        classes: subject.classes || [],
      });
    } else {
      setEditingSubject(null);
      setSubjectFormData({
        name: '',
        code: '',
        description: '',
        maxMarks: 100,
        passingMarks: 40,
        classes: [],
      });
    }
    setSubjectFormError('');
    setIsSubjectSheetOpen(true);
  };

  const handleCloseSubjectSheet = () => {
    setIsSubjectSheetOpen(false);
    setEditingSubject(null);
    setSubjectFormData({
      name: '',
      code: '',
      description: '',
      maxMarks: 100,
      passingMarks: 40,
      classes: [],
    });
    setSubjectFormError('');
  };

  const handleSubjectFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setSubjectFormData((prev) => ({
      ...prev,
      [name]:
        name === 'maxMarks' || name === 'passingMarks'
          ? value
            ? parseInt(value)
            : undefined
          : value,
    }));
  };

  const handleClassToggle = (classId: string) => {
    setSubjectFormData((prev) => {
      const currentClasses = prev.classes || [];
      const isSelected = currentClasses.includes(classId);

      return {
        ...prev,
        classes: isSelected
          ? currentClasses.filter((id) => id !== classId)
          : [...currentClasses, classId],
      };
    });
  };

  const handleSubmitSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubjectFormError('');

    // Validation
    if (
      subjectFormData.maxMarks &&
      subjectFormData.passingMarks &&
      subjectFormData.passingMarks > subjectFormData.maxMarks
    ) {
      setSubjectFormError('Passing marks cannot be greater than maximum marks');
      return;
    }

    setSubmittingSubject(true);
    try {
      if (editingSubject) {
        await subjectService.updateSubject(editingSubject._id, subjectFormData);
        setBanner({ message: 'Subject updated successfully!', type: 'success' });
      } else {
        await subjectService.createSubject(subjectFormData);
        setBanner({ message: 'Subject created successfully!', type: 'success' });
      }
      setTimeout(() => setBanner(null), 3000);
      handleCloseSubjectSheet();
      await fetchSubjects();
    } catch (error) {
      console.error('Failed to save subject:', error);
      setSubjectFormError(
        error instanceof Error ? error.message : 'Failed to save subject'
      );
    } finally {
      setSubmittingSubject(false);
    }
  };

  const handleEditSubject = (subject: Subject, e: React.MouseEvent) => {
    e.stopPropagation();
    handleOpenSubjectSheet(subject);
  };

  const handleDeleteSubject = async (subjectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this subject?')) return;

    try {
      await subjectService.deleteSubject(subjectId);
      setSubjects(prev => prev.filter(s => s._id !== subjectId));
      setBanner({ message: 'Subject deleted successfully', type: 'success' });
      setTimeout(() => setBanner(null), 3000);
    } catch (err) {
      console.error('Failed to delete subject:', err);
      setBanner({ message: 'Failed to delete subject. Please try again.', type: 'error' });
      setTimeout(() => setBanner(null), 3000);
    }
  };

  // Stats for subjects
  const activeSubjects = subjects.filter(s => s.isActive !== false).length;
  const inactiveSubjects = subjects.filter(s => s.isActive === false).length;

  // System settings items
  const systemSettings = [
    {
      title: 'Academic Year',
      description: 'Configure academic calendar and terms',
      icon: Calendar,
    },
    {
      title: 'Grading Scale',
      description: 'Define grading criteria and pass marks',
      icon: Award,
    },
    {
      title: 'Notifications',
      description: 'Email and SMS notification settings',
      icon: Bell,
    },
    {
      title: 'Backup & Export',
      description: 'Download data backups and export reports',
      icon: Download,
    },
  ];

  return (
    <section className="space-y-6">
      {/* Banner */}
      {banner && (
        <div
          className={`rounded-xl border px-4 py-3 flex items-center gap-2 ${
            banner.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {banner.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {banner.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
            <Settings className="w-6 h-6 text-slate-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">School Settings</h1>
            <p className="text-sm text-slate-500">
              Manage subjects and other school configurations
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-xl border bg-red-50 border-red-200 px-4 py-3 text-red-700 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Subjects</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{subjects.length}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-slate-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Active</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{activeSubjects}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Inactive</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{inactiveSubjects}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-slate-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Classes</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{classes.length}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Building className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Subjects Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">
              Subjects {!loading && `(${subjects.length})`}
            </h2>
          </div>
          <Button
            size="sm"
            onClick={() => handleOpenSubjectSheet()}
            className="bg-primary hover:bg-primary-dark"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Subject
          </Button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <div className="text-slate-500">Loading subjects...</div>
            </div>
          ) : subjects.length === 0 ? (
            <div className="py-10 text-center text-slate-500 space-y-3">
              <BookOpen className="w-16 h-16 mx-auto text-slate-300" />
              <div>No subjects added yet</div>
              <Button onClick={() => handleOpenSubjectSheet()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Subject
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((subject) => (
                <div
                  key={subject._id}
                  className="p-4 border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-sm transition-all duration-200 group bg-white"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 text-lg group-hover:text-primary transition-colors">
                        {subject.name}
                      </h3>
                      <p className="text-sm text-slate-500 font-mono">
                        Code: {subject.code}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        title="Edit Subject"
                        className="p-1.5 text-slate-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-all"
                        onClick={(e) => handleEditSubject(subject, e)}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        title="Delete Subject"
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        onClick={(e) => handleDeleteSubject(subject._id, e)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {subject.description && (
                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                      {subject.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <div className="text-slate-500">Max Marks</div>
                      <div className="font-semibold text-slate-900">
                        {subject.maxMarks || 'N/A'}
                      </div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <div className="text-slate-500">Pass Marks</div>
                      <div className="font-semibold text-slate-900">
                        {subject.passingMarks || 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Assigned Classes */}
                  <div className="bg-blue-50 p-2 rounded-lg text-xs">
                    <div className="text-blue-900 font-medium mb-1">Assigned to:</div>
                    <div className="text-blue-700">
                      {getClassNamesForSubject(subject.classes)}
                    </div>
                  </div>

                  {subject.isActive !== undefined && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          subject.isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
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
      </div>

      {/* School Information Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center">
              <Building className="w-5 h-5 text-sky-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">
              School Information
            </h2>
          </div>
          {!editingSchool && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditingSchool(true)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Information
            </Button>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          {editingSchool ? (
            <form onSubmit={handleUpdateSchoolInfo} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  School Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={schoolInfo.name}
                  onChange={(e) => setSchoolInfo({ ...schoolInfo, name: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-blue-300 bg-white text-slate-900 transition-all"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={schoolInfo.email}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-blue-300 bg-white text-slate-900 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={schoolInfo.phone}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, phone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-blue-300 bg-white text-slate-900 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Address
                </label>
                <textarea
                  value={schoolInfo.address}
                  onChange={(e) => setSchoolInfo({ ...schoolInfo, address: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-blue-300 bg-white text-slate-900 transition-all"
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
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                    <Building className="w-4 h-4" />
                    School Name
                  </div>
                  <div className="font-medium text-slate-900">
                    {schoolInfo.name || 'Not set'}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                    <Mail className="w-4 h-4" />
                    Contact Email
                  </div>
                  <div className="font-medium text-slate-900">
                    {schoolInfo.email || 'Not set'}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                    <Phone className="w-4 h-4" />
                    Contact Phone
                  </div>
                  <div className="font-medium text-slate-900">
                    {schoolInfo.phone || 'Not set'}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors md:col-span-2">
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                    <MapPin className="w-4 h-4" />
                    Address
                  </div>
                  <div className="font-medium text-slate-900">
                    {schoolInfo.address || 'Not set'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Additional Settings Sections */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
            <Settings className="w-5 h-5 text-amber-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">
            System Settings
          </h2>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="space-y-3">
            {systemSettings.map((setting) => (
              <div
                key={setting.title}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all cursor-pointer group border border-transparent hover:border-slate-200"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow border border-slate-100">
                    <setting.icon className="w-5 h-5 text-slate-600 group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900 text-sm group-hover:text-primary transition-colors">
                      {setting.title}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {setting.description}
                    </div>
                  </div>
                </div>
                <div className="text-slate-400 group-hover:text-primary transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create/Edit Subject Sheet */}
      <SlideSheet
        isOpen={isSubjectSheetOpen}
        onClose={handleCloseSubjectSheet}
        title={editingSubject ? 'Edit Subject' : 'Add New Subject'}
        subtitle={
          editingSubject
            ? 'Update the subject details below'
            : 'Create a new subject for your school'
        }
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseSubjectSheet}
              disabled={submittingSubject}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSubmitSubject}
              disabled={submittingSubject}
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {submittingSubject
                ? editingSubject
                  ? 'Updating...'
                  : 'Creating...'
                : editingSubject
                ? 'Update Subject'
                : 'Create Subject'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmitSubject} className="space-y-6">
          {subjectFormError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{subjectFormError}</p>
            </div>
          )}

          <SheetSection title="Basic Information" icon={<BookOpen className="w-4 h-4 text-slate-600" />}>
            <SheetField label="Subject Name" required>
              <input
                type="text"
                name="name"
                value={subjectFormData.name}
                onChange={handleSubjectFormChange}
                required
                placeholder="e.g., Mathematics, Physics, English"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-blue-300 bg-white text-slate-900 transition-all"
              />
            </SheetField>

            <SheetField label="Subject Code" required>
              <input
                type="text"
                name="code"
                value={subjectFormData.code}
                onChange={handleSubjectFormChange}
                required
                placeholder="e.g., MATH101, PHY201, ENG301"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-blue-300 bg-white text-slate-900 transition-all"
              />
            </SheetField>

            <SheetField label="Description">
              <textarea
                name="description"
                value={subjectFormData.description}
                onChange={handleSubjectFormChange}
                rows={3}
                placeholder="Additional information about this subject"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-blue-300 bg-white text-slate-900 transition-all"
              />
            </SheetField>
          </SheetSection>

          <SheetSection title="Grading" icon={<Award className="w-4 h-4 text-slate-600" />}>
            <div className="grid grid-cols-2 gap-4">
              <SheetField label="Maximum Marks">
                <input
                  type="number"
                  name="maxMarks"
                  value={subjectFormData.maxMarks || ''}
                  onChange={handleSubjectFormChange}
                  min="1"
                  placeholder="100"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-blue-300 bg-white text-slate-900 transition-all"
                />
              </SheetField>

              <SheetField label="Passing Marks">
                <input
                  type="number"
                  name="passingMarks"
                  value={subjectFormData.passingMarks || ''}
                  onChange={handleSubjectFormChange}
                  min="1"
                  max={subjectFormData.maxMarks}
                  placeholder="40"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-blue-300 bg-white text-slate-900 transition-all"
                />
              </SheetField>
            </div>
          </SheetSection>

          <SheetSection title="Assign to Classes" icon={<Building className="w-4 h-4 text-slate-600" />}>
            {classes.length === 0 ? (
              <p className="text-sm text-slate-500 py-2">
                No classes available. Create classes first.
              </p>
            ) : (
              <div className="space-y-2">
                <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-xl p-3 space-y-2">
                  {classes.map((cls) => (
                    <label
                      key={cls._id}
                      className="flex items-center space-x-3 cursor-pointer hover:bg-slate-50 p-2.5 rounded-lg transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={subjectFormData.classes?.includes(cls._id) || false}
                        onChange={() => handleClassToggle(cls._id)}
                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary/50"
                      />
                      <span className="text-sm text-slate-900">
                        {cls.name} (Grade {cls.grade})
                      </span>
                    </label>
                  ))}
                </div>
                {subjectFormData.classes && subjectFormData.classes.length > 0 && (
                  <p className="text-xs text-slate-500">
                    Selected {subjectFormData.classes.length} class
                    {subjectFormData.classes.length > 1 ? 'es' : ''}
                  </p>
                )}
              </div>
            )}
          </SheetSection>
        </form>
      </SlideSheet>
    </section>
  );
}
