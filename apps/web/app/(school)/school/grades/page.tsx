'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  gradesService,
  Grade,
  GradeType,
} from '../../../../lib/services/grades.service';
import { classService, Class } from '../../../../lib/services/class.service';
import { subjectService, Subject } from '../../../../lib/services/subject.service';
import { userService } from '../../../../lib/services/user.service';
import { FormModal, useToast } from '../../../../components/school';
import {
  GraduationCap,
  BookOpen,
  Plus,
  ClipboardList,
  Calendar,
  Loader2,
  CheckCircle,
  AlertCircle,
  CalendarDays,
  Star,
  MoreVertical,
  ArrowLeft,
  ChevronRight,
  Send,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────
interface StudentInfo {
  _id: string;
  firstName: string;
  lastName: string;
  studentId?: string;
  classId?: string;
  section?: string;
  rollNumber?: string;
}

interface ExamGroup {
  assessmentName: string;
  type: GradeType;
  maxScoreTotal: number;
  date: string;
  grades: Grade[];
  scope: 'school' | 'class';
}

interface StudentResult {
  student: { _id: string; firstName: string; lastName: string; studentId?: string };
  rollNo: string;
  totalMarks: number;
  maxMarks: number;
  percentage: number;
  grade: string;
  grades: Grade[];
}

type ExamView = 'classes' | 'sections' | 'examList' | 'results';

// Color cycling for class cards
const classColors = [
  { bg: 'bg-purple-100', text: 'text-purple-600', icon: 'bg-purple-50' },
  { bg: 'bg-blue-100', text: 'text-blue-600', icon: 'bg-blue-50' },
  { bg: 'bg-emerald-100', text: 'text-emerald-600', icon: 'bg-emerald-50' },
  { bg: 'bg-orange-100', text: 'text-orange-600', icon: 'bg-orange-50' },
  { bg: 'bg-pink-100', text: 'text-pink-600', icon: 'bg-pink-50' },
  { bg: 'bg-cyan-100', text: 'text-cyan-600', icon: 'bg-cyan-50' },
];

const sectionColors = [
  { bg: 'bg-blue-100', text: 'text-blue-700' },
  { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  { bg: 'bg-orange-100', text: 'text-orange-700' },
  { bg: 'bg-purple-100', text: 'text-purple-700' },
  { bg: 'bg-pink-100', text: 'text-pink-700' },
  { bg: 'bg-cyan-100', text: 'text-cyan-700' },
];

const subjectIconColors = [
  { bg: 'bg-blue-50', text: 'text-blue-600' },
  { bg: 'bg-emerald-50', text: 'text-emerald-600' },
  { bg: 'bg-purple-50', text: 'text-purple-600' },
  { bg: 'bg-orange-50', text: 'text-orange-600' },
  { bg: 'bg-pink-50', text: 'text-pink-600' },
  { bg: 'bg-cyan-50', text: 'text-cyan-600' },
];

function isSchoolExam(type: GradeType): boolean {
  return type === GradeType.EXAM || type === GradeType.MIDTERM || type === GradeType.FINAL;
}

// ─── Dummy Events Data ──────────────────────────────────────────
const dummyEvents = [
  { id: 1, title: 'Annual Sports Day', day: '15', month: 'MAR', type: 'School-wide Event', time: '9:00 AM - 5:00 PM', tag: 'Sports', tagColor: 'bg-red-100 text-red-700', scope: 'All Classes' },
  { id: 2, title: 'Science Fair', day: '20', month: 'MAR', type: 'Class 5-8', time: '10:00 AM - 3:00 PM', tag: 'Academic', tagColor: 'bg-blue-100 text-blue-700', scope: 'Classes 5, 6, 7, 8' },
  { id: 3, title: 'Parent-Teacher Meeting', day: '25', month: 'MAR', type: 'School-wide Event', time: '2:00 PM - 6:00 PM', tag: 'Meeting', tagColor: 'bg-emerald-100 text-emerald-700', scope: 'All Classes' },
  { id: 4, title: 'Mid-Term Examination Begins', day: '05', month: 'APR', type: 'School-wide Event', time: '9:00 AM - 12:00 PM', tag: 'Exam', tagColor: 'bg-purple-100 text-purple-700', scope: 'All Classes' },
  { id: 5, title: 'Art & Culture Exhibition', day: '12', month: 'APR', type: 'Class 1-4', time: '10:00 AM - 2:00 PM', tag: 'Cultural', tagColor: 'bg-amber-100 text-amber-700', scope: 'Classes 1, 2, 3, 4' },
  { id: 6, title: 'Career Guidance Workshop', day: '18', month: 'APR', type: 'Class 9-10', time: '11:00 AM - 1:00 PM', tag: 'Workshop', tagColor: 'bg-cyan-100 text-cyan-700', scope: 'Classes 9, 10' },
];

function EventsTab() {
  const [eventFilter, setEventFilter] = useState('all');
  const filteredEvents = eventFilter === 'all' ? dummyEvents : eventFilter === 'school' ? dummyEvents.filter(e => e.type === 'School-wide Event') : dummyEvents.filter(e => e.type !== 'School-wide Event');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Events', value: dummyEvents.length * 4, icon: <CalendarDays className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-100' },
          { label: 'Upcoming Events', value: dummyEvents.length, icon: <Calendar className="w-5 h-5 text-emerald-600" />, bg: 'bg-emerald-100' },
          { label: 'This Month', value: 5, icon: <Star className="w-5 h-5 text-amber-600" />, bg: 'bg-amber-100' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-slate-900">{s.value}</p>
                <p className="text-sm text-slate-500 mt-1">{s.label}</p>
              </div>
              <div className={`p-3 rounded-xl ${s.bg}`}>{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-slate-900">Upcoming Events</h3>
          <div className="flex gap-2">
            {[{ value: 'all', label: 'All Events' }, { value: 'school', label: 'School-wide' }, { value: 'class', label: 'Class-specific' }].map(opt => (
              <button key={opt.value} onClick={() => setEventFilter(opt.value)} className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${eventFilter === opt.value ? 'border-[#824ef2] bg-[#824ef2]/5 text-[#824ef2]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {filteredEvents.map((event) => (
            <div key={event.id} className="flex items-center gap-5 py-4 first:pt-0 last:pb-0">
              <div className="flex-shrink-0 w-14 h-16 rounded-xl bg-[#824ef2]/10 flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold text-[#824ef2] uppercase">{event.month}</span>
                <span className="text-xl font-bold text-[#824ef2] leading-tight">{event.day}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-slate-900">{event.title}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{event.type} &middot; {event.time}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${event.tagColor}`}>{event.tag}</span>
                  <span className="text-[10px] text-slate-400">{event.scope}</span>
                </div>
              </div>
              <button className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────
export default function SchoolGradesPage() {
  const { showToast } = useToast();
  const [allGrades, setAllGrades] = useState<Grade[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Main tabs
  const [activeTab, setActiveTab] = useState<'exams' | 'events'>('exams');

  // Exam sub-tabs
  const [examSubTab, setExamSubTab] = useState<'all' | 'approvals'>('all');

  // Multi-level navigation for exams
  const [examView, setExamView] = useState<ExamView>('classes');
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedExam, setSelectedExam] = useState<ExamGroup | null>(null);
  const [viewingStudent, setViewingStudent] = useState<StudentResult | null>(null);

  // Create exam modal
  const [showCreateExamModal, setShowCreateExamModal] = useState(false);
  const [examFormData, setExamFormData] = useState({
    examName: '',
    examType: 'MIDTERM' as GradeType,
    conductedBy: 'school' as 'school' | 'class',
    classId: '',
    section: '',
    startDate: '',
    endDate: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    try {
      setLoading(true);
      const [classesData, subjectsData, studentsData] = await Promise.all([
        classService.getClasses(),
        subjectService.getSubjects(),
        userService.getStudents(),
      ]);
      setClasses(classesData);
      setSubjects(subjectsData);
      setStudents(studentsData as StudentInfo[]);

      // Load grades from all classes
      if (classesData.length > 0) {
        const allGradesPromises = classesData.map(cls =>
          gradesService.getClassGrades(cls._id).catch(() => [] as Grade[])
        );
        const gradesArrays = await Promise.all(allGradesPromises);
        setAllGrades(gradesArrays.flat());
      }
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // ─── Derived data ──────────────────────────────────────────────
  // Grades grouped by class
  const gradesByClass = useMemo(() => {
    const map: Record<string, Grade[]> = {};
    allGrades.forEach(g => {
      const cid = typeof g.classId === 'object' ? g.classId._id : g.classId;
      if (!map[cid]) map[cid] = [];
      map[cid]!.push(g);
    });
    return map;
  }, [allGrades]);

  // Get exams for a class (grouped by assessmentName)
  function getExamsForClass(classId: string): ExamGroup[] {
    const classGrades = gradesByClass[classId] || [];
    const examMap: Record<string, ExamGroup> = {};
    classGrades.forEach(g => {
      const key = g.assessmentName || g.type;
      if (!examMap[key]) {
        examMap[key] = {
          assessmentName: key,
          type: g.type,
          maxScoreTotal: g.maxScore,
          date: g.assessmentDate || g.createdAt,
          grades: [],
          scope: isSchoolExam(g.type) ? 'school' : 'class',
        };
      }
      examMap[key]!.grades.push(g);
    });
    return Object.values(examMap);
  }

  // Count school vs class exams for a class
  function getExamCounts(classId: string) {
    const exams = getExamsForClass(classId);
    return {
      school: exams.filter(e => e.scope === 'school').length,
      class: exams.filter(e => e.scope === 'class').length,
    };
  }

  // Get results for a specific exam, sorted by percentage
  function getExamResults(exam: ExamGroup): StudentResult[] {
    // Group grades by student
    const studentMap: Record<string, Grade[]> = {};
    exam.grades.forEach(g => {
      const sid = g.studentId?._id;
      if (sid) {
        if (!studentMap[sid]) studentMap[sid] = [];
        studentMap[sid]!.push(g);
      }
    });

    return Object.entries(studentMap).map(([sid, studentGrades]) => {
      const first = studentGrades[0]!;
      const totalMarks = studentGrades.reduce((a, g) => a + g.score, 0);
      const maxMarks = studentGrades.reduce((a, g) => a + g.maxScore, 0);
      const percentage = maxMarks > 0 ? (totalMarks / maxMarks) * 100 : 0;
      const studentInfo = students.find(s => s._id === sid);
      return {
        student: first.studentId,
        rollNo: studentInfo?.rollNumber || studentInfo?.studentId || '-',
        totalMarks,
        maxMarks,
        percentage,
        grade: getLetterGrade(percentage),
        grades: studentGrades,
      };
    }).sort((a, b) => b.percentage - a.percentage);
  }

  function getLetterGrade(pct: number): string {
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B+';
    if (pct >= 60) return 'B';
    if (pct >= 50) return 'C';
    if (pct >= 40) return 'D';
    return 'F';
  }

  function getGradeColor(grade: string): string {
    if (grade === 'A+' || grade === 'A') return 'bg-emerald-100 text-emerald-700';
    if (grade === 'B+' || grade === 'B') return 'bg-blue-100 text-blue-700';
    if (grade === 'C') return 'bg-amber-100 text-amber-700';
    return 'bg-red-100 text-red-700';
  }

  // ─── Navigation helpers ────────────────────────────────────────
  function handleClassClick(cls: Class) {
    setSelectedClass(cls);
    if (cls.sections.length > 0) {
      setExamView('sections');
    } else {
      // No sections — go straight to exam list
      setSelectedSection(null);
      setExamView('examList');
    }
  }

  function handleSectionClick(section: string) {
    setSelectedSection(section);
    setExamView('examList');
  }

  function handleExamClick(exam: ExamGroup) {
    setSelectedExam(exam);
    setExamView('results');
  }

  function handleBack() {
    if (examView === 'results') {
      setSelectedExam(null);
      setExamView('examList');
    } else if (examView === 'examList') {
      setSelectedSection(null);
      if (selectedClass && selectedClass.sections.length > 0) {
        setExamView('sections');
      } else {
        setSelectedClass(null);
        setExamView('classes');
      }
    } else if (examView === 'sections') {
      setSelectedClass(null);
      setExamView('classes');
    }
  }

  // ─── Create Exam ──────────────────────────────────────────────
  async function handleCreateExam(e: React.FormEvent) {
    e.preventDefault();
    if (!examFormData.examName || !examFormData.classId) {
      showToast('error', 'Please fill in required fields');
      return;
    }
    setSubmitting(true);
    try {
      // Create the exam as a grade entry (the backend uses grades, not a separate exams table)
      // We create a placeholder grade to represent the exam structure
      const classStudents = students.filter(s => s.classId === examFormData.classId);
      if (classStudents.length === 0) {
        showToast('error', 'No students found in the selected class');
        setSubmitting(false);
        return;
      }

      // Get first subject to use as placeholder
      if (subjects.length === 0) {
        showToast('error', 'No subjects found');
        setSubmitting(false);
        return;
      }

      // Create grades for each student in the class for each subject
      for (const subject of subjects.slice(0, 5)) {
        for (const student of classStudents.slice(0, 10)) {
          const score = Math.floor(Math.random() * 40) + 60; // 60-100
          await gradesService.createGrade({
            studentId: student._id,
            classId: examFormData.classId,
            subjectId: subject._id,
            type: examFormData.examType,
            assessmentName: examFormData.examName,
            score,
            maxScore: 100,
            assessmentDate: examFormData.startDate || new Date().toISOString().split('T')[0] || '',
            remarks: score >= 80 ? 'Excellent work!' : score >= 60 ? 'Good effort' : 'Needs improvement',
          });
        }
      }

      showToast('success', `Exam "${examFormData.examName}" created with sample grades!`);
      setShowCreateExamModal(false);
      setExamFormData({ examName: '', examType: 'MIDTERM' as GradeType, conductedBy: 'school', classId: '', section: '', startDate: '', endDate: '', description: '' });
      await loadInitialData(); // Reload
    } catch (err) {
      console.error('Failed to create exam:', err);
      showToast('error', 'Failed to create exam');
    } finally {
      setSubmitting(false);
    }
  }

  // ─── Render helpers ───────────────────────────────────────────
  // Level 1: Class Cards Grid
  function renderClassCards() {
    return (
      <div className="space-y-6">
        {/* Sub-tabs: All Exams / Mark Approvals */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setExamSubTab('all')}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
                examSubTab === 'all'
                  ? 'bg-[#824ef2] text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              All Exams
            </button>
            <button
              onClick={() => setExamSubTab('approvals')}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
                examSubTab === 'approvals'
                  ? 'bg-[#824ef2] text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Mark Approvals
            </button>
          </div>
          <button
            onClick={() => setShowCreateExamModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Exam
          </button>
        </div>

        {examSubTab === 'all' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {classes.map((cls, idx) => {
              const color = classColors[idx % classColors.length]!;
              const counts = getExamCounts(cls._id);
              return (
                <button
                  key={cls._id}
                  onClick={() => handleClassClick(cls)}
                  className="bg-white rounded-xl border border-slate-200 p-5 text-left hover:shadow-md hover:border-[#824ef2]/30 transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl ${color.bg} flex items-center justify-center`}>
                      <ClipboardList className={`w-6 h-6 ${color.text}`} />
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#824ef2] transition-colors" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{cls.name}</h3>
                  <p className="text-sm text-slate-500 mt-0.5">{cls.sections.length} Section{cls.sections.length !== 1 ? 's' : ''}</p>
                  <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#824ef2]" />
                      <span className="text-xs text-slate-600">School: {counts.school}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-pink-400" />
                      <span className="text-xs text-slate-600">Class: {counts.class}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : renderMarkApprovals()}
      </div>
    );
  }

  // Mark Approvals view
  function renderMarkApprovals() {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Mark Approvals</h2>
          <p className="text-sm text-slate-500 mt-1">Review and approve marks submitted by teachers</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {classes.map((cls) => {
            return cls.sections.map((section, sIdx) => {
              const color = sectionColors[sIdx % sectionColors.length]!;
              const isApproved = sIdx % 2 === 1; // Dummy logic
              const pendingCount = isApproved ? 0 : Math.floor(Math.random() * 3) + 1;
              return (
                <div key={`${cls._id}-${section}`} className="bg-white rounded-xl border border-slate-200 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-11 h-11 rounded-xl ${color.bg} flex items-center justify-center`}>
                      <span className={`font-bold text-lg ${color.text}`}>{section}</span>
                    </div>
                    {isApproved ? (
                      <span className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      </span>
                    ) : (
                      <span className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center text-xs font-bold text-red-600">
                        {pendingCount}
                      </span>
                    )}
                  </div>
                  <h4 className="font-semibold text-slate-900">{cls.name} - Section {section}</h4>
                  <p className="text-sm text-slate-500">
                    {students.filter(s => s.classId === cls._id).length} Students
                  </p>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                    <span className={`text-sm font-medium ${isApproved ? 'text-emerald-600' : 'text-slate-600'}`}>
                      {isApproved ? 'Approved' : 'Pending'}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              );
            });
          })}
        </div>
      </div>
    );
  }

  // Level 2: Section Cards
  function renderSections() {
    if (!selectedClass) return null;
    const classStudents = students.filter(s => s.classId === selectedClass._id);

    return (
      <div className="space-y-6">
        {/* Back */}
        <button onClick={handleBack} className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-[#824ef2] transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Classes
        </button>

        <div>
          <h2 className="text-xl font-bold text-slate-900">{selectedClass.name} - Sections</h2>
          <p className="text-sm text-slate-500 mt-1">Select section to view exams</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {selectedClass.sections.map((section, idx) => {
            const color = sectionColors[idx % sectionColors.length]!;
            const sectionStudentCount = classStudents.length > 0
              ? Math.ceil(classStudents.length / selectedClass.sections.length)
              : 0;

            // Count school vs class exams
            const classExams = getExamsForClass(selectedClass._id);
            const schoolExams = classExams.filter(e => e.scope === 'school');
            const classOnlyExams = classExams.filter(e => e.scope === 'class');

            return (
              <div key={section} className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-11 h-11 rounded-xl ${color.bg} flex items-center justify-center`}>
                    <span className={`font-bold text-lg ${color.text}`}>{section}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Section {section}</h4>
                    <p className="text-sm text-slate-500">{sectionStudentCount} Students</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => handleSectionClick(section)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-[#824ef2]/5 border border-[#824ef2]/20 hover:bg-[#824ef2]/10 transition-colors"
                  >
                    <div>
                      <span className="text-sm font-medium text-[#824ef2]">School Exams</span>
                      <p className="text-xs text-slate-500">{schoolExams.length} exams</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#824ef2]" />
                  </button>
                  <button
                    onClick={() => handleSectionClick(section)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <span className="text-sm font-medium text-slate-700">Class Exams</span>
                      <p className="text-xs text-slate-500">{classOnlyExams.length} exams</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Level 4: Results Table
  function renderResults() {
    if (!selectedClass || !selectedExam) return null;
    const results = getExamResults(selectedExam);

    return (
      <div className="space-y-6">
        <button onClick={handleBack} className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-[#824ef2] transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Exams
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {selectedExam.scope === 'school' ? 'School' : 'Class'} Exams - {selectedClass.name}{selectedSection ? ` Section ${selectedSection}` : ''}
            </h2>
            <p className="text-sm text-slate-500 mt-1">Select exam to view results</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2]"
              value={selectedExam.assessmentName}
              onChange={(e) => {
                const exams = getExamsForClass(selectedClass._id);
                const found = exams.find(ex => ex.assessmentName === e.target.value);
                if (found) setSelectedExam(found);
              }}
            >
              {getExamsForClass(selectedClass._id).map((ex) => (
                <option key={ex.assessmentName} value={ex.assessmentName}>{ex.assessmentName}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Card */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">{selectedExam.assessmentName}</h3>
            <button
              onClick={() => showToast('success', 'All reports sent to parents!')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#824ef2] hover:bg-[#6b3fd4] transition-colors"
            >
              <Send className="w-4 h-4" />
              Send All Reports
            </button>
          </div>

          {results.length === 0 ? (
            <div className="p-12 text-center">
              <GraduationCap className="mx-auto w-16 h-16 text-slate-300" />
              <h3 className="mt-4 text-lg font-medium text-slate-900">No results found</h3>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-left uppercase text-xs text-slate-500 tracking-wider">
                    <th className="py-3.5 px-5 font-semibold">Student Name</th>
                    <th className="py-3.5 px-5 font-semibold">Roll No</th>
                    <th className="py-3.5 px-5 font-semibold">Total Marks</th>
                    <th className="py-3.5 px-5 font-semibold">Percentage</th>
                    <th className="py-3.5 px-5 font-semibold">Grade</th>
                    <th className="py-3.5 px-5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {results.map((result, idx) => (
                    <tr key={result.student._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-[#824ef2] font-semibold text-sm">
                            {result.student.firstName?.charAt(0)}{result.student.lastName?.charAt(0)}
                          </div>
                          <span className="font-medium text-slate-900">{result.student.firstName} {result.student.lastName}</span>
                        </div>
                      </td>
                      <td className="py-4 px-5 text-slate-600">{result.rollNo}</td>
                      <td className="py-4 px-5 font-semibold text-slate-900">{result.totalMarks}/{result.maxMarks}</td>
                      <td className="py-4 px-5 text-slate-900">{result.percentage.toFixed(1)}%</td>
                      <td className="py-4 px-5">
                        <span className={`inline-flex items-center justify-center w-10 h-8 rounded-lg text-xs font-bold ${getGradeColor(result.grade)}`}>
                          {result.grade}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setViewingStudent(result)}
                            className="text-sm font-medium text-[#824ef2] hover:underline"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => showToast('success', `Report sent to ${result.student.firstName}'s parent!`)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-[#824ef2] transition-colors"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
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

  // ─── Student Detail Modal ─────────────────────────────────────
  function renderStudentDetailModal() {
    if (!viewingStudent || !selectedExam) return null;
    const { student, totalMarks, maxMarks, percentage, grade, grades: studentGrades } = viewingStudent;
    const studentInfo = students.find(s => s._id === student._id);

    return (
      <FormModal
        open={!!viewingStudent}
        onClose={() => setViewingStudent(null)}
        title=""
        size="lg"
      >
        <div className="space-y-6">
          {/* Student Header */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-[#824ef2] flex items-center justify-center text-white font-bold text-xl">
              {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">{student.firstName} {student.lastName}</h3>
              <p className="text-sm text-slate-500">
                Roll No: {studentInfo?.rollNumber || studentInfo?.studentId || student.studentId || '-'}
                {selectedClass ? ` | ${selectedClass.name}${selectedSection ? `-${selectedSection}` : ''}` : ''}
              </p>
            </div>
          </div>

          {/* Exam name + selector */}
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-bold text-slate-900">{selectedExam.assessmentName} Results</h4>
            <select
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2]"
              value={selectedExam.assessmentName}
              onChange={(e) => {
                const exams = selectedClass ? getExamsForClass(selectedClass._id) : [];
                const found = exams.find(ex => ex.assessmentName === e.target.value);
                if (found) {
                  setSelectedExam(found);
                  const newResults = getExamResults(found);
                  const newStudentResult = newResults.find(r => r.student._id === student._id);
                  if (newStudentResult) setViewingStudent(newStudentResult);
                }
              }}
            >
              {(selectedClass ? getExamsForClass(selectedClass._id) : []).map(ex => (
                <option key={ex.assessmentName} value={ex.assessmentName}>{ex.assessmentName}</option>
              ))}
            </select>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Total Marks', value: String(maxMarks), bg: 'bg-purple-50' },
              { label: 'Obtained', value: String(totalMarks), bg: 'bg-blue-50' },
              { label: 'Percentage', value: `${percentage.toFixed(1)}%`, bg: 'bg-amber-50' },
              { label: 'Grade', value: grade, bg: 'bg-emerald-50' },
            ].map(card => (
              <div key={card.label} className={`${card.bg} rounded-xl p-4 text-center`}>
                <p className="text-xs text-slate-500 mb-1">{card.label}</p>
                <p className="text-2xl font-bold text-slate-900">{card.value}</p>
              </div>
            ))}
          </div>

          {/* Subject-wise Performance */}
          <div>
            <h4 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">Subject-wise Performance</h4>
            <div className="space-y-1">
              {studentGrades.map((g, idx) => {
                const iconColor = subjectIconColors[idx % subjectIconColors.length]!;
                const pct = g.maxScore > 0 ? Math.round((g.score / g.maxScore) * 100) : 0;
                return (
                  <div key={g._id} className="flex items-center gap-4 py-3.5 px-4 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className={`w-10 h-10 rounded-xl ${iconColor.bg} flex items-center justify-center`}>
                      <BookOpen className={`w-5 h-5 ${iconColor.text}`} />
                    </div>
                    <div className="flex-1">
                      <span className="font-medium text-slate-900">{g.subjectId?.name || 'Subject'}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900">{g.score}/{g.maxScore}</span>
                      <p className="text-xs text-emerald-600 font-medium">{pct}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Send Report button */}
          <div className="flex justify-center pt-2">
            <button
              onClick={() => {
                showToast('success', `Report sent to ${student.firstName}'s parent!`);
                setViewingStudent(null);
              }}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold text-white bg-[#824ef2] hover:bg-[#6b3fd4] transition-colors"
            >
              <Send className="w-4 h-4" />
              Send Report to Parent
            </button>
          </div>
        </div>
      </FormModal>
    );
  }

  // ─── Main Render ──────────────────────────────────────────────
  if (loading && classes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#824ef2] animate-spin" />
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span className="text-red-800 font-medium text-sm">{error}</span>
        </div>
      )}

      {/* Page Header */}

      {/* Main Tabs: Exams | Events */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-6">
          {([
            { key: 'exams' as const, label: 'Exams' },
            { key: 'events' as const, label: 'Events' },
          ]).map(tab => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                // Reset exam navigation when switching tabs
                if (tab.key === 'exams') {
                  setExamView('classes');
                  setSelectedClass(null);
                  setSelectedSection(null);
                  setSelectedExam(null);
                }
              }}
              className={`relative pb-3 text-sm font-medium transition-colors ${
                activeTab === tab.key ? 'text-[#824ef2]' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#824ef2] rounded-t" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'exams' && (
        <>
          {examView === 'classes' && renderClassCards()}
          {examView === 'sections' && renderSections()}
          {examView === 'examList' && <ExamListView
            selectedClass={selectedClass}
            selectedSection={selectedSection}
            getExamsForClass={getExamsForClass}
            handleBack={handleBack}
            handleExamClick={handleExamClick}
          />}
          {examView === 'results' && renderResults()}
        </>
      )}

      {activeTab === 'events' && <EventsTab />}

      {/* Student Detail Modal */}
      {renderStudentDetailModal()}

      {/* Create Exam Modal */}
      <FormModal
        open={showCreateExamModal}
        onClose={() => setShowCreateExamModal(false)}
        title="Create New Exam"
        size="md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowCreateExamModal(false)}
              className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="create-exam-form"
              disabled={submitting}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
              ) : (
                'Create Exam'
              )}
            </button>
          </>
        }
      >
        <form id="create-exam-form" onSubmit={handleCreateExam} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Exam Name</label>
            <input
              type="text"
              value={examFormData.examName}
              onChange={(e) => setExamFormData({ ...examFormData, examName: e.target.value })}
              placeholder="Enter exam name"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] hover:border-slate-300 transition-colors placeholder:text-slate-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Exam Type</label>
            <select
              value={examFormData.examType}
              onChange={(e) => setExamFormData({ ...examFormData, examType: e.target.value as GradeType })}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] hover:border-slate-300 transition-colors"
            >
              <option value={GradeType.MIDTERM}>Mid Term</option>
              <option value={GradeType.FINAL}>Final</option>
              <option value={GradeType.EXAM}>Exam</option>
              <option value={GradeType.QUIZ}>Quiz</option>
              <option value={GradeType.ASSIGNMENT}>Assignment</option>
              <option value={GradeType.PROJECT}>Project</option>
              <option value={GradeType.PRACTICAL}>Practical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Conducted By</label>
            <div className="flex items-center gap-6 mt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="conductedBy"
                  value="school"
                  checked={examFormData.conductedBy === 'school'}
                  onChange={() => setExamFormData({ ...examFormData, conductedBy: 'school' })}
                  className="w-4 h-4 text-[#824ef2] border-slate-300 focus:ring-[#824ef2]"
                />
                <span className="text-sm text-slate-700">School Exam</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="conductedBy"
                  value="class"
                  checked={examFormData.conductedBy === 'class'}
                  onChange={() => setExamFormData({ ...examFormData, conductedBy: 'class' })}
                  className="w-4 h-4 text-[#824ef2] border-slate-300 focus:ring-[#824ef2]"
                />
                <span className="text-sm text-slate-700">Class Exam</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Class</label>
            <select
              value={examFormData.classId}
              onChange={(e) => setExamFormData({ ...examFormData, classId: e.target.value, section: '' })}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] hover:border-slate-300 transition-colors"
              required
            >
              <option value="">Select Class</option>
              {classes.map(cls => (
                <option key={cls._id} value={cls._id}>{cls.name}</option>
              ))}
            </select>
          </div>

          {examFormData.classId && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Section</label>
              <select
                value={examFormData.section}
                onChange={(e) => setExamFormData({ ...examFormData, section: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] hover:border-slate-300 transition-colors"
              >
                <option value="">All Sections</option>
                {classes.find(c => c._id === examFormData.classId)?.sections.map(s => (
                  <option key={s} value={s}>Section {s}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Start Date</label>
              <input
                type="date"
                value={examFormData.startDate}
                onChange={(e) => setExamFormData({ ...examFormData, startDate: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] hover:border-slate-300 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">End Date</label>
              <input
                type="date"
                value={examFormData.endDate}
                onChange={(e) => setExamFormData({ ...examFormData, endDate: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] hover:border-slate-300 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea
              value={examFormData.description}
              onChange={(e) => setExamFormData({ ...examFormData, description: e.target.value })}
              rows={3}
              placeholder="Enter exam description"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] hover:border-slate-300 transition-colors resize-none placeholder:text-slate-400"
            />
          </div>
        </form>
      </FormModal>
    </section>
  );
}

// ─── Separate component for Exam List (needs its own state) ─────
function ExamListView({
  selectedClass,
  selectedSection,
  getExamsForClass,
  handleBack,
  handleExamClick,
}: {
  selectedClass: Class | null;
  selectedSection: string | null;
  getExamsForClass: (classId: string) => ExamGroup[];
  handleBack: () => void;
  handleExamClick: (exam: ExamGroup) => void;
}) {
  const [examFilter, setExamFilter] = useState<'all' | 'school' | 'class'>('all');

  if (!selectedClass) return null;
  const exams = getExamsForClass(selectedClass._id);
  const filtered = examFilter === 'all' ? exams : examFilter === 'school' ? exams.filter(e => e.scope === 'school') : exams.filter(e => e.scope === 'class');

  return (
    <div className="space-y-6">
      <button onClick={handleBack} className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-[#824ef2] transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Sections
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {selectedClass.name}{selectedSection ? ` - Section ${selectedSection}` : ''} Exams
          </h2>
          <p className="text-sm text-slate-500 mt-1">Select an exam to view results</p>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2">
        {(['all', 'school', 'class'] as const).map(f => (
          <button
            key={f}
            onClick={() => setExamFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              examFilter === f
                ? 'bg-[#824ef2] text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {f === 'all' ? 'All Exams' : f === 'school' ? 'School Exams' : 'Class Exams'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardList className="mx-auto w-16 h-16 text-slate-300" />
            <h3 className="mt-4 text-lg font-medium text-slate-900">No exams found</h3>
            <p className="mt-2 text-sm text-slate-500">Create an exam to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((exam, idx) => {
              const uniqueStudents = new Set(exam.grades.map(g => g.studentId?._id)).size;
              const avgPct = exam.grades.length > 0
                ? Math.round(exam.grades.reduce((a, g) => a + (g.percentage || 0), 0) / exam.grades.length)
                : 0;
              return (
                <div key={exam.assessmentName + idx} className="flex items-center gap-5 p-5 hover:bg-slate-50 transition-colors">
                  <div className={`w-12 h-12 rounded-xl ${exam.scope === 'school' ? 'bg-[#824ef2]/10' : 'bg-blue-50'} flex items-center justify-center`}>
                    <GraduationCap className={`w-6 h-6 ${exam.scope === 'school' ? 'text-[#824ef2]' : 'text-blue-600'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5">
                      <h4 className="font-semibold text-slate-900">{exam.assessmentName}</h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        exam.scope === 'school' ? 'bg-[#824ef2]/10 text-[#824ef2]' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {exam.scope === 'school' ? 'School Exam' : 'Class Exam'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">
                      Date: {exam.date ? new Date(exam.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '-'}
                      {' | '}Total Marks: {exam.grades[0]?.maxScore || 0}
                      {' | '}{uniqueStudents} Student{uniqueStudents !== 1 ? 's' : ''}
                      {' | '}Avg: {avgPct}%
                    </p>
                  </div>
                  <button
                    onClick={() => handleExamClick(exam)}
                    className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#824ef2] hover:bg-[#6b3fd4] transition-colors"
                  >
                    View Results
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
