'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../../contexts/auth-context';
import { getCurrentSchoolId, getEntities } from '../../../../lib/data-store';
import { Button } from '@repo/ui/button';
import { GlassCard, AnimatedStatCard, Icon3D, gradients } from '@/components/ui';
import {
  BarChart3,
  TrendingUp,
  Users,
  PieChart,
} from 'lucide-react';

export default function ReportsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
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

  const SectionCard = ({ title, data, gradient }: { title: string; data: number[]; gradient: string }) => {
    const max = Math.max(1, ...data);
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <GlassCard className="p-6 bg-white/90" hover={false}>
          <h3 className="font-semibold mb-4 text-gray-900 flex items-center gap-2">
            {title}
            <Icon3D gradient={gradient} size="sm">
              <BarChart3 className="w-3.5 h-3.5" />
            </Icon3D>
          </h3>
          <div className="h-40 flex items-end gap-2">
            <AnimatePresence>
              {data.map((v, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 + 0.3 }}
                    className="text-xs font-medium text-gray-600"
                  >
                    {v}%
                  </motion.div>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.round((v / max) * 100)}%` }}
                    transition={{ delay: i * 0.1, duration: 0.6, ease: 'easeOut' }}
                    whileHover={{ scale: 1.05, originY: 'bottom' }}
                    className={`w-full bg-gradient-to-t ${gradient} rounded-t transition-all`}
                    title={`${labels[i]}: ${v}%`}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-3 grid grid-cols-5 text-[10px] text-gray-500"
          >
            {labels.map((l, i) => (
              <div key={i} className="text-center">
                {l}
              </div>
            ))}
          </motion.div>
        </GlassCard>
      </motion.div>
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between gap-3 flex-wrap"
      >
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            Reports
            <Icon3D gradient={gradients.purple} size="sm">
              <PieChart className="w-3.5 h-3.5" />
            </Icon3D>
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            View performance analytics
          </p>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex gap-2 sm:gap-3"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button variant="outline" onClick={printPDF} className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Export </span>PDF
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button variant="outline" onClick={downloadCSV} className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Download </span>CSV
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4"
      >
        <AnimatedStatCard
          title="Avg Attendance"
          value={attendancePct.length > 0 ? Math.round(attendancePct.reduce((a, b) => a + b, 0) / attendancePct.length) : 0}
          icon={<Users className="w-5 h-5 text-purple-600" />}
          iconBgColor="bg-purple-50"
          delay={0}
        />
        <AnimatedStatCard
          title="Avg Homework Rate"
          value={homeworkRate.length > 0 ? Math.round(homeworkRate.reduce((a, b) => a + b, 0) / homeworkRate.length) : 0}
          icon={<BarChart3 className="w-5 h-5 text-violet-600" />}
          iconBgColor="bg-violet-50"
          delay={1}
        />
        <AnimatedStatCard
          title="Performance"
          value={perfTrend.length > 0 ? Math.round(perfTrend.reduce((a, b) => a + b, 0) / perfTrend.length) : 0}
          icon={<TrendingUp className="w-5 h-5 text-indigo-600" />}
          iconBgColor="bg-indigo-50"
          delay={2}
        />
      </motion.div>

      {/* Charts Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6"
      >
        <SectionCard title="Attendance %" data={attendancePct} gradient={gradients.purple} />
        <SectionCard title="Homework Rate" data={homeworkRate} gradient={gradients.violet} />
        <SectionCard title="Performance Trend" data={perfTrend} gradient={gradients.indigo} />
      </motion.div>
    </div>
  );
}
