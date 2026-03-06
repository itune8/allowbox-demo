'use client';

import { useState, useEffect, useMemo } from 'react';
import { SchoolStatCard, SchoolStatusBadge, FormModal, ConfirmModal, useToast } from '../../../../components/school';
import {
  BookOpen,
  Users,
  Clock,
  GraduationCap,
  Plus,
  X,
  Loader2,
  Download,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  BookMarked,
  Calculator,
  Beaker,
  Globe,
  History,
  Palette,
  Music,
  Trophy,
} from 'lucide-react';

// Types
interface Subject {
  id: string;
  name: string;
  code: string;
  category: 'core' | 'elective' | 'language' | 'sports' | 'arts';
  description?: string;
  credits?: number;
  teachersAssigned: number;
  classesAssigned: number;
  totalStudents: number;
  hoursPerWeek: number;
  status: 'active' | 'inactive';
}

// Category Badge
function CategoryBadge({ category }: { category: Subject['category'] }) {
  const styles: Record<string, string> = {
    core: 'bg-blue-50 text-blue-700 border-blue-200',
    elective: 'bg-purple-50 text-purple-700 border-purple-200',
    language: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    sports: 'bg-amber-50 text-amber-700 border-amber-200',
    arts: 'bg-pink-50 text-pink-700 border-pink-200',
  };

  const labels: Record<string, string> = {
    core: 'Core',
    elective: 'Elective',
    language: 'Language',
    sports: 'Sports',
    arts: 'Arts',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${styles[category]}`}>
      {labels[category]}
    </span>
  );
}

export default function SubjectsPage() {
  const { showToast } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showDetailsModal, setShowDetailsModal] = useState<Subject | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulated API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock data
      const mockSubjects: Subject[] = [
        {
          id: '1',
          name: 'Mathematics',
          code: 'MATH-101',
          category: 'core',
          description: 'Fundamental mathematics concepts and applications',
          credits: 4,
          teachersAssigned: 5,
          classesAssigned: 12,
          totalStudents: 350,
          hoursPerWeek: 6,
          status: 'active',
        },
        {
          id: '2',
          name: 'Physics',
          code: 'PHY-101',
          category: 'core',
          description: 'Introduction to classical and modern physics',
          credits: 4,
          teachersAssigned: 3,
          classesAssigned: 8,
          totalStudents: 240,
          hoursPerWeek: 5,
          status: 'active',
        },
        {
          id: '3',
          name: 'English Literature',
          code: 'ENG-101',
          category: 'language',
          description: 'Study of English language and literature',
          credits: 3,
          teachersAssigned: 4,
          classesAssigned: 10,
          totalStudents: 300,
          hoursPerWeek: 4,
          status: 'active',
        },
        {
          id: '4',
          name: 'Computer Science',
          code: 'CS-101',
          category: 'elective',
          description: 'Programming fundamentals and computational thinking',
          credits: 3,
          teachersAssigned: 2,
          classesAssigned: 6,
          totalStudents: 180,
          hoursPerWeek: 4,
          status: 'active',
        },
        {
          id: '5',
          name: 'Spanish',
          code: 'SPN-101',
          category: 'language',
          description: 'Introduction to Spanish language and culture',
          credits: 2,
          teachersAssigned: 2,
          classesAssigned: 4,
          totalStudents: 120,
          hoursPerWeek: 3,
          status: 'active',
        },
        {
          id: '6',
          name: 'Physical Education',
          code: 'PE-101',
          category: 'sports',
          description: 'Physical fitness and sports activities',
          credits: 1,
          teachersAssigned: 3,
          classesAssigned: 15,
          totalStudents: 450,
          hoursPerWeek: 2,
          status: 'active',
        },
        {
          id: '7',
          name: 'Art & Design',
          code: 'ART-101',
          category: 'arts',
          description: 'Creative arts and design principles',
          credits: 2,
          teachersAssigned: 2,
          classesAssigned: 5,
          totalStudents: 150,
          hoursPerWeek: 3,
          status: 'active',
        },
        {
          id: '8',
          name: 'Chemistry',
          code: 'CHEM-101',
          category: 'core',
          description: 'Basic chemistry concepts and laboratory work',
          credits: 4,
          teachersAssigned: 3,
          classesAssigned: 8,
          totalStudents: 240,
          hoursPerWeek: 5,
          status: 'active',
        },
      ];

      setSubjects(mockSubjects);
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
      setError('Failed to load subjects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredSubjects = useMemo(() => {
    return subjects.filter(subject => {
      const matchesCategory = !categoryFilter || subject.category === categoryFilter;
      const matchesStatus = !statusFilter || subject.status === statusFilter;
      return matchesCategory && matchesStatus;
    });
  }, [subjects, categoryFilter, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    const totalSubjects = subjects.length;
    const activeSubjects = subjects.filter(s => s.status === 'active').length;
    const inactiveSubjects = subjects.filter(s => s.status === 'inactive').length;
    const totalTeachers = subjects.reduce((sum, s) => sum + s.teachersAssigned, 0);
    return { totalSubjects, activeSubjects, inactiveSubjects, totalTeachers };
  }, [subjects]);

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, 500));
      showToast('success', 'Subject created successfully');
      setShowFormModal(false);
      await fetchSubjects();
    } catch (error) {
      console.error('Failed to create subject:', error);
      showToast('error', 'Failed to create subject. Please try again.');
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    try {
      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setSubjects(prev => prev.filter(s => s.id !== subjectId));
      showToast('success', 'Subject deleted successfully');
    } catch (err) {
      console.error('Failed to delete subject:', err);
      showToast('error', 'Failed to delete subject. Please try again.');
    }
  };

  const getCategoryIcon = (category: Subject['category']) => {
    switch (category) {
      case 'core': return Calculator;
      case 'elective': return BookMarked;
      case 'language': return Globe;
      case 'sports': return Trophy;
      case 'arts': return Palette;
      default: return BookOpen;
    }
  };

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
            onClick={() => setShowFormModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Subject
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SchoolStatCard
          icon={<BookOpen className="w-5 h-5" />}
          color="blue"
          label="Total Subjects"
          value={stats.totalSubjects}
        />
        <SchoolStatCard
          icon={<CheckCircle className="w-5 h-5" />}
          color="green"
          label="Active"
          value={stats.activeSubjects}
        />
        <SchoolStatCard
          icon={<XCircle className="w-5 h-5" />}
          color="slate"
          label="Inactive"
          value={stats.inactiveSubjects}
        />
        <SchoolStatCard
          icon={<Users className="w-5 h-5" />}
          color="purple"
          label="Teachers Assigned"
          value={stats.totalTeachers}
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-slate-600 w-[70px] flex-shrink-0">Category:</span>
            <div className="flex flex-wrap gap-2">
              {[
                { value: '', label: 'All' },
                { value: 'core', label: 'Core' },
                { value: 'elective', label: 'Elective' },
                { value: 'language', label: 'Language' },
                { value: 'sports', label: 'Sports' },
                { value: 'arts', label: 'Arts' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setCategoryFilter(option.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    categoryFilter === option.value
                      ? 'bg-[#824ef2] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-slate-600 w-[70px] flex-shrink-0">Status:</span>
            <div className="flex flex-wrap gap-2">
              {[
                { value: '', label: 'All' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setStatusFilter(option.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === option.value
                      ? 'bg-[#824ef2] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Subjects Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Desktop Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm hidden md:table">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="pl-[64px] pr-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Subject</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Code</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Credits</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Teachers</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Students</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <Loader2 className="w-8 h-8 text-[#824ef2] animate-spin mx-auto" />
                    <p className="mt-3 text-sm text-slate-500">Loading subjects...</p>
                  </td>
                </tr>
              ) : filteredSubjects.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <BookOpen className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-sm font-medium">{subjects.length === 0 ? 'No subjects added yet' : 'No subjects found with selected filters'}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {subjects.length === 0 ? 'Add your first subject to get started' : 'Try selecting different filters'}
                      </p>
                      {subjects.length === 0 && (
                        <button
                          onClick={() => setShowFormModal(true)}
                          className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Add Subject
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSubjects.map((subject) => {
                  const CategoryIcon = getCategoryIcon(subject.category);
                  return (
                    <tr
                      key={subject.id}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => setShowDetailsModal(subject)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                            <CategoryIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="font-medium text-slate-900">{subject.name}</span>
                            {subject.description && (
                              <p className="text-xs text-slate-500 line-clamp-1">{subject.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-mono text-xs">
                        {subject.code}
                      </td>
                      <td className="px-4 py-3">
                        <CategoryBadge category={subject.category} />
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {subject.credits || '\u2014'}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {subject.teachersAssigned}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {subject.totalStudents}
                      </td>
                      <td className="px-4 py-3">
                        <SchoolStatusBadge value={subject.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            title="View"
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDetailsModal(subject);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            title="Edit"
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle edit
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            title="Delete"
                            className="p-1.5 rounded-lg hover:bg-red-100 text-slate-400 hover:text-red-600 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTarget({ id: subject.id, name: subject.name });
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-slate-100">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-[#824ef2] animate-spin" />
              <p className="mt-3 text-sm text-slate-500">Loading subjects...</p>
            </div>
          ) : filteredSubjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-slate-500 py-16 px-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-sm font-medium">{subjects.length === 0 ? 'No subjects added yet' : 'No subjects found'}</p>
              {subjects.length === 0 && (
                <button
                  onClick={() => setShowFormModal(true)}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#824ef2] rounded-lg"
                >
                  <Plus className="w-4 h-4" />
                  Add Subject
                </button>
              )}
            </div>
          ) : (
            filteredSubjects.map((subject) => {
              const CategoryIcon = getCategoryIcon(subject.category);
              return (
                <div
                  key={subject.id}
                  className="p-4 hover:bg-slate-50 cursor-pointer"
                  onClick={() => setShowDetailsModal(subject)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                        <CategoryIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{subject.name}</p>
                        <p className="text-xs text-slate-500 font-mono">{subject.code}</p>
                      </div>
                    </div>
                    <CategoryBadge category={subject.category} />
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <p className="text-slate-500">Teachers</p>
                      <p className="font-medium text-slate-900">{subject.teachersAssigned}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Students</p>
                      <p className="font-medium text-slate-900">{subject.totalStudents}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Status</p>
                      <SchoolStatusBadge value={subject.status} />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Table Footer */}
        {filteredSubjects.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 text-sm text-slate-600">
            Showing {filteredSubjects.length} of {subjects.length} subjects
          </div>
        )}
      </div>

      {/* Subject Details Modal */}
      {showDetailsModal && (
        <FormModal
          open={!!showDetailsModal}
          onClose={() => setShowDetailsModal(null)}
          title="Subject Details"
          size="lg"
          footer={
            <>
              <button
                onClick={() => setShowDetailsModal(null)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  // Handle edit
                }}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit Subject
              </button>
            </>
          }
        >
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              {(() => {
                const CategoryIcon = getCategoryIcon(showDetailsModal.category);
                return (
                  <div className="w-14 h-14 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                    <CategoryIcon className="w-7 h-7" />
                  </div>
                );
              })()}
              <div>
                <h4 className="text-xl font-semibold text-slate-900">{showDetailsModal.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-slate-500 font-mono">{showDetailsModal.code}</span>
                  <CategoryBadge category={showDetailsModal.category} />
                  <SchoolStatusBadge value={showDetailsModal.status} />
                </div>
              </div>
            </div>

            {showDetailsModal.description && (
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">{showDetailsModal.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-slate-500 uppercase tracking-wider">Teachers</span>
                </div>
                <p className="text-2xl font-semibold text-slate-900">{showDetailsModal.teachersAssigned}</p>
                <p className="text-xs text-slate-500 mt-1">Assigned teachers</p>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-slate-500 uppercase tracking-wider">Students</span>
                </div>
                <p className="text-2xl font-semibold text-slate-900">{showDetailsModal.totalStudents}</p>
                <p className="text-xs text-slate-500 mt-1">Enrolled students</p>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-slate-500 uppercase tracking-wider">Classes</span>
                </div>
                <p className="text-2xl font-semibold text-slate-900">{showDetailsModal.classesAssigned}</p>
                <p className="text-xs text-slate-500 mt-1">Active classes</p>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-slate-500 uppercase tracking-wider">Hours/Week</span>
                </div>
                <p className="text-2xl font-semibold text-slate-900">{showDetailsModal.hoursPerWeek}</p>
                <p className="text-xs text-slate-500 mt-1">Teaching hours</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Subject Information</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-500">Subject Code</span>
                  <span className="text-sm font-medium text-slate-900">{showDetailsModal.code}</span>
                </div>
                <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-500">Category</span>
                  <span className="text-sm font-medium text-slate-900 capitalize">{showDetailsModal.category}</span>
                </div>
                <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-500">Credits</span>
                  <span className="text-sm font-medium text-slate-900">{showDetailsModal.credits?.toString() || '\u2014'}</span>
                </div>
                <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-500">Status</span>
                  <SchoolStatusBadge value={showDetailsModal.status} />
                </div>
              </div>
            </div>
          </div>
        </FormModal>
      )}

      {/* Create Subject Modal */}
      <FormModal
        open={showFormModal}
        onClose={() => setShowFormModal(false)}
        title="Add New Subject"
        size="lg"
      >
        <form onSubmit={handleCreateSubject} className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Subject Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] text-slate-900"
                  placeholder="e.g., Mathematics"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Subject Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] text-slate-900 font-mono"
                  placeholder="e.g., MATH-101"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] text-slate-900"
                >
                  <option value="">Select category</option>
                  <option value="core">Core</option>
                  <option value="elective">Elective</option>
                  <option value="language">Language</option>
                  <option value="sports">Sports</option>
                  <option value="arts">Arts</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] text-slate-900"
                  placeholder="Brief description of the subject"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Course Details</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Credits</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] text-slate-900"
                    placeholder="e.g., 4"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Hours/Week <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] text-slate-900"
                    placeholder="e.g., 6"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] text-slate-900"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowFormModal(false)}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Subject
            </button>
          </div>
        </form>
      </FormModal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Subject"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmColor="red"
        onConfirm={() => {
          if (deleteTarget) {
            handleDeleteSubject(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
