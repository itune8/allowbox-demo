'use client';

import { useMemo } from 'react';
import { useAuth } from '../../../../contexts/auth-context';
import { getCurrentSchoolId, getEntities } from '../../../../lib/data-store';
import { Button } from '@repo/ui/button';

export default function ReportsPage() {
  const { user } = useAuth();
  const schoolId = useMemo(() => getCurrentSchoolId(), []);
  const entities = useMemo(() => getEntities(schoolId), [schoolId]);

  const teacherEmail = user?.email || '';
  const assignedClassIds = useMemo(
    () => entities.teacherAssignments?.[teacherEmail] || [],
    [entities.teacherAssignments, teacherEmail]
  );

  const allowedClasses = useMemo(() => {
    const all = entities.classes || [];
    if (!assignedClassIds || assignedClassIds.length === 0) return all;
    return all.filter((c) => assignedClassIds.includes(c.id));
  }, [entities.classes, assignedClassIds]);

  const allowedClassIds = useMemo(() => new Set(allowedClasses.map((c) => c.id)), [allowedClasses]);

  // Build last 5 weeks
  const labels: string[] = useMemo(() => {
    const now = new Date();
    const day = (now.getDay() + 6) % 7; // Mon=0
    const monday = new Date(now);
    monday.setDate(now.getDate() - day);
    const out: string[] = [];
    for (let i = 4; i >= 0; i--) {
      out.push(i === 0 ? 'This Week' : `W-${i}`);
    }
    return out;
  }, []);

  const weekRanges = useMemo(() => {
    const now = new Date();
    const day = (now.getDay() + 6) % 7;
    const monday = new Date(now);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(now.getDate() - day);
    const ranges: { start: Date; end: Date }[] = [];
    for (let i = 4; i >= 0; i--) {
      const start = new Date(monday);
      start.setDate(monday.getDate() - i * 7);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      ranges.push({ start, end });
    }
    return ranges;
  }, []);

  // Homework completion per week
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

  // Attendance percentage per week
  const attendancePct = useMemo(() => {
    const att = entities.attendance || {};
    const classIdToStrength = new Map<string, number>();
    for (const c of entities.classes) classIdToStrength.set(c.id, c.strength || 0);

    const sums = Array(5).fill(0);
    const counts = Array(5).fill(0);
    for (const [dateStr, byClass] of Object.entries(att)) {
      const d = new Date(dateStr);
      let weekIdx = -1;
      for (let i = 0; i < weekRanges.length; i++) {
        const { start, end } = weekRanges[i]!;
        if (d >= start && d <= end) {
          weekIdx = i;
          break;
        }
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

  // Performance trend
  const perfTrend = useMemo(
    () => homeworkRate.map((v, i) => Math.round((v + (attendancePct[i] || 0)) / 2)),
    [homeworkRate, attendancePct]
  );

  const SectionCard = ({ title, data }: { title: string; data: number[] }) => {
    const max = Math.max(1, ...data);
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="font-semibold mb-4 text-gray-900 dark:text-gray-100">{title}</div>
        <div className="h-40 flex items-end gap-2">
          {data.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400">{v}%</div>
              <div
                className="w-full bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t hover:from-indigo-600 hover:to-indigo-500 transition-all"
                style={{ height: `${Math.round((v / max) * 100)}%` }}
                title={`${labels[i]}: ${v}%`}
              />
            </div>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-5 text-[10px] text-gray-500 dark:text-gray-400">
          {labels.map((l, i) => (
            <div key={i} className="text-center">
              {l}
            </div>
          ))}
        </div>
      </div>
    );
  };

  function downloadCSV() {
    const rows: string[] = [];
    rows.push(['Metric', 'Week', 'Value'].join(','));
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
    const buildRows = (name: string, arr: number[]) =>
      labels.map((w, i) => `<tr><td>${name}</td><td>${w}</td><td>${arr[i] ?? ''}</td></tr>`).join('');
    const html = `
      <html><head>${style}</head><body>
        <h1>Teacher Reports Summary</h1>
        <table>
          <thead><tr><th>Metric</th><th>Week</th><th>Value (%)</th></tr></thead>
          <tbody>
            ${buildRows('Attendance', attendancePct)}
            ${buildRows('Homework Rate', homeworkRate)}
            ${buildRows('Performance', perfTrend)}
          </tbody>
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Reports</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            View performance analytics and trends for your classes
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={printPDF}>
            Export PDF
          </Button>
          <Button variant="outline" onClick={downloadCSV}>
            Download CSV
          </Button>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SectionCard title="Attendance % by Class" data={attendancePct} />
        <SectionCard title="Homework Completion Rate" data={homeworkRate} />
        <SectionCard title="Student Performance Trend" data={perfTrend} />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <div className="text-sm font-medium text-blue-800 dark:text-blue-300">Average Attendance</div>
          <div className="text-3xl font-bold text-blue-900 dark:text-blue-200 mt-2">
            {attendancePct.length > 0
              ? Math.round(attendancePct.reduce((a, b) => a + b, 0) / attendancePct.length)
              : 0}
            %
          </div>
          <div className="text-xs text-blue-700 dark:text-blue-400 mt-1">Last 5 weeks</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
          <div className="text-sm font-medium text-green-800 dark:text-green-300">Homework Completion</div>
          <div className="text-3xl font-bold text-green-900 dark:text-green-200 mt-2">
            {homeworkRate.length > 0
              ? Math.round(homeworkRate.reduce((a, b) => a + b, 0) / homeworkRate.length)
              : 0}
            %
          </div>
          <div className="text-xs text-green-700 dark:text-green-400 mt-1">Last 5 weeks</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6">
          <div className="text-sm font-medium text-purple-800 dark:text-purple-300">Overall Performance</div>
          <div className="text-3xl font-bold text-purple-900 dark:text-purple-200 mt-2">
            {perfTrend.length > 0 ? Math.round(perfTrend.reduce((a, b) => a + b, 0) / perfTrend.length) : 0}%
          </div>
          <div className="text-xs text-purple-700 dark:text-purple-400 mt-1">Last 5 weeks</div>
        </div>
      </div>
    </div>
  );
}
