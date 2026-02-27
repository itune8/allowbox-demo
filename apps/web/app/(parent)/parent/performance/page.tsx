'use client';

import { useState, useEffect, useMemo } from 'react';
import { SchoolStatCard, useToast } from '../../../../components/school';
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
  { id: 's1', subject: 'Mathematics', score: 92, maxScore: 100, grade: 'A+', trend: 'up', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 's2', subject: 'Science', score: 88, maxScore: 100, grade: 'A', trend: 'up', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { id: 's3', subject: 'English', score: 85, maxScore: 100, grade: 'A', trend: 'stable', color: 'bg-green-100 text-green-700 border-green-200' },
  { id: 's4', subject: 'Hindi', score: 78, maxScore: 100, grade: 'B+', trend: 'down', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { id: 's5', subject: 'Social Studies', score: 82, maxScore: 100, grade: 'A', trend: 'up', color: 'bg-pink-100 text-pink-700 border-pink-200' },
  { id: 's6', subject: 'Computer Science', score: 95, maxScore: 100, grade: 'A+', trend: 'up', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
];

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

export default function ParentPerformancePage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState(MOCK_CHILDREN[0]!.id);
  const [showChildDropdown, setShowChildDropdown] = useState(false);
  const [tab, setTab] = useState<'overview' | 'subjects' | 'trends'>('overview');

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

  const maxTrend = Math.max(...MOCK_MONTHLY_TRENDS.map((t) => t.percentage));

  function TrendArrow({ trend }: { trend: 'up' | 'down' | 'stable' }) {
    if (trend === 'up') return <ArrowUp className="w-4 h-4 text-green-500" />;
    if (trend === 'down') return <ArrowDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_SUBJECT_SCORES.map((subject) => (
            <div key={subject.id} className={`rounded-xl border p-5 ${subject.color}`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">{subject.subject}</h3>
                <TrendArrow trend={subject.trend} />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">{subject.score}</span>
                <span className="text-sm opacity-75">/ {subject.maxScore}</span>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className={`text-sm font-semibold ${gradeColor[subject.grade] || 'text-slate-600'}`}>
                  Grade: {subject.grade}
                </span>
                <span className="text-xs opacity-75 capitalize flex items-center gap-1">
                  {subject.trend === 'up' && 'Improving'}
                  {subject.trend === 'down' && 'Declining'}
                  {subject.trend === 'stable' && 'Stable'}
                </span>
              </div>
              {/* Score bar */}
              <div className="mt-3 h-1.5 bg-white/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-current opacity-50 rounded-full transition-all duration-500"
                  style={{ width: `${(subject.score / subject.maxScore) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Trends Tab */}
      {tab === 'trends' && (
        <div className="space-y-4">
          {/* Bar Chart Visualization */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Monthly Progress</h2>
            <div className="flex items-end justify-between gap-3" style={{ height: '240px' }}>
              {MOCK_MONTHLY_TRENDS.map((t, i) => {
                const barHeight = (t.percentage / maxTrend) * 100;
                return (
                  <div key={t.month} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs font-semibold text-slate-700">{t.percentage}%</span>
                    <div className="w-full flex justify-center" style={{ height: '180px' }}>
                      <div
                        className="w-full max-w-[48px] rounded-t-lg transition-all duration-500"
                        style={{
                          height: `${barHeight}%`,
                          backgroundColor: i === MOCK_MONTHLY_TRENDS.length - 1 ? '#824ef2' : '#e2d9f8',
                        }}
                      />
                    </div>
                    <span className="text-xs text-slate-500 font-medium">{t.month}</span>
                  </div>
                );
              })}
            </div>
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
    </section>
  );
}
