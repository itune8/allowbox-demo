'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../contexts/auth-context';
import { useRouter } from 'next/navigation';
import { tenantService, type TenantData } from '../../../lib/services/tenant.service';
import { userService, type User } from '../../../lib/services/user.service';
import { classService, type Class } from '../../../lib/services/class.service';
import { SchoolStatCard } from '../../../components/school';
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
  AlertTriangle,
  Clock,
  Info,
  Loader2,
  TrendingUp,
  Zap,
  Bell,
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

  const alerts = [
    { type: 'red' as const, title: 'Low Attendance Alert', message: 'Grade 10-B has 65% attendance today', time: '2 hours ago' },
    { type: 'amber' as const, title: 'Fee Payment Reminder', message: '45 students have pending fee payments', time: '5 hours ago' },
    { type: 'blue' as const, title: 'System Update', message: 'New features added to parent portal', time: '1 day ago' },
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

  const classInsights = [
    { name: 'Grade 10-A Attendance', percentage: 92, rating: 'Excellent', color: 'bg-emerald-500', ratingColor: 'text-emerald-600' },
    { name: 'Grade 9-B Performance', percentage: 88, rating: 'Good', color: 'bg-blue-500', ratingColor: 'text-blue-600' },
    { name: 'Grade 8-A Fee Collection', percentage: 85, rating: 'Good', color: 'bg-emerald-500', ratingColor: 'text-emerald-600' },
    { name: 'Grade 7-C Attendance', percentage: 78, rating: 'Average', color: 'bg-amber-400', ratingColor: 'text-amber-600' },
    { name: 'Grade 6-B Performance', percentage: 72, rating: 'Average', color: 'bg-blue-500', ratingColor: 'text-blue-600' },
    { name: 'Grade 5-A Fee Collection', percentage: 68, rating: 'Needs Attention', color: 'bg-red-500', ratingColor: 'text-red-600' },
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

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#824ef2] animate-spin" />
      </div>
    );
  }

  // ---- Chart calculations ----
  const chartW = 560;
  const chartH = 220;
  const padL = 50;
  const padR = 30;
  const padT = 20;
  const padB = 35;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;

  // Y-axis range: 280k to 340k (matching reference)
  const yMin = 280000;
  const yMax = 340000;
  const yRange = yMax - yMin;
  const yTicks = [280000, 300000, 320000, 340000];

  const toX = (i: number) => padL + (i / (chartData.length - 1)) * innerW;
  const toY = (v: number) => padT + innerH - ((v - yMin) / yRange) * innerH;

  // Build smooth line path
  const linePath = chartData.map((d, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(d.value).toFixed(1)}`).join(' ');

  // Gradient area path (fill under the line)
  const areaPath = `${linePath} L${toX(chartData.length - 1).toFixed(1)},${(padT + innerH).toFixed(1)} L${padL},${(padT + innerH).toFixed(1)} Z`;

  const getInsightValueColor = (val: number) => {
    if (val >= 90) return 'text-emerald-600';
    if (val >= 80) return 'text-blue-600';
    if (val >= 70) return 'text-amber-600';
    return 'text-red-600';
  };

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
          progressBar
        />
        <SchoolStatCard
          icon={<UserPlus className="w-5 h-5" />}
          color="blue"
          label="Teacher Attendance"
          value={stats.staff.activeTeachers}
          total={stats.staff.teachers}
          percentage={stats.staff.rate}
          subtitle="Present today"
          progressBar
        />
        <SchoolStatCard
          icon={<FileText className="w-5 h-5" />}
          color="orange"
          label="Homework Completion"
          value={homeworkData.submitted}
          total={homeworkData.total}
          percentage={homeworkData.rate}
          subtitle="Completed this week"
          progressBar
        />
        <SchoolStatCard
          icon={<DollarSign className="w-5 h-5" />}
          color="purple"
          label="Fee Collection"
          value={`$${Math.round(feeData.collected / 1000)}K`}
          total={`$${Math.round(feeData.total / 1000)}K`}
          percentage={feeData.rate}
          subtitle="Collected this month"
          progressBar
        />
      </div>

      {/* Quick Actions - White bordered cards with centered icons */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Zap className="w-5 h-5 text-amber-500" />
          <h2 className="text-base font-semibold text-slate-900">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Add New Student', icon: <UserPlus className="w-6 h-6" />, href: '/school/students' },
            { label: 'Generate Invoice', icon: <FileText className="w-6 h-6" />, href: '/school/fees' },
            { label: 'Schedule Event', icon: <CalendarDays className="w-6 h-6" />, href: '/school/events' },
            { label: 'Send Announcement', icon: <Megaphone className="w-6 h-6" />, href: '/school/messages' },
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => router.push(action.href)}
              className="flex flex-col items-center gap-3 px-4 py-5 rounded-xl border border-[#824ef2]/20 bg-[#824ef2]/[0.02] hover:bg-[#824ef2]/[0.06] hover:border-[#824ef2]/40 hover:shadow-sm transition-all group"
            >
              <div className="p-3 rounded-xl bg-[#824ef2]/[0.07]">
                <span className="text-[#824ef2]">{action.icon}</span>
              </div>
              <span className="text-sm font-medium text-slate-800">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Fee Collection Overview + Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Fee Collection Chart */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#824ef2]" />
              <h2 className="text-base font-semibold text-slate-900">Fee Collection Overview</h2>
            </div>
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="appearance-none bg-white border border-slate-200 rounded-lg px-3 py-1.5 pr-8 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] cursor-pointer"
              >
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <svg
            viewBox={`0 0 ${chartW} ${chartH}`}
            className="w-full"
            style={{ height: '280px' }}
            onMouseLeave={() => setHoveredPoint(null)}
          >
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#824ef2" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#824ef2" stopOpacity="0.01" />
              </linearGradient>
            </defs>

            {/* Horizontal grid lines + Y-axis labels */}
            {yTicks.map(val => (
              <g key={val}>
                <text x={padL - 8} y={toY(val) + 4} textAnchor="end" className="text-[11px] fill-slate-400" style={{ fontFamily: 'system-ui' }}>
                  {`${val / 1000}k`}
                </text>
                <line x1={padL} y1={toY(val)} x2={chartW - padR} y2={toY(val)} stroke="#f1f5f9" strokeWidth="1" />
              </g>
            ))}

            {/* X-axis labels */}
            {chartData.map((d, i) => (
              <text key={d.month} x={toX(i)} y={chartH - 8} textAnchor="middle" className="text-[11px] fill-slate-400" style={{ fontFamily: 'system-ui' }}>
                {d.month}
              </text>
            ))}

            {/* Gradient fill under line */}
            <path d={areaPath} fill="url(#chartGradient)" />

            {/* Main purple line */}
            <path d={linePath} fill="none" stroke="#824ef2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

            {/* Data point dots */}
            {chartData.map((d, i) => (
              <g key={`point-${i}`}>
                {/* Invisible larger hover target */}
                <circle
                  cx={toX(i)}
                  cy={toY(d.value)}
                  r="12"
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPoint(i)}
                />
                {/* Visible dot */}
                <circle
                  cx={toX(i)}
                  cy={toY(d.value)}
                  r={hoveredPoint === i ? 5 : 3.5}
                  fill={hoveredPoint === i ? '#824ef2' : '#824ef2'}
                  stroke="white"
                  strokeWidth={hoveredPoint === i ? 3 : 2}
                  className="transition-all duration-150"
                  style={{ filter: hoveredPoint === i ? 'drop-shadow(0 0 4px rgba(130,78,242,0.4))' : 'none' }}
                />
              </g>
            ))}

            {/* Hover tooltip */}
            {hoveredPoint !== null && (() => {
              const d = chartData[hoveredPoint];
              if (!d) return null;
              const tx = toX(hoveredPoint);
              const ty = toY(d.value);
              const tooltipW = 100;
              const tooltipH = 42;
              // Keep tooltip within SVG bounds
              const tooltipX = Math.max(padL, Math.min(tx - tooltipW / 2, chartW - padR - tooltipW));
              const tooltipY = ty - tooltipH - 12;

              return (
                <g>
                  {/* Vertical guide line */}
                  <line
                    x1={tx}
                    y1={ty + 6}
                    x2={tx}
                    y2={padT + innerH}
                    stroke="#824ef2"
                    strokeWidth="1"
                    strokeDasharray="4,3"
                    opacity="0.3"
                  />
                  {/* Tooltip background */}
                  <rect
                    x={tooltipX}
                    y={tooltipY}
                    width={tooltipW}
                    height={tooltipH}
                    rx="8"
                    fill="#1e293b"
                    opacity="0.95"
                  />
                  {/* Tooltip arrow */}
                  <polygon
                    points={`${tx - 5},${tooltipY + tooltipH} ${tx + 5},${tooltipY + tooltipH} ${tx},${tooltipY + tooltipH + 6}`}
                    fill="#1e293b"
                    opacity="0.95"
                  />
                  {/* Tooltip month label */}
                  <text
                    x={tooltipX + tooltipW / 2}
                    y={tooltipY + 16}
                    textAnchor="middle"
                    fill="#94a3b8"
                    style={{ fontSize: '10px', fontFamily: 'system-ui' }}
                  >
                    {d.month} {selectedYear}
                  </text>
                  {/* Tooltip value */}
                  <text
                    x={tooltipX + tooltipW / 2}
                    y={tooltipY + 33}
                    textAnchor="middle"
                    fill="white"
                    style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'system-ui' }}
                  >
                    ${(d.value / 1000).toFixed(0)}K
                  </text>
                </g>
              );
            })()}
          </svg>
        </div>

        {/* Recent Alerts */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-semibold text-slate-900">Recent Alerts</h2>
            </div>
            <button className="text-sm text-[#824ef2] hover:underline font-medium">View All</button>
          </div>
          <div className="space-y-3">
            {alerts.map((alert, idx) => {
              const bgColor = alert.type === 'red' ? 'bg-red-50' : alert.type === 'amber' ? 'bg-amber-50' : 'bg-blue-50';
              const borderColor = alert.type === 'red' ? 'border-l-red-500' : alert.type === 'amber' ? 'border-l-amber-500' : 'border-l-blue-500';
              const iconBg = alert.type === 'red' ? 'bg-red-100' : alert.type === 'amber' ? 'bg-amber-100' : 'bg-blue-100';
              const iconColor = alert.type === 'red' ? 'text-red-500' : alert.type === 'amber' ? 'text-amber-500' : 'text-blue-500';
              const AlertIcon = alert.type === 'red' ? AlertTriangle : alert.type === 'amber' ? Clock : Info;
              return (
                <div key={idx} className={`p-4 rounded-xl border-l-4 ${borderColor} ${bgColor}`}>
                  <div className="flex items-start gap-3">
                    <div className={`p-1.5 rounded-lg ${iconBg} flex-shrink-0`}>
                      <AlertIcon className={`w-4 h-4 ${iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{alert.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{alert.message}</p>
                      <p className="text-xs text-slate-400 mt-1">{alert.time}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Upcoming Events + Quick Insights (Class Performance bars) */}
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

        {/* Quick Insights - Class Performance Progress Bars */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="w-5 h-5 text-[#824ef2]" />
            <h2 className="text-base font-semibold text-slate-900">Quick Insights</h2>
          </div>
          <div className="space-y-4">
            {classInsights.map((item) => (
              <div key={item.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-slate-600">{item.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-700">{item.percentage}%</span>
                    <span className={`text-xs font-medium ${item.ratingColor}`}>{item.rating}</span>
                  </div>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-700`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Reports */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList className="w-5 h-5 text-[#824ef2]" />
          <h2 className="text-base font-semibold text-slate-900">Quick Reports</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickReports.map((report) => (
            <button
              key={report.label}
              onClick={() => router.push('/school/reports')}
              className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-[#824ef2]/30 hover:shadow-sm transition-all group"
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

      {/* Parent-Teacher Engagement */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Parent-Teacher Engagement</h2>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-slate-600">Active Communication</p>
          <p className="text-sm font-medium text-slate-700">687 / 920 Parents</p>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-1">
          <div className="h-full bg-[#824ef2] rounded-full" style={{ width: '75%' }}>
            <span className="text-[9px] text-white font-medium pl-2 leading-3">75%</span>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          {[
            { value: '342', label: 'Messages Sent' },
            { value: '156', label: 'Meetings Scheduled' },
            { value: '89', label: 'Feedback Received' },
            { value: '234', label: 'Active This Week' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Insights - 3 Column Tables */}
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
