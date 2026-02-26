'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import {
  eventService,
  type Event,
  EventType,
  EventVisibility,
} from '../../../../lib/services/event.service';
import { SchoolStatCard, FormModal, useToast } from '../../../../components/school';
import {
  Calendar,
  CalendarDays,
  CalendarCheck,
  Star,
  Clock,
  MapPin,
  Users,
  Loader2,
  Eye,
} from 'lucide-react';

type ScopeFilter = 'all' | 'school-wide' | 'my-classes';

const dateColors = [
  'bg-pink-50 text-pink-700',
  'bg-emerald-50 text-emerald-700',
  'bg-sky-50 text-sky-700',
  'bg-amber-50 text-amber-700',
  'bg-violet-50 text-violet-700',
];

const typeColors: Record<EventType, string> = {
  [EventType.ACADEMIC]: 'bg-blue-100 text-blue-700',
  [EventType.SPORTS]: 'bg-green-100 text-green-700',
  [EventType.CULTURAL]: 'bg-purple-100 text-purple-700',
  [EventType.HOLIDAY]: 'bg-yellow-100 text-yellow-700',
  [EventType.MEETING]: 'bg-slate-100 text-slate-700',
  [EventType.EXAM]: 'bg-red-100 text-red-700',
  [EventType.OTHER]: 'bg-indigo-100 text-indigo-700',
};

const typeLabels: Record<EventType, string> = {
  [EventType.ACADEMIC]: 'Academic',
  [EventType.SPORTS]: 'Sports',
  [EventType.CULTURAL]: 'Cultural',
  [EventType.HOLIDAY]: 'Holiday',
  [EventType.MEETING]: 'Meeting',
  [EventType.EXAM]: 'Exam',
  [EventType.OTHER]: 'Other',
};

// ── Mock data ──
const MOCK_EVENTS: Event[] = [
  {
    _id: 'evt-1', tenantId: 't1', title: 'Annual Sports Day',
    description: 'Inter-house athletics competition featuring track & field events.',
    type: EventType.SPORTS,
    startDate: new Date(Date.now() + 3 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 3 * 86400000).toISOString(),
    startTime: '09:00', endTime: '17:00', location: 'School Sports Ground',
    visibility: [EventVisibility.ALL],
    createdBy: { _id: 'a1', firstName: 'Admin', lastName: 'User' },
    isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    _id: 'evt-2', tenantId: 't1', title: 'Parent-Teacher Conference',
    description: 'Quarterly parent-teacher meeting to discuss student progress.',
    type: EventType.MEETING,
    startDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    startTime: '14:00', endTime: '18:00', location: 'School Auditorium',
    visibility: [EventVisibility.ALL],
    createdBy: { _id: 'a1', firstName: 'Admin', lastName: 'User' },
    isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    _id: 'evt-3', tenantId: 't1', title: 'Science Fair Exhibition',
    description: 'Students showcase their science projects. Judges evaluate for creativity.',
    type: EventType.ACADEMIC,
    startDate: new Date(Date.now() + 12 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 12 * 86400000).toISOString(),
    startTime: '10:00', endTime: '15:00', location: 'Science Lab & Main Hall',
    visibility: [EventVisibility.STUDENTS, EventVisibility.TEACHERS],
    createdBy: { _id: 'a1', firstName: 'Admin', lastName: 'User' },
    isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    _id: 'evt-4', tenantId: 't1', title: 'Mid-Term Examinations',
    description: 'Mid-term examinations for all grades.',
    type: EventType.EXAM,
    startDate: new Date(Date.now() + 18 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 25 * 86400000).toISOString(),
    startTime: '08:30', endTime: '12:30', location: 'Respective Classrooms',
    visibility: [EventVisibility.ALL],
    createdBy: { _id: 'a1', firstName: 'Admin', lastName: 'User' },
    isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    _id: 'evt-5', tenantId: 't1', title: 'Staff Meeting — Curriculum Review',
    description: 'Monthly staff meeting to review curriculum progress.',
    type: EventType.MEETING,
    startDate: new Date(Date.now() + 5 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 5 * 86400000).toISOString(),
    startTime: '15:30', endTime: '17:00', location: 'Conference Room B',
    visibility: [EventVisibility.TEACHERS, EventVisibility.STAFF],
    createdBy: { _id: 'a1', firstName: 'Admin', lastName: 'User' },
    isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    _id: 'evt-6', tenantId: 't1', title: 'Cultural Fest — "Harmony"',
    description: 'Annual cultural festival with performances and exhibitions.',
    type: EventType.CULTURAL,
    startDate: new Date(Date.now() + 30 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 31 * 86400000).toISOString(),
    startTime: '09:00', endTime: '20:00', location: 'School Campus',
    visibility: [EventVisibility.ALL],
    createdBy: { _id: 'a1', firstName: 'Admin', lastName: 'User' },
    isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
];

export default function TeacherEventsPage() {
  const { showToast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>('all');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await eventService.getAll();
        setEvents(data.length > 0 ? data : MOCK_EVENTS);
      } catch {
        setEvents(MOCK_EVENTS);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const upcomingEvents = events.filter((e) => new Date(e.startDate) >= new Date());
  const thisMonthEvents = events.filter((e) => {
    const start = new Date(e.startDate);
    const now = new Date();
    return start.getMonth() === now.getMonth() && start.getFullYear() === now.getFullYear();
  });

  const filteredEvents = useMemo(() => {
    let filtered = upcomingEvents;
    if (scopeFilter === 'school-wide') {
      filtered = filtered.filter((e) => e.visibility.includes(EventVisibility.ALL));
    } else if (scopeFilter === 'my-classes') {
      filtered = filtered.filter((e) => !e.visibility.includes(EventVisibility.ALL));
    }
    return filtered.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [upcomingEvents, scopeFilter]);

  const stats = useMemo(() => ({
    total: events.length,
    upcoming: upcomingEvents.length,
    thisMonth: thisMonthEvents.length,
  }), [events, upcomingEvents, thisMonthEvents]);

  function getEventScope(event: Event): string {
    if (event.visibility.includes(EventVisibility.ALL)) return 'All Classes';
    if (event.classIds && event.classIds.length > 0) {
      const names = event.classIds.map((c) => c.name);
      return names.length > 3 ? `${names.slice(0, 3).join(', ')} +${names.length - 3} more` : names.join(', ');
    }
    return 'Selected Groups';
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-[#824ef2] animate-spin" />
        <p className="mt-4 text-slate-500">Loading events...</p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
          <Calendar className="w-6 h-6 text-[#824ef2]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Events</h1>
          <p className="text-sm text-slate-500">School events and activities</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SchoolStatCard icon={<CalendarDays className="w-5 h-5" />} color="blue" label="Total Events" value={stats.total} />
        <SchoolStatCard icon={<CalendarCheck className="w-5 h-5" />} color="green" label="Upcoming" value={stats.upcoming} />
        <SchoolStatCard icon={<Star className="w-5 h-5" />} color="purple" label="This Month" value={stats.thisMonth} />
      </div>

      {/* Event List */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-5 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Upcoming Events</h2>
            <div className="flex gap-2">
              {([
                { key: 'all' as ScopeFilter, label: 'All Events' },
                { key: 'school-wide' as ScopeFilter, label: 'School-wide' },
                { key: 'my-classes' as ScopeFilter, label: 'My Classes' },
              ]).map((btn) => (
                <button
                  key={btn.key}
                  onClick={() => setScopeFilter(btn.key)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors border ${
                    scopeFilter === btn.key
                      ? 'bg-[#824ef2] text-white border-[#824ef2]'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          {filteredEvents.length === 0 ? (
            <div className="py-16 text-center">
              <Calendar className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500">No upcoming events</p>
            </div>
          ) : (
            filteredEvents.map((event, index) => {
              const startDate = new Date(event.startDate);
              const day = startDate.getDate();
              const month = startDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
              const colorClass = dateColors[index % dateColors.length];
              const timeRange = event.startTime
                ? `${event.startTime}${event.endTime ? ' - ' + event.endTime : ''}`
                : '';

              return (
                <div key={event._id}>
                  <div
                    className="flex items-center gap-4 p-4 px-5 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => { setSelectedEvent(event); setShowDetailModal(true); }}
                  >
                    <div className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${colorClass}`}>
                      <span className="text-[10px] font-bold tracking-wider leading-none">{month}</span>
                      <span className="text-2xl font-bold leading-tight">{day}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 truncate">{event.title}</h3>
                      <p className="text-sm text-slate-500 mb-1.5">
                        {event.visibility.includes(EventVisibility.ALL) ? 'School-wide Event' : 'Class-specific Event'}
                        {timeRange && ` \u2022 ${timeRange}`}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${typeColors[event.type]}`}>
                          {typeLabels[event.type]}
                        </span>
                        <span className="text-xs text-slate-400">{getEventScope(event)}</span>
                      </div>
                    </div>
                  </div>
                  {index < filteredEvents.length - 1 && <div className="border-b border-slate-100 mx-5" />}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Detail Modal (read-only for teacher) */}
      <FormModal
        open={showDetailModal && !!selectedEvent}
        onClose={() => { setSelectedEvent(null); setShowDetailModal(false); }}
        title={selectedEvent?.title || ''}
        size="lg"
        footer={
          <button onClick={() => { setSelectedEvent(null); setShowDetailModal(false); }} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Close</button>
        }
      >
        {selectedEvent && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${typeColors[selectedEvent.type]}`}>
                {typeLabels[selectedEvent.type]}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium bg-slate-100 text-slate-600">
                <Users className="w-3 h-3" />
                {getEventScope(selectedEvent)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <p className="text-xs text-slate-500 mb-1">Date</p>
                <p className="text-sm font-semibold text-slate-900">
                  {new Date(selectedEvent.startDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <p className="text-xs text-slate-500 mb-1">Time</p>
                <p className="text-sm font-semibold text-slate-900">
                  {selectedEvent.startTime || 'All Day'}
                  {selectedEvent.endTime && ` - ${selectedEvent.endTime}`}
                </p>
              </div>
            </div>
            {selectedEvent.location && (
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-600" /> Location
                </h4>
                <p className="text-sm text-slate-700">{selectedEvent.location}</p>
              </div>
            )}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Description</h4>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{selectedEvent.description}</p>
              </div>
            </div>
          </div>
        )}
      </FormModal>
    </section>
  );
}
