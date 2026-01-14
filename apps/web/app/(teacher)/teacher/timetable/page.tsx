'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../../contexts/auth-context';
import { getCurrentSchoolId, getEntities, type TimetableEntry } from '../../../../lib/data-store';
import { Button } from '@repo/ui/button';
import { GlassCard, AnimatedStatCard, Icon3D } from '@/components/ui';
import { Calendar, Clock, Book, Download } from 'lucide-react';

export default function TimetablePage() {
  const { user } = useAuth();
  const schoolId = useMemo(() => getCurrentSchoolId(), []);
  const [entities] = useState(() => getEntities(schoolId));
  const [week, setWeek] = useState('This Week');
  const [refreshing, setRefreshing] = useState(false);

  const teacherEmail = user?.email || '';
  const assignedClassIds = useMemo(
    () => entities.teacherAssignments?.[teacherEmail] || [],
    [entities.teacherAssignments, teacherEmail]
  );

  const classesForTeacher = useMemo(() => {
    const all = entities.classes || [];
    if (!assignedClassIds || assignedClassIds.length === 0) return all;
    return all.filter((c) => assignedClassIds.includes(c.id));
  }, [entities.classes, assignedClassIds]);

  const [selectedClass, setSelectedClass] = useState(() => classesForTeacher[0]?.id || '');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const clsName = entities.classes.find((c) => c.id === selectedClass)?.name || '';

  const allEntries = (entities.timetable[selectedClass] || []) as TimetableEntry[];
  const dataByDay: Record<string, TimetableEntry[]> = days.reduce((acc, d) => {
    acc[d] = allEntries.filter((x) => x.day === d);
    return acc;
  }, {} as Record<string, TimetableEntry[]>);

  const todayName = new Date().toLocaleDateString(undefined, { weekday: 'long' });

  function downloadCSV() {
    const rows: string[] = [];
    rows.push(['Day', 'Subject', 'Start', 'End', 'Class'].join(','));
    for (const d of days) {
      const list = dataByDay[d] || [];
      for (const s of list) {
        rows.push(
          [d, s.subject, s.start, s.end, clsName]
            .map((v) => `"${String(v).replace(/"/g, '""')}"`)
            .join(',')
        );
      }
    }
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timetable-${clsName || 'class'}-${week.replace(/\s+/g, '-').toLowerCase()}.csv`;
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
      rows.push(
        `<tr><td>${d}</td><td>${entries.map((e) => `${e.subject} (${e.start}-${e.end})`).join('<br/>')}</td></tr>`
      );
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
    setTimeout(() => {
      w.print();
      w.close();
    }, 300);
  }

  const totalSessions = useMemo(
    () => Object.values(dataByDay).reduce((sum, arr) => sum + arr.length, 0),
    [dataByDay]
  );

  const sessionsByDay = useMemo(
    () => Object.entries(dataByDay).filter(([_, sessions]) => sessions.length > 0).length,
    [dataByDay]
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between gap-3 flex-wrap"
      >
        <div className="flex items-center gap-4">
          <Icon3D gradient="from-violet-500 to-purple-500" size="lg">
            <Calendar className="w-6 h-6" />
          </Icon3D>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Timetable</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">View your weekly class schedule</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <select
              className="border border-gray-300 bg-white text-gray-900 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
              value={week}
              onChange={(e) => setWeek(e.target.value)}
            >
              {['This Week', 'Next Week', 'Last Week'].map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <select
              className="border border-gray-300 bg-white text-gray-900 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm max-w-[100px] sm:max-w-none focus:outline-none focus:ring-2 focus:ring-violet-500/30"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              {classesForTeacher.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="sm"
              variant="outline"
              className="hidden sm:inline-flex"
              onClick={() => {
                setRefreshing(true);
                setTimeout(() => setRefreshing(false), 600);
              }}
            >
              Refresh {refreshing ? '…' : ''}
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button size="sm" variant="outline" onClick={printPDF} className="text-xs sm:text-sm">
              <Download className="w-3.5 h-3.5 mr-1" />
              <span className="hidden sm:inline">Download </span>PDF
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button size="sm" variant="outline" onClick={downloadCSV} className="text-xs sm:text-sm">
              <Download className="w-3.5 h-3.5 mr-1" />
              <span className="hidden sm:inline">Download </span>CSV
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 * 0.1 }}
        >
          <AnimatedStatCard
            title="Total Sessions"
            value={totalSessions}
            icon={<Clock className="w-5 h-5 text-white" />}
            gradient="from-violet-500 to-purple-500"
            delay={0}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 * 0.1 }}
        >
          <AnimatedStatCard
            title="Days Scheduled"
            value={sessionsByDay}
            icon={<Calendar className="w-5 h-5 text-white" />}
            gradient="from-cyan-500 to-blue-500"
            delay={1}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 * 0.1 }}
          className="col-span-2 sm:col-span-1"
        >
          <AnimatedStatCard
            title="Class"
            value={clsName || 'Select a class'}
            icon={<Book className="w-5 h-5 text-white" />}
            gradient="from-amber-500 to-orange-500"
            delay={2}
          />
        </motion.div>
      </div>

      {/* Timetable Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
        {days.map((d, dayIdx) => (
          <motion.div
            key={d}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: dayIdx * 0.05 }}
          >
            <GlassCard
              className={`p-3 sm:p-4 bg-white/90 h-full ${
                d === todayName ? 'ring-2 ring-violet-400' : ''
              }`}
            >
              <div className="font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center justify-between text-sm sm:text-base">
                <span className="truncate">{d.slice(0, 3)}<span className="hidden sm:inline">{d.slice(3)}</span></span>
                {d === todayName && (
                  <motion.span
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="text-xs bg-violet-100 text-violet-700 px-1.5 sm:px-2 py-0.5 rounded flex-shrink-0"
                  >
                    Today
                  </motion.span>
                )}
              </div>
              {(dataByDay[d] || []).length === 0 ? (
                <div className="text-xs sm:text-sm text-gray-500 italic text-center py-4">No sessions</div>
              ) : (
                <div className="space-y-1.5 sm:space-y-2">
                  {(dataByDay[d] || []).map((s, sessionIdx) => (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: dayIdx * 0.05 + sessionIdx * 0.05 }}
                      whileHover={{ y: -2 }}
                      className="p-2 sm:p-3 rounded-lg border border-violet-100 hover:shadow-md transition-all ease-in-out bg-gradient-to-br from-white via-violet-50/30 to-white"
                    >
                      <div className="text-xs sm:text-sm text-gray-800 font-medium truncate">{s.subject}</div>
                      <div className="text-xs text-gray-500 mt-0.5 sm:mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {s.start} – {s.end}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5 sm:mt-1 truncate hidden sm:block">{clsName}</div>
                    </motion.div>
                  ))}
                </div>
              )}
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      <AnimatePresence>
        {days.every((d) => (dataByDay[d] || []).length === 0) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <GlassCard className="p-8 sm:p-12 text-center bg-white/80">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl sm:text-5xl mb-3"
              >
                📆
              </motion.div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                No timetable found
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-4">
                Contact admin to set up your schedule for this week
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={() => alert('Request sent')}>Request Update</Button>
              </motion.div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
