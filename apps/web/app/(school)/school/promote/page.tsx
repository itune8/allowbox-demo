'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  classService,
  Class,
} from '../../../../lib/services/class.service';
import { userService } from '../../../../lib/services/user.service';
import type { User } from '../../../../lib/services/user.service';
import {
  gradesService,
  Grade,
} from '../../../../lib/services/grades.service';
import {
  FormModal,
  useToast,
  SchoolStatCard,
  Pagination,
  CustomSelect,
} from '../../../../components/school';
import {
  Users,
  Search,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
  GraduationCap,
  ArrowUpRight,
  ArrowLeft,
  Loader2,
  Filter,
  BookOpen,
  ChevronRight,
  Info,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────
type PromotionStatus = 'Promoted' | 'Pending' | 'Results Pending';
type FinalResult = 'Published' | 'Pending';
type ViewMode = 'all' | 'byClass';

interface StudentPromotion {
  student: User;
  rollNo: string;
  className: string;
  classId: string;
  section: string;
  finalResult: FinalResult;
  percentage: number;
  status: PromotionStatus;
  grades: Grade[];
}

interface ClassCardData {
  id: string;
  name: string;
  sections: string[];
  totalStudents: number;
  promotedCount: number;
}

// ─── Color Palettes ──────────────────────────────────────────────
const subjectIconColors = [
  { bg: 'bg-blue-50', text: 'text-blue-600' },
  { bg: 'bg-emerald-50', text: 'text-emerald-600' },
  { bg: 'bg-purple-50', text: 'text-purple-600' },
  { bg: 'bg-orange-50', text: 'text-orange-600' },
  { bg: 'bg-pink-50', text: 'text-pink-600' },
  { bg: 'bg-cyan-50', text: 'text-cyan-600' },
];

const classCardColors = [
  { iconBg: 'bg-purple-100', iconText: 'text-purple-600' },
  { iconBg: 'bg-pink-100', iconText: 'text-pink-600' },
  { iconBg: 'bg-emerald-100', iconText: 'text-emerald-600' },
  { iconBg: 'bg-amber-100', iconText: 'text-amber-600' },
  { iconBg: 'bg-blue-100', iconText: 'text-blue-600' },
  { iconBg: 'bg-rose-100', iconText: 'text-rose-600' },
  { iconBg: 'bg-indigo-100', iconText: 'text-indigo-600' },
  { iconBg: 'bg-red-100', iconText: 'text-red-600' },
];

const sectionLetterColors = [
  { bg: 'bg-blue-100', text: 'text-blue-700' },
  { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  { bg: 'bg-orange-100', text: 'text-orange-700' },
  { bg: 'bg-purple-100', text: 'text-purple-700' },
];

// ─── Helpers ─────────────────────────────────────────────────────
function getLetterGrade(pct: number): string {
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B+';
  if (pct >= 60) return 'B';
  if (pct >= 50) return 'C';
  if (pct >= 40) return 'D';
  return 'F';
}

function getSubjectCategory(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('math')) return 'Mathematics';
  if (n.includes('eng')) return 'Language';
  if (n.includes('sci') || n.includes('phy') || n.includes('chem') || n.includes('bio')) return 'Science';
  if (n.includes('hist') || n.includes('geo') || n.includes('social')) return 'Social Studies';
  if (n.includes('hindi') || n.includes('lang')) return 'Language';
  if (n.includes('comp') || n.includes('it')) return 'Technology';
  if (n.includes('art') || n.includes('draw')) return 'Creative Arts';
  return 'Subject';
}

function getInitials(first: string, last: string): string {
  return `${first?.charAt(0) || ''}${last?.charAt(0) || ''}`.toUpperCase();
}

function getClassName(student: User): string {
  if (!student.classId) return 'Unassigned';
  if (typeof student.classId === 'object' && student.classId !== null) {
    return (student.classId as any).name || (student.classId as any).grade || 'Unknown';
  }
  return 'Unknown';
}

function getClassIdStr(student: User): string {
  if (!student.classId) return '';
  if (typeof student.classId === 'string') return student.classId;
  return (student.classId as any)?._id || (student.classId as any)?.id || '';
}

// Seeded pseudo-random for consistent "already promoted" marking
function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const ch = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash |= 0;
  }
  return Math.abs(hash % 100) / 100;
}

// ─── Main Page Component ─────────────────────────────────────────
export default function StudentPromotionPage() {
  const { showToast } = useToast();

  // Data state
  const [students, setStudents] = useState<User[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [allGrades, setAllGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PromotionStatus>('all');

  // By Class navigation
  const [selectedClassCard, setSelectedClassCard] = useState<ClassCardData | null>(null);
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string | null>(null);

  // Promotion state (local, since no backend API)
  const [promotionMap, setPromotionMap] = useState<Record<string, PromotionStatus>>({});

  // Modal state
  const [viewMarksStudent, setViewMarksStudent] = useState<StudentPromotion | null>(null);
  const [confirmPromoteStudent, setConfirmPromoteStudent] = useState<StudentPromotion | null>(null);
  const [promoteToClass, setPromoteToClass] = useState('');
  const [promoteToSection, setPromoteToSection] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkClass, setBulkClass] = useState('');
  const [bulkSection, setBulkSection] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const perPage = 10;

  // ─── Data Loading ────────────────────────────────────────────
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const [studentsData, classesData] = await Promise.all([
        userService.getStudents(),
        classService.getClasses(),
      ]);
      setStudents(studentsData);
      setClasses(classesData);

      // Load grades from all classes
      if (classesData.length > 0) {
        const gradePromises = classesData.map((cls) =>
          gradesService.getClassGrades(cls._id).catch(() => [] as Grade[])
        );
        const gradeArrays = await Promise.all(gradePromises);
        const grades = gradeArrays.flat();
        setAllGrades(grades);

        // Build initial promotion map
        const map: Record<string, PromotionStatus> = {};
        studentsData.forEach((student) => {
          const sid = student.id || (student as any)._id || '';
          const studentGrades = grades.filter(
            (g) => g.studentId?._id === sid
          );
          if (studentGrades.length === 0) {
            map[sid] = 'Results Pending';
          } else {
            const avg =
              studentGrades.reduce((sum, g) => sum + g.percentage, 0) /
              studentGrades.length;
            if (avg >= 40) {
              // ~60% already promoted for demo
              map[sid] = seededRandom(sid) < 0.6 ? 'Promoted' : 'Pending';
            } else {
              map[sid] = 'Results Pending';
            }
          }
        });
        setPromotionMap(map);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // ─── Derived Data ────────────────────────────────────────────
  const gradesByStudent = useMemo(() => {
    const map: Record<string, Grade[]> = {};
    allGrades.forEach((g) => {
      const sid = g.studentId?._id;
      if (sid) {
        if (!map[sid]) map[sid] = [];
        map[sid]!.push(g);
      }
    });
    return map;
  }, [allGrades]);

  const studentPromotions: StudentPromotion[] = useMemo(() => {
    return students.map((student) => {
      const sid = student.id || (student as any)._id || '';
      const studentGrades = gradesByStudent[sid] || [];
      const hasGrades = studentGrades.length > 0;
      const avg = hasGrades
        ? studentGrades.reduce((sum, g) => sum + g.percentage, 0) /
          studentGrades.length
        : 0;

      const finalResult: FinalResult = hasGrades && avg >= 40 ? 'Published' : 'Pending';
      const status = promotionMap[sid] || 'Results Pending';

      return {
        student,
        rollNo: (student as any).rollNumber || student.studentId || '-',
        className: getClassName(student),
        classId: getClassIdStr(student),
        section: student.section || '-',
        finalResult,
        percentage: Math.round(avg * 10) / 10,
        status,
        grades: studentGrades,
      };
    });
  }, [students, gradesByStudent, promotionMap]);

  // Stats
  const stats = useMemo(() => {
    const total = studentPromotions.length;
    const promoted = studentPromotions.filter((s) => s.status === 'Promoted').length;
    const pending = studentPromotions.filter((s) => s.status === 'Pending').length;
    const resultsPending = studentPromotions.filter((s) => s.status === 'Results Pending').length;
    return { total, promoted, pending, resultsPending };
  }, [studentPromotions]);

  // Class card data
  const classCardsData: ClassCardData[] = useMemo(() => {
    return classes.map((cls) => {
      const classStudents = studentPromotions.filter((s) => s.classId === cls._id);
      const promoted = classStudents.filter((s) => s.status === 'Promoted').length;
      return {
        id: cls._id,
        name: cls.name,
        sections: cls.sections || [],
        totalStudents: classStudents.length,
        promotedCount: promoted,
      };
    });
  }, [classes, studentPromotions]);

  // Filtered students for table
  const filteredStudents = useMemo(() => {
    let result = [...studentPromotions];

    // By Class filter
    if (viewMode === 'byClass' && selectedClassCard) {
      result = result.filter((s) => s.classId === selectedClassCard.id);
      if (selectedSectionFilter && selectedSectionFilter !== '__all__') {
        result = result.filter((s) => s.section === selectedSectionFilter);
      }
    }

    // Search
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((s) => {
        const name = `${s.student.firstName} ${s.student.lastName}`.toLowerCase();
        const id = (s.student.studentId || '').toLowerCase();
        return name.includes(q) || id.includes(q);
      });
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((s) => s.status === statusFilter);
    }

    return result;
  }, [studentPromotions, viewMode, selectedClassCard, selectedSectionFilter, searchQuery, statusFilter]);

  const paginatedStudents = useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredStudents.slice(start, start + perPage);
  }, [filteredStudents, page]);

  // ─── Actions ─────────────────────────────────────────────────
  const handlePromoteStudent = useCallback(
    (sp: StudentPromotion) => {
      if (sp.status === 'Results Pending') return;
      if (sp.status === 'Promoted') {
        showToast('info', `${sp.student.firstName} ${sp.student.lastName} is already promoted.`);
        return;
      }
      // Find next class
      const currentClassIdx = classes.findIndex((c) => c._id === sp.classId);
      const nextClass = currentClassIdx >= 0 && currentClassIdx < classes.length - 1
        ? classes[currentClassIdx + 1]
        : classes[0];
      setConfirmPromoteStudent(sp);
      setPromoteToClass(nextClass?._id || '');
      setPromoteToSection(nextClass?.sections?.[0] || '');
    },
    [classes, showToast]
  );

  const confirmPromotion = useCallback(() => {
    if (!confirmPromoteStudent) return;
    const sid = confirmPromoteStudent.student.id || (confirmPromoteStudent.student as any)._id || '';
    setPromotionMap((prev) => ({ ...prev, [sid]: 'Promoted' }));
    const targetClassName = classes.find((c) => c._id === promoteToClass)?.name || 'next class';
    showToast(
      'success',
      `${confirmPromoteStudent.student.firstName} ${confirmPromoteStudent.student.lastName} promoted to ${targetClassName}${promoteToSection ? ` - Section ${promoteToSection}` : ''}`
    );
    setConfirmPromoteStudent(null);
    setPromoteToClass('');
    setPromoteToSection('');
  }, [confirmPromoteStudent, promoteToClass, promoteToSection, classes, showToast]);

  const handleBulkPromote = useCallback(() => {
    const classStudents = studentPromotions.filter((s) => {
      if (!bulkClass) return false;
      const matchClass = s.classId === bulkClass;
      if (bulkSection) return matchClass && s.section === bulkSection;
      return matchClass;
    });

    const eligible = classStudents.filter((s) => s.status === 'Pending');
    if (eligible.length === 0) {
      showToast('warning', 'No eligible students to promote.');
      setShowBulkModal(false);
      return;
    }

    const newMap = { ...promotionMap };
    eligible.forEach((s) => {
      const sid = s.student.id || (s.student as any)._id || '';
      newMap[sid] = 'Promoted';
    });
    setPromotionMap(newMap);
    showToast('success', `Successfully promoted ${eligible.length} students!`);
    setShowBulkModal(false);
    setBulkClass('');
    setBulkSection('');
  }, [bulkClass, bulkSection, studentPromotions, promotionMap, showToast]);

  // Bulk modal stats
  const bulkStats = useMemo(() => {
    if (!bulkClass) return { total: 0, eligible: 0, resultsPending: 0 };
    const classStudents = studentPromotions.filter((s) => {
      const matchClass = s.classId === bulkClass;
      if (bulkSection) return matchClass && s.section === bulkSection;
      return matchClass;
    });
    return {
      total: classStudents.length,
      eligible: classStudents.filter((s) => s.status === 'Pending').length,
      resultsPending: classStudents.filter((s) => s.status === 'Results Pending').length,
    };
  }, [bulkClass, bulkSection, studentPromotions]);

  // ─── Render: Status Badge ───────────────────────────────────
  function renderStatusBadge(status: PromotionStatus) {
    if (status === 'Promoted') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
          <CheckCircle className="w-3.5 h-3.5" />
          Promoted
        </span>
      );
    }
    if (status === 'Pending') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700">
          <Clock className="w-3.5 h-3.5" />
          Pending
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-pink-50 text-pink-700">
        <AlertTriangle className="w-3.5 h-3.5" />
        Results Pending
      </span>
    );
  }

  function renderResultBadge(result: FinalResult) {
    if (result === 'Published') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Published
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700">
        <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
        Pending
      </span>
    );
  }

  // ─── Render: Student Table ──────────────────────────────────
  function renderStudentTable() {
    return (
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              placeholder="Search students by name or ID..."
              className="w-full h-10 pl-9 pr-4 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] transition-all bg-white"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <CustomSelect
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value as any);
              setPage(1);
            }}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'Promoted', label: 'Promoted' },
              { value: 'Pending', label: 'Pending' },
              { value: 'Results Pending', label: 'Results Pending' },
            ]}
            size="sm"
          />
          <button className="inline-flex items-center gap-2 h-10 px-4 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="pl-[68px] pr-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Roll No
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Final Result
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Percentage
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-16">
                      <div className="flex flex-col items-center justify-center text-slate-500">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                          <GraduationCap className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-sm font-medium">No students found</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Try adjusting your search or filters
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedStudents.map((sp, idx) => {
                    const sid =
                      sp.student.studentId ||
                      `STU${String(idx + 1 + (page - 1) * perPage).padStart(3, '0')}`;
                    const isDisabled = sp.status === 'Results Pending';

                    return (
                      <tr
                        key={sp.student.id || (sp.student as any)._id}
                        className={`transition-colors ${isDisabled ? 'opacity-60' : 'hover:bg-slate-50'}`}
                      >
                        {/* Student */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#824ef2]/10 flex items-center justify-center text-[#824ef2] text-xs font-semibold flex-shrink-0">
                              {getInitials(sp.student.firstName, sp.student.lastName)}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">
                                {sp.student.firstName} {sp.student.lastName}
                              </p>
                              <p className="text-xs text-slate-400">ID: {sid}</p>
                            </div>
                          </div>
                        </td>
                        {/* Roll No */}
                        <td className="px-5 py-4 text-slate-600">{sp.rollNo}</td>
                        {/* Class */}
                        <td className="px-5 py-4 text-slate-600">
                          {sp.className}
                          {sp.section !== '-' ? `-${sp.section}` : ''}
                        </td>
                        {/* Final Result */}
                        <td className="px-5 py-4">{renderResultBadge(sp.finalResult)}</td>
                        {/* Percentage */}
                        <td className="px-5 py-4">
                          <span className="font-semibold text-slate-900">
                            {sp.percentage > 0 ? `${sp.percentage}%` : '-'}
                          </span>
                        </td>
                        {/* Status */}
                        <td className="px-5 py-4">{renderStatusBadge(sp.status)}</td>
                        {/* Actions */}
                        <td className="px-5 py-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              title="View Marks"
                              onClick={() => !isDisabled && setViewMarksStudent(sp)}
                              disabled={isDisabled}
                              className={`p-1.5 rounded-lg transition-colors ${
                                isDisabled
                                  ? 'text-slate-300 cursor-not-allowed'
                                  : 'hover:bg-blue-50 text-blue-600'
                              }`}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {sp.status === 'Promoted' ? (
                              <span className="p-1.5">
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                              </span>
                            ) : (
                              <button
                                title="Promote Student"
                                onClick={() => handlePromoteStudent(sp)}
                                disabled={isDisabled}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  isDisabled
                                    ? 'text-slate-300 cursor-not-allowed'
                                    : 'hover:bg-purple-50 text-[#824ef2]'
                                }`}
                              >
                                <ArrowUpRight className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {filteredStudents.length > perPage && (
            <div className="border-t border-slate-200 px-4">
              <Pagination
                total={filteredStudents.length}
                page={page}
                perPage={perPage}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Render: By Class View ──────────────────────────────────
  function renderByClassView() {
    // Level 2: Section cards for selected class
    if (selectedClassCard) {
      return (
        <div className="space-y-4">
          <button
            onClick={() => {
              setSelectedClassCard(null);
              setSelectedSectionFilter(null);
              setPage(1);
            }}
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-[#824ef2] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Classes
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="hover:text-[#824ef2] cursor-pointer" onClick={() => { setSelectedClassCard(null); setSelectedSectionFilter(null); setPage(1); }}>
              Classes
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className={selectedSectionFilter ? 'hover:text-[#824ef2] cursor-pointer' : 'text-slate-900 font-medium'} onClick={() => { if (selectedSectionFilter) { setSelectedSectionFilter(null); setPage(1); } }}>
              {selectedClassCard.name}
            </span>
            {selectedSectionFilter && (
              <>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-slate-900 font-medium">
                  {selectedSectionFilter === '__all__' ? 'All Sections' : `Section ${selectedSectionFilter}`}
                </span>
              </>
            )}
          </div>

          {/* Section cards OR table */}
          {!selectedSectionFilter ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {/* All Sections card */}
              <div
                onClick={() => {
                  setSelectedSectionFilter(null);
                  setPage(1);
                  // Show table for all sections by not filtering section
                  // We use a special value to indicate "show all"
                  setSelectedSectionFilter('__all__');
                }}
                className="rounded-xl border-2 border-[#824ef2] bg-[#824ef2]/5 p-4 cursor-pointer hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-xl bg-[#824ef2]/10">
                    <Users className="w-5 h-5 text-[#824ef2]" />
                  </div>
                  <span className="text-xl font-bold text-[#824ef2]">
                    {selectedClassCard.totalStudents}
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-900">All Sections</p>
                <p className="text-xs text-slate-500">View all students</p>
              </div>

              {/* Individual section cards */}
              {selectedClassCard.sections.map((section, idx) => {
                const color = sectionLetterColors[idx % sectionLetterColors.length]!;
                const sectionStudents = studentPromotions.filter(
                  (s) => s.classId === selectedClassCard.id && s.section === section
                );
                const sectionPromoted = sectionStudents.filter(
                  (s) => s.status === 'Promoted'
                ).length;

                return (
                  <div
                    key={section}
                    onClick={() => {
                      setSelectedSectionFilter(section);
                      setPage(1);
                    }}
                    className="rounded-xl border border-slate-200 bg-white p-4 cursor-pointer hover:border-[#824ef2]/30 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className={`w-10 h-10 rounded-xl ${color.bg} flex items-center justify-center`}
                      >
                        <span className={`text-lg font-bold ${color.text}`}>{section}</span>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">Section {section}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Total: {sectionStudents.length} students
                    </p>
                    <p className="text-xs text-emerald-600 font-medium mt-0.5">
                      {sectionPromoted} Promoted
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            // Show filtered table
            renderStudentTable()
          )}
        </div>
      );
    }

    // Level 1: Class cards grid
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {classCardsData.map((cls, idx) => {
          const color = classCardColors[idx % classCardColors.length]!;
          return (
            <div
              key={cls.id}
              onClick={() => {
                setSelectedClassCard(cls);
                setSelectedSectionFilter(null);
                setPage(1);
              }}
              className="bg-white rounded-xl border border-slate-200 p-5 cursor-pointer hover:border-[#824ef2]/30 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${color.iconBg}`}>
                  <GraduationCap className={`w-5 h-5 ${color.iconText}`} />
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#824ef2] transition-colors" />
              </div>
              <h3 className="text-base font-bold text-slate-900">{cls.name}</h3>
              <p className="text-sm text-slate-500 mt-0.5">
                Total: {cls.totalStudents} students
              </p>
              <p className="text-sm text-emerald-600 font-medium mt-0.5">
                {cls.promotedCount} Promoted
              </p>
            </div>
          );
        })}
        {classCardsData.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-slate-500">
            <GraduationCap className="w-12 h-12 text-slate-300 mb-3" />
            <p className="text-sm font-medium">No classes found</p>
          </div>
        )}
      </div>
    );
  }

  // ─── Render: View Marks Modal ───────────────────────────────
  function renderViewMarksModal() {
    if (!viewMarksStudent) return null;
    const sp = viewMarksStudent;
    const studentGrades = sp.grades;
    const totalObtained = studentGrades.reduce((sum, g) => sum + g.score, 0);
    const totalMax = studentGrades.reduce((sum, g) => sum + g.maxScore, 0);
    const overallPct = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;
    const passed = overallPct >= 40;

    return (
      <FormModal
        open={!!viewMarksStudent}
        onClose={() => setViewMarksStudent(null)}
        title={`${sp.student.firstName} ${sp.student.lastName} - ${sp.className}${sp.section !== '-' ? `-${sp.section}` : ''}`}
        size="lg"
      >
        <div className="space-y-6">
          {/* Title */}
          <div>
            <h3 className="text-lg font-bold text-slate-900">Final Examination Results</h3>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500 mb-1">Total Marks</p>
              <p className="text-2xl font-bold text-slate-900">
                {totalObtained}/{totalMax}
              </p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500 mb-1">Percentage</p>
              <p className="text-2xl font-bold text-slate-900">{overallPct}%</p>
            </div>
          </div>

          {/* Subject-wise list */}
          <div className="space-y-1">
            {studentGrades.map((g, idx) => {
              const iconColor = subjectIconColors[idx % subjectIconColors.length]!;
              const pct = g.maxScore > 0 ? Math.round((g.score / g.maxScore) * 100) : 0;
              const subjectName = g.subjectId?.name || 'Subject';
              const category = getSubjectCategory(subjectName);
              const grade = getLetterGrade(pct);

              return (
                <div
                  key={g._id}
                  className="flex items-center gap-4 py-3.5 px-4 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div
                    className={`w-10 h-10 rounded-xl ${iconColor.bg} flex items-center justify-center flex-shrink-0`}
                  >
                    <BookOpen className={`w-5 h-5 ${iconColor.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900">{subjectName}</p>
                    <p className="text-xs text-slate-400">{category}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-slate-900">
                      {g.score}/{g.maxScore}
                    </p>
                    <p className="text-xs text-slate-500">Grade: {grade}</p>
                  </div>
                </div>
              );
            })}
            {studentGrades.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm">
                No grade data available for this student.
              </div>
            )}
          </div>

          {/* Result banner */}
          {studentGrades.length > 0 && (
            <div
              className={`rounded-xl p-4 ${
                passed ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'
              }`}
            >
              <div className="flex items-center gap-3">
                {passed ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                )}
                <p
                  className={`text-sm font-semibold ${
                    passed ? 'text-emerald-700' : 'text-red-700'
                  }`}
                >
                  Result: {passed ? 'PASS' : 'FAIL'} -{' '}
                  {passed
                    ? 'Student is eligible for promotion to next class'
                    : 'Student is not eligible for promotion'}
                </p>
              </div>
            </div>
          )}
        </div>
      </FormModal>
    );
  }

  // ─── Render: Confirm Promotion Modal ────────────────────────
  function renderConfirmPromoteModal() {
    if (!confirmPromoteStudent) return null;
    const sp = confirmPromoteStudent;
    const selectedTargetClass = classes.find((c) => c._id === promoteToClass);

    return (
      <FormModal
        open={!!confirmPromoteStudent}
        onClose={() => {
          setConfirmPromoteStudent(null);
          setPromoteToClass('');
          setPromoteToSection('');
        }}
        title="Confirm Promotion"
        size="sm"
        footer={
          <>
            <button
              onClick={() => {
                setConfirmPromoteStudent(null);
                setPromoteToClass('');
                setPromoteToSection('');
              }}
              className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmPromotion}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors"
            >
              Confirm Promotion
            </button>
          </>
        }
      >
        <div className="space-y-5">
          <p className="text-sm text-slate-600">
            Are you sure you want to promote{' '}
            <span className="font-semibold text-slate-900">
              {sp.student.firstName} {sp.student.lastName}
            </span>{' '}
            from{' '}
            <span className="font-semibold text-slate-900">
              {sp.className}
              {sp.section !== '-' ? `-${sp.section}` : ''}
            </span>
            ?
          </p>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Promote to Class
            </label>
            <select
              value={promoteToClass}
              onChange={(e) => {
                setPromoteToClass(e.target.value);
                const cls = classes.find((c) => c._id === e.target.value);
                setPromoteToSection(cls?.sections?.[0] || '');
              }}
              className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] transition-all"
            >
              <option value="">Select Class</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {selectedTargetClass && selectedTargetClass.sections.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Section
              </label>
              <select
                value={promoteToSection}
                onChange={(e) => setPromoteToSection(e.target.value)}
                className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] transition-all"
              >
                <option value="">Select Section</option>
                {selectedTargetClass.sections.map((s) => (
                  <option key={s} value={s}>
                    Section {s}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </FormModal>
    );
  }

  // ─── Render: Bulk Promotion Modal ───────────────────────────
  function renderBulkPromotionModal() {
    const selectedBulkClass = classes.find((c) => c._id === bulkClass);

    return (
      <FormModal
        open={showBulkModal}
        onClose={() => {
          setShowBulkModal(false);
          setBulkClass('');
          setBulkSection('');
        }}
        title="Bulk Promotion"
        size="md"
        footer={
          <>
            <button
              onClick={() => {
                setShowBulkModal(false);
                setBulkClass('');
                setBulkSection('');
              }}
              className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleBulkPromote}
              disabled={!bulkClass || bulkStats.eligible === 0}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Promote All Eligible
            </button>
          </>
        }
      >
        <div className="space-y-5">
          {/* Info banner */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              Only students with published results and passing grades will be promoted.
              Students with pending results will be skipped.
            </p>
          </div>

          {/* Class selector */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Select Class
            </label>
            <select
              value={bulkClass}
              onChange={(e) => {
                setBulkClass(e.target.value);
                setBulkSection('');
              }}
              className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] transition-all"
            >
              <option value="">Select Class</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {/* Section selector */}
          {selectedBulkClass && selectedBulkClass.sections.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Select Section
              </label>
              <select
                value={bulkSection}
                onChange={(e) => setBulkSection(e.target.value)}
                className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] transition-all"
              >
                <option value="">All Sections</option>
                {selectedBulkClass.sections.map((s) => (
                  <option key={s} value={s}>
                    Section {s}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Summary */}
          {bulkClass && (
            <div className="bg-slate-50 rounded-xl p-4 space-y-3">
              <h4 className="text-sm font-semibold text-slate-900">Promotion Summary</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900">{bulkStats.total}</p>
                  <p className="text-xs text-slate-500">Total Students</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-600">{bulkStats.eligible}</p>
                  <p className="text-xs text-slate-500">Eligible for Promotion</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{bulkStats.resultsPending}</p>
                  <p className="text-xs text-slate-500">Results Pending</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </FormModal>
    );
  }

  // ─── Main Render ────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#824ef2] animate-spin" />
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span className="text-red-800 font-medium text-sm">{error}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end">
        <button
          onClick={() => setShowBulkModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors"
        >
          <Users className="w-4 h-4" />
          Bulk Promote
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SchoolStatCard
          icon={<Users className="w-5 h-5" />}
          color="blue"
          label="Total Students"
          value={stats.total}
        />
        <SchoolStatCard
          icon={<CheckCircle className="w-5 h-5" />}
          color="green"
          label="Promoted"
          value={stats.promoted}
          total={stats.total}
          percentage={stats.total > 0 ? Math.round((stats.promoted / stats.total) * 100) : 0}
        />
        <SchoolStatCard
          icon={<Clock className="w-5 h-5" />}
          color="orange"
          label="Pending"
          value={stats.pending}
          total={stats.total}
          percentage={stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}
        />
        <SchoolStatCard
          icon={<AlertTriangle className="w-5 h-5" />}
          color="red"
          label="Results Pending"
          value={stats.resultsPending}
          total={stats.total}
          percentage={
            stats.total > 0 ? Math.round((stats.resultsPending / stats.total) * 100) : 0
          }
        />
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            setViewMode('all');
            setSelectedClassCard(null);
            setSelectedSectionFilter(null);
            setPage(1);
          }}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
            viewMode === 'all'
              ? 'bg-[#824ef2] text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Students
        </button>
        <button
          onClick={() => {
            setViewMode('byClass');
            setPage(1);
          }}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
            viewMode === 'byClass'
              ? 'bg-[#824ef2] text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          By Class
        </button>
      </div>

      {/* Content */}
      {viewMode === 'all' ? renderStudentTable() : renderByClassView()}

      {/* Modals */}
      {renderViewMarksModal()}
      {renderConfirmPromoteModal()}
      {renderBulkPromotionModal()}
    </section>
  );
}
