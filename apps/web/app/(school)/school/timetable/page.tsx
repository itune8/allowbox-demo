'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '../../../../contexts/auth-context';
import { getCurrentSchoolId, getEntities, type TimetableEntry } from '../../../../lib/data-store';
import { Button } from '@repo/ui/button';
import { Calendar, Clock, Book, Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { SlideSheet, SheetSection, SheetDetailRow } from '@/components/ui';

export default function TimetablePage() {
  const { user } = useAuth();
  const schoolId = useMemo(() => getCurrentSchoolId(), []);
  const [entities] = useState(() => getEntities(schoolId));
  const [week, setWeek] = useState('This Week');
  const [refreshing, setRefreshing] = useState(false);
  const [showDetailsSheet, setShowDetailsSheet] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TimetableEntry | null>(null);

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

  const hasNoSessions = days.every((d) => (dataByDay[d] || []).length === 0);

  const handleSessionClick = (entry: TimetableEntry) => {
    setSelectedEntry(entry);
    setShowDetailsSheet(true);
  };

  const handleCloseDetailsSheet = () => {
    setShowDetailsSheet(false);
    setSelectedEntry(null);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100">
            <Calendar className="h-6 w-6 text-violet-600" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Timetable</h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">View your weekly class schedule</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            className="border border-slate-200 bg-white text-slate-900 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
            className="border border-slate-200 bg-white text-slate-900 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm max-w-[100px] sm:max-w-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
            className="hidden sm:inline-flex border-slate-200 hover:bg-slate-50"
            onClick={() => {
              setRefreshing(true);
              setTimeout(() => setRefreshing(false), 600);
            }}
            disabled={refreshing}
          >
            {refreshing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Refreshing
              </>
            ) : (
              'Refresh'
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={printPDF}
            className="text-xs sm:text-sm border-slate-200 hover:bg-slate-50"
          >
            <Download className="w-3.5 h-3.5 mr-1" />
            <span className="hidden sm:inline">Download </span>PDF
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={downloadCSV}
            className="text-xs sm:text-sm border-slate-200 hover:bg-slate-50"
          >
            <Download className="w-3.5 h-3.5 mr-1" />
            <span className="hidden sm:inline">Download </span>CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-medium text-slate-600">Total Sessions</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{totalSessions}</p>
            </div>
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-violet-100">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-violet-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-medium text-slate-600">Days Scheduled</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{sessionsByDay}</p>
            </div>
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-cyan-100">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-600" />
            </div>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-slate-600">Class</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 truncate">
                {clsName || 'Select a class'}
              </p>
            </div>
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-amber-100 flex-shrink-0">
              <Book className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Success Banner - Show when sessions exist */}
      {!hasNoSessions && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-emerald-900">Schedule Loaded</h3>
              <p className="text-sm text-emerald-700 mt-1">
                Your timetable for {week.toLowerCase()} is displayed below. Use the download options to export your schedule.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Timetable Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
        {days.map((d) => (
          <div
            key={d}
            className={`bg-white rounded-xl border p-3 sm:p-4 h-full ${
              d === todayName
                ? 'border-violet-300 ring-2 ring-violet-100'
                : 'border-slate-200'
            }`}
          >
            <div className="font-semibold text-slate-900 mb-2 sm:mb-3 flex items-center justify-between text-sm sm:text-base">
              <span className="truncate">
                {d.slice(0, 3)}<span className="hidden sm:inline">{d.slice(3)}</span>
              </span>
              {d === todayName && (
                <span className="text-xs bg-violet-100 text-violet-700 px-1.5 sm:px-2 py-0.5 rounded flex-shrink-0 font-medium">
                  Today
                </span>
              )}
            </div>
            {(dataByDay[d] || []).length === 0 ? (
              <div className="text-xs sm:text-sm text-slate-500 italic text-center py-4 bg-slate-50 rounded-lg">
                No sessions
              </div>
            ) : (
              <div className="space-y-1.5 sm:space-y-2">
                {(dataByDay[d] || []).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSessionClick(s)}
                    className="w-full p-2 sm:p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition-colors text-left cursor-pointer"
                  >
                    <div className="text-xs sm:text-sm text-slate-900 font-medium truncate">
                      {s.subject}
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5 sm:mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {s.start} – {s.end}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 sm:mt-1 truncate hidden sm:block">
                      {clsName}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {hasNoSessions && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-12">
          <div className="text-center max-w-md mx-auto">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-amber-100 mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-amber-600" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">
              No timetable found
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mb-6">
              Contact admin to set up your schedule for this week
            </p>
            <Button
              onClick={() => alert('Request sent')}
              className="bg-primary hover:bg-primary-dark"
            >
              Request Update
            </Button>
          </div>
        </div>
      )}

      {/* Session Details Sheet */}
      <SlideSheet
        isOpen={showDetailsSheet}
        onClose={handleCloseDetailsSheet}
        title="Session Details"
        subtitle={selectedEntry ? `${selectedEntry.subject} - ${selectedEntry.day}` : ''}
        size="md"
      >
        {selectedEntry && (
          <SheetSection>
            <SheetDetailRow label="Subject" value={selectedEntry.subject} />
            <SheetDetailRow label="Day" value={selectedEntry.day} />
            <SheetDetailRow label="Start Time" value={selectedEntry.start} />
            <SheetDetailRow label="End Time" value={selectedEntry.end} />
            <SheetDetailRow label="Class" value={clsName} />
            <SheetDetailRow
              label="Duration"
              value={(() => {
                const startParts = selectedEntry.start.split(':').map(Number);
                const endParts = selectedEntry.end.split(':').map(Number);
                const startHour = startParts[0] || 0;
                const startMin = startParts[1] || 0;
                const endHour = endParts[0] || 0;
                const endMin = endParts[1] || 0;
                const durationMin = (endHour * 60 + endMin) - (startHour * 60 + startMin);
                const hours = Math.floor(durationMin / 60);
                const mins = durationMin % 60;
                return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
              })()}
            />
          </SheetSection>
        )}
      </SlideSheet>
    </div>
  );
}
