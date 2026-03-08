'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../contexts/auth-context';
import { useRouter } from 'next/navigation';
import { tenantService, type TenantData } from '../../../lib/services/tenant.service';
import { userService, type User } from '../../../lib/services/user.service';
import { classService, type Class } from '../../../lib/services/class.service';
import { SchoolStatCard, CustomSelect } from '../../../components/school';
import {
  Users,
  UserPlus,
  FileText,
  DollarSign,
  ChevronRight,
  Megaphone,
  BarChart3,
  ClipboardList,
  BookOpen,
  Clock,
  Loader2,
  TrendingUp,
  CalendarDays,
  ChevronDown,
} from 'lucide-react';

export default function SchoolDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tenantData, setTenantData] = useState<TenantData | null>(null);
  const [loadingTenant, setLoadingTenant] = useState(true);
  const [students, setStudents] = useState<User[]>([]);
  const [staff, setStaff] = useState<User[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedYear, setSelectedYear] = useState('2024');
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  useEffect(() => {
    const fetchTenantData = async () => {
      try {
        const data = await tenantService.getCurrentTenant();
        setTenantData(data);
      } catch (error) {
        console.error('Failed to fetch tenant data:', error);
      } finally {
        setLoadingTenant(false);
      }
    };

    if (user?.tenantId) {
      fetchTenantData();
    } else {
      setLoadingTenant(false);
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const [studentsData, staffData, classesData] = await Promise.all([
          userService.getUsers().then(users => users.filter(u => u.role === 'student')),
          userService.getUsers().then(users => users.filter(u => ['teacher', 'tenant_admin', 'accountant'].includes(u.role))),
          classService.getClasses(),
        ]);
        setStudents(studentsData);
        setStaff(staffData);
        setClasses(classesData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const stats = useMemo(() => {
    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.isActive).length;
    const totalStaff = staff.length;
    const teachers = staff.filter(s => s.role === 'teacher').length;
    const activeTeachers = staff.filter(s => s.role === 'teacher' && s.isActive).length;
    const studentAttendanceRate = totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0;
    const teacherAttendanceRate = teachers > 0 ? Math.round((activeTeachers / teachers) * 100) : 0;

    return {
      students: { total: totalStudents, active: activeStudents, rate: studentAttendanceRate },
      staff: { total: totalStaff, teachers, activeTeachers, rate: teacherAttendanceRate },
      classes: { total: classes.length },
    };
  }, [students, staff, classes]);

  const feeData = useMemo(() => {
    const collected = 272000;
    const total = 400000;
    const rate = Math.round((collected / total) * 100);
    return { collected, total, rate };
  }, []);

  const homeworkData = useMemo(() => {
    const submitted = 304;
    const total = 400;
    const rate = Math.round((submitted / total) * 100);
    return { submitted, total, rate };
  }, []);

  // Fee chart data points (collected only, matching reference)
  const chartData = [
    { month: 'Jan', value: 300000 },
    { month: 'Feb', value: 320000 },
    { month: 'Mar', value: 295000 },
    { month: 'Apr', value: 310000 },
    { month: 'May', value: 340000 },
    { month: 'Jun', value: 290000 },
    { month: 'Jul', value: 305000 },
    { month: 'Aug', value: 315000 },
    { month: 'Sep', value: 310000 },
    { month: 'Oct', value: 325000 },
    { month: 'Nov', value: 320000 },
    { month: 'Dec', value: 280000 },
  ];

  const events = [
    { day: '15', month: 'DEC', title: 'Annual Sports Day', time: '9:00 AM - 4:00 PM' },
    { day: '18', month: 'JAN', title: 'Parent-Teacher Meeting', time: '10:00 AM - 2:00 PM' },
    { day: '22', month: 'JAN', title: 'Science Exhibition', time: '11:00 AM - 4:00 PM' },
  ];

  const quickReports = [
    { label: 'Attendance Report', icon: <BarChart3 className="w-5 h-5" />, color: 'bg-emerald-100 text-emerald-600' },
    { label: 'Performance Report', icon: <ClipboardList className="w-5 h-5" />, color: 'bg-blue-100 text-blue-600' },
    { label: 'Fee Report', icon: <DollarSign className="w-5 h-5" />, color: 'bg-orange-100 text-orange-600' },
    { label: 'Homework Report', icon: <BookOpen className="w-5 h-5" />, color: 'bg-red-100 text-red-600' },
  ];


  const quickInsightsTables = [
    {
      title: 'Attendance Report',
      data: [
        { name: 'Class 10-A', value: 96 },
        { name: 'Class 9-B', value: 94 },
        { name: 'Class 8-A', value: 91 },
        { name: 'Class 7-C', value: 88 },
        { name: 'Class 6-B', value: 68 },
      ],
    },
    {
      title: 'Fee Report',
      data: [
        { name: 'Class 10-A', value: 95 },
        { name: 'Class 9-B', value: 88 },
        { name: 'Class 8-A', value: 72 },
        { name: 'Class 7-C', value: 58 },
        { name: 'Class 6-B', value: 79 },
      ],
    },
    {
      title: 'Academic Performance',
      data: [
        { name: 'Class 10-A', value: 87 },
        { name: 'Class 9-B', value: 84 },
        { name: 'Class 8-A', value: 82 },
        { name: 'Class 7-C', value: 78 },
        { name: 'Class 6-B', value: 76 },
      ],
    },
  ];

  const getInsightValueColor = (val: number) => {
    if (val >= 90) return 'text-emerald-600';
    if (val >= 80) return 'text-blue-600';
    if (val >= 70) return 'text-amber-600';
    return 'text-red-600';
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#824ef2] animate-spin" />
      </div>
    );
  }

  // ---- Chart calculations ----
  // Y-axis range: 280k to 340k (matching reference)
  const yMin = 280000;
  const yMax = 340000;
  const yRange = yMax - yMin;
  const yTicks = [280000, 300000, 320000, 340000];

  // Percentage-based points for responsive chart (0-100 range)
  const pctPoints = chartData.map((d, i) => ({
    xPct: (i / (chartData.length - 1)) * 100,
    yPct: ((yMax - d.value) / yRange) * 100,
  }));

  // Build smooth line path using percentage coordinates in 0-100 viewBox
  const buildPctPath = (pts: typeof pctPoints) => {
    if (pts.length < 2) return '';
    let path = `M${pts[0]!.xPct.toFixed(2)},${pts[0]!.yPct.toFixed(2)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const curr = pts[i]!;
      const next = pts[i + 1]!;
      const tension = 0.3;
      const dx = next.xPct - curr.xPct;
      const cp1x = curr.xPct + dx * tension;
      const cp2x = next.xPct - dx * tension;
      path += ` C${cp1x.toFixed(2)},${curr.yPct.toFixed(2)} ${cp2x.toFixed(2)},${next.yPct.toFixed(2)} ${next.xPct.toFixed(2)},${next.yPct.toFixed(2)}`;
    }
    return path;
  };
  const feeLinePath = buildPctPath(pctPoints);
  const feeLastPt = pctPoints[pctPoints.length - 1] ?? { xPct: 100, yPct: 100 };
  const feeFirstPt = pctPoints[0] ?? { xPct: 0, yPct: 100 };
  const feeAreaPath = `${feeLinePath} L${feeLastPt.xPct},100 L${feeFirstPt.xPct},100 Z`;
  const gridTicks = yTicks.map(val => ((yMax - val) / yRange) * 100);

  return (
    <div className="space-y-6">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SchoolStatCard
          icon={<Users className="w-5 h-5" />}
          color="green"
          label="Student Attendance"
          value={stats.students.active}
          total={stats.students.total}
          percentage={stats.students.rate}
          subtitle="Present today"
        />
        <SchoolStatCard
          icon={<UserPlus className="w-5 h-5" />}
          color="blue"
          label="Teacher Attendance"
          value={stats.staff.activeTeachers}
          total={stats.staff.teachers}
          percentage={stats.staff.rate}
          subtitle="Present today"
        />
        <SchoolStatCard
          icon={<FileText className="w-5 h-5" />}
          color="orange"
          label="Homework Completion"
          value={homeworkData.submitted}
          total={homeworkData.total}
          percentage={homeworkData.rate}
          subtitle="Completed this week"
        />
        <SchoolStatCard
          icon={<DollarSign className="w-5 h-5" />}
          color="purple"
          label="Fee Collection"
          value={`$${Math.round(feeData.collected / 1000)}K`}
          total={`$${Math.round(feeData.total / 1000)}K`}
          percentage={feeData.rate}
          subtitle="Collected this month"
        />
      </div>

      {/* Quick Actions (left) + Fee Collection Overview (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Quick Actions - Left Panel */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200">
            <div className="px-5 pt-5 pb-2">
              <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
            </div>
            <div className="p-5 space-y-4">
              {[
                { label: 'Add New Student', icon: <UserPlus className="w-4 h-4" />, href: '/school/students', iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
                { label: 'Generate Invoice', icon: <FileText className="w-4 h-4" />, href: '/school/fees', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
                { label: 'Schedule Event', icon: <CalendarDays className="w-4 h-4" />, href: '/school/events', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
                { label: 'Send Announcement', icon: <Megaphone className="w-4 h-4" />, href: '/school/messages', iconBg: 'bg-orange-100', iconColor: 'text-orange-600' },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => router.push(action.href)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <span className={`flex items-center justify-center w-8 h-8 rounded-lg ${action.iconBg}`}>
                    <span className={action.iconColor}>{action.icon}</span>
                  </span>
                  <span className="font-medium">{action.label}</span>
                </button>
              ))}
            </div>
        </div>

        {/* Fee Collection Chart - Right Panel */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200">
            <div className="flex items-center justify-between px-5 pt-5 pb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#824ef2]" />
                <h2 className="text-lg font-semibold text-slate-900">Fee Collection Overview</h2>
              </div>
              <CustomSelect
                value={selectedYear}
                onChange={setSelectedYear}
                options={[{ value: '2024', label: '2024' }, { value: '2023', label: '2023' }]}
                size="sm"
              />
            </div>
            <div className="px-5 pb-5 pt-2">
              <div className="flex" style={{ height: '220px' }}>
                {/* Y-axis labels */}
                <div className="flex flex-col justify-between pr-2 py-0" style={{ width: '40px' }}>
                  {yTicks.slice().reverse().map((val) => (
                    <span key={val} className="text-[11px] text-slate-400 text-right leading-none">
                      {`${val / 1000}k`}
                    </span>
                  ))}
                </div>
                {/* Chart area */}
                <div className="flex-1 relative" onMouseLeave={() => setHoveredPoint(null)}>
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                    {/* Grid lines */}
                    {gridTicks.map((yPct, i) => (
                      <line key={i} x1="0" y1={yPct} x2="100" y2={yPct} stroke="#f1f5f9" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
                    ))}
                    {/* Area fill */}
                    <path d={feeAreaPath} fill="url(#feeChartGrad)" />
                    <defs>
                      <linearGradient id="feeChartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#824ef2" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#824ef2" stopOpacity="0.01" />
                      </linearGradient>
                    </defs>
                    {/* Line */}
                    <path d={feeLinePath} fill="none" stroke="#824ef2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                  </svg>
                  {/* Dots as HTML */}
                  {pctPoints.map((p, i) => (
                    <div
                      key={i}
                      className="absolute cursor-pointer"
                      style={{
                        left: `${p.xPct}%`,
                        top: `${p.yPct}%`,
                        transform: 'translate(-50%, -50%)',
                        width: '24px',
                        height: '24px',
                      }}
                      onMouseEnter={() => setHoveredPoint(i)}
                    >
                      <div
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#824ef2] border-2 border-white transition-all duration-150"
                        style={{
                          width: hoveredPoint === i ? '10px' : '7px',
                          height: hoveredPoint === i ? '10px' : '7px',
                          boxShadow: hoveredPoint === i ? '0 0 6px rgba(130,78,242,0.4)' : 'none',
                        }}
                      />
                    </div>
                  ))}
                  {/* Tooltip */}
                  {hoveredPoint !== null && (() => {
                    const d = chartData[hoveredPoint];
                    if (!d) return null;
                    const p = pctPoints[hoveredPoint]!;
                    return (
                      <div
                        className="absolute z-10 pointer-events-none"
                        style={{
                          left: `${p.xPct}%`,
                          top: `${p.yPct}%`,
                          transform: 'translate(-50%, -120%)',
                        }}
                      >
                        <div className="bg-slate-800/95 text-white rounded-lg px-3 py-2 text-center shadow-lg">
                          <div className="text-[10px] text-slate-400">{d.month} {selectedYear}</div>
                          <div className="text-sm font-semibold">${(d.value / 1000).toFixed(0)}K</div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
              {/* X-axis labels */}
              <div className="flex justify-between mt-2" style={{ marginLeft: '40px' }}>
                {chartData.map((d) => (
                  <span key={d.month} className="text-[11px] text-slate-400 text-center">
                    {d.month}
                  </span>
                ))}
              </div>
            </div>
        </div>
      </div>

      {/* Upcoming Events + Quick Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-[#824ef2]" />
              <h2 className="text-base font-semibold text-slate-900">Upcoming Events</h2>
            </div>
            <button onClick={() => router.push('/school/events')} className="text-sm text-[#824ef2] hover:underline font-medium">View Calendar</button>
          </div>
          <div className="space-y-3">
            {events.map((event, idx) => (
              <div key={idx} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex-shrink-0 w-12 h-14 rounded-xl bg-[#824ef2]/10 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold text-[#824ef2] leading-tight">{event.day}</span>
                  <span className="text-[10px] font-semibold uppercase text-[#824ef2]/70 leading-none">{event.month}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">{event.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {event.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Reports */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="w-5 h-5 text-[#824ef2]" />
            <h2 className="text-base font-semibold text-slate-900">Quick Reports</h2>
          </div>
          <div className="space-y-3">
            {quickReports.map((report) => (
              <button
                key={report.label}
                onClick={() => router.push('/school/reports')}
                className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-[#824ef2]/30 hover:shadow-sm transition-all group"
              >
                <div className={`p-2.5 rounded-xl ${report.color}`}>
                  {report.icon}
                </div>
                <span className="text-sm font-medium text-slate-700 flex-1 text-left">{report.label}</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#824ef2] transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Insights */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Quick Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickInsightsTables.map((section) => (
            <div key={section.title} className="border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-900">{section.title}</h3>
                <button onClick={() => router.push('/school/reports')} className="text-xs text-[#824ef2] hover:underline font-medium">View All</button>
              </div>
              <div className="space-y-3.5">
                {section.data.map((cls) => (
                  <div key={cls.name} className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">{cls.name}</span>
                    <span className={`text-sm font-bold ${getInsightValueColor(cls.value)}`}>{cls.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
