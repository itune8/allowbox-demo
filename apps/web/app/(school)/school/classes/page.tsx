'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { classService, type Class } from '@/lib/services/class.service';
import { SchoolStatCard, FormModal, ConfirmModal, useToast, Pagination } from '../../../../components/school';
import {
  BookOpen,
  Users,
  Plus,
  Layers,
  Clock,
  Info,
  Loader2,
  X,
  Download,
  GraduationCap,
  FileText,
  Edit,
  Trash2,
  Calendar,
  LayoutGrid,
  ClipboardList,
  Search,
} from 'lucide-react';

export interface ClassFormData {
  name: string;
  grade: string;
  sections: string[];
  description?: string;
  capacity?: number;
}

const headerColors = ['bg-[#824ef2]', 'bg-blue-600', 'bg-emerald-600'];

export default function ClassesPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showAddClass, setShowAddClass] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingClass, setDeletingClass] = useState<Class | null>(null);

  // Form state
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [sectionInput, setSectionInput] = useState('');
  const [formData, setFormData] = useState<ClassFormData>({
    name: '',
    grade: '',
    sections: [],
    description: '',
    capacity: undefined,
  });

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await classService.getClasses();
      setClasses(data);
    } catch (err) {
      console.error('Failed to fetch classes:', err);
      setError('Failed to load classes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

  const resetForm = () => {
    setFormData({ name: '', grade: '', sections: [], description: '', capacity: undefined });
    setSectionInput('');
    setFormError('');
    setEditingClass(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowAddClass(true);
  };

  const handleOpenEdit = (cls: Class) => {
    setEditingClass(cls);
    setFormData({
      name: cls.name,
      grade: cls.grade,
      sections: [...cls.sections],
      description: cls.description || '',
      capacity: cls.capacity || undefined,
    });
    setFormError('');
    setShowAddClass(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (formData.sections.length === 0) {
      setFormError('Please add at least one section');
      return;
    }

    setFormLoading(true);
    try {
      if (editingClass) {
        await classService.updateClass(editingClass._id, formData);
        showToast('success', `Class "${formData.name}" updated successfully`);
      } else {
        const newClass = await classService.createClass(formData);
        showToast('success', `Class "${newClass.name}" added successfully with ${newClass.sections.length} section(s)`);
      }
      await fetchClasses();
      resetForm();
      setShowAddClass(false);
    } catch (err) {
      console.error('Failed to save class:', err);
      setFormError(err instanceof Error ? err.message : 'Failed to save class');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteClick = (cls: Class) => {
    setDeletingClass(cls);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingClass) return;
    try {
      await classService.deleteClass(deletingClass._id);
      showToast('success', `Class "${deletingClass.name}" deleted successfully`);
      await fetchClasses();
    } catch (err) {
      console.error('Failed to delete class:', err);
      showToast('error', 'Failed to delete class');
    } finally {
      setShowDeleteConfirm(false);
      setDeletingClass(null);
    }
  };

  // Stats
  const stats = useMemo(() => {
    const totalClasses = classes.length;
    const activeClasses = classes.filter(c => c.sections.length > 0).length;
    const totalSections = classes.reduce((acc, cls) => acc + cls.sections.length, 0);
    const totalCapacity = classes.reduce((acc, cls) => acc + (cls.capacity || 0), 0);
    return { totalClasses, activeClasses, totalSections, totalCapacity };
  }, [classes]);

  // Filtered classes
  const filteredClasses = useMemo(() => {
    if (!searchQuery.trim()) return classes;
    const q = searchQuery.toLowerCase();
    return classes.filter(
      cls => cls.name.toLowerCase().includes(q) || cls.grade.toLowerCase().includes(q)
    );
  }, [classes, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Class
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SchoolStatCard
          icon={<BookOpen className="w-5 h-5" />}
          color="purple"
          label="Total Classes"
          value={stats.totalClasses}
        />
        <SchoolStatCard
          icon={<GraduationCap className="w-5 h-5" />}
          color="green"
          label="Active Classes"
          value={stats.activeClasses}
        />
        <SchoolStatCard
          icon={<Layers className="w-5 h-5" />}
          color="blue"
          label="Total Sections"
          value={stats.totalSections}
        />
        <SchoolStatCard
          icon={<Users className="w-5 h-5" />}
          color="orange"
          label="Total Students"
          value={stats.totalCapacity}
        />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search classes by name or grade..."
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] hover:border-slate-300 transition-all"
        />
      </div>

      {/* Loading / Empty / Grid */}
      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
          <Loader2 className="w-8 h-8 text-[#824ef2] animate-spin mx-auto" />
          <p className="mt-3 text-sm text-slate-500">Loading classes...</p>
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">No classes found</h3>
          <p className="mt-1 text-sm text-slate-500">
            {searchQuery ? 'No results match your search.' : 'Get started by creating your first class.'}
          </p>
          {!searchQuery && (
            <button
              onClick={handleOpenAdd}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Class
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClasses.map((cls, index) => {
            const colorIndex = index % 3;
            const updatedDate = new Date(cls.updatedAt).toLocaleDateString();
            return (
              <div
                key={cls._id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-slate-300 hover:shadow-sm transition-all"
              >
                {/* Colored header band */}
                <div className={`${headerColors[colorIndex]} px-5 py-4`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-semibold text-lg">{cls.name}</h3>
                      <span className="text-white/80 text-sm">Academic Year {new Date().getFullYear()}</span>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold text-lg">
                      {cls.grade}
                    </div>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-5">
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Layers className="w-4 h-4 text-slate-400" />
                      <span>Sections: {cls.sections.join(', ') || 'None'}</span>
                    </div>
                    {cls.capacity && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span>Capacity: {cls.capacity}</span>
                      </div>
                    )}
                    {cls.description && (
                      <div className="flex items-start gap-2 text-sm text-slate-600">
                        <Info className="w-4 h-4 text-slate-400 mt-0.5" />
                        <span className="line-clamp-2">{cls.description}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Updated: {updatedDate}</span>
                    </div>
                  </div>

                  {/* 4 icon shortcut buttons */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <button
                      onClick={() => router.push(`/school/classes/${cls._id}?tab=sections`)}
                      className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-slate-50 transition-colors group"
                      title="Sections"
                    >
                      <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                        <LayoutGrid className="w-4 h-4 text-purple-600" />
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">Sections</span>
                    </button>
                    <button
                      onClick={() => router.push(`/school/classes/${cls._id}?tab=timetable`)}
                      className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-slate-50 transition-colors group"
                      title="Timetable"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                        <Calendar className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">Timetable</span>
                    </button>
                    <button
                      onClick={() => router.push(`/school/classes/${cls._id}?tab=subjects`)}
                      className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-slate-50 transition-colors group"
                      title="Subjects"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                        <BookOpen className="w-4 h-4 text-emerald-600" />
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">Subjects</span>
                    </button>
                    <button
                      onClick={() => router.push(`/school/classes/${cls._id}?tab=students`)}
                      className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-slate-50 transition-colors group"
                      title="Students"
                    >
                      <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                        <Users className="w-4 h-4 text-orange-600" />
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">Students</span>
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => router.push(`/school/classes/${cls._id}`)}
                      className="flex-1 text-sm font-medium text-[#824ef2] hover:bg-purple-50 py-2 rounded-lg transition-colors text-center"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleOpenEdit(cls)}
                      className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(cls)}
                      className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Class FormModal */}
      <FormModal
        open={showAddClass}
        title={editingClass ? 'Edit Class' : 'Add New Class'}
        onClose={() => { setShowAddClass(false); resetForm(); }}
        size="lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => { setShowAddClass(false); resetForm(); }}
              disabled={formLoading}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="class-form"
              disabled={formLoading}
              className="px-6 py-2 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {formLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {editingClass ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <BookOpen className="w-4 h-4" />
                  {editingClass ? 'Update Class' : 'Create Class'}
                </>
              )}
            </button>
          </>
        }
      >
        <form id="class-form" onSubmit={handleSubmit} className="space-y-5">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {formError}
            </div>
          )}

          {/* Class Information */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-slate-600" />
              Class Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Class Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Class 10, Grade 5"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] hover:border-slate-300 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Grade/Level <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 10, 5, 12"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] hover:border-slate-300 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Sections */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-600" />
              Sections
            </h4>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Add Sections <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={sectionInput}
                onChange={(e) => setSectionInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSection();
                  }
                }}
                placeholder="e.g., A, B, C"
                className="flex-1 px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] hover:border-slate-300 transition-all"
              />
              <button
                type="button"
                onClick={handleAddSection}
                className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
            {formData.sections.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.sections.map((section) => (
                  <span
                    key={section}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium border border-slate-200"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    Section {section}
                    <button
                      type="button"
                      onClick={() => handleRemoveSection(section)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Capacity */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-600" />
              Capacity
            </h4>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Total Capacity (Optional)</label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity || ''}
              onChange={handleChange}
              min={1}
              placeholder="Maximum number of students"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] hover:border-slate-300 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-600" />
              Description
            </h4>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description (Optional)</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Additional information about this class"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] hover:border-slate-300 transition-all resize-none"
            />
          </div>
        </form>
      </FormModal>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        open={showDeleteConfirm}
        title="Delete Class"
        message={`Are you sure you want to delete "${deletingClass?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmColor="red"
        onConfirm={handleDeleteConfirm}
        onCancel={() => { setShowDeleteConfirm(false); setDeletingClass(null); }}
      />
    </div>
  );
}
