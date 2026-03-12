'use client';

import { useState, useEffect, useMemo } from 'react';
import { SchoolStatCard, FormModal, useToast } from '../../../../components/school';
import {
  BarChart3,
  Award,
  TrendingUp,
  Users,
  ChevronDown,
  Loader2,
  ArrowUp,
  ArrowDown,
  Minus,
  X,
} from 'lucide-react';

// ── Mock data ──
const MOCK_CHILDREN = [
  { id: 'child1', name: 'Aarav Sharma', class: 'Class 10-A', photo: 'AS' },
  { id: 'child2', name: 'Priya Sharma', class: 'Class 7-B', photo: 'PS' },
];

interface ExamSummary {
  id: string;
  exam: string;
  totalMarks: number;
  obtained: number;
  percentage: number;
  grade: string;
  rank: number;
}

interface SubjectScore {
  id: string;
  subject: string;
  score: number;
  maxScore: number;
  grade: string;
  trend: 'up' | 'down' | 'stable';
  color: string;
  barColor: string;
}

interface SubjectHistory {
  exam: string;
  marks: number;
  maxMarks: number;
  date: string;
}

interface MonthlyTrend {
  month: string;
  percentage: number;
}

const MOCK_EXAM_SUMMARIES: ExamSummary[] = [
  { id: 'ex1', exam: 'Annual Examination', totalMarks: 500, obtained: 438, percentage: 87.6, grade: 'A', rank: 5 },
  { id: 'ex2', exam: 'Mid-Term Examination', totalMarks: 500, obtained: 412, percentage: 82.4, grade: 'A', rank: 8 },
  { id: 'ex3', exam: 'Unit Test 3', totalMarks: 250, obtained: 218, percentage: 87.2, grade: 'A', rank: 4 },
  { id: 'ex4', exam: 'Unit Test 2', totalMarks: 250, obtained: 195, percentage: 78.0, grade: 'B+', rank: 12 },
  { id: 'ex5', exam: 'Unit Test 1', totalMarks: 250, obtained: 205, percentage: 82.0, grade: 'A', rank: 9 },
  { id: 'ex6', exam: 'Quarterly Examination', totalMarks: 400, obtained: 332, percentage: 83.0, grade: 'A', rank: 7 },
];

const MOCK_SUBJECT_SCORES: SubjectScore[] = [
  { id: 's1', subject: 'Mathematics', score: 92, maxScore: 100, grade: 'A+', trend: 'up', color: 'bg-blue-100 text-blue-700 border-blue-200', barColor: 'bg-blue-500' },
  { id: 's2', subject: 'Science', score: 88, maxScore: 100, grade: 'A', trend: 'up', color: 'bg-purple-100 text-purple-700 border-purple-200', barColor: 'bg-purple-500' },
  { id: 's3', subject: 'English', score: 85, maxScore: 100, grade: 'A', trend: 'stable', color: 'bg-green-100 text-green-700 border-green-200', barColor: 'bg-green-500' },
  { id: 's4', subject: 'Hindi', score: 78, maxScore: 100, grade: 'B+', trend: 'down', color: 'bg-amber-100 text-amber-700 border-amber-200', barColor: 'bg-amber-500' },
  { id: 's5', subject: 'Social Studies', score: 82, maxScore: 100, grade: 'A', trend: 'up', color: 'bg-pink-100 text-pink-700 border-pink-200', barColor: 'bg-pink-500' },
  { id: 's6', subject: 'Computer Science', score: 95, maxScore: 100, grade: 'A+', trend: 'up', color: 'bg-cyan-100 text-cyan-700 border-cyan-200', barColor: 'bg-cyan-500' },
];

const MOCK_SUBJECT_HISTORY: Record<string, SubjectHistory[]> = {
  s1: [
    { exam: 'Unit Test 1', marks: 82, maxMarks: 100, date: 'Jul 2025' },
    { exam: 'Quarterly Exam', marks: 85, maxMarks: 100, date: 'Sep 2025' },
    { exam: 'Unit Test 2', marks: 78, maxMarks: 100, date: 'Oct 2025' },
    { exam: 'Mid-Term Exam', marks: 88, maxMarks: 100, date: 'Nov 2025' },
    { exam: 'Unit Test 3', marks: 90, maxMarks: 100, date: 'Jan 2026' },
    { exam: 'Annual Exam', marks: 92, maxMarks: 100, date: 'Mar 2026' },
  ],
  s2: [
    { exam: 'Unit Test 1', marks: 75, maxMarks: 100, date: 'Jul 2025' },
    { exam: 'Quarterly Exam', marks: 80, maxMarks: 100, date: 'Sep 2025' },
    { exam: 'Unit Test 2', marks: 82, maxMarks: 100, date: 'Oct 2025' },
    { exam: 'Mid-Term Exam', marks: 84, maxMarks: 100, date: 'Nov 2025' },
    { exam: 'Unit Test 3', marks: 86, maxMarks: 100, date: 'Jan 2026' },
    { exam: 'Annual Exam', marks: 88, maxMarks: 100, date: 'Mar 2026' },
  ],
  s3: [
    { exam: 'Unit Test 1', marks: 80, maxMarks: 100, date: 'Jul 2025' },
    { exam: 'Quarterly Exam', marks: 83, maxMarks: 100, date: 'Sep 2025' },
    { exam: 'Unit Test 2', marks: 81, maxMarks: 100, date: 'Oct 2025' },
    { exam: 'Mid-Term Exam', marks: 85, maxMarks: 100, date: 'Nov 2025' },
    { exam: 'Unit Test 3', marks: 84, maxMarks: 100, date: 'Jan 2026' },
    { exam: 'Annual Exam', marks: 85, maxMarks: 100, date: 'Mar 2026' },
  ],
  s4: [
    { exam: 'Unit Test 1', marks: 85, maxMarks: 100, date: 'Jul 2025' },
    { exam: 'Quarterly Exam', marks: 82, maxMarks: 100, date: 'Sep 2025' },
    { exam: 'Unit Test 2', marks: 80, maxMarks: 100, date: 'Oct 2025' },
    { exam: 'Mid-Term Exam', marks: 79, maxMarks: 100, date: 'Nov 2025' },
    { exam: 'Unit Test 3', marks: 76, maxMarks: 100, date: 'Jan 2026' },
    { exam: 'Annual Exam', marks: 78, maxMarks: 100, date: 'Mar 2026' },
  ],
  s5: [
    { exam: 'Unit Test 1', marks: 72, maxMarks: 100, date: 'Jul 2025' },
    { exam: 'Quarterly Exam', marks: 75, maxMarks: 100, date: 'Sep 2025' },
    { exam: 'Unit Test 2', marks: 78, maxMarks: 100, date: 'Oct 2025' },
    { exam: 'Mid-Term Exam', marks: 80, maxMarks: 100, date: 'Nov 2025' },
    { exam: 'Unit Test 3', marks: 81, maxMarks: 100, date: 'Jan 2026' },
    { exam: 'Annual Exam', marks: 82, maxMarks: 100, date: 'Mar 2026' },
  ],
  s6: [
    { exam: 'Unit Test 1', marks: 88, maxMarks: 100, date: 'Jul 2025' },
    { exam: 'Quarterly Exam', marks: 90, maxMarks: 100, date: 'Sep 2025' },
    { exam: 'Unit Test 2', marks: 91, maxMarks: 100, date: 'Oct 2025' },
    { exam: 'Mid-Term Exam', marks: 93, maxMarks: 100, date: 'Nov 2025' },
    { exam: 'Unit Test 3', marks: 94, maxMarks: 100, date: 'Jan 2026' },
    { exam: 'Annual Exam', marks: 95, maxMarks: 100, date: 'Mar 2026' },
  ],
};

const MOCK_MONTHLY_TRENDS: MonthlyTrend[] = [
  { month: 'Aug', percentage: 76 },
  { month: 'Sep', percentage: 79 },
  { month: 'Oct', percentage: 82 },
  { month: 'Nov', percentage: 78 },
  { month: 'Dec', percentage: 84 },
  { month: 'Jan', percentage: 86 },
  { month: 'Feb', percentage: 88 },
];

const gradeColor: Record<string, string> = {
  'A+': 'text-green-600',
  'A': 'text-green-600',
  'B+': 'text-blue-600',
  'B': 'text-blue-600',
  'B-': 'text-blue-600',
  'C': 'text-amber-600',
  'D': 'text-red-600',
  'F': 'text-red-600',
};

// SVG Line Graph for Trends tab
function TrendsLineGraph({ data }: { data: MonthlyTrend[] }) {
  const padding = { top: 28, right: 20, bottom: 36, left: 46 };
  const width = 800;
  const height = 240;
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const minVal = Math.min(...data.map((d) => d.percentage)) - 5;
  const maxVal = Math.max(...data.map((d) => d.percentage)) + 5;
  const range = maxVal - minVal;

  const points = data.map((d, i) => ({
    x: padding.left + (i / (data.length - 1)) * chartW,
    y: padding.top + chartH - ((d.percentage - minVal) / range) * chartH,
    label: d.month,
    value: d.percentage,
  }));

  // Smooth cubic bezier curve through points
  function smoothLine(pts: typeof points): string {
    if (pts.length < 2) return '';
    let d = `M${pts[0]!.x},${pts[0]!.y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(i - 1, 0)]!;
      const p1 = pts[i]!;
      const p2 = pts[i + 1]!;
      const p3 = pts[Math.min(i + 2, pts.length - 1)]!;
      const tension = 0.3;
      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;
      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;
      d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    return d;
  }

  const smoothPath = smoothLine(points);
  const areaPath = `${smoothPath} L${points[points.length - 1]!.x},${padding.top + chartH} L${points[0]!.x},${padding.top + chartH} Z`;

  // Y-axis ticks
  const yTicks = 4;
  const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) => Math.round(minVal + (range / yTicks) * i));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="trendAreaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#824ef2" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#824ef2" stopOpacity="0.01" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {yTickValues.map((val) => {
        const y = padding.top + chartH - ((val - minVal) / range) * chartH;
        return (
          <g key={val}>
            <line x1={padding.left} y1={y} x2={padding.left + chartW} y2={y} stroke="#f1f5f9" strokeWidth="1" />
            <text x={padding.left - 8} y={y + 4} textAnchor="end" className="text-[10px]" fill="#94a3b8">{val}%</text>
          </g>
        );
      })}

      {/* Area fill */}
      <path d={areaPath} fill="url(#trendAreaGrad)" />

      {/* Smooth line */}
      <path d={smoothPath} fill="none" stroke="#824ef2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Dots and labels */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="3.5" fill="#824ef2" stroke="white" strokeWidth="2" />
          <text x={p.x} y={p.y - 10} textAnchor="middle" className="text-[9px] font-semibold" fill="#64748b">{p.value}%</text>
          <text x={p.x} y={padding.top + chartH + 16} textAnchor="middle" className="text-[10px]" fill="#94a3b8">{p.label}</text>
        </g>
      ))}
    </svg>
  );
}

// SVG Line Graph for Subject History modal
function SubjectHistoryGraph({ data, color }: { data: SubjectHistory[]; color: string }) {
  const padding = { top: 20, right: 20, bottom: 40, left: 45 };
  const width = 500;
  const height = 220;
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const marks = data.map((d) => d.marks);
  const minVal = Math.min(...marks) - 5;
  const maxVal = Math.max(...marks) + 5;
  const range = maxVal - minVal;

  const points = data.map((d, i) => ({
    x: padding.left + (i / (data.length - 1)) * chartW,
    y: padding.top + chartH - ((d.marks - minVal) / range) * chartH,
    label: d.date,
    value: d.marks,
  }));

  const linePath = points.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(' ');
  const areaPath = `${linePath} L${points[points.length - 1]!.x},${padding.top + chartH} L${points[0]!.x},${padding.top + chartH} Z`;

  // Y-axis ticks
  const yTicks = 4;
  const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) => Math.round(minVal + (range / yTicks) * i));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="subjectAreaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {yTickValues.map((val) => {
        const y = padding.top + chartH - ((val - minVal) / range) * chartH;
        return (
          <g key={val}>
            <line x1={padding.left} y1={y} x2={padding.left + chartW} y2={y} stroke="#e2e8f0" strokeWidth="1" />
            <text x={padding.left - 8} y={y + 4} textAnchor="end" className="text-[10px]" fill="#94a3b8">{val}</text>
          </g>
        );
      })}

      {/* Area fill */}
      <path d={areaPath} fill="url(#subjectAreaGrad)" />

      {/* Line */}
      <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Dots and labels */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill={color} stroke="white" strokeWidth="2" />
          <text x={p.x} y={p.y - 10} textAnchor="middle" className="text-[9px] font-semibold" fill="#64748b">{p.value}</text>
          <text x={p.x} y={padding.top + chartH + 18} textAnchor="middle" className="text-[10px]" fill="#64748b">{p.label}</text>
        </g>
      ))}
    </svg>
  );
}

// Map barColor class to hex for SVG usage
const barColorToHex: Record<string, string> = {
  'bg-blue-500': '#3b82f6',
  'bg-purple-500': '#a855f7',
  'bg-green-500': '#22c55e',
  'bg-amber-500': '#f59e0b',
  'bg-pink-500': '#ec4899',
  'bg-cyan-500': '#06b6d4',
};

export default function ParentPerformancePage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState(MOCK_CHILDREN[0]!.id);
  const [showChildDropdown, setShowChildDropdown] = useState(false);
  const [tab, setTab] = useState<'overview' | 'subjects' | 'trends'>('overview');
  const [selectedSubject, setSelectedSubject] = useState<SubjectScore | null>(null);
  const [subjectDropdownOpen, setSubjectDropdownOpen] = useState(false);
  const [subjectDropdownValue, setSubjectDropdownValue] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const currentChild = MOCK_CHILDREN.find((c) => c.id === selectedChild) || MOCK_CHILDREN[0]!;

  const stats = useMemo(() => {
    const avgPercentage = Math.round(MOCK_EXAM_SUMMARIES.reduce((sum, e) => sum + e.percentage, 0) / MOCK_EXAM_SUMMARIES.length);
    const bestSubject = MOCK_SUBJECT_SCORES.reduce((best, s) => s.score > best.score ? s : best, MOCK_SUBJECT_SCORES[0]!);
    const bestRank = Math.min(...MOCK_EXAM_SUMMARIES.map((e) => e.rank));
    const latestPct = MOCK_MONTHLY_TRENDS[MOCK_MONTHLY_TRENDS.length - 1]!.percentage;
    const prevPct = MOCK_MONTHLY_TRENDS[MOCK_MONTHLY_TRENDS.length - 2]!.percentage;
    const improvement = latestPct - prevPct;
    return { avgPercentage, bestSubject: bestSubject.subject, bestRank, improvement };
  }, []);

  const showSubjectDropdown = MOCK_SUBJECT_SCORES.length > 6;

  function TrendArrow({ trend }: { trend: 'up' | 'down' | 'stable' }) {
    if (trend === 'up') return <ArrowUp className="w-4 h-4 text-green-500" />;
    if (trend === 'down') return <ArrowDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  }

  function handleSubjectClick(subject: SubjectScore) {
    setSelectedSubject(subject);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-[#824ef2] animate-spin" />
        <p className="mt-4 text-slate-500">Loading performance...</p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-[#824ef2]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Performance</h1>
            <p className="text-sm text-slate-500">Track your child&apos;s academic progress and exam results</p>
          </div>
        </div>
        {MOCK_CHILDREN.length > 1 && (
          <div className="relative">
            <button onClick={() => setShowChildDropdown(!showChildDropdown)} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="w-7 h-7 rounded-full bg-[#824ef2]/10 flex items-center justify-center text-xs font-bold text-[#824ef2]">{currentChild.photo}</div>
              <span className="text-sm font-medium text-slate-700">{currentChild.name}</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
            {showChildDropdown && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 min-w-[200px]">
                {MOCK_CHILDREN.map((child) => (
                  <button key={child.id} onClick={() => { setSelectedChild(child.id); setShowChildDropdown(false); }} className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${selectedChild === child.id ? 'bg-[#824ef2]/5 text-[#824ef2]' : 'text-slate-700'}`}>
                    <div className="w-7 h-7 rounded-full bg-[#824ef2]/10 flex items-center justify-center text-xs font-bold text-[#824ef2]">{child.photo}</div>
                    <div className="text-left">
                      <p className="font-medium">{child.name}</p>
                      <p className="text-xs text-slate-400">{child.class}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SchoolStatCard icon={<BarChart3 className="w-5 h-5" />} color="purple" label="Overall Average" value={`${stats.avgPercentage}%`} />
        <SchoolStatCard icon={<Award className="w-5 h-5" />} color="green" label="Best Subject" value={stats.bestSubject} />
        <SchoolStatCard icon={<Users className="w-5 h-5" />} color="blue" label="Class Rank" value={`#${stats.bestRank}`} />
        <SchoolStatCard icon={<TrendingUp className="w-5 h-5" />} color="amber" label="Improvement" value={`+${stats.improvement}%`} subtitle="vs last month" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {([
          { key: 'overview' as const, label: 'Overview' },
          { key: 'subjects' as const, label: 'Subject-wise' },
          { key: 'trends' as const, label: 'Trends' },
        ]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key ? 'border-[#824ef2] text-[#824ef2]' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-5 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Exam Summaries</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Exam</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Total</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Obtained</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">%</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Grade</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Rank</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_EXAM_SUMMARIES.map((exam) => (
                  <tr key={exam.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-5 font-medium text-slate-900">{exam.exam}</td>
                    <td className="py-3 px-5 text-slate-600">{exam.totalMarks}</td>
                    <td className="py-3 px-5 font-semibold text-slate-700">{exam.obtained}</td>
                    <td className="py-3 px-5">
                      <span className={`font-semibold ${exam.percentage >= 85 ? 'text-green-600' : exam.percentage >= 70 ? 'text-blue-600' : 'text-amber-600'}`}>
                        {exam.percentage}%
                      </span>
                    </td>
                    <td className="py-3 px-5">
                      <span className={`text-sm font-semibold ${gradeColor[exam.grade] || 'text-slate-600'}`}>
                        {exam.grade}
                      </span>
                    </td>
                    <td className="py-3 px-5">
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-blue-100 text-blue-700">
                        #{exam.rank}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subject-wise Tab */}
      {tab === 'subjects' && (
        <div>
          {showSubjectDropdown ? (
            /* Dropdown selector when > 6 subjects */
            <div className="space-y-4">
              <div className="relative w-full sm:w-72">
                <button
                  onClick={() => setSubjectDropdownOpen(!subjectDropdownOpen)}
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm"
                >
                  <span className={subjectDropdownValue ? 'text-slate-900 font-medium' : 'text-slate-400'}>
                    {subjectDropdownValue
                      ? MOCK_SUBJECT_SCORES.find((s) => s.id === subjectDropdownValue)?.subject
                      : 'Select a subject'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>
                {subjectDropdownOpen && (
                  <div className="absolute left-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 w-full max-h-60 overflow-y-auto">
                    {MOCK_SUBJECT_SCORES.map((subject) => (
                      <button
                        key={subject.id}
                        onClick={() => {
                          setSubjectDropdownValue(subject.id);
                          setSubjectDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                          subjectDropdownValue === subject.id ? 'bg-[#824ef2]/5 text-[#824ef2] font-medium' : 'text-slate-700'
                        }`}
                      >
                        {subject.subject} — {subject.score}/{subject.maxScore} ({subject.grade})
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {subjectDropdownValue && (() => {
                const subject = MOCK_SUBJECT_SCORES.find((s) => s.id === subjectDropdownValue);
                if (!subject) return null;
                return (
                  <button
                    onClick={() => handleSubjectClick(subject)}
                    className="bg-white rounded-xl border border-slate-200 p-5 w-full text-left hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-sm text-slate-900">{subject.subject}</h3>
                      <TrendArrow trend={subject.trend} />
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-slate-900">{subject.score}</span>
                      <span className="text-sm text-slate-400">/ {subject.maxScore}</span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className={`text-sm font-semibold ${gradeColor[subject.grade] || 'text-slate-600'}`}>
                        Grade: {subject.grade}
                      </span>
                      <span className="text-xs text-slate-400 capitalize flex items-center gap-1">
                        {subject.trend === 'up' && 'Improving'}
                        {subject.trend === 'down' && 'Declining'}
                        {subject.trend === 'stable' && 'Stable'}
                      </span>
                    </div>
                  </button>
                );
              })()}
            </div>
          ) : (
            /* Card grid when <= 6 subjects */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {MOCK_SUBJECT_SCORES.map((subject) => (
                <button
                  key={subject.id}
                  onClick={() => handleSubjectClick(subject)}
                  className="bg-white rounded-xl border border-slate-200 p-5 text-left hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm text-slate-900">{subject.subject}</h3>
                    <TrendArrow trend={subject.trend} />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-slate-900">{subject.score}</span>
                    <span className="text-sm text-slate-400">/ {subject.maxScore}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className={`text-sm font-semibold ${gradeColor[subject.grade] || 'text-slate-600'}`}>
                      Grade: {subject.grade}
                    </span>
                    <span className="text-xs text-slate-400 capitalize flex items-center gap-1">
                      {subject.trend === 'up' && 'Improving'}
                      {subject.trend === 'down' && 'Declining'}
                      {subject.trend === 'stable' && 'Stable'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Trends Tab */}
      {tab === 'trends' && (
        <div className="space-y-4">
          {/* Line Graph Visualization */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Monthly Progress</h2>
            <TrendsLineGraph data={MOCK_MONTHLY_TRENDS} />
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <p className="text-xs text-slate-500 mb-1">Starting Score</p>
              <p className="text-2xl font-bold text-slate-600">{MOCK_MONTHLY_TRENDS[0]!.percentage}%</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <p className="text-xs text-slate-500 mb-1">Current Score</p>
              <p className="text-2xl font-bold text-[#824ef2]">{MOCK_MONTHLY_TRENDS[MOCK_MONTHLY_TRENDS.length - 1]!.percentage}%</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <p className="text-xs text-slate-500 mb-1">Overall Growth</p>
              <p className="text-2xl font-bold text-green-600">
                +{MOCK_MONTHLY_TRENDS[MOCK_MONTHLY_TRENDS.length - 1]!.percentage - MOCK_MONTHLY_TRENDS[0]!.percentage}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Subject Detail Modal */}
      <FormModal
        open={!!selectedSubject}
        title={selectedSubject ? `${selectedSubject.subject} — Marks History` : ''}
        onClose={() => setSelectedSubject(null)}
        size="lg"
      >
        {selectedSubject && (() => {
          const history = MOCK_SUBJECT_HISTORY[selectedSubject.id] || [];
          const hexColor = barColorToHex[selectedSubject.barColor] || '#824ef2';
          return (
            <div className="space-y-6">
              {/* Summary row */}
              <div className="flex items-center gap-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-slate-900">{selectedSubject.score}</span>
                  <span className="text-sm text-slate-400">/ {selectedSubject.maxScore}</span>
                </div>
                <span className={`text-sm font-semibold ${gradeColor[selectedSubject.grade] || 'text-slate-600'}`}>
                  Grade: {selectedSubject.grade}
                </span>
                <span className="text-xs text-slate-400 capitalize flex items-center gap-1">
                  <TrendArrow trend={selectedSubject.trend} />
                  {selectedSubject.trend === 'up' && 'Improving'}
                  {selectedSubject.trend === 'down' && 'Declining'}
                  {selectedSubject.trend === 'stable' && 'Stable'}
                </span>
              </div>

              {/* Line graph */}
              {history.length > 1 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Progress Over Time</h3>
                  <SubjectHistoryGraph data={history} color={hexColor} />
                </div>
              )}

              {/* Marks history table */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Exam History</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="text-left py-2.5 px-4 font-medium text-slate-500">Exam</th>
                        <th className="text-left py-2.5 px-4 font-medium text-slate-500">Date</th>
                        <th className="text-left py-2.5 px-4 font-medium text-slate-500">Marks</th>
                        <th className="text-left py-2.5 px-4 font-medium text-slate-500">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((entry, idx) => (
                        <tr key={idx} className="border-b border-slate-100 last:border-b-0">
                          <td className="py-2.5 px-4 font-medium text-slate-900">{entry.exam}</td>
                          <td className="py-2.5 px-4 text-slate-500">{entry.date}</td>
                          <td className="py-2.5 px-4 font-semibold text-slate-700">{entry.marks}/{entry.maxMarks}</td>
                          <td className="py-2.5 px-4">
                            <span className={`font-semibold ${(entry.marks / entry.maxMarks) * 100 >= 85 ? 'text-green-600' : (entry.marks / entry.maxMarks) * 100 >= 70 ? 'text-blue-600' : 'text-amber-600'}`}>
                              {Math.round((entry.marks / entry.maxMarks) * 100)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })()}
      </FormModal>
    </section>
  );
}
