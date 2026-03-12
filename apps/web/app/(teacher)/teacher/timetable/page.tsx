'use client';

import { useState, useMemo } from 'react';
import { SchoolStatCard } from '../../../../components/school';
import {
  Clock,
  BookOpen,
  Users,
  Coffee,
  Loader2,
  Calendar,
} from 'lucide-react';

// ── Mock timetable ──
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface Period {
  time: string;
  subject: string;
  class: string;
  room: string;
  color: string;
}

const subjectColors: Record<string, string> = {
  Mathematics: 'bg-blue-50 border-blue-200 text-blue-700',
  Physics: 'bg-purple-50 border-purple-200 text-purple-700',
  Chemistry: 'bg-green-50 border-green-200 text-green-700',
  English: 'bg-amber-50 border-amber-200 text-amber-700',
  Free: 'bg-slate-50 border-slate-200 text-slate-400',
};

const MOCK_TIMETABLE: Record<string, Period[]> = {
  Monday: [
    { time: '08:00 - 08:45', subject: 'Mathematics', class: 'Class 10-A', room: 'Room 201', color: 'blue' },
    { time: '08:50 - 09:35', subject: 'Mathematics', class: 'Class 9-B', room: 'Room 203', color: 'blue' },
    { time: '10:00 - 10:45', subject: 'Physics', class: 'Class 8-A', room: 'Lab 1', color: 'purple' },
    { time: '10:50 - 11:35', subject: 'Free', class: '', room: '', color: 'slate' },
    { time: '12:15 - 13:00', subject: 'Mathematics', class: 'Class 7-C', room: 'Room 108', color: 'blue' },
    { time: '13:05 - 13:50', subject: 'Physics', class: 'Class 9-A', room: 'Lab 2', color: 'purple' },
  ],
  Tuesday: [
    { time: '08:00 - 08:45', subject: 'Physics', class: 'Class 10-A', room: 'Lab 1', color: 'purple' },
    { time: '08:50 - 09:35', subject: 'Free', class: '', room: '', color: 'slate' },
    { time: '10:00 - 10:45', subject: 'Mathematics', class: 'Class 10-B', room: 'Room 205', color: 'blue' },
    { time: '10:50 - 11:35', subject: 'Mathematics', class: 'Class 8-A', room: 'Room 201', color: 'blue' },
    { time: '12:15 - 13:00', subject: 'Physics', class: 'Class 7-C', room: 'Lab 2', color: 'purple' },
    { time: '13:05 - 13:50', subject: 'Mathematics', class: 'Class 9-B', room: 'Room 203', color: 'blue' },
  ],
  Wednesday: [
    { time: '08:00 - 08:45', subject: 'Mathematics', class: 'Class 9-A', room: 'Room 201', color: 'blue' },
    { time: '08:50 - 09:35', subject: 'Physics', class: 'Class 10-B', room: 'Lab 1', color: 'purple' },
    { time: '10:00 - 10:45', subject: 'Free', class: '', room: '', color: 'slate' },
    { time: '10:50 - 11:35', subject: 'Mathematics', class: 'Class 10-A', room: 'Room 201', color: 'blue' },
    { time: '12:15 - 13:00', subject: 'Physics', class: 'Class 8-A', room: 'Lab 2', color: 'purple' },
    { time: '13:05 - 13:50', subject: 'Free', class: '', room: '', color: 'slate' },
  ],
  Thursday: [
    { time: '08:00 - 08:45', subject: 'Mathematics', class: 'Class 7-C', room: 'Room 108', color: 'blue' },
    { time: '08:50 - 09:35', subject: 'Mathematics', class: 'Class 10-A', room: 'Room 201', color: 'blue' },
    { time: '10:00 - 10:45', subject: 'Physics', class: 'Class 9-A', room: 'Lab 1', color: 'purple' },
    { time: '10:50 - 11:35', subject: 'Physics', class: 'Class 10-B', room: 'Lab 2', color: 'purple' },
    { time: '12:15 - 13:00', subject: 'Free', class: '', room: '', color: 'slate' },
    { time: '13:05 - 13:50', subject: 'Mathematics', class: 'Class 9-B', room: 'Room 203', color: 'blue' },
  ],
  Friday: [
    { time: '08:00 - 08:45', subject: 'Physics', class: 'Class 8-A', room: 'Lab 1', color: 'purple' },
    { time: '08:50 - 09:35', subject: 'Mathematics', class: 'Class 9-A', room: 'Room 201', color: 'blue' },
    { time: '10:00 - 10:45', subject: 'Mathematics', class: 'Class 10-B', room: 'Room 205', color: 'blue' },
    { time: '10:50 - 11:35', subject: 'Free', class: '', room: '', color: 'slate' },
    { time: '12:15 - 13:00', subject: 'Physics', class: 'Class 10-A', room: 'Lab 2', color: 'purple' },
    { time: '13:05 - 13:50', subject: 'Mathematics', class: 'Class 7-C', room: 'Room 108', color: 'blue' },
  ],
  Saturday: [
    { time: '08:00 - 08:45', subject: 'Mathematics', class: 'Class 10-A', room: 'Room 201', color: 'blue' },
    { time: '08:50 - 09:35', subject: 'Physics', class: 'Class 9-B', room: 'Lab 1', color: 'purple' },
    { time: '10:00 - 10:45', subject: 'Free', class: '', room: '', color: 'slate' },
    { time: '10:50 - 11:35', subject: 'Free', class: '', room: '', color: 'slate' },
    { time: '12:15 - 13:00', subject: 'Mathematics', class: 'Class 8-A', room: 'Room 201', color: 'blue' },
    { time: '13:05 - 13:50', subject: 'Free', class: '', room: '', color: 'slate' },
  ],
};

export default function TeacherTimetablePage() {
  const [view, setView] = useState<'weekly' | 'daily'>('weekly');
  const todayIdx = new Date().getDay(); // 0=Sun, 1=Mon, ...
  const todayName = todayIdx === 0 ? 'Monday' : DAYS[todayIdx - 1] || 'Monday';
  const [selectedDay, setSelectedDay] = useState(todayName);

  const allPeriods = useMemo(() => Object.values(MOCK_TIMETABLE).flat(), []);
  const totalPeriods = allPeriods.length;
  const subjects = useMemo(() => new Set(allPeriods.filter((p) => p.subject !== 'Free').map((p) => p.subject)), [allPeriods]);
  const classes = useMemo(() => new Set(allPeriods.filter((p) => p.class).map((p) => p.class)), [allPeriods]);
  const freePeriods = allPeriods.filter((p) => p.subject === 'Free').length;

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Schedule</h1>
            <p className="text-sm text-slate-500">Weekly timetable and class schedule</p>
          </div>
        </div>
        <div className="flex gap-2">
          {(['weekly', 'daily'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                view === v ? 'bg-[#824ef2] text-white border-[#824ef2]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {v === 'weekly' ? 'Weekly View' : 'Daily View'}
            </button>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SchoolStatCard icon={<Clock className="w-5 h-5" />} color="blue" label="Total Periods" value={totalPeriods} />
        <SchoolStatCard icon={<BookOpen className="w-5 h-5" />} color="purple" label="Subjects" value={subjects.size} />
        <SchoolStatCard icon={<Users className="w-5 h-5" />} color="green" label="Classes" value={classes.size} />
        <SchoolStatCard icon={<Coffee className="w-5 h-5" />} color="amber" label="Free Periods" value={freePeriods} />
      </div>

      {/* Weekly View */}
      {view === 'weekly' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium text-slate-500 w-28">Time</th>
                  {DAYS.map((day) => (
                    <th
                      key={day}
                      className={`text-left py-3 px-3 font-medium ${
                        day === todayName ? 'text-[#824ef2] bg-[#824ef2]/5' : 'text-slate-500'
                      }`}
                    >
                      {day}
                      {day === todayName && (
                        <span className="ml-1.5 text-[10px] bg-[#824ef2] text-white px-1.5 py-0.5 rounded-full">Today</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(MOCK_TIMETABLE['Monday'] || []).map((_, idx) => (
                  <tr key={idx} className="border-b border-slate-100 last:border-b-0">
                    <td className="py-2 px-4 text-xs text-slate-500 font-medium align-top pt-3">
                      {MOCK_TIMETABLE['Monday']?.[idx]?.time}
                    </td>
                    {DAYS.map((day) => {
                      const period = MOCK_TIMETABLE[day]?.[idx];
                      if (!period) return <td key={day} className="py-2 px-3" />;
                      const isFree = period.subject === 'Free';
                      const colorMap: Record<string, string> = {
                        blue: 'bg-blue-50 border-blue-200',
                        purple: 'bg-purple-50 border-purple-200',
                        green: 'bg-green-50 border-green-200',
                        amber: 'bg-amber-50 border-amber-200',
                        slate: 'bg-slate-50 border-slate-200',
                      };
                      const textMap: Record<string, string> = {
                        blue: 'text-blue-700',
                        purple: 'text-purple-700',
                        green: 'text-green-700',
                        amber: 'text-amber-700',
                        slate: 'text-slate-400',
                      };
                      const isToday = day === todayName;
                      return (
                        <td key={day} className={`py-2 px-3 ${isToday ? 'bg-[#824ef2]/[0.02]' : ''}`}>
                          <div className={`rounded-lg border p-2.5 ${colorMap[period.color] || colorMap.slate}`}>
                            <p className={`font-medium text-xs ${textMap[period.color] || textMap.slate}`}>
                              {isFree ? 'Free Period' : period.subject}
                            </p>
                            {!isFree && (
                              <>
                                <p className="text-[11px] text-slate-500 mt-0.5">{period.class}</p>
                                <p className="text-[11px] text-slate-400">{period.room}</p>
                              </>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Daily View */}
      {view === 'daily' && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">{selectedDay}&apos;s Schedule</h2>
            <div className="flex gap-2 flex-wrap">
              {DAYS.map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    selectedDay === day
                      ? 'bg-[#824ef2] text-white border-[#824ef2]'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {(MOCK_TIMETABLE[selectedDay] || []).map((period, idx) => {
              const isFree = period.subject === 'Free';
              return (
                <div key={idx} className="flex items-center gap-4 p-4 px-5 hover:bg-slate-50 transition-colors">
                  <div className="flex-shrink-0 w-20 text-center">
                    <p className="text-xs text-slate-500 font-medium">{period.time.split(' - ')[0]}</p>
                    <p className="text-[10px] text-slate-400">{period.time.split(' - ')[1]}</p>
                  </div>
                  <div className={`w-1 h-12 rounded-full ${isFree ? 'bg-slate-200' : period.color === 'blue' ? 'bg-blue-400' : period.color === 'purple' ? 'bg-purple-400' : 'bg-green-400'}`} />
                  <div className="flex-1">
                    <p className={`font-semibold ${isFree ? 'text-slate-400' : 'text-slate-900'}`}>
                      {isFree ? 'Free Period' : period.subject}
                    </p>
                    {!isFree && (
                      <p className="text-sm text-slate-500 mt-0.5">
                        {period.class} &bull; {period.room}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
