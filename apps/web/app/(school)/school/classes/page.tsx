'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@repo/ui/button';
import { classService, type Class } from '@/lib/services/class.service';
import { SlideSheet, SheetSection, SheetField } from '../../../../components/ui/slide-sheet';
import {
  BookOpen,
  Users,
  Plus,
  ChevronRight,
  Layers,
  Clock,
  Info,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
  Download,
  GraduationCap,
  FileText,
} from 'lucide-react';

// Professional Stat Card
function StatCard({
  title,
  value,
  icon: Icon,
  variant = 'default',
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  variant?: 'default' | 'purple' | 'blue' | 'green';
}) {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-600',
    purple: 'bg-purple-100 text-purple-600',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-emerald-100 text-emerald-600',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
        </div>
        <div className={`p-2.5 rounded-lg ${variantStyles[variant]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

export interface ClassFormData {
  name: string;
  grade: string;
  sections: string[];
  description?: string;
  capacity?: number;
}

export default function ClassesPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddClass, setShowAddClass] = useState(false);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state for create class
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

  const showBanner = (type: 'success' | 'error', message: string) => {
    setBanner({ type, message });
    setTimeout(() => setBanner(null), 4000);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (formData.sections.length === 0) {
      setFormError('Please add at least one section');
      return;
    }

    setFormLoading(true);
    try {
      const newClass = await classService.createClass(formData);
      setClasses([...classes, newClass]);
      showBanner('success', `Class "${newClass.name}" added successfully with ${newClass.sections.length} section(s)`);

      // Reset form
      setFormData({
        name: '',
        grade: '',
        sections: [],
        description: '',
        capacity: undefined,
      });
      setSectionInput('');
      setShowAddClass(false);
    } catch (err) {
      console.error('Failed to create class:', err);
      setFormError(err instanceof Error ? err.message : 'Failed to create class');
    } finally {
      setFormLoading(false);
    }
  };

  const handleCloseSheet = () => {
    setShowAddClass(false);
    setFormError('');
    // Optionally reset form when closing
  };

  // Stats
  const stats = useMemo(() => {
    const totalClasses = classes.length;
    const totalSections = classes.reduce((acc, cls) => acc + cls.sections.length, 0);
    const totalCapacity = classes.reduce((acc, cls) => acc + (cls.capacity || 0), 0);
    return { totalClasses, totalSections, totalCapacity };
  }, [classes]);

  return (
    <div className="space-y-6">
      {/* Banner */}
      {banner && (
        <div className={`rounded-lg border px-4 py-3 flex items-center gap-3 ${
          banner.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {banner.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <span className="text-sm font-medium">{banner.message}</span>
          <button
            onClick={() => setBanner(null)}
            className="ml-auto p-1 hover:bg-white/50 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Classes</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your school classes and sections</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setShowAddClass(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Class
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Classes" value={stats.totalClasses} icon={BookOpen} variant="purple" />
        <StatCard title="Total Sections" value={stats.totalSections} icon={Layers} variant="blue" />
        <StatCard title="Total Capacity" value={stats.totalCapacity} icon={Users} variant="green" />
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
          <p className="mt-3 text-sm text-slate-500">Loading classes...</p>
        </div>
      ) : classes.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">No classes found</h3>
          <p className="mt-1 text-sm text-slate-500">
            Get started by creating your first class.
          </p>
          <button
            onClick={() => setShowAddClass(true)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Class
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls) => {
            const updatedDate = new Date(cls.updatedAt).toLocaleDateString();
            return (
              <div
                key={cls._id}
                className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer"
                onClick={() => router.push(`/school/classes/${cls._id}`)}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-lg">
                    {cls.grade}
                  </div>
                  <div>
                    <h3 className="text-slate-900 font-semibold">
                      {cls.name}
                    </h3>
                    <span className="text-xs text-slate-500">Grade {cls.grade}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Layers className="w-4 h-4 text-slate-400" />
                    <span>Sections: {cls.sections.join(', ')}</span>
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

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <button
                    className="w-full text-sm font-medium text-slate-700 hover:text-primary transition-colors flex items-center justify-center gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/school/classes/${cls._id}`);
                    }}
                  >
                    View Details
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Class SlideSheet */}
      <SlideSheet
        isOpen={showAddClass}
        onClose={handleCloseSheet}
        title="Add New Class"
        subtitle="Create a new class with sections"
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              onClick={handleCloseSheet}
              variant="outline"
              disabled={formLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={formLoading}
              onClick={handleSubmit}
              className="bg-primary hover:bg-primary-dark text-white"
            >
              {formLoading ? (
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
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error message */}
          {formError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {formError}
              </p>
            </div>
          )}

          {/* Section: Class Information */}
          <SheetSection
            title="Class Information"
            icon={<GraduationCap className="w-4 h-4 text-slate-600" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SheetField label="Class Name" required>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Class 10, Grade 5"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white
                      focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                      hover:border-slate-300 transition-all"
                  />
                </div>
              </SheetField>

              <SheetField label="Grade/Level" required>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                    required
                    placeholder="e.g., 10, 5, 12"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white
                      focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                      hover:border-slate-300 transition-all"
                  />
                </div>
              </SheetField>
            </div>
          </SheetSection>

          {/* Section: Sections */}
          <SheetSection
            title="Sections"
            icon={<Layers className="w-4 h-4 text-slate-600" />}
          >
            <SheetField label="Add Sections" required>
              <div className="flex gap-2 mb-3">
                <div className="relative flex-1">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
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
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white
                      focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                      hover:border-slate-300 transition-all"
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleAddSection}
                  variant="outline"
                  className="px-4"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
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
            </SheetField>
          </SheetSection>

          {/* Section: Capacity */}
          <SheetSection
            title="Capacity"
            icon={<Users className="w-4 h-4 text-slate-600" />}
          >
            <SheetField label="Total Capacity (Optional)">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Users className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity || ''}
                  onChange={handleChange}
                  min={1}
                  placeholder="Maximum number of students"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white
                    focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                    hover:border-slate-300 transition-all"
                />
              </div>
            </SheetField>
          </SheetSection>

          {/* Section: Description */}
          <SheetSection
            title="Description"
            icon={<FileText className="w-4 h-4 text-slate-600" />}
          >
            <SheetField label="Description (Optional)">
              <div className="relative">
                <div className="absolute left-3 top-3 text-slate-400">
                  <FileText className="w-4 h-4" />
                </div>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Additional information about this class"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white
                    focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                    hover:border-slate-300 transition-all resize-none"
                />
              </div>
            </SheetField>
          </SheetSection>
        </form>
      </SlideSheet>
    </div>
  );
}
