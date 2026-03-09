'use client';

import { useState, useEffect, useMemo } from 'react';
import { SchoolStatCard, FormModal, useToast } from '../../../../components/school';
import {
  GraduationCap,
  CheckCircle,
  Clock,
  Loader2,
  Calendar,
  FileText,
  CalendarDays,
  MapPin,
  Search,
  Download,
  BookOpen,
  ClipboardList,
  AlertCircle,
  Trophy,
  Star,
  ChevronDown,
  Filter,
} from 'lucide-react';

// ── Types ──
interface MockChild {
  id: string;
  name: string;
  class: string;
  section: string;
}

interface SyllabusTopic {
  title: string;
  description: string;
}

interface ExamSubject {
  subject: string;
  date: string;
  time: string;
  room: string;
  syllabus: SyllabusTopic[];
}

interface ExamGroup {
  id: string;
  name: string;
  dateRange: string;
  term: string;
  status: 'active' | 'upcoming' | 'scheduled' | 'completed';
  childId: string;
  note: string;
  subjects: ExamSubject[];
}

interface ResultSubject {
  name: string;
  marksObtained: number;
  totalMarks: number;
  grade: string;
  remarks: string;
}

interface ExamResult {
  id: string;
  examName: string;
  completedDate: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  grade: string;
  rank: number;
  childId: string;
  teacherComment: string;
  subjects: ResultSubject[];
}

type EventType = 'ACADEMIC' | 'SPORTS' | 'CULTURAL' | 'HOLIDAY' | 'MEETING';

interface SchoolEvent {
  id: string;
  title: string;
  description: string;
  type: EventType;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  agenda: string[];
}

// ── Mock data ──
const MOCK_CHILDREN: MockChild[] = [
  { id: 'c1', name: 'Aarav Sharma', class: 'Class 10', section: 'A' },
  { id: 'c2', name: 'Meera Sharma', class: 'Class 7', section: 'B' },
];

const MOCK_EXAM_GROUPS: ExamGroup[] = [
  {
    id: 'eg1',
    name: 'Mid-Term Science Practical',
    dateRange: 'Mar 18 - Mar 24, 2025',
    term: 'Term 2',
    status: 'active',
    childId: 'c1',
    note: 'Please arrive 15 minutes before the scheduled time. Bring all necessary stationery.',
    subjects: [
      {
        subject: 'Physics',
        date: '2025-03-18',
        time: '09:00 - 11:00',
        room: 'Lab 1',
        syllabus: [
          { title: 'Optics & Light', description: 'Reflection, refraction, lenses, and optical instruments. Includes ray diagrams and numerical problems.' },
          { title: 'Electricity & Magnetism', description: 'Ohm\'s law, circuits, electromagnetic induction, and applications of electromagnetism.' },
          { title: 'Mechanics', description: 'Newton\'s laws of motion, work-energy theorem, and conservation of momentum.' },
        ],
      },
      {
        subject: 'Chemistry',
        date: '2025-03-20',
        time: '09:00 - 11:00',
        room: 'Lab 2',
        syllabus: [
          { title: 'Organic Chemistry Basics', description: 'Nomenclature, functional groups, and basic reactions of hydrocarbons.' },
          { title: 'Acids, Bases & Salts', description: 'pH scale, neutralization reactions, and preparation of salts.' },
          { title: 'Chemical Bonding', description: 'Ionic and covalent bonds, metallic bonding, and molecular geometry.' },
        ],
      },
      {
        subject: 'Biology',
        date: '2025-03-24',
        time: '09:00 - 11:00',
        room: 'Lab 3',
        syllabus: [
          { title: 'Cell Biology', description: 'Cell structure, organelles, cell division (mitosis and meiosis).' },
          { title: 'Human Physiology', description: 'Digestive, respiratory, and circulatory systems. Includes diagrams.' },
          { title: 'Genetics & Evolution', description: 'Mendel\'s laws, DNA structure, heredity, and natural selection.' },
        ],
      },
    ],
  },
  {
    id: 'eg2',
    name: 'Mathematics Monthly Assessment',
    dateRange: 'Apr 5 - Apr 5, 2025',
    term: 'Term 2',
    status: 'upcoming',
    childId: 'c1',
    note: 'Calculators are not allowed. Bring geometry box and graph paper.',
    subjects: [
      {
        subject: 'Mathematics',
        date: '2025-04-05',
        time: '10:00 - 12:00',
        room: 'Room 105',
        syllabus: [
          { title: 'Trigonometry', description: 'Trigonometric ratios, identities, heights and distances.' },
          { title: 'Coordinate Geometry', description: 'Distance formula, section formula, area of triangle, and equation of line.' },
        ],
      },
    ],
  },
  {
    id: 'eg3',
    name: 'Final Term Examination',
    dateRange: 'May 10 - May 24, 2025',
    term: 'Term 2',
    status: 'scheduled',
    childId: 'c1',
    note: 'This is a comprehensive examination covering the entire syllabus of Term 2. Please prepare thoroughly.',
    subjects: [
      {
        subject: 'Mathematics',
        date: '2025-05-10',
        time: '09:00 - 12:00',
        room: 'Hall A',
        syllabus: [
          { title: 'Algebra', description: 'Quadratic equations, arithmetic progressions, and polynomials.' },
          { title: 'Geometry', description: 'Circles, triangles, and constructions.' },
          { title: 'Statistics & Probability', description: 'Mean, median, mode, and basic probability concepts.' },
        ],
      },
      {
        subject: 'Physics',
        date: '2025-05-12',
        time: '09:00 - 12:00',
        room: 'Hall A',
        syllabus: [
          { title: 'Light & Optics', description: 'Reflection, refraction, lenses, and the human eye.' },
          { title: 'Electricity', description: 'Electric current, potential difference, resistance, and Ohm\'s law.' },
        ],
      },
      {
        subject: 'Chemistry',
        date: '2025-05-15',
        time: '09:00 - 12:00',
        room: 'Hall B',
        syllabus: [
          { title: 'Chemical Reactions', description: 'Types of reactions, balancing equations, and oxidation-reduction.' },
          { title: 'Periodic Table', description: 'Classification of elements, trends in properties, and valency.' },
        ],
      },
      {
        subject: 'English',
        date: '2025-05-18',
        time: '09:00 - 12:00',
        room: 'Hall B',
        syllabus: [
          { title: 'Literature', description: 'Prose, poetry, and drama from the prescribed textbook.' },
          { title: 'Grammar & Writing', description: 'Tenses, voice, reported speech, letter writing, and essay.' },
        ],
      },
      {
        subject: 'Hindi',
        date: '2025-05-24',
        time: '09:00 - 12:00',
        room: 'Hall C',
        syllabus: [
          { title: 'Gadya Khand', description: 'Prescribed prose chapters and their summaries.' },
          { title: 'Vyakaran', description: 'Samas, Sandhi, Ras, and Alankar.' },
        ],
      },
    ],
  },
  {
    id: 'eg4',
    name: 'Term 1 Unit Test',
    dateRange: 'Jan 15 - Jan 18, 2025',
    term: 'Term 1',
    status: 'completed',
    childId: 'c1',
    note: 'Unit test covering chapters 1-4 from each subject.',
    subjects: [
      {
        subject: 'Mathematics',
        date: '2025-01-15',
        time: '09:00 - 10:30',
        room: 'Room 105',
        syllabus: [
          { title: 'Number Systems', description: 'Real numbers, rational and irrational numbers.' },
          { title: 'Polynomials', description: 'Zeroes of polynomials and factorization.' },
        ],
      },
      {
        subject: 'Science',
        date: '2025-01-18',
        time: '09:00 - 10:30',
        room: 'Room 201',
        syllabus: [
          { title: 'Matter in Our Surroundings', description: 'States of matter and changes of state.' },
        ],
      },
    ],
  },
];

const MOCK_EXAM_RESULTS: ExamResult[] = [
  {
    id: 'er1',
    examName: 'Term 1 Final Assessment',
    completedDate: 'Dec 20, 2024',
    totalScore: 450,
    maxScore: 500,
    percentage: 90,
    grade: 'A',
    rank: 3,
    childId: 'c1',
    teacherComment: 'Aarav has shown outstanding performance this term. His grasp on concepts is excellent and he actively participates in class discussions. Keep up the great work!',
    subjects: [
      { name: 'Mathematics', marksObtained: 95, totalMarks: 100, grade: 'A+', remarks: 'Excellent problem-solving skills' },
      { name: 'Physics', marksObtained: 92, totalMarks: 100, grade: 'A+', remarks: 'Strong conceptual understanding' },
      { name: 'Chemistry', marksObtained: 88, totalMarks: 100, grade: 'A', remarks: 'Good performance in practicals' },
      { name: 'English', marksObtained: 85, totalMarks: 100, grade: 'A', remarks: 'Creative writing has improved' },
      { name: 'Hindi', marksObtained: 90, totalMarks: 100, grade: 'A+', remarks: 'Very good in grammar section' },
    ],
  },
  {
    id: 'er2',
    examName: 'Monthly Quiz - August',
    completedDate: 'Aug 28, 2024',
    totalScore: 92,
    maxScore: 100,
    percentage: 92,
    grade: 'A-',
    rank: 5,
    childId: 'c1',
    teacherComment: 'Consistent performance across all subjects. Aarav should focus more on time management during exams to improve further.',
    subjects: [
      { name: 'Mathematics', marksObtained: 19, totalMarks: 20, grade: 'A+', remarks: 'Near perfect score' },
      { name: 'Physics', marksObtained: 18, totalMarks: 20, grade: 'A', remarks: 'Good numerical accuracy' },
      { name: 'Chemistry', marksObtained: 17, totalMarks: 20, grade: 'A', remarks: 'Well prepared' },
      { name: 'English', marksObtained: 20, totalMarks: 20, grade: 'A+', remarks: 'Perfect score!' },
      { name: 'Hindi', marksObtained: 18, totalMarks: 20, grade: 'A', remarks: 'Good comprehension skills' },
    ],
  },
  {
    id: 'er3',
    examName: 'Monthly Quiz - July',
    completedDate: 'Jul 25, 2024',
    totalScore: 88,
    maxScore: 100,
    percentage: 88,
    grade: 'B+',
    rank: 8,
    childId: 'c1',
    teacherComment: 'Good effort overall. Aarav needs to revise Chemistry concepts more thoroughly and practice essay writing in English.',
    subjects: [
      { name: 'Mathematics', marksObtained: 18, totalMarks: 20, grade: 'A', remarks: 'Strong in algebra' },
      { name: 'Physics', marksObtained: 19, totalMarks: 20, grade: 'A+', remarks: 'Excellent understanding' },
      { name: 'Chemistry', marksObtained: 15, totalMarks: 20, grade: 'B+', remarks: 'Needs more practice in equations' },
      { name: 'English', marksObtained: 17, totalMarks: 20, grade: 'A', remarks: 'Grammar is solid' },
      { name: 'Hindi', marksObtained: 19, totalMarks: 20, grade: 'A+', remarks: 'Very expressive writing' },
    ],
  },
];

const MOCK_EVENTS: SchoolEvent[] = [
  {
    id: 'evt-1',
    title: 'Annual Science Fair',
    description: 'Students showcase their science projects. Judges from local universities will evaluate creativity and scientific method. Parents are welcome to attend and support their children.',
    type: 'ACADEMIC',
    date: new Date(Date.now() + 5 * 86400000).toISOString(),
    startTime: '09:00',
    endTime: '15:00',
    location: 'School Main Hall & Science Labs',
    agenda: [
      'Registration and setup of projects (8:00 - 9:00 AM)',
      'Inaugural ceremony and welcome address',
      'Judging round for senior categories',
      'Judging round for junior categories',
      'Interactive science demonstrations',
      'Prize distribution and closing ceremony',
    ],
  },
  {
    id: 'evt-2',
    title: 'Inter-House Sports Day',
    description: 'Annual inter-house athletics competition featuring track and field events, relay races, and team sports. Students are encouraged to participate and support their house teams.',
    type: 'SPORTS',
    date: new Date(Date.now() + 10 * 86400000).toISOString(),
    startTime: '08:00',
    endTime: '17:00',
    location: 'School Sports Ground',
    agenda: [
      'March past and opening ceremony',
      '100m, 200m and 400m sprints',
      'Long jump and high jump events',
      'Relay races (4x100m and 4x400m)',
      'Tug of war and fun games',
      'Prize distribution ceremony',
    ],
  },
  {
    id: 'evt-3',
    title: 'Cultural Fest - Harmony 2025',
    description: 'Annual cultural festival with music performances, dance competitions, drama, art exhibitions, and food stalls. A celebration of talent and creativity.',
    type: 'CULTURAL',
    date: new Date(Date.now() + 18 * 86400000).toISOString(),
    startTime: '10:00',
    endTime: '20:00',
    location: 'School Campus',
    agenda: [
      'Art exhibition opening and gallery walk',
      'Classical and folk dance performances',
      'Music recitals and band performances',
      'Drama and theatre presentations',
      'Food festival and stall visits',
      'Grand finale and award ceremony',
    ],
  },
  {
    id: 'evt-4',
    title: 'Holi Holiday',
    description: 'School will remain closed for the Holi festival break. Classes resume on the following Monday. Wishing everyone a colorful and joyful celebration!',
    type: 'HOLIDAY',
    date: new Date(Date.now() + 25 * 86400000).toISOString(),
    startTime: '',
    endTime: '',
    location: '',
    agenda: [],
  },
  {
    id: 'evt-5',
    title: 'Parent-Teacher Conference',
    description: 'Quarterly parent-teacher meeting to discuss student academic progress, behavior, and upcoming plans. Individual slots will be allotted by class teachers.',
    type: 'MEETING',
    date: new Date(Date.now() + 7 * 86400000).toISOString(),
    startTime: '14:00',
    endTime: '18:00',
    location: 'School Auditorium',
    agenda: [
      'Welcome and overview by the Principal',
      'Individual parent-teacher discussions',
      'Review of academic performance and areas of improvement',
      'Discussion on co-curricular activities and student well-being',
      'Q&A session with department heads',
      'Closing remarks and next steps',
    ],
  },
  {
    id: 'evt-6',
    title: 'Mathematics Olympiad Prep Workshop',
    description: 'A preparatory workshop for students participating in the upcoming regional Mathematics Olympiad. Expert faculty will cover advanced problem-solving techniques.',
    type: 'ACADEMIC',
    date: new Date(Date.now() + 12 * 86400000).toISOString(),
    startTime: '09:30',
    endTime: '13:00',
    location: 'Seminar Hall, Block B',
    agenda: [
      'Introduction to Olympiad-level problem solving',
      'Number theory and combinatorics workshop',
      'Geometry and algebra advanced problems',
      'Mock test and timed practice session',
      'Doubt clearing and tips from previous winners',
    ],
  },
];

// ── Color/Status maps ──
const examStatusConfig: Record<ExamGroup['status'], { border: string; bg: string; text: string; badge: string; badgeBg: string; label: string }> = {
  active: { border: 'border-l-green-500', bg: 'bg-green-100', text: 'text-green-600', badge: 'text-green-700', badgeBg: 'bg-green-100', label: 'Active' },
  upcoming: { border: 'border-l-blue-500', bg: 'bg-blue-100', text: 'text-blue-600', badge: 'text-blue-700', badgeBg: 'bg-blue-100', label: 'Upcoming' },
  scheduled: { border: 'border-l-purple-500', bg: 'bg-purple-100', text: 'text-purple-600', badge: 'text-purple-700', badgeBg: 'bg-purple-100', label: 'Scheduled' },
  completed: { border: 'border-l-slate-400', bg: 'bg-slate-100', text: 'text-slate-500', badge: 'text-slate-600', badgeBg: 'bg-slate-100', label: 'Completed' },
};

const eventTypeConfig: Record<EventType, { badge: string; badgeBg: string; dot: string; label: string }> = {
  ACADEMIC: { badge: 'text-purple-700', badgeBg: 'bg-purple-100', dot: 'bg-purple-500', label: 'Academic' },
  SPORTS: { badge: 'text-orange-700', badgeBg: 'bg-orange-100', dot: 'bg-orange-500', label: 'Sports' },
  CULTURAL: { badge: 'text-pink-700', badgeBg: 'bg-pink-100', dot: 'bg-pink-500', label: 'Cultural' },
  HOLIDAY: { badge: 'text-yellow-700', badgeBg: 'bg-yellow-100', dot: 'bg-yellow-500', label: 'Holiday' },
  MEETING: { badge: 'text-blue-700', badgeBg: 'bg-blue-100', dot: 'bg-blue-500', label: 'Meeting' },
};

const gradeColors: Record<string, string> = {
  'A+': 'text-green-600', 'A': 'text-green-600', 'A-': 'text-green-600',
  'B+': 'text-blue-600', 'B': 'text-blue-600', 'B-': 'text-blue-600',
  'C+': 'text-amber-600', 'C': 'text-amber-600',
  'D': 'text-orange-600', 'F': 'text-red-600',
};

const gradeBadgeColors: Record<string, string> = {
  'A+': 'bg-green-100 text-green-700 border-green-200',
  'A': 'bg-green-100 text-green-700 border-green-200',
  'A-': 'bg-green-100 text-green-700 border-green-200',
  'B+': 'bg-blue-100 text-blue-700 border-blue-200',
  'B': 'bg-blue-100 text-blue-700 border-blue-200',
  'B-': 'bg-blue-100 text-blue-700 border-blue-200',
  'C+': 'bg-amber-100 text-amber-700 border-amber-200',
  'C': 'bg-amber-100 text-amber-700 border-amber-200',
  'D': 'bg-orange-100 text-orange-700 border-orange-200',
  'F': 'bg-red-100 text-red-700 border-red-200',
};

const TERM_OPTIONS = ['All Terms', 'Term 1', 'Term 2'];
const YEAR_OPTIONS = ['All Years', '2024', '2025'];

export default function ParentExamsPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [selectedChildId, setSelectedChildId] = useState(MOCK_CHILDREN[0]!.id);
  const [tab, setTab] = useState<'schedule' | 'results' | 'events'>('schedule');

  // Schedule tab state
  const [scheduleSearch, setScheduleSearch] = useState('');
  const [termFilter, setTermFilter] = useState('All Terms');
  const [selectedExamGroup, setSelectedExamGroup] = useState<ExamGroup | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [syllabusSubject, setSyllabusSubject] = useState<ExamSubject | null>(null);
  const [showSyllabusModal, setShowSyllabusModal] = useState(false);

  // Results tab state
  const [yearFilter, setYearFilter] = useState('All Years');
  const [selectedResult, setSelectedResult] = useState<ExamResult | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);

  // Events tab state
  const [eventSearch, setEventSearch] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState<'ALL' | EventType>('ALL');
  const [showEventFilterDropdown, setShowEventFilterDropdown] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<SchoolEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const { examService } = await import('../../../../lib/services/exam.service');
        const data = await examService.getExams();
        if (data && data.length > 0) {
          showToast('success', 'Exams loaded');
        }
      } catch {
        // Use mock data
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // ── Derived data ──
  const childExamGroups = useMemo(() => {
    let groups = MOCK_EXAM_GROUPS.filter((g) => g.childId === selectedChildId);
    if (scheduleSearch.trim()) {
      const q = scheduleSearch.toLowerCase();
      groups = groups.filter((g) => g.name.toLowerCase().includes(q));
    }
    if (termFilter !== 'All Terms') {
      groups = groups.filter((g) => g.term === termFilter);
    }
    return groups;
  }, [selectedChildId, scheduleSearch, termFilter]);

  const childResults = useMemo(() => {
    let results = MOCK_EXAM_RESULTS.filter((r) => r.childId === selectedChildId);
    if (yearFilter !== 'All Years') {
      results = results.filter((r) => r.completedDate.includes(yearFilter));
    }
    return results;
  }, [selectedChildId, yearFilter]);

  const filteredEvents = useMemo(() => {
    let events = [...MOCK_EVENTS].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    if (eventSearch.trim()) {
      const q = eventSearch.toLowerCase();
      events = events.filter((e) => e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q));
    }
    if (eventTypeFilter !== 'ALL') {
      events = events.filter((e) => e.type === eventTypeFilter);
    }
    return events;
  }, [eventSearch, eventTypeFilter]);

  const stats = useMemo(() => {
    const allGroups = MOCK_EXAM_GROUPS.filter((g) => g.childId === selectedChildId);
    const total = allGroups.length;
    const completed = allGroups.filter((g) => g.status === 'completed').length;
    const upcoming = allGroups.filter((g) => g.status === 'upcoming' || g.status === 'active' || g.status === 'scheduled').length;
    return { total, completed, upcoming, events: MOCK_EVENTS.length };
  }, [selectedChildId]);

  const selectedChild = MOCK_CHILDREN.find((c) => c.id === selectedChildId);

  // ── Helpers ──
  function formatOrdinal(n: number): string {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]!);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-[#824ef2] animate-spin" />
        <p className="mt-4 text-slate-500">Loading exams & events...</p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-[#824ef2]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Exams & Events</h1>
            <p className="text-sm text-slate-500">View exam schedules, results, and school events</p>
          </div>
        </div>
        <select
          value={selectedChildId}
          onChange={(e) => setSelectedChildId(e.target.value)}
          className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] hover:border-slate-300 transition-all cursor-pointer"
        >
          {MOCK_CHILDREN.map((child) => (
            <option key={child.id} value={child.id}>
              {child.name} — {child.class}-{child.section}
            </option>
          ))}
        </select>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SchoolStatCard icon={<FileText className="w-5 h-5" />} color="blue" label="Total Exams" value={stats.total} />
        <SchoolStatCard icon={<CheckCircle className="w-5 h-5" />} color="green" label="Completed" value={stats.completed} />
        <SchoolStatCard icon={<Clock className="w-5 h-5" />} color="amber" label="Upcoming" value={stats.upcoming} />
        <SchoolStatCard icon={<CalendarDays className="w-5 h-5" />} color="purple" label="School Events" value={stats.events} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto">
        {([
          { key: 'schedule' as const, label: 'Exams Schedule' },
          { key: 'results' as const, label: 'Results' },
          { key: 'events' as const, label: 'Events' },
        ]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              tab === t.key ? 'border-[#824ef2] text-[#824ef2]' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* TAB 1: EXAMS SCHEDULE                                  */}
      {/* ═══════════════════════════════════════════════════════ */}
      {tab === 'schedule' && (
        <div className="space-y-4">
          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search exams..."
                value={scheduleSearch}
                onChange={(e) => setScheduleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] transition-all"
              />
            </div>
            <select
              value={termFilter}
              onChange={(e) => setTermFilter(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] hover:border-slate-300 transition-all cursor-pointer"
            >
              {TERM_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Exam Group Cards */}
          {childExamGroups.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
              <Calendar className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500">No exams found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {childExamGroups.map((group) => {
                const config = examStatusConfig[group.status];
                return (
                  <div
                    key={group.id}
                    className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Left: Icon + Info */}
                      <div className="flex items-start gap-4">
                        <div className={`w-11 h-11 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0`}>
                          <ClipboardList className={`w-5 h-5 ${config.text}`} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-slate-900 text-base">{group.name}</h3>
                          <p className="text-sm text-slate-500 mt-0.5">{group.dateRange}</p>
                          <span className="inline-block mt-1.5 text-xs px-2.5 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600">
                            {group.term}
                          </span>
                        </div>
                      </div>

                      {/* Right: Status + Button */}
                      <div className="flex items-center gap-3 sm:flex-shrink-0">
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${config.badgeBg} ${config.badge}`}>
                          {config.label}
                        </span>
                        <button
                          onClick={() => { setSelectedExamGroup(group); setShowScheduleModal(true); }}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#824ef2] bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors whitespace-nowrap"
                        >
                          <BookOpen className="w-4 h-4" />
                          View Schedule
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* TAB 2: RESULTS                                         */}
      {/* ═══════════════════════════════════════════════════════ */}
      {tab === 'results' && (
        <div className="space-y-4">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Exam History & Reports</h2>
              <p className="text-sm text-slate-500 mt-0.5">View detailed results and report cards</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => showToast('info', 'Downloading all reports...')}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#824ef2] bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download All
              </button>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] hover:border-slate-300 transition-all cursor-pointer"
              >
                {YEAR_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Result Cards */}
          {childResults.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
              <Trophy className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500">No results available yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {childResults.map((result, index) => (
                <div
                  key={result.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Left: Icon + Info */}
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-900 text-base">{result.examName}</h3>
                        <p className="text-sm text-slate-500 mt-0.5">Completed on {result.completedDate}</p>
                      </div>
                    </div>

                    {/* Right: Score + Grade + Button */}
                    <div className="flex items-center gap-3 sm:gap-4 sm:flex-shrink-0 flex-wrap">
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-900">{result.totalScore}/{result.maxScore}</p>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold border ${gradeBadgeColors[result.grade] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                        {result.grade}
                      </span>
                      <button
                        onClick={() => { setSelectedResult(result); setShowResultModal(true); }}
                        className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                          index === 0
                            ? 'text-white bg-[#824ef2] hover:bg-[#7040d4]'
                            : 'text-[#824ef2] bg-purple-50 hover:bg-purple-100'
                        }`}
                      >
                        View Report
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* TAB 3: EVENTS                                          */}
      {/* ═══════════════════════════════════════════════════════ */}
      {tab === 'events' && (
        <div className="space-y-4">
          {/* Header + Search + Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Upcoming Events</h2>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={eventSearch}
                  onChange={(e) => setEventSearch(e.target.value)}
                  className="w-full sm:w-56 pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] transition-all"
                />
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowEventFilterDropdown(!showEventFilterDropdown)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border rounded-lg transition-colors ${
                    eventTypeFilter !== 'ALL'
                      ? 'text-[#824ef2] border-[#824ef2] bg-purple-50'
                      : 'text-slate-700 border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  Filter
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                {showEventFilterDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowEventFilterDropdown(false)} />
                    <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1">
                      <button
                        onClick={() => { setEventTypeFilter('ALL'); setShowEventFilterDropdown(false); }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${eventTypeFilter === 'ALL' ? 'text-[#824ef2] bg-purple-50 font-medium' : 'text-slate-700 hover:bg-slate-50'}`}
                      >
                        All Types
                      </button>
                      {(Object.keys(eventTypeConfig) as EventType[]).map((type) => (
                        <button
                          key={type}
                          onClick={() => { setEventTypeFilter(type); setShowEventFilterDropdown(false); }}
                          className={`w-full text-left px-4 py-2 text-sm transition-colors ${eventTypeFilter === type ? 'text-[#824ef2] bg-purple-50 font-medium' : 'text-slate-700 hover:bg-slate-50'}`}
                        >
                          {eventTypeConfig[type].label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Event Timeline Cards */}
          {filteredEvents.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
              <CalendarDays className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500">No events found</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[18px] top-4 bottom-4 w-0.5 bg-slate-200 hidden sm:block" />

              <div className="space-y-4">
                {filteredEvents.map((event, index) => {
                  const typeConf = eventTypeConfig[event.type];
                  const eventDate = new Date(event.date);

                  return (
                    <div key={event.id} className="flex gap-4 relative">
                      {/* Timeline dot */}
                      <div className="hidden sm:flex flex-col items-center flex-shrink-0 pt-5">
                        <div className={`w-[14px] h-[14px] rounded-full ${typeConf.dot} border-2 border-white shadow-sm z-10`} />
                      </div>

                      {/* Card */}
                      <div className="flex-1 bg-white rounded-xl border border-slate-200 p-4 sm:p-5 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <span className={`inline-block text-xs px-2.5 py-0.5 rounded-full font-medium ${typeConf.badgeBg} ${typeConf.badge} mb-2`}>
                              {typeConf.label}
                            </span>
                            <h3 className="font-semibold text-slate-900 text-base">{event.title}</h3>
                            <p className="text-sm text-slate-500 mt-1 line-clamp-2">{event.description}</p>
                            <div className="flex items-center gap-4 mt-3 flex-wrap">
                              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                                <Clock className="w-3.5 h-3.5" />
                                {eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                {event.startTime && `, ${event.startTime}`}
                                {event.endTime && ` - ${event.endTime}`}
                              </span>
                              {event.location && (
                                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                                  <MapPin className="w-3.5 h-3.5" />
                                  {event.location}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => { setSelectedEvent(event); setShowEventModal(true); }}
                            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex-shrink-0 ${
                              index === 0
                                ? 'text-white bg-[#824ef2] hover:bg-[#7040d4]'
                                : 'text-[#824ef2] border border-[#824ef2]/30 bg-white hover:bg-purple-50'
                            }`}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* MODAL: Exam Schedule                                   */}
      {/* ═══════════════════════════════════════════════════════ */}
      <FormModal
        open={showScheduleModal && !!selectedExamGroup}
        onClose={() => { setShowScheduleModal(false); setSelectedExamGroup(null); }}
        title={selectedExamGroup?.name || ''}
        size="lg"
        footer={
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setShowScheduleModal(false); setSelectedExamGroup(null); }}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => showToast('info', 'Downloading schedule PDF...')}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#7040d4] transition-colors"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        }
      >
        {selectedExamGroup && (
          <div className="space-y-5">
            {/* Info banner */}
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700">{selectedExamGroup.note}</p>
            </div>

            {/* Schedule table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left py-3 px-4 font-medium text-slate-500">Subject</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-500">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-500">Time</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-500">Room</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-500">Syllabus</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedExamGroup.subjects.map((subj, idx) => (
                    <tr key={idx} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-900">{subj.subject}</td>
                      <td className="py-3 px-4 text-slate-600">
                        {new Date(subj.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{subj.time}</td>
                      <td className="py-3 px-4 text-slate-600">{subj.room}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => { setSyllabusSubject(subj); setShowSyllabusModal(true); }}
                          className="text-sm font-medium text-[#824ef2] hover:underline"
                        >
                          View Topics
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </FormModal>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* MODAL: Syllabus Topics                                 */}
      {/* ═══════════════════════════════════════════════════════ */}
      <FormModal
        open={showSyllabusModal && !!syllabusSubject}
        onClose={() => { setShowSyllabusModal(false); setSyllabusSubject(null); }}
        title={syllabusSubject ? `${syllabusSubject.subject} Syllabus` : ''}
        size="md"
        footer={
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setShowSyllabusModal(false); setSyllabusSubject(null); }}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => showToast('info', 'Downloading syllabus PDF...')}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#7040d4] transition-colors"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        }
      >
        {syllabusSubject && (
          <div className="space-y-5">
            {selectedExamGroup && (
              <p className="text-sm text-slate-500">{selectedExamGroup.name}</p>
            )}

            {/* Numbered topic list */}
            <div className="space-y-4">
              {syllabusSubject.syllabus.map((topic, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-[#824ef2]">{idx + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-900 text-sm">{topic.title}</h4>
                    <p className="text-sm text-slate-500 mt-0.5">{topic.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Tip box */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Star className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700">
                  Remember to bring geometry box and graph paper for the exam. Review all diagrams and practice numerical problems for best results.
                </p>
              </div>
            </div>
          </div>
        )}
      </FormModal>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* MODAL: Exam Result Report                              */}
      {/* ═══════════════════════════════════════════════════════ */}
      <FormModal
        open={showResultModal && !!selectedResult}
        onClose={() => { setShowResultModal(false); setSelectedResult(null); }}
        title={selectedResult ? `${selectedResult.examName} Result` : ''}
        size="lg"
        footer={
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setShowResultModal(false); setSelectedResult(null); }}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => showToast('info', 'Downloading report card...')}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#7040d4] transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Report Card
            </button>
          </div>
        }
      >
        {selectedResult && (
          <div className="space-y-5">
            {/* Subtitle + Grade badge */}
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm text-slate-500">
                Student: {selectedChild?.name} | Class: {selectedChild?.class}-{selectedChild?.section}
              </p>
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold border-2 flex-shrink-0 ${gradeBadgeColors[selectedResult.grade] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                {selectedResult.grade}
              </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 text-center">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Total Score</p>
                <p className="text-xl font-bold text-slate-900">{selectedResult.totalScore}/{selectedResult.maxScore}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 text-center">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Percentage</p>
                <p className="text-xl font-bold text-[#824ef2]">{selectedResult.percentage}%</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 text-center">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Class Rank</p>
                <p className="text-xl font-bold text-slate-900">{formatOrdinal(selectedResult.rank)}</p>
              </div>
            </div>

            {/* Subject breakdown */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-3">Subject Breakdown</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[600px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left py-2.5 px-4 font-medium text-slate-500">Subject</th>
                      <th className="text-left py-2.5 px-4 font-medium text-slate-500">Marks Obtained</th>
                      <th className="text-left py-2.5 px-4 font-medium text-slate-500">Total Marks</th>
                      <th className="text-left py-2.5 px-4 font-medium text-slate-500">Grade</th>
                      <th className="text-left py-2.5 px-4 font-medium text-slate-500">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedResult.subjects.map((subj, idx) => (
                      <tr key={idx} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-4 font-medium text-slate-900">{subj.name}</td>
                        <td className="py-2.5 px-4 text-slate-700 font-semibold">{subj.marksObtained}</td>
                        <td className="py-2.5 px-4 text-slate-600">{subj.totalMarks}</td>
                        <td className="py-2.5 px-4">
                          <span className={`text-sm font-semibold ${gradeColors[subj.grade] || 'text-slate-700'}`}>
                            {subj.grade}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-500 text-xs">{subj.remarks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Teacher's comment */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-amber-800 mb-2">Teacher&apos;s Comment</h4>
              <p className="text-sm text-amber-700 italic">&ldquo;{selectedResult.teacherComment}&rdquo;</p>
            </div>
          </div>
        )}
      </FormModal>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* MODAL: Event Details                                   */}
      {/* ═══════════════════════════════════════════════════════ */}
      <FormModal
        open={showEventModal && !!selectedEvent}
        onClose={() => { setSelectedEvent(null); setShowEventModal(false); }}
        title="Event Details"
        size="lg"
        footer={
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setSelectedEvent(null); setShowEventModal(false); }}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => showToast('info', 'Added to calendar')}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#7040d4] transition-colors"
            >
              <CalendarDays className="w-4 h-4" />
              Add to Calendar
            </button>
          </div>
        }
      >
        {selectedEvent && (() => {
          const typeConf = eventTypeConfig[selectedEvent.type];
          const eventDate = new Date(selectedEvent.date);

          return (
            <div className="space-y-5">
              {/* Status badge */}
              <span className={`inline-block text-xs px-3 py-1 rounded-full font-medium ${typeConf.badgeBg} ${typeConf.badge}`}>
                Upcoming
              </span>

              {/* Event title */}
              <h3 className="text-xl font-bold text-slate-900">{selectedEvent.title}</h3>

              {/* Date, Time, Location */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  <p className="text-sm text-slate-700">
                    {eventDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                {selectedEvent.startTime && (
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    <p className="text-sm text-slate-700">
                      {selectedEvent.startTime}{selectedEvent.endTime && ` - ${selectedEvent.endTime}`}
                    </p>
                  </div>
                )}
                {selectedEvent.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    <p className="text-sm text-slate-700">{selectedEvent.location}</p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <p className="text-sm text-slate-700 leading-relaxed">{selectedEvent.description}</p>
              </div>

              {/* Agenda */}
              {selectedEvent.agenda.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">Agenda:</h4>
                  <ul className="space-y-2">
                    {selectedEvent.agenda.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#824ef2] flex-shrink-0 mt-1.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })()}
      </FormModal>
    </section>
  );
}
