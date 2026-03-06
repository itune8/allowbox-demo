'use client';

import { useState, useEffect, useMemo } from 'react';
import { classService, Class } from '../../../../lib/services/class.service';
import { homeworkService, Homework, HomeworkStatus } from '../../../../lib/services/homework.service';
import { userService } from '../../../../lib/services/user.service';
import { subjectService, Subject } from '../../../../lib/services/subject.service';
import { useToast } from '../../../../components/school';
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Percent,
  FileText,
  Download,
  Filter,
  Search,
  ArrowLeft,
  ChevronRight,
  Loader2,
  BookOpen,
  Users,
  Eye,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ViewLevel = 'classes' | 'sections' | 'students' | 'studentDetail';

interface GeneratedAssignment {
  id: string;
  name: string;
  subject: string;
  dueDate: string;
  status: 'Completed' | 'Pending' | 'Not Submitted';
  score: string;
  submittedOn: string;
}

interface ClassCardData {
  classId: string;
  className: string;
  sections: string[];
  totalAssignments: number;
  completed: number;
  pending: number;
  notSubmitted: number;
  completionRate: number;
  assignments: GeneratedAssignment[];
}

interface SectionCardData {
  section: string;
  studentCount: number;
  totalAssignments: number;
  completed: number;
  pending: number;
  completionRate: number;
}

interface StudentAssignmentData {
  studentId: string;
  name: string;
  avatar: string;
  rollNo: string;
  total: number;
  completed: number;
  pending: number;
  notSubmitted: number;
  avgScore: number;
  assignments: GeneratedAssignment[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ASSIGNMENT_NAMES = [
  'Chapter 5 - Photosynthesis',
  'Algebra Worksheet 12',
  'Essay on Climate Change',
  'World War II Timeline',
  'Lab Report - Chemical Reactions',
  'Physics Numericals Set 5',
  'Grammar Exercise 8',
  'Map Study - Rivers of India',
  'Book Review - To Kill a Mockingbird',
  'Programming Assignment 3',
  'Poetry Analysis',
  'Statistics Project',
  'Creative Writing Assignment',
  'History Research Paper',
  'Environmental Science Report',
];

const CARD_ICON_COLORS = [
  'bg-blue-50 text-blue-600',
  'bg-emerald-50 text-emerald-600',
  'bg-purple-50 text-purple-600',
  'bg-orange-50 text-orange-600',
  'bg-pink-50 text-pink-600',
  'bg-rose-50 text-rose-600',
];

// ---------------------------------------------------------------------------
// Deterministic seeded random (so data stays stable across re-renders)
// ---------------------------------------------------------------------------

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ---------------------------------------------------------------------------
// Data generation helpers
// ---------------------------------------------------------------------------

function generateAssignmentsForClass(
  classId: string,
  subjects: Subject[],
): GeneratedAssignment[] {
  const rand = seededRandom(classId.split('').reduce((a, c) => a + c.charCodeAt(0), 0));
  const count = Math.floor(rand() * 8) + 8; // 8-15
  const assignments: GeneratedAssignment[] = [];

  for (let i = 0; i < count; i++) {
    const nameIdx = Math.floor(rand() * ASSIGNMENT_NAMES.length);
    const subjectIdx = Math.floor(rand() * Math.max(subjects.length, 1));
    const subjectName = subjects.length > 0 ? subjects[subjectIdx % subjects.length]!.name : 'General';

    // Due date between Jan 2024 - Mar 2024
    const dayOffset = Math.floor(rand() * 90);
    const due = new Date(2024, 0, 1 + dayOffset);
    const dueDateStr = due.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    // Status distribution: ~70% Completed, ~20% Pending, ~10% Not Submitted
    const roll = rand();
    let status: 'Completed' | 'Pending' | 'Not Submitted';
    if (roll < 0.7) status = 'Completed';
    else if (roll < 0.9) status = 'Pending';
    else status = 'Not Submitted';

    let score = '-';
    let submittedOn = '-';
    if (status === 'Completed') {
      const s = Math.floor(rand() * 9) + 12; // 12-20
      score = `${s}/20`;
      const subDays = Math.floor(rand() * 3) + 1;
      const subDate = new Date(due.getTime() - subDays * 86400000);
      submittedOn = subDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    assignments.push({
      id: `${classId}-hw-${i}`,
      name: ASSIGNMENT_NAMES[nameIdx]!,
      subject: subjectName,
      dueDate: dueDateStr,
      status,
      score,
      submittedOn,
    });
  }

  return assignments;
}

function generateStudentData(
  students: { id: string; name: string; section?: string; rollNo?: string }[],
  assignments: GeneratedAssignment[],
  section: string,
): StudentAssignmentData[] {
  const sectionStudents = students.filter((s) => s.section === section);
  return sectionStudents.map((student, idx) => {
    const rand = seededRandom(student.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) + idx);
    const total = assignments.length;
    const completedPct = 0.7 + rand() * 0.2; // 70-90%
    const completed = Math.round(total * completedPct);
    const notSubmitted = Math.floor(rand() * 3); // 0-2
    const pending = Math.max(0, total - completed - notSubmitted);
    const avgScore = Math.round(75 + rand() * 20); // 75-95

    // Generate per-student assignments with randomized statuses
    const studentAssignments: GeneratedAssignment[] = assignments.map((a, ai) => {
      const r = seededRandom(student.id.charCodeAt(0) + ai * 7);
      const roll = r();
      let status: 'Completed' | 'Pending' | 'Not Submitted';
      if (ai < completed) status = 'Completed';
      else if (ai < completed + pending) status = 'Pending';
      else status = 'Not Submitted';

      let score = '-';
      let submittedOn = '-';
      if (status === 'Completed') {
        const s = Math.floor(r() * 9) + 12;
        score = `${s}/20`;
        const due = new Date(2024, 0, 1 + Math.floor(r() * 90));
        const subDays = Math.floor(r() * 3) + 1;
        const subDate = new Date(due.getTime() - subDays * 86400000);
        submittedOn = subDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }

      return { ...a, id: `${a.id}-${student.id}`, status, score, submittedOn };
    });

    return {
      studentId: student.id,
      name: student.name,
      avatar: student.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2),
      rollNo: student.rollNo || String(idx + 1).padStart(3, '0'),
      total,
      completed,
      pending,
      notSubmitted,
      avgScore,
      assignments: studentAssignments,
    };
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AssignmentsOverviewPage() {
  const { showToast } = useToast();

  // API data
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [allStudents, setAllStudents] = useState<
    { id: string; name: string; section?: string; classId?: string; rollNo?: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Navigation
  const [viewLevel, setViewLevel] = useState<ViewLevel>('classes');
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);


  // Search & filter
  const [searchQuery, setSearchQuery] = useState('');

  // ---------- Load data ----------

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [classesData, subjectsData, studentsData] = await Promise.all([
        classService.getClasses(),
        subjectService.getSubjects(),
        userService.getStudents(),
      ]);
      setClasses(classesData);
      setSubjects(subjectsData);
      setAllStudents(
        studentsData.map((s) => ({
          id: s._id || s.id,
          name: `${s.firstName} ${s.lastName}`,
          section: s.section,
          classId: typeof s.classId === 'object' ? s.classId?._id : s.classId,
          rollNo: s.studentId,
        })),
      );
    } catch (err) {
      console.error('Failed to load data', err);
      showToast('error', 'Failed to load assignment data');
    } finally {
      setLoading(false);
    }
  }

  // ---------- Derived / generated data ----------

  const classCards: ClassCardData[] = useMemo(() => {
    return classes.map((cls) => {
      const assignments = generateAssignmentsForClass(cls._id, subjects);
      const completed = assignments.filter((a) => a.status === 'Completed').length;
      const pending = assignments.filter((a) => a.status === 'Pending').length;
      const notSubmitted = assignments.filter((a) => a.status === 'Not Submitted').length;
      const rate = assignments.length > 0 ? Math.round((completed / assignments.length) * 100) : 0;

      return {
        classId: cls._id,
        className: cls.name,
        sections: cls.sections || [],
        totalAssignments: assignments.length,
        completed,
        pending,
        notSubmitted,
        completionRate: rate,
        assignments,
      };
    });
  }, [classes, subjects]);

  const filteredClassCards = useMemo(() => {
    if (!searchQuery.trim()) return classCards;
    const q = searchQuery.toLowerCase();
    return classCards.filter((c) => c.className.toLowerCase().includes(q));
  }, [classCards, searchQuery]);

  // Overall stats
  const overallStats = useMemo(() => {
    const totalCompleted = classCards.reduce((s, c) => s + c.completed, 0);
    const totalPending = classCards.reduce((s, c) => s + c.pending, 0);
    const totalNotSubmitted = classCards.reduce((s, c) => s + c.notSubmitted, 0);
    const totalAll = classCards.reduce((s, c) => s + c.totalAssignments, 0);
    const rate = totalAll > 0 ? Math.round((totalCompleted / totalAll) * 100) : 0;
    return { completed: totalCompleted, pending: totalPending, notSubmitted: totalNotSubmitted, rate };
  }, [classCards]);

  // Section cards for selected class
  const sectionCards: SectionCardData[] = useMemo(() => {
    if (!selectedClass) return [];
    const cls = classCards.find((c) => c.classId === selectedClass._id);
    if (!cls) return [];

    return (selectedClass.sections || []).map((section) => {
      const studentsInSection = allStudents.filter(
        (s) => s.classId === selectedClass._id && s.section === section,
      );
      const studentCount = studentsInSection.length || Math.floor(Math.random() * 20 + 20);
      const rand = seededRandom(section.charCodeAt(0) + (selectedClass._id.charCodeAt(0) || 0));
      const total = cls.totalAssignments;
      const completedPct = 0.65 + rand() * 0.25;
      const completed = Math.round(total * completedPct);
      const pending = total - completed;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

      return { section, studentCount, totalAssignments: total, completed, pending, completionRate: rate };
    });
  }, [selectedClass, classCards, allStudents]);

  // Students for the modal
  const sectionStudents: StudentAssignmentData[] = useMemo(() => {
    if (!selectedClass || !selectedSection) return [];
    const cls = classCards.find((c) => c.classId === selectedClass._id);
    if (!cls) return [];

    const studentsInSection = allStudents.filter(
      (s) => s.classId === selectedClass._id && s.section === selectedSection,
    );

    // If no real students, generate placeholder students
    if (studentsInSection.length === 0) {
      const placeholderNames = [
        'Aarav Sharma', 'Priya Patel', 'Rohan Gupta', 'Ananya Singh', 'Vikram Reddy',
        'Sneha Kumar', 'Arjun Nair', 'Kavya Joshi', 'Rahul Mehta', 'Ishita Das',
        'Aditya Verma', 'Neha Mishra', 'Karan Kapoor', 'Divya Iyer', 'Siddharth Rao',
      ];
      const placeholders = placeholderNames.map((name, i) => ({
        id: `placeholder-${selectedClass._id}-${selectedSection}-${i}`,
        name,
        section: selectedSection,
        classId: selectedClass._id,
        rollNo: String(i + 1).padStart(3, '0'),
      }));
      return generateStudentData(placeholders, cls.assignments, selectedSection);
    }

    return generateStudentData(studentsInSection, cls.assignments, selectedSection);
  }, [selectedClass, selectedSection, classCards, allStudents]);

  // Selected student detail
  const selectedStudent = useMemo(() => {
    if (!selectedStudentId) return null;
    return sectionStudents.find((s) => s.studentId === selectedStudentId) || null;
  }, [selectedStudentId, sectionStudents]);

  // ---------- Navigation helpers ----------

  function handleClassClick(cls: Class) {
    setSelectedClass(cls);
    setViewLevel('sections');
    setSearchQuery('');
  }

  function handleSectionClick(section: string) {
    setSelectedSection(section);
    setViewLevel('students');
  }

  function handleViewStudent(studentId: string) {
    setSelectedStudentId(studentId);
    setViewLevel('studentDetail');
  }

  function goBackToClasses() {
    setViewLevel('classes');
    setSelectedClass(null);
    setSelectedSection(null);
    setSelectedStudentId(null);
    setSearchQuery('');
  }

  function goBackToSections() {
    setViewLevel('students');
    setSelectedStudentId(null);
  }

  // ---------- Loading state ----------

  if (loading) {
    return (
      <section className="flex flex-col items-center justify-center py-32">
        <Loader2 className="w-10 h-10 text-[#824ef2] animate-spin" />
        <p className="mt-4 text-slate-500 text-sm">Loading assignment data...</p>
      </section>
    );
  }

  // ---------- Empty state ----------

  if (classes.length === 0) {
    return (
      <section className="space-y-6">
        <PageHeader />
        <div className="bg-white rounded-xl border border-slate-200 py-20 text-center">
          <BookOpen className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <p className="text-slate-600 font-semibold text-lg">No Classes Found</p>
          <p className="text-sm text-slate-500 mt-2">
            Create classes first to view assignment data.
          </p>
        </div>
      </section>
    );
  }

  // ======================================================================
  // RENDER
  // ======================================================================

  return (
    <section className="space-y-6">
      {/* Page Header */}
      <PageHeader />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<CheckCircle className="w-5 h-5 text-emerald-600" />}
          iconBg="bg-emerald-50"
          borderColor="border-emerald-200"
          label="Completed"
          value={overallStats.completed}
          trend="up"
          trendText="12% from last week"
          trendColor="text-emerald-600"
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-orange-600" />}
          iconBg="bg-orange-50"
          borderColor="border-orange-200"
          label="Pending"
          value={overallStats.pending}
          trend="neutral"
          trendText="No change"
          trendColor="text-slate-500"
        />
        <StatCard
          icon={<AlertTriangle className="w-5 h-5 text-red-600" />}
          iconBg="bg-red-50"
          borderColor="border-red-200"
          label="Not Submitted"
          value={overallStats.notSubmitted}
          trend="up"
          trendText="5% increase"
          trendColor="text-red-600"
        />
        <StatCard
          icon={<Percent className="w-5 h-5 text-[#824ef2]" />}
          iconBg="bg-purple-50"
          borderColor="border-purple-200"
          label="Completion Rate"
          value={`${overallStats.rate}%`}
          trend="up"
          trendText="8% improvement"
          trendColor="text-emerald-600"
        />
      </div>

      {/* Main Content Area */}
      {viewLevel === 'classes' && (
        <ClassesView
          classCards={filteredClassCards}
          searchQuery={searchQuery}
          onSearch={setSearchQuery}
          onClassClick={handleClassClick}
          classes={classes}
        />
      )}

      {viewLevel === 'sections' && selectedClass && (
        <SectionsView
          selectedClass={selectedClass}
          sectionCards={sectionCards}
          onBack={goBackToClasses}
          onSectionClick={handleSectionClick}
        />
      )}

      {viewLevel === 'students' && selectedClass && selectedSection && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span>Classes</span>
            <ChevronRight className="w-4 h-4" />
            <span>{selectedClass.name}</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-900 font-medium">Section {selectedSection}</span>
          </div>
          <button
            onClick={() => { setViewLevel('sections'); setSelectedSection(null); }}
            className="text-sm text-[#824ef2] hover:underline flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sections
          </button>

          <h2 className="text-lg font-semibold text-slate-900">Section {selectedSection} - Students</h2>
          <p className="text-sm text-slate-500">Individual student assignment status</p>

          {sectionStudents.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
              <Users className="w-10 h-10 mx-auto text-slate-400 mb-3" />
              <p className="text-slate-600 font-medium">No students found</p>
              <p className="text-sm text-slate-500 mt-1">No students in this section yet.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-slate-200 bg-slate-50">
                      <th className="py-3.5 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Student</th>
                      <th className="py-3.5 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Roll No</th>
                      <th className="py-3.5 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Total</th>
                      <th className="py-3.5 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Completed</th>
                      <th className="py-3.5 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Pending</th>
                      <th className="py-3.5 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Not Submitted</th>
                      <th className="py-3.5 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Avg Score</th>
                      <th className="py-3.5 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sectionStudents.map((student) => (
                      <tr key={student.studentId} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-[#824ef2] text-xs font-semibold">
                              {student.avatar}
                            </div>
                            <span className="font-medium text-slate-900">{student.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">{student.rollNo}</td>
                        <td className="py-3.5 px-4 text-slate-900 font-medium">{student.total}</td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                            {student.completed}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                            {student.pending}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            {student.notSubmitted}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-900 font-medium">{student.avgScore}%</td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleViewStudent(student.studentId)}
                            className="text-[#824ef2] hover:text-[#6b3fd4] text-sm font-medium flex items-center gap-1 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {viewLevel === 'studentDetail' && selectedStudent && selectedClass && (
        <StudentDetailView
          student={selectedStudent}
          selectedClass={selectedClass}
          selectedSection={selectedSection || ''}
          onBack={goBackToSections}
        />
      )}
    </section>
  );
}

// =========================================================================
// Sub-components
// =========================================================================

// ---------- Page Header ----------

function PageHeader() {
  return (
    <div className="flex items-center justify-end gap-3">
      <div className="flex items-center gap-3">
        <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
          <Download className="w-4 h-4" />
          Export
        </button>
        <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>
    </div>
  );
}

// ---------- Stat Card ----------

function StatCard({
  icon,
  iconBg,
  borderColor,
  label,
  value,
  trend,
  trendText,
  trendColor,
}: {
  icon: React.ReactNode;
  iconBg: string;
  borderColor: string;
  label: string;
  value: number | string;
  trend: 'up' | 'down' | 'neutral';
  trendText: string;
  trendColor: string;
}) {
  const arrow = trend === 'up' ? '\u2191' : trend === 'down' ? '\u2193' : '\u2014';
  return (
    <div className={`bg-white rounded-xl border ${borderColor} p-5 transition-shadow hover:shadow-sm`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center`}>
          {icon}
        </div>
        <span className="text-sm font-medium text-slate-500">{label}</span>
      </div>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
      <p className={`text-xs mt-1 ${trendColor} font-medium`}>
        {arrow} {trendText}
      </p>
    </div>
  );
}

// ---------- Classes View ----------

function ClassesView({
  classCards,
  searchQuery,
  onSearch,
  onClassClick,
  classes,
}: {
  classCards: ClassCardData[];
  searchQuery: string;
  onSearch: (q: string) => void;
  onClassClick: (cls: Class) => void;
  classes: Class[];
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      {/* Title + Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h2 className="text-lg font-bold text-slate-900">All Classes</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search classes..."
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] hover:border-slate-300 transition-colors w-64"
            />
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      {classCards.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-600 font-medium">No classes match your search</p>
          <p className="text-sm text-slate-500 mt-1">Try adjusting your search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {classCards.map((card) => {
            const cls = classes.find((c) => c._id === card.classId);
            return (
              <div
                key={card.classId}
                onClick={() => cls && onClassClick(cls)}
                className="bg-white rounded-xl border border-slate-200 p-5 cursor-pointer hover:shadow-md hover:border-[#824ef2]/30 transition-all group"
              >
                {/* Class name + sections badge */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-[#824ef2] transition-colors">
                    {card.className}
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                    {card.sections.length} Sections
                  </span>
                </div>

                {/* Stats rows */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Total Assignments</span>
                    <span className="text-sm font-semibold text-slate-900">{card.totalAssignments}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Completed</span>
                    <span className="text-sm font-semibold text-emerald-600">{card.completed}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Pending</span>
                    <span className="text-sm font-semibold text-orange-600">{card.pending}</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-100 my-4" />

                {/* Completion Rate + Progress Bar */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-500">Completion Rate</span>
                    <span className="text-sm font-bold text-slate-900">{card.completionRate}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#824ef2] rounded-full transition-all duration-500"
                      style={{ width: `${card.completionRate}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------- Sections View ----------

function SectionsView({
  selectedClass,
  sectionCards,
  onBack,
  onSectionClick,
}: {
  selectedClass: Class;
  sectionCards: SectionCardData[];
  onBack: () => void;
  onSectionClick: (section: string) => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
        <button onClick={onBack} className="hover:text-[#824ef2] transition-colors">
          Classes
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 font-medium">{selectedClass.name}</span>
      </div>

      {/* Back link */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-[#824ef2] hover:text-[#6b3fd4] font-medium mb-5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Classes
      </button>

      {/* Title */}
      <h2 className="text-lg font-bold text-slate-900 mb-6">
        {selectedClass.name} - Sections
      </h2>

      {/* Section cards grid */}
      {sectionCards.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-600 font-medium">No sections found</p>
          <p className="text-sm text-slate-500 mt-1">This class has no sections configured.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sectionCards.map((section) => (
            <div
              key={section.section}
              onClick={() => onSectionClick(section.section)}
              className="bg-white rounded-xl border border-slate-200 p-5 cursor-pointer hover:shadow-md hover:border-[#824ef2]/30 transition-all group"
            >
              {/* Section name + student count */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 text-base group-hover:text-[#824ef2] transition-colors">
                  Section {section.section}
                </h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                  {section.studentCount} Students
                </span>
              </div>

              {/* Stats rows */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Total Assignments</span>
                  <span className="text-sm font-semibold text-slate-900">{section.totalAssignments}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Completed</span>
                  <span className="text-sm font-semibold text-emerald-600">{section.completed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Pending</span>
                  <span className="text-sm font-semibold text-orange-600">{section.pending}</span>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100 my-4" />

              {/* Completion Rate + Progress Bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-500">Completion Rate</span>
                  <span className="text-sm font-bold text-slate-900">{section.completionRate}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#824ef2] rounded-full transition-all duration-500"
                    style={{ width: `${section.completionRate}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- Student Detail View ----------

function StudentDetailView({
  student,
  selectedClass,
  selectedSection,
  onBack,
}: {
  student: StudentAssignmentData;
  selectedClass: Class;
  selectedSection: string;
  onBack: () => void;
}) {
  const completedCount = student.assignments.filter((a) => a.status === 'Completed').length;
  const pendingCount = student.assignments.filter((a) => a.status === 'Pending').length;
  const notSubmittedCount = student.assignments.filter((a) => a.status === 'Not Submitted').length;

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Back */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
          <span className="hover:text-[#824ef2] cursor-default">Classes</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span>{selectedClass.name}</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span>Section {selectedSection}</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 font-medium">{student.name}</span>
        </div>

        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-[#824ef2] hover:text-[#6b3fd4] font-medium mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Students
        </button>

        <h2 className="text-lg font-bold text-slate-900">
          {student.name} - Assignment Details
        </h2>
      </div>

      {/* Student Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-blue-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-slate-500">Total Assignments</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{student.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-emerald-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-sm font-medium text-slate-500">Completed</span>
          </div>
          <p className="text-3xl font-bold text-emerald-600">{completedCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-orange-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-sm font-medium text-slate-500">Pending</span>
          </div>
          <p className="text-3xl font-bold text-orange-600">{pendingCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-red-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-sm font-medium text-slate-500">Not Submitted</span>
          </div>
          <p className="text-3xl font-bold text-red-600">{notSubmittedCount}</p>
        </div>
      </div>

      {/* Assignment List Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="font-bold text-slate-900">Assignment List</h3>
        </div>

        {student.assignments.length === 0 ? (
          <div className="py-16 text-center">
            <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-600 font-medium">No assignments</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-slate-200 bg-slate-50">
                  <th className="py-3.5 px-6 font-semibold text-slate-600 text-xs uppercase tracking-wider">Assignment</th>
                  <th className="py-3.5 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Subject</th>
                  <th className="py-3.5 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Due Date</th>
                  <th className="py-3.5 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Score</th>
                  <th className="py-3.5 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Submitted On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {student.assignments.map((assignment, idx) => (
                  <tr key={assignment.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${CARD_ICON_COLORS[idx % CARD_ICON_COLORS.length]}`}>
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-slate-900">{assignment.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{assignment.subject}</td>
                    <td className="py-3.5 px-4 text-slate-600">{assignment.dueDate}</td>
                    <td className="py-3.5 px-4">
                      <AssignmentStatusBadge status={assignment.status} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-900 font-medium">{assignment.score}</td>
                    <td className="py-3.5 px-4 text-slate-600">{assignment.submittedOn}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- Status Badge ----------

function AssignmentStatusBadge({ status }: { status: 'Completed' | 'Pending' | 'Not Submitted' }) {
  const config = {
    Completed: 'bg-emerald-100 text-emerald-700',
    Pending: 'bg-orange-100 text-orange-700',
    'Not Submitted': 'bg-red-100 text-red-700',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config[status]}`}>
      {status}
    </span>
  );
}
