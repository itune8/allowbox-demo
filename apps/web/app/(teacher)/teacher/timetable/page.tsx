'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '../../../../contexts/auth-context';
import { getCurrentSchoolId, getEntities, type TimetableEntry } from '../../../../lib/data-store';
import { Button } from '@repo/ui/button';

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Timetable</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">View your weekly class schedule</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            className="border border-gray-300 bg-white text-gray-900 rounded-md px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
            value={week}
            onChange={(e) => setWeek(e.target.value)}
          >
            {['This Week', 'Next Week', 'Last Week'].map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
          <select
            className="border border-gray-300 bg-white text-gray-900 rounded-md px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            {classesForTeacher.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setRefreshing(true);
              setTimeout(() => setRefreshing(false), 600);
            }}
          >
            Refresh {refreshing ? '…' : ''}
          </Button>
          <Button size="sm" variant="outline" onClick={printPDF}>
            Download PDF
          </Button>
          <Button size="sm" variant="outline" onClick={downloadCSV}>
            Download CSV
          </Button>
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {days.map((d) => (
          <div
            key={d}
            className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm ${
              d === todayName ? 'ring-2 ring-indigo-400 dark:ring-indigo-600' : ''
            }`}
          >
            <div className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center justify-between">
              {d}
              {d === todayName && (
                <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded">
                  Today
                </span>
              )}
            </div>
            {(dataByDay[d] || []).length === 0 ? (
              <div className="text-sm text-gray-500 dark:text-gray-400 italic">No sessions</div>
            ) : (
              <div className="space-y-2">
                {(dataByDay[d] || []).map((s) => (
                  <div
                    key={s.id}
                    className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all ease-in-out bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900"
                  >
                    <div className="text-sm text-gray-800 dark:text-gray-200 font-medium">{s.subject}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {s.start} – {s.end}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{clsName}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {days.every((d) => (dataByDay[d] || []).length === 0) && (
        <div className="flex flex-col items-center justify-center py-16 space-y-3 text-gray-500 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="text-4xl">📆</div>
          <div className="text-lg font-medium">No timetable found for this week</div>
          <p className="text-sm text-gray-400">Contact admin to set up your schedule</p>
          <Button onClick={() => alert('Request sent')}>Request Update</Button>
        </div>
      )}
    </div>
  );
}
