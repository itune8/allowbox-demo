'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ProtectedRoute } from '../../../components/protected-route';
import { useAuth } from '../../../contexts/auth-context';
import { Button } from '@repo/ui/button';
import { ROLES } from '@repo/config';
import {
  getCurrentSchoolId,
  getEntities,
  setAttendance,
  setHomework,
  subscribe as storeSubscribe,
  Homework as HomeworkType,
  ClassItem,
  TimetableEntry,
} from '../../../lib/data-store';

type Section = 'dashboard' | 'timetable' | 'attendance' | 'homework' | 'reports';
const sidebarItems: { key: Section; label: string; icon: React.ReactNode }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 13h8V3H3z"/><path d="M13 21h8V3h-8z"/><path d="M3 21h8v-6H3z"/></svg>) },
  { key: 'timetable', label: 'Timetable', icon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>) },
  { key: 'attendance', label: 'Attendance', icon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 6L9 17l-5-5"/></svg>) },
  { key: 'homework', label: 'Homework', icon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 19.5A2.5 2.5 0 006.5 22H20"/><path d="M20 6V22"/><path d="M4 12V4a2 2 0 012-2h11l3 3v7"/></svg>) },
  { key: 'reports', label: 'Reports', icon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 3v18h18"/><path d="M7 13h3v5H7zM12 8h3v10h-3zM17 11h3v7h-3z"/></svg>) },
];

export default function TeacherDashboardPage() {
  const { user, logout } = useAuth();
  const profileRef = useRef<HTMLDivElement | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [active, setActive] = useState<Section>('dashboard');
  const schoolId = useMemo(() => getCurrentSchoolId(), []);
  const [entities, setEntities] = useState(() => getEntities(schoolId));
  const [today, setToday] = useState(() => new Date().toISOString().slice(0, 10));
  // Determine classes assigned to this teacher
  const teacherEmail = user?.email || '';
  const assignedClassIds = useMemo(() => (entities.teacherAssignments?.[teacherEmail] || []), [entities.teacherAssignments, teacherEmail]);
  const classesForTeacher = useMemo(() => {
    const all = entities.classes || [];
    if (!assignedClassIds || assignedClassIds.length === 0) return all;
    return all.filter((c) => assignedClassIds.includes(c.id));
  }, [entities.classes, assignedClassIds]);

  const [selectedClass, setSelectedClass] = useState(() => classesForTeacher[0]?.id || '');
  const isTeacher = (user?.roles || []).includes(ROLES.TEACHER);

  // Removed storeSubscribe - data will be fetched from real API instead
  // useEffect(() => {
  //   const unsub = storeSubscribe(() => {
  //     setEntities(getEntities(schoolId));
  //   });
  //   return unsub;
  // }, [schoolId]);

  // profile menu outside click
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!profileRef.current) return;
      if (!profileRef.current.contains(e.target as Node)) setShowProfileMenu(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  // ensure selected class is always valid when classes update
  useEffect(() => {
    // keep selectedClass within the allowed classes for this teacher
    if (!selectedClass) {
      const first = classesForTeacher[0]?.id || '';
      if (first) setSelectedClass(first);
    } else if (!classesForTeacher.some((c) => c.id === selectedClass)) {
      const first = classesForTeacher[0]?.id || '';
      setSelectedClass(first);
    }
  }, [classesForTeacher, selectedClass]);

  const scheduleToday = useMemo(() => {
    const day = new Date(today).toLocaleDateString(undefined, { weekday: 'long' });
    const map = entities.timetable[selectedClass] || [];
    return map.filter((t) => t.day === day);
  }, [entities, selectedClass, today]);

  const studentsInSelectedClass = useMemo(() => entities.students.filter((s) => s.className === (entities.classes.find((c) => c.id === selectedClass)?.name || '')), [entities, selectedClass]);
  // const attendanceForDay = entities.attendance[today]?.[selectedClass] || {};


  return (
    <ProtectedRoute>
  <div className="relative min-h-screen bg-gray-50 dark:bg-gray-950 flex transition-opacity duration-300 ease-in-out">
        {/* Layered background glows */}
        <div className="pointer-events-none absolute -top-24 -left-1/6 w-[1200px] h-[600px] bg-gradient-radial from-indigo-500/20 via-indigo-500/10 to-transparent blur-3xl opacity-60 animate-gradientMove" />
        <div className="pointer-events-none absolute top-1/3 -right-1/6 w-[1000px] h-[500px] bg-gradient-radial from-purple-500/20 via-purple-500/10 to-transparent blur-3xl opacity-60 animate-gradientFlow" />
        {/* Sidebar */}
  <aside className="w-64 bg-white/95 dark:bg-gray-900/80 backdrop-blur border-r dark:border-gray-800 hidden md:flex md:flex-col sticky top-0 h-screen shadow-[0_8px_30px_rgba(0,0,0,0.04)] animate-slide-in-left">
          <div className="h-16 flex items-center px-6 border-b">
            <span className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>
              Teacher Portal
            </span>
          </div>
          <nav className="flex-1 py-4 overflow-auto">
            {sidebarItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setActive(item.key)}
                className={`group w-full text-left px-6 py-3 rounded-r-xl border-l-4 transition-all ease-in-out duration-300 transform flex items-center gap-3 ${
                  active === item.key
                    ? 'bg-indigo-50/60 dark:bg-gray-800/70 text-indigo-700 dark:text-indigo-300 font-medium border-indigo-500'
                    : 'text-gray-700 dark:text-gray-300 border-transparent hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-500 hover:text-white hover:pl-7 hover:-translate-y-0.5'
                }`}
              >
                <span className="text-gray-500 dark:text-gray-400 group-hover:text-white dark:group-hover:text-white">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="p-4 border-t">
            <Button variant="outline" size="sm" onClick={logout} className="w-full">
              Logout
            </Button>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          <header className="bg-white/90 dark:bg-gray-900 backdrop-blur shadow-sm sticky top-0 z-10 border-b border-gray-100 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Teacher Dashboard</h1>
              <div className="relative flex items-center gap-2" ref={profileRef}>
                {/* Theme toggle */}
                <button
                  className="text-xs px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ease-smooth"
                  title="Toggle dark mode"
                  onClick={() => {
                    if (typeof document !== 'undefined') {
                      const isDark = document.documentElement.classList.toggle('dark');
                      try { localStorage.setItem('theme', isDark ? 'dark' : 'light'); } catch { /* no-op */ }
                    }
                  }}
                >
                  🌙
                </button>
                <button className="flex items-center gap-2 rounded-full hover:bg-indigo-50 dark:hover:bg-gray-800 transition-colors ease-smooth px-2 py-1" onClick={() => setShowProfileMenu((s) => !s)}>
                  <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-200 font-semibold">{user?.firstName?.[0] ?? 'T'}</div>
                  <span className="text-sm text-gray-900 dark:text-gray-100 hidden sm:block">{user?.firstName} {user?.lastName}</span>
                </button>
                {showProfileMenu && (
                  <div className="absolute right-0 top-12 w-40 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg shadow-md animate-slide-in-bottom">
                    <button className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm text-gray-900 dark:text-gray-100">View Profile</button>
                    <button className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm text-gray-900 dark:text-gray-100">Settings</button>
                    <div className="h-px bg-gray-100 dark:bg-gray-800" />
                    <button className="w-full text-left px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm text-red-600 dark:text-red-400" onClick={logout}>Logout</button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {!isTeacher ? (
            <div className="p-6">
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-4">You do not have permission to view this page.</div>
            </div>
          ) : (
            <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
            {/* Dashboard */}
            {active === 'dashboard' && (
              <section className="animate-slide-in-top">
                {/* Metric cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                  <MetricCard icon="users" title="My Students" value={studentsInSelectedClass.length} color="indigo" />
                  <MetricCard icon="book" title="Classes Today" value={scheduleToday.length} color="purple" />
                  <MetricCard icon="clipboard" title="Pending Homework" value={(entities.homework[selectedClass] || []).length} color="blue" />
                </div>

                {/* Quick actions */}
                <div className="flex gap-3 mt-5 flex-wrap">
                  <button className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-all duration-200 shadow-sm active:scale-95 inline-flex items-center gap-2" onClick={() => setActive('homework')}>
                    <span>＋</span> Add Homework
                  </button>
                  <button className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-all duration-200 shadow-sm active:scale-95 inline-flex items-center gap-2" onClick={() => setActive('attendance')}>
                    <span>✓</span> Mark Attendance
                  </button>
                  <button className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-all duration-200 shadow-sm active:scale-95 inline-flex items-center gap-2" onClick={() => setActive('timetable')}>
                    <span>📅</span> View Timetable
                  </button>
                </div>

                {/* Today's Schedule timeline and activity feed */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                  <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-5 animate-fade-in">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Today&apos;s Schedule</h3>
                      <select className="border border-gray-300 bg-white text-gray-900 rounded-md px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                        {classesForTeacher.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                      </select>
                    </div>
                    {scheduleToday.length === 0 ? (
                      <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl py-10 text-gray-500 text-sm flex flex-col items-center justify-center animate-fade-in">
                        <div className="text-3xl mb-2">📭</div>
                        No sessions today
                      </div>
                    ) : (
                      <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800 animate-fade-in">
                        {scheduleToday.map((t) => (
                          <div key={t.id} className="flex items-center justify-between py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-indigo-500" />
                              <div>
                                <div className="font-medium text-gray-900 dark:text-gray-100">{t.subject}</div>
                                <div className="text-xs text-gray-500">{t.start} - {t.end}</div>
                              </div>
                            </div>
                            <Button size="sm" onClick={() => setActive('attendance')}>Take Attendance</Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 space-y-3 animate-fade-in">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h3>
                    <ActivityLog />
                  </div>
                </div>
              </section>
            )}

            {/* Timetable */}
            {active === 'timetable' && (
              <TimetableSection entities={entities} selectedClass={selectedClass} classesForTeacher={classesForTeacher} />
            )}

            {/* Attendance */}
            {active === 'attendance' && (
              <AttendanceSection
                today={today}
                setToday={setToday}
                entities={entities}
                selectedClass={selectedClass}
                setSelectedClass={setSelectedClass}
                schoolId={schoolId}
                classesForTeacher={classesForTeacher}
              />
            )}

            {/* Homework */}
            {active === 'homework' && (
              <HomeworkPage schoolId={schoolId} entities={entities} allowedClasses={classesForTeacher} onEntitiesChange={() => setEntities(getEntities(schoolId))} />
            )}

            {active === 'reports' && (
              <ReportsSection entities={entities} allowedClasses={classesForTeacher} />
            )}

            </main>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

// === Helpers and new sections ===

function CountingNumber({ value, duration = 800 }: { value: number | string; duration?: number }) {
  const [display, setDisplay] = useState<string>(typeof value === 'number' ? '0' : String(value));
  useEffect(() => {
    const endStr = String(value);
    const numeric = Number(String(value).replace(/[^0-9.]/g, ''));
    if (!Number.isFinite(numeric)) { setDisplay(endStr); return; }
    const start = 0; const startTime = performance.now(); let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      const val = Math.round(start + (numeric - start) * eased);
      setDisplay(val.toLocaleString());
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <span>{display}</span>;
}

function MetricCard({ icon, title, value, color }: { icon: 'users' | 'book' | 'clipboard'; title: string; value: number; color: 'indigo' | 'purple' | 'blue' }) {
  const colorMap: Record<'indigo' | 'purple' | 'blue', string> = {
    indigo: 'border-indigo-500',
    purple: 'border-purple-500',
    blue: 'border-blue-500',
  };
  const topBorder = `border-t-4 ${colorMap[color]}`;
  const iconEl = icon === 'users'
    ? (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>)
    : icon === 'book'
    ? (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 19.5A2.5 2.5 0 016.5 22H20"/><path d="M20 6V22"/><path d="M4 12V4a2 2 0 012-2h11l3 3v7"/></svg>)
    : (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M7 8h10M7 12h10M7 16h10"/></svg>);
  return (
    <div className={`bg-white/70 dark:bg-gray-900/60 backdrop-blur border border-white/40 dark:border-gray-800 rounded-2xl shadow p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ease-in-out ${topBorder}`}>
      <div className="flex items-center gap-3">
        <div className="bg-indigo-50/90 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-200 p-2 rounded-lg">
          {iconEl}
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-xl font-semibold text-gray-900 dark:text-gray-100"><CountingNumber value={value} /></p>
        </div>
      </div>
    </div>
  );
}

function ActivityLog() {
  const items = [
    { id: 1, icon: '✓', text: 'Attendance marked for Grade 6', time: '2h ago' },
    { id: 2, icon: '✎', text: 'Homework created: Algebra Worksheet', time: '5h ago' },
    { id: 3, icon: '📅', text: 'Timetable synced for the week', time: '1d ago' },
  ];
  return (
    <div className="space-y-3">
      {items.map((i) => (
        <div key={i.id} className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-md bg-gray-100 dark:bg-gray-800 grid place-items-center text-gray-600">{i.icon}</div>
          <div>
            <div className="text-sm text-gray-800 dark:text-gray-200">{i.text}</div>
            <div className="text-xs text-gray-400">{i.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TimetableSection({ entities, selectedClass }: { entities: ReturnType<typeof getEntities>; selectedClass: string; classesForTeacher: ClassItem[] }) {
  const [week, setWeek] = useState('This Week');
  const [refreshing, setRefreshing] = useState(false);
  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
  const clsName = entities.classes.find((c) => c.id === selectedClass)?.name || '';

  const allEntries = (entities.timetable[selectedClass] || []) as TimetableEntry[];
  const dataByDay: Record<string, TimetableEntry[]> = days.reduce((acc, d) => {
    acc[d] = allEntries.filter((x) => x.day === d);
    return acc;
  }, {} as Record<string, TimetableEntry[]>);
  const todayName = new Date().toLocaleDateString(undefined, { weekday: 'long' });

  function downloadCSV() {
    const rows: string[] = [];
    rows.push(['Day','Subject','Start','End','Class'].join(','));
    for (const d of days) {
      const list = dataByDay[d] || [];
      for (const s of list) {
        rows.push([d, s.subject, s.start, s.end, clsName].map((v) => `"${String(v).replace(/"/g,'""')}"`).join(','));
      }
    }
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timetable-${clsName || 'class'}-${week.replace(/\s+/g,'-').toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function printPDF() {
    const w = window.open('', '_blank');
    if (!w) return;
    const style = `
      <style>
        body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; padding: 16px; color: #111827; }
        h1 { font-size: 18px; margin: 0 0 8px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #e5e7eb; padding: 8px; font-size: 12px; text-align: left; }
        th { background: #f3f4f6; }
      </style>`;
    const rows: string[] = [];
    for (const d of days) {
      const entries = dataByDay[d] || [];
      if (entries.length === 0) continue;
      rows.push(`<tr><td>${d}</td><td>${entries.map(e=>`${e.subject} (${e.start}-${e.end})`).join('<br/>')}</td></tr>`);
    }
    const html = `
      <html><head>${style}</head><body>
        <h1>Timetable - ${clsName} - ${week}</h1>
        <table>
          <thead><tr><th>Day</th><th>Sessions</th></tr></thead>
          <tbody>${rows.join('')}</tbody>
        </table>
      </body></html>
    `;
    w.document.write(html);
    w.document.close();
    w.focus();
    // Give the window a moment to render, then print
    setTimeout(() => { w.print(); w.close(); }, 300);
  }

  return (
    <section className="animate-slide-in-right">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Timetable</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <select className="border border-gray-300 bg-white text-gray-900 rounded-md px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100" value={week} onChange={(e)=>setWeek(e.target.value)}>
            {['This Week','Next Week','Last Week'].map(w => <option key={w} value={w}>{w}</option>)}
          </select>
          <Button size="sm" variant="outline" onClick={()=>{ setRefreshing(true); setTimeout(()=>setRefreshing(false), 600); }}>Refresh {refreshing ? '…' : ''}</Button>
          <Button size="sm" variant="outline" onClick={printPDF}>Download PDF</Button>
          <Button size="sm" variant="outline" onClick={downloadCSV}>Download CSV</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {days.map((d) => (
          <div key={d} className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm ${d===todayName? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950/30' : ''}`}>
            <div className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{d}</div>
            {(dataByDay[d] || []).length === 0 ? (
              <div className="text-sm text-gray-500 dark:text-gray-400">No sessions</div>
            ) : (
              <div className="space-y-2">
                {(dataByDay[d] || []).map((s) => (
                  <div key={s.id} className="p-2 rounded-md border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all ease-in-out">
                    <div className="text-sm text-gray-800 dark:text-gray-200 font-medium">{s.subject}</div>
                    <div className="text-xs text-gray-500">{clsName} • {s.start} – {s.end}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      {(days.every((d)=>(dataByDay[d] || []).length===0)) && (
        <div className="flex flex-col items-center justify-center py-12 space-y-3 text-gray-500">
          <div className="text-4xl">📆</div>
          <div>No timetable found for this week.</div>
          <Button onClick={()=>alert('Request sent')}>Request Update</Button>
        </div>
      )}
    </section>
  );
}

function AttendanceSection({ today, setToday, entities, selectedClass, setSelectedClass, schoolId, classesForTeacher }:
  { today: string; setToday: (v: string)=>void; entities: ReturnType<typeof getEntities>; selectedClass: string; setSelectedClass: (v: string)=>void; schoolId: string; classesForTeacher: ClassItem[] }) {
  const students = entities.students.filter((s) => s.className === (entities.classes.find((c) => c.id === selectedClass)?.name || ''));
  const attendanceForDay = entities.attendance[today]?.[selectedClass] || {};
  const [local, setLocal] = useState<Record<string, boolean>>(() => ({ ...attendanceForDay }));
  useEffect(() => { setLocal({ ...(entities.attendance[today]?.[selectedClass] || {}) }); }, [entities.attendance, today, selectedClass]);

  const presentCount = Object.values(local).filter(Boolean).length;
  const total = students.length;
  const percent = total ? Math.round((presentCount / total) * 100) : 0;
  const [confirm, setConfirm] = useState(false);

  return (
    <section className="animate-slide-in-left">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Attendance</h2>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 dark:text-gray-300" htmlFor="att-date">Date</label>
            <input id="att-date" type="date" className="border border-gray-300 bg-white text-gray-900 rounded-md px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100" value={today} onChange={(e) => setToday(e.target.value)} />
            <label className="text-sm text-gray-700 dark:text-gray-300" htmlFor="att-class">Class</label>
            <select id="att-class" className="border border-gray-300 bg-white text-gray-900 rounded-md px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
              {classesForTeacher.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
          </div>
        </div>

        {/* Analytics summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="rounded-lg bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-800 p-4 text-sm text-gray-600 dark:text-gray-300">
            <div className="font-medium text-gray-800 dark:text-gray-100">Present: {presentCount}/{total}</div>
            <div className="mt-2 h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div className="h-full bg-green-500" style={{ width: `${percent}%` }} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3 text-sm">
          <div />
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={total === 0} onClick={() => {
              const map = Object.fromEntries(students.map((s) => [s.id, true] as const));
              setLocal(map);
            }}>Mark All Present</Button>
            <Button size="sm" variant="outline" disabled={total === 0} onClick={() => {
              const map = Object.fromEntries(students.map((s) => [s.id, false] as const));
              setLocal(map);
            }}>Clear</Button>
            <Button size="sm" onClick={() => setConfirm(true)}>Save Changes</Button>
          </div>
        </div>

        {students.length === 0 ? (
          <div className="text-sm text-gray-600 dark:text-gray-300">No students found for this class. Add students in the School Admin portal; they’ll show up here automatically.</div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {students.map((s) => {
              const present = Boolean(local[s.id]);
              return (
                <li key={s.id} className={`flex items-center justify-between py-2 transition-colors ${present ? 'bg-green-50/50 dark:bg-green-900/10' : ''}`}>
                  <span className="text-sm text-gray-900 dark:text-gray-100">{s.name}</span>
                  <label className="inline-flex items-center cursor-pointer select-none">
                    <input type="checkbox" className="sr-only" checked={present} onChange={() => setLocal((m) => ({ ...m, [s.id]: !present }))} />
                    <span className={`w-10 h-5 flex items-center bg-gray-200 dark:bg-gray-700 rounded-full p-1 duration-200 ease-in-out ${present ? '!bg-green-500' : ''}`}>
                      <span className={`bg-white w-4 h-4 rounded-full shadow transform duration-200 ease-in-out ${present ? 'translate-x-5' : ''}`} />
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Confirm modal */}
      {confirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-96 shadow-lg animate-zoom-in">
            <div className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Confirm Attendance Submission?</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">This will save attendance for the selected class and date.</div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <Button variant="outline" onClick={()=>setConfirm(false)}>Cancel</Button>
              <Button onClick={()=>{ setAttendance(schoolId, today, selectedClass, local); setConfirm(false); }}>Confirm</Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function HomeworkPage({ schoolId, entities, allowedClasses, onEntitiesChange }: { schoolId: string; entities: ReturnType<typeof getEntities>; allowedClasses: ClassItem[]; onEntitiesChange: () => void }) {
  const [classId, setClassId] = useState(() => allowedClasses[0]?.id || '');
  const [title, setTitle] = useState('');
  const [due, setDue] = useState(() => new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [description, setDescription] = useState('');
  const [view, setView] = useState<HomeworkType | null>(null);

  useEffect(() => { if (!classId && allowedClasses[0]) setClassId(allowedClasses[0].id); }, [allowedClasses, classId]);

  if (allowedClasses.length === 0) {
    return (
      <section className="animate-slide-in-bottom">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-300">No classes found. Classes are managed by the School Admin.</p>
        </div>
      </section>
    );
  }

  const list: HomeworkType[] = entities.homework[classId] || [];
  const total = list.length; const completed = list.filter((h)=>h.status==='Completed').length; const pending = total - completed;

  function addHomework() {
    const trimmed = title.trim();
    if (!trimmed) return;
    const item: HomeworkType = { id: `hw-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, title: trimmed, due, description: description.trim() || undefined, status: 'Pending' };
    setHomework(schoolId, classId, [item, ...list]);
    onEntitiesChange();
    setTitle(''); setDescription('');
  }
  function removeHomework(id: string) {
    const next = list.filter((h) => h.id !== id);
    setHomework(schoolId, classId, next);
    onEntitiesChange();
  }
  function toggleComplete(id: string) {
    const next: HomeworkType[] = list.map((h) => h.id === id ? { ...h, status: (h.status === 'Completed' ? 'Pending' : 'Completed') as 'Pending' | 'Completed' } : h);
    setHomework(schoolId, classId, next);
    onEntitiesChange();
  }

  return (
    <section className="animate-slide-in-bottom">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Homework</h2>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        {/* Form with floating labels */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Class</label>
            <select className="border border-gray-300 bg-white text-gray-900 dark:border-gray-700 rounded-lg px-3 py-2 text-sm w-full dark:bg-gray-900 dark:text-gray-100" value={classId} onChange={(e) => setClassId(e.target.value)}>
              {allowedClasses.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
          </div>
          <div className="relative">
            <input className="peer border border-gray-300 bg-white text-gray-900 dark:border-gray-700 rounded-lg px-3 pt-5 pb-2 text-sm w-full dark:bg-gray-900 dark:text-gray-100 placeholder-transparent focus:ring-2 focus:ring-indigo-400 focus:outline-none" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
            <label className="absolute left-3 top-2 text-xs text-gray-400 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-2.5 peer-focus:top-2 peer-focus:text-xs">Title</label>
          </div>
          <div className="relative">
            <input type="date" className="peer border border-gray-300 bg-white text-gray-900 dark:border-gray-700 rounded-lg px-3 pt-5 pb-2 text-sm w-full dark:bg-gray-900 dark:text-gray-100 placeholder-transparent focus:ring-2 focus:ring-indigo-400 focus:outline-none" value={due} onChange={(e) => setDue(e.target.value)} placeholder="Due" />
            <label className="absolute left-3 top-2 text-xs text-gray-400">Due</label>
          </div>
          <div className="sm:col-span-3">
            <textarea className="border border-gray-300 bg-white text-gray-900 dark:border-gray-700 rounded-lg px-3 py-2 text-sm w-full dark:bg-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 focus:outline-none" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Instructions or links…" />
          </div>
        </div>
        <div className="flex justify-end items-center">
          <button className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-all shadow-sm active:scale-95" onClick={addHomework}>Add</button>
        </div>

        {/* Stats bar */}
        <div className="mt-6 flex items-center justify-between bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-3 text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-gray-400"/> Total: {total}</div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500"/> Pending: {pending}</div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"/> Completed: {completed}</div>
        </div>

        {/* List */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((h) => (
            <div key={h.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-4 hover:shadow-md transition-all cursor-pointer" onClick={()=>setView(h)}>
              <div className="flex items-center justify-between mb-1">
                <div className="font-medium text-gray-900 dark:text-gray-100">{h.title}</div>
                <span className={`text-xs px-2 py-0.5 rounded ${h.status==='Completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'}`}>{h.status || 'Pending'}</span>
              </div>
              <div className="text-xs text-gray-500">Due: {h.due}</div>
              {h.description && <div className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">{h.description}</div>}
              <div className="mt-3 flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={(e)=>{e.stopPropagation(); toggleComplete(h.id);}}>{h.status==='Completed' ? 'Mark Pending' : 'Mark Complete'}</Button>
                <Button size="sm" variant="outline" onClick={(e)=>{e.stopPropagation(); removeHomework(h.id);}}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
        {list.length===0 && (
          <div className="py-8 text-center text-gray-500 dark:text-gray-400">No homework yet for this class.</div>
        )}
      </div>

      {/* Quick view modal */}
      {view && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={()=>setView(null)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg w-full max-w-md p-6 animate-zoom-in">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">{view.title}</h3>
            <div className="text-sm text-gray-600 dark:text-gray-300">Due: {view.due}</div>
            {view.description && <div className="mt-3 text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{view.description}</div>}
            <div className="mt-4 text-right">
              <Button variant="outline" onClick={()=>setView(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function ReportsSection({ entities, allowedClasses }: { entities: ReturnType<typeof getEntities>; allowedClasses: ClassItem[] }) {
  // Build last 5 weeks buckets ending this week (Mon-Sun)
  const labels: string[] = useMemo(() => {
    const now = new Date();
    const day = (now.getDay() + 6) % 7; // Mon=0
    const monday = new Date(now);
    monday.setDate(now.getDate() - day);
    const out: string[] = [];
    for (let i = 4; i >= 0; i--) {
      const d = new Date(monday);
      d.setDate(monday.getDate() - i * 7);
      out.push(i === 0 ? 'This Week' : `W-${i}`);
    }
    return out;
  }, []);

  const weekRanges = useMemo(() => {
    const now = new Date();
    const day = (now.getDay() + 6) % 7; // Mon=0
    const monday = new Date(now);
    monday.setHours(0,0,0,0);
    monday.setDate(now.getDate() - day);
    const ranges: { start: Date; end: Date }[] = [];
    for (let i = 4; i >= 0; i--) {
      const start = new Date(monday);
      start.setDate(monday.getDate() - i * 7);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23,59,59,999);
      ranges.push({ start, end });
    }
    return ranges;
  }, []);

  const allowedClassIds = useMemo(() => new Set(allowedClasses.map(c => c.id)), [allowedClasses]);

  // Homework completion per week: completed / total for items due within week
  const homeworkRate = useMemo(() => {
    const byClass = entities.homework || {};
    const totals = Array(5).fill(0);
    const completed = Array(5).fill(0);
    for (const [classId, list] of Object.entries(byClass)) {
      if (!allowedClassIds.has(classId)) continue;
      for (const hw of list || []) {
        const due = new Date(hw.due);
        for (let i = 0; i < weekRanges.length; i++) {
          const { start, end } = weekRanges[i]!;
          if (due >= start && due <= end) {
            totals[i]++;
            if ((hw.status || 'Pending') === 'Completed') completed[i]++;
            break;
          }
        }
      }
    }
    return totals.map((t, i) => (t > 0 ? Math.round((completed[i]! / t) * 100) : 0));
  }, [entities.homework, allowedClassIds, weekRanges]);

  // Attendance percentage per week: average of daily present% across allowed classes and days
  const attendancePct = useMemo(() => {
    const att = entities.attendance || {};
    const studentsByClassName = new Map<string, number>();
    for (const c of entities.classes) studentsByClassName.set(c.name, c.strength || 0);
    // Reverse map classId -> className and strength
    const classIdToStrength = new Map<string, number>();
    for (const c of entities.classes) classIdToStrength.set(c.id, c.strength || 0);

    const sums = Array(5).fill(0);
    const counts = Array(5).fill(0);
    for (const [dateStr, byClass] of Object.entries(att)) {
      const d = new Date(dateStr);
      // find week index
      let weekIdx = -1;
      for (let i = 0; i < weekRanges.length; i++) {
        const { start, end } = weekRanges[i]!;
        if (d >= start && d <= end) { weekIdx = i; break; }
      }
      if (weekIdx < 0) continue;
      for (const [classId, records] of Object.entries(byClass || {})) {
        if (!allowedClassIds.has(classId)) continue;
        const present = Object.values(records || {}).filter(Boolean).length;
        const total = classIdToStrength.get(classId) || Object.keys(records || {}).length || 0;
        if (total <= 0) continue;
        const pct = (present / total) * 100;
        sums[weekIdx] += pct;
        counts[weekIdx] += 1;
      }
    }
    return sums.map((s, i) => (counts[i]! > 0 ? Math.round(s / counts[i]!) : 0));
  }, [entities.attendance, entities.classes, allowedClassIds, weekRanges]);

  // Simple composite trend as proxy for performance: average of homework rate and attendance
  const perfTrend = useMemo(() => homeworkRate.map((v, i) => Math.round((v + (attendancePct[i] || 0)) / 2)), [homeworkRate, attendancePct]);
  const SectionCard = ({ title, data }: { title: string; data: number[] }) => {
    const max = Math.max(1, ...data);
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="font-medium mb-3 text-gray-900 dark:text-gray-100">{title}</div>
        <div className="h-32 flex items-end gap-2">
          {data.map((v, i) => (
            <div key={i} className="flex-1">
              <div className="w-full bg-indigo-500/90 rounded-t" style={{ height: `${Math.round((v / max) * 100)}%` }} title={`${labels[i]}: ${v}%`} />
            </div>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-5 text-[10px] text-gray-400">
          {labels.map((l, i) => (<div key={i} className="text-center">{l}</div>))}
        </div>
      </div>
    );
  };
  function downloadCSV() {
    const rows: string[] = [];
    rows.push(['Metric','Week','Value'].join(','));
    labels.forEach((w, i) => {
      rows.push(['Attendance %', w, attendancePct[i] ?? ''].join(','));
      rows.push(['Homework Rate %', w, homeworkRate[i] ?? ''].join(','));
      rows.push(['Performance %', w, perfTrend[i] ?? ''].join(','));
    });
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'teacher-reports.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
  function printPDF() {
    const w = window.open('', '_blank');
    if (!w) return;
    const style = `
      <style>
        body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; padding: 16px; color: #111827; }
        h1 { font-size: 18px; margin: 0 0 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th, td { border: 1px solid #e5e7eb; padding: 8px; font-size: 12px; text-align: left; }
        th { background: #f3f4f6; }
      </style>`;
    const buildRows = (name: string, arr: number[]) => labels.map((w, i) => `<tr><td>${name}</td><td>${w}</td><td>${arr[i] ?? ''}</td></tr>`).join('');
    const html = `
      <html><head>${style}</head><body>
        <h1>Teacher Reports Summary</h1>
        <table>
          <thead><tr><th>Metric</th><th>Week</th><th>Value</th></tr></thead>
          <tbody>
            ${buildRows('Attendance %', attendancePct)}
            ${buildRows('Homework Rate %', homeworkRate)}
            ${buildRows('Performance %', perfTrend)}
          </tbody>
        </table>
      </body></html>
    `;
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); w.close(); }, 300);
  }
  const hasData = true;
  return (
    <section className="animate-fade-in">
      <div className="flex justify-end gap-3 mb-4">
        <button className="bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/30 px-3 py-2 rounded-md text-sm" onClick={printPDF}>Export PDF</button>
        <button className="bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30 px-3 py-2 rounded-md text-sm" onClick={downloadCSV}>Download CSV</button>
        <button className="bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 px-3 py-2 rounded-md text-sm">View Detailed Report</button>
      </div>
      {hasData ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SectionCard title="Attendance % by Class" data={attendancePct} />
          <SectionCard title="Homework Completion Rate" data={homeworkRate} />
          <SectionCard title="Student Performance Trend" data={perfTrend} />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500 space-y-3">
          <div className="text-4xl">📈</div>
          <div>No reports available yet.</div>
          <Button>Generate Reports</Button>
        </div>
      )}
    </section>
  );
}
