'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import {
  eventService,
  Event,
  EventType,
  EventVisibility,
  CreateEventDto,
} from '../../../../lib/services/event.service';
import { classService, Class } from '../../../../lib/services/class.service';
import { SchoolStatCard, FormModal, ConfirmModal, useToast } from '../../../../components/school';
import {
  Calendar,
  Plus,
  X,
  Clock,
  MapPin,
  Edit,
  Trash2,
  Eye,
  CalendarDays,
  AlertCircle,
  Loader2,
  MoreVertical,
  Star,
  CalendarCheck,
  Users,
} from 'lucide-react';

type ScopeFilter = 'all' | 'school-wide' | 'class-specific';

const dateColors = [
  'bg-pink-50 text-pink-700',
  'bg-emerald-50 text-emerald-700',
  'bg-sky-50 text-sky-700',
  'bg-amber-50 text-amber-700',
  'bg-violet-50 text-violet-700',
];

// ── Mock data used when API returns no results ──
const MOCK_EVENTS: Event[] = [
  {
    _id: 'mock-evt-1',
    tenantId: 'tenant-1',
    title: 'Annual Sports Day',
    description: 'Inter-house athletics competition featuring track & field events, relay races, and team sports. All students participate. Parents are welcome to attend and cheer.',
    type: EventType.SPORTS,
    startDate: new Date(Date.now() + 3 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 3 * 86400000).toISOString(),
    startTime: '09:00',
    endTime: '17:00',
    location: 'School Sports Ground',
    visibility: [EventVisibility.ALL],
    createdBy: { _id: 'admin-1', firstName: 'Admin', lastName: 'User' },
    isActive: true,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    _id: 'mock-evt-2',
    tenantId: 'tenant-1',
    title: 'Parent-Teacher Conference',
    description: 'Quarterly parent-teacher meeting to discuss student progress, academic performance, and areas for improvement. Individual time slots will be assigned.',
    type: EventType.MEETING,
    startDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    startTime: '14:00',
    endTime: '18:00',
    location: 'School Auditorium',
    visibility: [EventVisibility.ALL],
    createdBy: { _id: 'admin-1', firstName: 'Admin', lastName: 'User' },
    isActive: true,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    _id: 'mock-evt-3',
    tenantId: 'tenant-1',
    title: 'Science Fair Exhibition',
    description: 'Students showcase their science projects and experiments. Judges will evaluate projects for creativity, scientific method, and presentation. Prizes for top 3 in each category.',
    type: EventType.ACADEMIC,
    startDate: new Date(Date.now() + 12 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 12 * 86400000).toISOString(),
    startTime: '10:00',
    endTime: '15:00',
    location: 'Science Lab & Main Hall',
    visibility: [EventVisibility.STUDENTS, EventVisibility.TEACHERS],
    classIds: [
      { _id: 'c1', name: 'Class 8A', grade: '8' },
      { _id: 'c2', name: 'Class 9A', grade: '9' },
      { _id: 'c3', name: 'Class 10A', grade: '10' },
    ],
    createdBy: { _id: 'admin-1', firstName: 'Admin', lastName: 'User' },
    isActive: true,
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    _id: 'mock-evt-4',
    tenantId: 'tenant-1',
    title: 'Mid-Term Examinations',
    description: 'Mid-term examinations for all grades. Exam schedule has been shared with class teachers. Students should bring their own stationery.',
    type: EventType.EXAM,
    startDate: new Date(Date.now() + 18 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 25 * 86400000).toISOString(),
    startTime: '08:30',
    endTime: '12:30',
    location: 'Respective Classrooms',
    visibility: [EventVisibility.ALL],
    createdBy: { _id: 'admin-1', firstName: 'Admin', lastName: 'User' },
    isActive: true,
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    _id: 'mock-evt-5',
    tenantId: 'tenant-1',
    title: 'Cultural Fest — "Harmony"',
    description: 'Annual cultural festival featuring dance performances, drama, music, art exhibitions, and food stalls. Theme this year: "Unity in Diversity".',
    type: EventType.CULTURAL,
    startDate: new Date(Date.now() + 30 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 31 * 86400000).toISOString(),
    startTime: '09:00',
    endTime: '20:00',
    location: 'School Campus',
    visibility: [EventVisibility.ALL],
    createdBy: { _id: 'admin-1', firstName: 'Admin', lastName: 'User' },
    isActive: true,
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    _id: 'mock-evt-6',
    tenantId: 'tenant-1',
    title: 'Staff Meeting — Curriculum Review',
    description: 'Monthly staff meeting to review curriculum progress, discuss upcoming changes, and plan for next term. All teaching staff must attend.',
    type: EventType.MEETING,
    startDate: new Date(Date.now() + 5 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 5 * 86400000).toISOString(),
    startTime: '15:30',
    endTime: '17:00',
    location: 'Conference Room B',
    visibility: [EventVisibility.TEACHERS, EventVisibility.STAFF],
    createdBy: { _id: 'admin-1', firstName: 'Admin', lastName: 'User' },
    isActive: true,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    _id: 'mock-evt-7',
    tenantId: 'tenant-1',
    title: 'Republic Day Celebration',
    description: 'Flag hoisting ceremony followed by patriotic songs, speeches, and march-past. School will close after the event.',
    type: EventType.HOLIDAY,
    startDate: new Date(Date.now() + 10 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 10 * 86400000).toISOString(),
    startTime: '08:00',
    endTime: '11:00',
    location: 'School Main Ground',
    visibility: [EventVisibility.ALL],
    createdBy: { _id: 'admin-1', firstName: 'Admin', lastName: 'User' },
    isActive: true,
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    _id: 'mock-evt-8',
    tenantId: 'tenant-1',
    title: 'Grade 5 Field Trip — Museum Visit',
    description: 'Educational field trip to the National History Museum for Grade 5 students. Permission slips must be submitted by Friday. Bus leaves at 8:00 AM sharp.',
    type: EventType.ACADEMIC,
    startDate: new Date(Date.now() + 15 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 15 * 86400000).toISOString(),
    startTime: '08:00',
    endTime: '14:00',
    location: 'National History Museum',
    visibility: [EventVisibility.STUDENTS, EventVisibility.PARENTS],
    classIds: [
      { _id: 'c4', name: 'Class 5A', grade: '5' },
      { _id: 'c5', name: 'Class 5B', grade: '5' },
    ],
    createdBy: { _id: 'admin-1', firstName: 'Admin', lastName: 'User' },
    isActive: true,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
];

export default function SchoolEventsPage() {
  const { showToast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>('all');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Confirm modal
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; eventId: string }>({
    open: false,
    eventId: '',
  });

  // Form state
  const [formData, setFormData] = useState<CreateEventDto & { eventScope: 'school-wide' | 'class-specific' }>({
    title: '',
    description: '',
    type: EventType.ACADEMIC,
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    location: '',
    visibility: [EventVisibility.ALL],
    eventScope: 'school-wide',
  });

  useEffect(() => {
    loadData();
  }, []);

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [eventsData, classesData] = await Promise.all([
        eventService.getAll(),
        classService.getClasses(),
      ]);
      // Use mock data if API returns empty
      setEvents(eventsData.length > 0 ? eventsData : MOCK_EVENTS);
      setClasses(classesData);
    } catch (err) {
      console.error('Failed to load events, using mock data:', err);
      // Fallback to mock data on error
      setEvents(MOCK_EVENTS);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title.trim() || !formData.startDate) return;

    const submitData: CreateEventDto = {
      title: formData.title,
      description: formData.description,
      type: formData.type,
      startDate: formData.startDate,
      endDate: formData.startDate,
      startTime: formData.startTime,
      endTime: formData.endTime,
      location: formData.location,
      visibility: formData.eventScope === 'school-wide' ? [EventVisibility.ALL] : formData.visibility,
      classIds: formData.eventScope === 'class-specific' ? formData.classIds : undefined,
    };

    try {
      setSubmitting(true);
      if (editingEvent) {
        await eventService.update(editingEvent._id, submitData);
        showToast('success', 'Event updated successfully');
      } else {
        await eventService.create(submitData);
        showToast('success', 'Event created successfully');
      }
      await loadData();
      resetForm();
      setShowForm(false);
      setEditingEvent(null);
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to save event');
    } finally {
      setSubmitting(false);
    }
  }

  function handleDeleteClick(id: string) {
    setOpenMenuId(null);
    setConfirmModal({ open: true, eventId: id });
  }

  async function handleDeleteConfirm() {
    try {
      await eventService.delete(confirmModal.eventId);
      showToast('success', 'Event deleted successfully');
      await loadData();
      setSelectedEvent(null);
      setShowDetailModal(false);
    } catch (err) {
      showToast('error', 'Failed to delete event');
      console.error(err);
    } finally {
      setConfirmModal({ open: false, eventId: '' });
    }
  }

  function handleEdit(event: Event) {
    setOpenMenuId(null);
    setEditingEvent(event);
    const isSchoolWide = event.visibility.includes(EventVisibility.ALL);
    setFormData({
      title: event.title,
      description: event.description,
      type: event.type,
      startDate: event.startDate.split('T')[0] ?? '',
      endDate: event.endDate.split('T')[0] ?? '',
      startTime: event.startTime || '',
      endTime: event.endTime || '',
      location: event.location || '',
      visibility: event.visibility,
      classIds: event.classIds?.map((c) => c._id),
      eventScope: isSchoolWide ? 'school-wide' : 'class-specific',
    });
    setShowForm(true);
    setSelectedEvent(null);
    setShowDetailModal(false);
  }

  function handleView(event: Event) {
    setOpenMenuId(null);
    setSelectedEvent(event);
    setShowDetailModal(true);
  }

  function resetForm() {
    setFormData({
      title: '',
      description: '',
      type: EventType.ACADEMIC,
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      location: '',
      visibility: [EventVisibility.ALL],
      eventScope: 'school-wide',
    });
    setEditingEvent(null);
  }

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

  const upcomingEvents = events.filter((e) => new Date(e.startDate) >= new Date());

  const thisMonthEvents = events.filter((e) => {
    const start = new Date(e.startDate);
    const now = new Date();
    return start.getMonth() === now.getMonth() && start.getFullYear() === now.getFullYear();
  });

  // Filter events by scope
  const filteredEvents = useMemo(() => {
    let filtered = upcomingEvents;
    if (scopeFilter === 'school-wide') {
      filtered = filtered.filter((e) => e.visibility.includes(EventVisibility.ALL));
    } else if (scopeFilter === 'class-specific') {
      filtered = filtered.filter((e) => !e.visibility.includes(EventVisibility.ALL));
    }
    return filtered.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [upcomingEvents, scopeFilter]);

  function getEventScope(event: Event): string {
    if (event.visibility.includes(EventVisibility.ALL)) return 'All Classes';
    if (event.classIds && event.classIds.length > 0) {
      const names = event.classIds.map((c) => c.name);
      return names.length > 3 ? `${names.slice(0, 3).join(', ')} +${names.length - 3} more` : names.join(', ');
    }
    return 'Selected Groups';
  }

  const stats = useMemo(() => ({
    total: events.length,
    upcoming: upcomingEvents.length,
    thisMonth: thisMonthEvents.length,
  }), [events, upcomingEvents, thisMonthEvents]);

  const inputClass = 'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] hover:border-slate-300 transition-all';

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
      {/* Error Banner */}
      {error && (
        <div className="bg-white rounded-xl border border-red-200 px-4 py-3 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 flex-1">{error}</p>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-end">
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Event
        </button>
      </div>

      {/* 3 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SchoolStatCard
          icon={<CalendarDays className="w-5 h-5" />}
          color="blue"
          label="Total Events"
          value={stats.total}
        />
        <SchoolStatCard
          icon={<CalendarCheck className="w-5 h-5" />}
          color="green"
          label="Upcoming Events"
          value={stats.upcoming}
        />
        <SchoolStatCard
          icon={<Star className="w-5 h-5" />}
          color="purple"
          label="This Month"
          value={stats.thisMonth}
        />
      </div>

      {/* Upcoming Events List */}
      <div className="bg-white rounded-xl border border-slate-200">
        {/* Section header with filter buttons */}
        <div className="p-5 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Upcoming Events</h2>
            <div className="flex gap-2">
              {([
                { key: 'all' as ScopeFilter, label: 'All Events' },
                { key: 'school-wide' as ScopeFilter, label: 'School-wide' },
                { key: 'class-specific' as ScopeFilter, label: 'Class-specific' },
              ]).map((btn) => (
                <button
                  key={btn.key}
                  onClick={() => setScopeFilter(btn.key)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors border ${
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

        {/* Event list */}
        <div ref={menuRef}>
          {filteredEvents.length === 0 ? (
            <div className="py-16 text-center">
              <Calendar className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 mb-4">No events found</p>
              <button
                onClick={() => { resetForm(); setShowForm(true); }}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create First Event
              </button>
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
              const isSchoolWide = event.visibility.includes(EventVisibility.ALL);

              return (
                <div key={event._id}>
                  <div
                    className="flex items-center gap-4 p-4 px-5 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => handleView(event)}
                  >
                    {/* Date badge */}
                    <div className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${colorClass}`}>
                      <span className="text-[10px] font-bold tracking-wider leading-none">{month}</span>
                      <span className="text-2xl font-bold leading-tight">{day}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-semibold text-slate-900 truncate">{event.title}</h3>
                      </div>
                      <p className="text-sm text-slate-500 mb-1.5">
                        {isSchoolWide ? 'School-wide Event' : 'Class-specific Event'}
                        {timeRange && ` \u2022 ${timeRange}`}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${typeColors[event.type]}`}>
                          {typeLabels[event.type]}
                        </span>
                        <span className="text-xs text-slate-400">{getEventScope(event)}</span>
                      </div>
                    </div>

                    {/* Three-dot menu */}
                    <div className="relative flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === event._id ? null : event._id);
                        }}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      {openMenuId === event._id && (
                        <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 w-40 z-20">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleView(event); }}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <Eye className="w-4 h-4" /> View
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEdit(event); }}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <Edit className="w-4 h-4" /> Edit
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteClick(event._id); }}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  {index < filteredEvents.length - 1 && (
                    <div className="border-b border-slate-100 mx-5" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Create/Edit Event Modal */}
      <FormModal
        open={showForm}
        onClose={() => { setShowForm(false); resetForm(); }}
        title={editingEvent ? 'Edit Event' : 'Create New Event'}
        size="lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => { setShowForm(false); resetForm(); }}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="event-form"
              disabled={submitting}
              className="px-6 py-2 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              ) : (
                editingEvent ? 'Update Event' : 'Create Event'
              )}
            </button>
          </>
        }
      >
        <form id="event-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Event Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              className={inputClass}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter event title..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Event Type</label>
              <select
                className={`${inputClass} cursor-pointer`}
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as EventType })}
              >
                {Object.entries(typeLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Event Scope</label>
              <select
                className={`${inputClass} cursor-pointer`}
                value={formData.eventScope}
                onChange={(e) => {
                  const scope = e.target.value as 'school-wide' | 'class-specific';
                  setFormData({
                    ...formData,
                    eventScope: scope,
                    visibility: scope === 'school-wide' ? [EventVisibility.ALL] : [],
                    classIds: scope === 'class-specific' ? [] : undefined,
                  });
                }}
              >
                <option value="school-wide">School-wide Event</option>
                <option value="class-specific">Class-specific</option>
              </select>
            </div>
          </div>

          {/* Class selection for class-specific scope */}
          {formData.eventScope === 'class-specific' && classes.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Select Classes</label>
              <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-1">
                {classes.map((cls) => (
                  <label
                    key={cls._id}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={formData.classIds?.includes(cls._id) || false}
                      onChange={(e) => {
                        const current = formData.classIds || [];
                        setFormData({
                          ...formData,
                          classIds: e.target.checked
                            ? [...current, cls._id]
                            : current.filter((id) => id !== cls._id),
                        });
                      }}
                      className="w-4 h-4 text-[#824ef2] border-slate-300 rounded focus:ring-[#824ef2]/50"
                    />
                    <span className="text-sm text-slate-700">{cls.name} (Grade {cls.grade})</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea
              className={`${inputClass} resize-none`}
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the event..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Event Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                className={inputClass}
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value, endDate: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Time</label>
              <input
                type="time"
                className={inputClass}
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Location</label>
            <input
              type="text"
              className={inputClass}
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Enter location..."
            />
          </div>
        </form>
      </FormModal>

      {/* View Event Detail Modal */}
      <FormModal
        open={showDetailModal && !!selectedEvent}
        onClose={() => { setSelectedEvent(null); setShowDetailModal(false); }}
        title={selectedEvent?.title || ''}
        size="lg"
        footer={
          selectedEvent ? (
            <>
              <button
                onClick={() => handleEdit(selectedEvent)}
                className="px-4 py-2 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors flex items-center gap-2"
              >
                <Edit className="w-4 h-4" /> Edit
              </button>
              <button
                onClick={() => handleDeleteClick(selectedEvent._id)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
              <button
                onClick={() => { setSelectedEvent(null); setShowDetailModal(false); }}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
            </>
          ) : undefined
        }
      >
        {selectedEvent && (
          <div className="space-y-5">
            {/* Type + Scope */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex text-xs px-2.5 py-1 rounded-full font-medium ${typeColors[selectedEvent.type]}`}>
                {typeLabels[selectedEvent.type]}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium bg-slate-100 text-slate-600">
                <Users className="w-3 h-3" />
                {getEventScope(selectedEvent)}
              </span>
            </div>

            {/* Date & Time */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-slate-600" /> Date & Time
              </h4>
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
            </div>

            {/* Location */}
            {selectedEvent.location && (
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-600" /> Location
                </h4>
                <p className="text-sm text-slate-700">{selectedEvent.location}</p>
              </div>
            )}

            {/* Description */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Description</h4>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{selectedEvent.description}</p>
              </div>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-200">
              <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-medium text-[10px]">
                {selectedEvent.createdBy?.firstName?.[0]}{selectedEvent.createdBy?.lastName?.[0]}
              </div>
              <span>
                Created by{' '}
                <span className="font-medium text-slate-700">
                  {selectedEvent.createdBy?.firstName} {selectedEvent.createdBy?.lastName}
                </span>
                {' on '}
                {new Date(selectedEvent.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
        )}
      </FormModal>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        open={confirmModal.open}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone."
        confirmLabel="Delete"
        confirmColor="red"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmModal({ open: false, eventId: '' })}
      />
    </section>
  );
}
