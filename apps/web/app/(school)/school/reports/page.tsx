'use client';

import { useState } from 'react';
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  Eye,
  BookOpen,
  ClipboardCheck,
  BarChart3,
  GraduationCap,
  Bus,
  Heart,
  Clock,
  FileCheck,
  CalendarCheck,
  BookOpenCheck,
  ArrowRight,
  ArrowUpRight,
} from 'lucide-react';
import { SchoolStatCard, SchoolStatusBadge, FormModal, useToast, CustomSelect } from '../../../../components/school';

// ─── Types ──────────────────────────────────────────────────────────────────────

type CategoryKey = 'academic' | 'attendance' | 'financial';

interface ReportItem {
  name: string;
  icon: React.ElementType;
  color: string;
  status: string;
  date: string;
}

interface AcademicClassRow {
  className: string;
  teacher: string;
  initials: string;
  avatarColor: string;
  students: number;
  avgScore: number;
  passRate: number;
}

interface AttendanceClassRow {
  className: string;
  totalStudents: number;
  presentDays: string;
  absentRate: number;
  present: number;
  absent: number;
}

interface FinancialClassRow {
  className: string;
  totalInvoiced: number;
  collected: number;
  outstanding: number;
  collectionRate: number;
}

// ─── Mock Data ──────────────────────────────────────────────────────────────────

const overviewReports: ReportItem[] = [
  { name: 'Fees Summary', icon: DollarSign, color: 'bg-emerald-500', status: 'Completed', date: 'Feb 24, 2026' },
  { name: 'Attendance Overview', icon: Users, color: 'bg-blue-500', status: 'Completed', date: 'Feb 23, 2026' },
  { name: 'Students by Class', icon: BarChart3, color: 'bg-purple-500', status: 'Completed', date: 'Feb 22, 2026' },
  { name: 'Academic Performance', icon: GraduationCap, color: 'bg-amber-500', status: 'Completed', date: 'Feb 21, 2026' },
  { name: 'Transport Report', icon: Bus, color: 'bg-blue-500', status: 'Completed', date: 'Feb 20, 2026' },
  { name: 'Health Summary', icon: Heart, color: 'bg-red-500', status: 'Completed', date: 'Feb 19, 2026' },
  { name: 'Staff Directory', icon: Users, color: 'bg-slate-500', status: 'Completed', date: 'Feb 18, 2026' },
  { name: 'Event Calendar', icon: Calendar, color: 'bg-purple-500', status: 'Completed', date: 'Feb 17, 2026' },
  { name: 'Homework Completion', icon: FileCheck, color: 'bg-orange-500', status: 'Completed', date: 'Feb 16, 2026' },
  { name: 'Leave Requests', icon: CalendarCheck, color: 'bg-teal-500', status: 'Completed', date: 'Feb 15, 2026' },
  { name: 'Subject Analysis', icon: BookOpenCheck, color: 'bg-cyan-500', status: 'Completed', date: 'Feb 14, 2026' },
  { name: 'Timetable Summary', icon: Clock, color: 'bg-slate-500', status: 'Completed', date: 'Feb 13, 2026' },
];

const academicData: AcademicClassRow[] = [
  { className: 'Class 10 - Section A', teacher: 'John Doe', initials: 'JD', avatarColor: 'bg-purple-500', students: 42, avgScore: 88.5, passRate: 96 },
  { className: 'Class 10 - Section B', teacher: 'Alice Smith', initials: 'AS', avatarColor: 'bg-blue-500', students: 38, avgScore: 76.2, passRate: 85 },
  { className: 'Class 9 - Section A', teacher: 'Robert Johnson', initials: 'RJ', avatarColor: 'bg-emerald-500', students: 45, avgScore: 82.1, passRate: 92 },
  { className: 'Class 9 - Section B', teacher: 'Emily White', initials: 'EW', avatarColor: 'bg-orange-500', students: 40, avgScore: 65.4, passRate: 72 },
  { className: 'Class 8 - Section A', teacher: 'Michael King', initials: 'MK', avatarColor: 'bg-red-500', students: 35, avgScore: 91.0, passRate: 100 },
];

const attendanceData: AttendanceClassRow[] = [
  { className: 'Class 10 - Section A', totalStudents: 42, presentDays: '22/24', absentRate: 4.2, present: 92, absent: 8 },
  { className: 'Class 10 - Section B', totalStudents: 38, presentDays: '19/24', absentRate: 12.5, present: 79, absent: 21 },
  { className: 'Class 9 - Section A', totalStudents: 45, presentDays: '23/24', absentRate: 2.1, present: 96, absent: 4 },
  { className: 'Class 9 - Section B', totalStudents: 40, presentDays: '18/24', absentRate: 18.5, present: 75, absent: 25 },
  { className: 'Class 8 - Section A', totalStudents: 35, presentDays: '21/24', absentRate: 8.3, present: 88, absent: 12 },
];

const financialData: FinancialClassRow[] = [
  { className: 'Class 10 - Section A', totalInvoiced: 12500, collected: 11200, outstanding: 1300, collectionRate: 89 },
  { className: 'Class 10 - Section B', totalInvoiced: 10800, collected: 6400, outstanding: 4400, collectionRate: 59 },
  { className: 'Class 9 - Section A', totalInvoiced: 11000, collected: 10800, outstanding: 200, collectionRate: 98 },
  { className: 'Class 9 - Section B', totalInvoiced: 9500, collected: 7200, outstanding: 2300, collectionRate: 76 },
  { className: 'Class 8 - Section A', totalInvoiced: 9480, collected: 9680, outstanding: -200, collectionRate: 100 },
];

// ─── Helper Functions ───────────────────────────────────────────────────────────

function getPassRateColor(rate: number): string {
  if (rate >= 85) return 'text-emerald-600';
  if (rate >= 70) return 'text-orange-500';
  return 'text-red-500';
}

function getPerformanceBarColor(rate: number): string {
  if (rate >= 85) return 'bg-emerald-500';
  if (rate >= 70) return 'bg-orange-400';
  return 'bg-red-500';
}

function getAttendanceStatus(absentRate: number): { label: string; bg: string; text: string } {
  if (absentRate < 5) return { label: 'Excellent', bg: 'bg-emerald-50', text: 'text-emerald-700' };
  if (absentRate <= 15) return { label: 'Average', bg: 'bg-amber-50', text: 'text-amber-700' };
  return { label: 'Poor', bg: 'bg-red-50', text: 'text-red-700' };
}

function getCollectionBarColor(rate: number): string {
  if (rate >= 80) return 'bg-emerald-500';
  if (rate >= 50) return 'bg-orange-400';
  return 'bg-red-500';
}

function formatCurrency(value: number): string {
  if (value < 0) return `-$${Math.abs(value).toLocaleString()}`;
  return `$${value.toLocaleString()}`;
}

// ─── Category Card Config ───────────────────────────────────────────────────────

const categoryCards: {
  key: CategoryKey;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  iconBg: string;
  iconText: string;
  linkColor: string;
  decorativeBg: string;
}[] = [
  {
    key: 'academic',
    title: 'Academic Reports',
    subtitle: 'Class performance, grades & exam results',
    icon: BookOpen,
    iconBg: 'bg-purple-100',
    iconText: 'text-purple-600',
    linkColor: 'text-purple-600',
    decorativeBg: 'text-purple-100',
  },
  {
    key: 'attendance',
    title: 'Attendance Reports',
    subtitle: 'Daily attendance, leaves & absence trends',
    icon: ClipboardCheck,
    iconBg: 'bg-emerald-100',
    iconText: 'text-emerald-600',
    linkColor: 'text-emerald-600',
    decorativeBg: 'text-emerald-100',
  },
  {
    key: 'financial',
    title: 'Financial Reports',
    subtitle: 'Fee collection, dues & expense tracking',
    icon: TrendingUp,
    iconBg: 'bg-orange-100',
    iconText: 'text-orange-600',
    linkColor: 'text-orange-600',
    decorativeBg: 'text-orange-100',
  },
];

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const { showToast } = useToast();
  const [activeCategory, setActiveCategory] = useState<CategoryKey | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');
  const [detailModal, setDetailModal] = useState<{ open: boolean; title: string; rows: { label: string; value: string }[] }>({ open: false, title: '', rows: [] });
  const [classFilter, setClassFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('feb-2026');

  const classFilterOptions = [
    { value: 'all', label: 'All Classes' },
    { value: 'class-10', label: 'Class 10' },
    { value: 'class-9', label: 'Class 9' },
    { value: 'class-8', label: 'Class 8' },
  ];
  const monthFilterOptions = [
    { value: 'feb-2026', label: 'February 2026' },
    { value: 'jan-2026', label: 'January 2026' },
    { value: 'dec-2025', label: 'December 2025' },
  ];

  const handleExport = () => {
    showToast('success', 'Report exported successfully! Check your downloads folder.');
  };


  const handleAcademicDetail = (row: typeof academicData[0]) => {
    setDetailModal({
      open: true,
      title: `${row.className} — Academic Details`,
      rows: [
        { label: 'Class', value: row.className },
        { label: 'Teacher In-Charge', value: row.teacher },
        { label: 'Total Students', value: String(row.students) },
        { label: 'Average Score', value: `${row.avgScore}%` },
        { label: 'Pass Rate', value: `${row.passRate}%` },
        { label: 'Highest Score', value: '98%' },
        { label: 'Lowest Score', value: '42%' },
        { label: 'Tests Conducted', value: '6' },
      ],
    });
  };

  const handleAttendanceDetail = (row: typeof attendanceData[0]) => {
    const status = row.absentRate < 5 ? 'Excellent' : row.absentRate <= 15 ? 'Average' : 'Poor';
    setDetailModal({
      open: true,
      title: `${row.className} — Attendance Log`,
      rows: [
        { label: 'Class', value: row.className },
        { label: 'Total Students', value: String(row.totalStudents) },
        { label: 'Present Days (Avg)', value: row.presentDays },
        { label: 'Absent Rate', value: `${row.absentRate}%` },
        { label: 'Status', value: status },
        { label: 'Most Absent Day', value: 'Monday' },
        { label: 'Best Attendance Day', value: 'Wednesday' },
        { label: 'Period', value: 'February 2026' },
      ],
    });
  };

  const handleFinancialDetail = (row: typeof financialData[0]) => {
    setDetailModal({
      open: true,
      title: `${row.className} — Invoice List`,
      rows: [
        { label: 'Class', value: row.className },
        { label: 'Total Invoiced', value: `$${row.totalInvoiced.toLocaleString()}` },
        { label: 'Collected', value: `$${row.collected.toLocaleString()}` },
        { label: 'Outstanding', value: `$${row.outstanding.toLocaleString()}` },
        { label: 'Collection Rate', value: `${row.collectionRate}%` },
        { label: 'Invoices Sent', value: '42' },
        { label: 'Payments Received', value: '38' },
        { label: 'Overdue Invoices', value: '4' },
      ],
    });
  };

  const handleDownload = (name: string) => {
    showToast('success', `Downloading ${name}...`);
  };

  const handleView = (name: string) => {
    setDetailModal({
      open: true,
      title: name,
      rows: [
        { label: 'Report Name', value: name },
        { label: 'Status', value: 'Completed' },
        { label: 'Generated', value: new Date().toLocaleDateString() },
        { label: 'Records', value: String(Math.floor(Math.random() * 500 + 100)) },
        { label: 'Format', value: 'PDF / CSV' },
        { label: 'Size', value: `${(Math.random() * 2 + 0.5).toFixed(1)} MB` },
      ],
    });
  };

  // ─── Render Category Cards ──────────────────────────────────────────────────

  const renderCategoryCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {categoryCards.map((card) => {
        const Icon = card.icon;
        const isSelected = activeCategory === card.key;
        return (
          <button
            key={card.key}
            onClick={() => setActiveCategory(isSelected ? null : card.key)}
            className={`relative overflow-hidden bg-white rounded-xl p-5 text-left transition-all duration-200 hover:shadow-md ${
              isSelected
                ? 'border-2 border-[#824ef2] shadow-sm'
                : 'border border-slate-200 hover:border-slate-300'
            }`}
          >
            {/* Small colored icon */}
            <div className={`inline-flex p-2.5 rounded-xl ${card.iconBg} mb-3`}>
              <Icon className={`w-5 h-5 ${card.iconText}`} />
            </div>

            <h3 className="text-base font-bold text-slate-900">{card.title}</h3>
            <p className="text-sm text-slate-500 mt-1 mb-4">{card.subtitle}</p>

            <span className={`inline-flex items-center gap-1 text-sm font-medium ${card.linkColor}`}>
              View Report
              <ArrowRight className="w-4 h-4" />
            </span>
          </button>
        );
      })}
    </div>
  );

  // ─── Render Overview (no category selected) ─────────────────────────────────

  const renderOverview = () => (
    <>
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SchoolStatCard
          icon={<FileText className="w-5 h-5" />}
          color="purple"
          label="Total Reports"
          value={12}
        />
        <SchoolStatCard
          icon={<Calendar className="w-5 h-5" />}
          color="blue"
          label="Generated Today"
          value={3}
        />
        <SchoolStatCard
          icon={<Download className="w-5 h-5" />}
          color="green"
          label="Downloads"
          value={48}
        />
        <SchoolStatCard
          icon={<TrendingUp className="w-5 h-5" />}
          color="amber"
          label="Trending"
          value={5}
        />
      </div>

      {/* Period Filter */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-slate-600 mr-2">Filter by period:</span>
          {['This Month', 'Last 3 Months', 'This Year'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                selectedPeriod === period
                  ? 'bg-[#824ef2] text-white'
                  : 'border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 hover:text-slate-900'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-slate-900">Report</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-900">Status</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-900">Generated</th>
                <th className="px-6 py-4 text-right font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {overviewReports.map((report) => {
                const IconComp = report.icon;
                return (
                  <tr
                    key={report.name}
                    className="group hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${report.color} flex items-center justify-center flex-shrink-0`}>
                          <IconComp className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-slate-900 font-medium">{report.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <SchoolStatusBadge value={report.status} />
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {report.date}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => handleView(report.name)}
                          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                          title="View Report"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownload(report.name)}
                          className="p-2 rounded-lg hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 transition-colors"
                          title="Download Report"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  // ─── Render Academic Detail ─────────────────────────────────────────────────

  const renderAcademicDetail = () => (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-900">Academic Performance</h2>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
              Class-wise
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <CustomSelect value={classFilter} onChange={setClassFilter} options={classFilterOptions} size="sm" />
            <CustomSelect value={monthFilter} onChange={setMonthFilter} options={monthFilterOptions} size="sm" />
            <button className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors">
              <Calendar className="w-4 h-4" />
            </button>
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg. GPA</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-900">3.42</span>
            <span className="inline-flex items-center text-xs font-medium text-emerald-600">
              <ArrowUpRight className="w-3 h-3" />
              2.1%
            </span>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pass Rate</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-900">94.5%</span>
            <span className="inline-flex items-center text-xs font-medium text-emerald-600">
              <ArrowUpRight className="w-3 h-3" />
              0.5%
            </span>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Top Class</p>
          <div className="mt-1">
            <span className="text-2xl font-bold text-slate-900">10-A</span>
            <p className="text-xs text-slate-400 mt-0.5">Science</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tests Conducted</p>
          <div className="mt-1">
            <span className="text-2xl font-bold text-slate-900">24</span>
            <p className="text-xs text-slate-400 mt-0.5">This month</p>
          </div>
        </div>
      </div>

      {/* Academic Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-slate-900">Class Name</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-900">Teacher In-Charge</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-900">Students</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-900">Avg. Score</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-900">Pass Rate</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-900">Performance</th>
                <th className="px-6 py-4 text-right font-semibold text-slate-900">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {academicData.map((row) => (
                <tr key={row.className} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-900">{row.className}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full ${row.avatarColor} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-xs font-bold text-white">{row.initials}</span>
                      </div>
                      <span className="text-slate-700">{row.teacher}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-700">{row.students}</td>
                  <td className="px-6 py-4 text-slate-700">{row.avgScore}%</td>
                  <td className="px-6 py-4">
                    <span className={`font-semibold ${getPassRateColor(row.passRate)}`}>
                      {row.passRate}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${getPerformanceBarColor(row.passRate)}`}
                          style={{ width: `${row.passRate}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500">{row.passRate}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleAcademicDetail(row)}
                      className="text-sm font-medium text-[#824ef2] hover:text-[#6b3fd4] transition-colors"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ─── Render Attendance Detail ───────────────────────────────────────────────

  const renderAttendanceDetail = () => {
    const chartHeight = 200;
    const chartWidth = 500;
    const barWidth = 50;
    const gap = 50;
    const startX = 60;
    const maxValue = 100;
    const classes = ['Class 10-A', 'Class 10-B', 'Class 9-A', 'Class 9-B', 'Class 8-A'];

    return (
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-slate-900">Class Attendance</h2>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                Daily Log
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <CustomSelect value={classFilter} onChange={setClassFilter} options={classFilterOptions} size="sm" />
              <CustomSelect value={monthFilter} onChange={setMonthFilter} options={monthFilterOptions} size="sm" />
              <button
                onClick={handleExport}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-slate-900">Class Name</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-900">Total Students</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-900">Present Days (Avg)</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-900">Absent Rate</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-900">Status</th>
                  <th className="px-6 py-4 text-right font-semibold text-slate-900">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendanceData.map((row) => {
                  const status = getAttendanceStatus(row.absentRate);
                  return (
                    <tr key={row.className} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-medium text-slate-900">{row.className}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-700">{row.totalStudents}</td>
                      <td className="px-6 py-4 text-slate-700">{row.presentDays}</td>
                      <td className="px-6 py-4">
                        <span className={`font-semibold ${row.absentRate < 5 ? 'text-emerald-600' : row.absentRate <= 15 ? 'text-orange-500' : 'text-red-500'}`}>
                          {row.absentRate}%
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleAttendanceDetail(row)}
                          className="text-sm font-medium text-[#824ef2] hover:text-[#6b3fd4] transition-colors"
                        >
                          View Log
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // ─── Render Financial Detail ────────────────────────────────────────────────

  const renderFinancialDetail = () => {
    const totalCollected = financialData.reduce((sum, r) => sum + r.collected, 0);
    const totalOutstanding = financialData.reduce((sum, r) => sum + Math.max(r.outstanding, 0), 0);
    const totalDue = totalCollected + totalOutstanding;

    return (
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-slate-900">Financial Overview</h2>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                Collections
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <CustomSelect value={classFilter} onChange={setClassFilter} options={classFilterOptions} size="sm" />
              <CustomSelect value={monthFilter} onChange={setMonthFilter} options={monthFilterOptions} size="sm" />
              <button
                onClick={handleExport}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Financial Summary Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Collected</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
              <span className="text-2xl font-bold text-slate-900">{formatCurrency(totalCollected)}</span>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0" />
              <span className="text-2xl font-bold text-slate-900">{formatCurrency(totalOutstanding)}</span>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Due</p>
            <div className="mt-1">
              <span className="text-2xl font-bold text-slate-900">{formatCurrency(totalDue)}</span>
            </div>
          </div>
        </div>

        {/* Financial Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-slate-900">Class Name</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-900">Total Invoiced</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-900">Collected</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-900">Outstanding</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-900">Collection Rate</th>
                  <th className="px-6 py-4 text-right font-semibold text-slate-900">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {financialData.map((row) => (
                  <tr key={row.className} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-900">{row.className}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{formatCurrency(row.totalInvoiced)}</td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-emerald-600">{formatCurrency(row.collected)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${row.outstanding > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                        {formatCurrency(row.outstanding)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${getCollectionBarColor(row.collectionRate)}`}
                            style={{ width: `${Math.min(row.collectionRate, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500">{row.collectionRate}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleFinancialDetail(row)}
                        className="text-sm font-medium text-[#824ef2] hover:text-[#6b3fd4] transition-colors"
                      >
                        Invoice List
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // ─── Render Detail Content Based on Active Category ─────────────────────────

  const renderDetailContent = () => {
    switch (activeCategory) {
      case 'academic':
        return renderAcademicDetail();
      case 'attendance':
        return renderAttendanceDetail();
      case 'financial':
        return renderFinancialDetail();
      default:
        return null;
    }
  };

  // ─── Main Render ────────────────────────────────────────────────────────────

  return (
    <section className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-end">
        {activeCategory && (
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors"
          >
            <Download className="w-4 h-4" />
            Export All Reports
          </button>
        )}
      </div>

      {/* Category Cards — always visible */}
      {renderCategoryCards()}

      {/* Conditional Content */}
      {activeCategory === null ? renderOverview() : renderDetailContent()}

      {/* Detail Modal */}
      <FormModal
        open={detailModal.open}
        onClose={() => setDetailModal({ open: false, title: '', rows: [] })}
        title={detailModal.title}
        size="md"
        footer={
          <>
            <button
              onClick={() => setDetailModal({ open: false, title: '', rows: [] })}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                showToast('success', `Downloading ${detailModal.title}...`);
                setDetailModal({ open: false, title: '', rows: [] });
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors"
            >
              <Download className="w-4 h-4" />
              Export as PDF
            </button>
          </>
        }
      >
        <div className="space-y-1">
          {detailModal.rows.map((row, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
              <span className="text-sm text-slate-500">{row.label}</span>
              <span className="text-sm font-medium text-slate-900">{row.value}</span>
            </div>
          ))}
        </div>
      </FormModal>
    </section>
  );
}
