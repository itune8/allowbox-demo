'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@repo/ui/button';
import {
  eventService,
  Event,
  EventType,
  EventVisibility,
  CreateEventDto,
} from '../../../../lib/services/event.service';
import { classService, Class } from '../../../../lib/services/class.service';
import {
  Calendar,
  Plus,
  X,
  Clock,
  MapPin,
  Eye,
  Edit,
  Trash2,
  CalendarCheck,
  CalendarClock,
  Users,
  Type,
  FileText,
  Tag,
  CalendarDays,
  Info,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { SlideSheet, SheetSection, SheetField, SheetDetailRow } from '../../../../components/ui/slide-sheet';

export default function SchoolEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'all'>('upcoming');

  // Form state
  const [formData, setFormData] = useState<CreateEventDto>({
    title: '',
    description: '',
    type: EventType.OTHER,
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    location: '',
    visibility: [EventVisibility.ALL],
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [eventsData, classesData] = await Promise.all([
        eventService.getAll(),
        classService.getClasses(),
      ]);
      setEvents(eventsData);
      setClasses(classesData);
    } catch (err) {
      setError('Failed to load events');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title.trim() || !formData.startDate || !formData.endDate) return;

    try {
      setSubmitting(true);
      if (editingEvent) {
        await eventService.update(editingEvent._id, formData);
      } else {
        await eventService.create(formData);
      }
      await loadData();
      resetForm();
      setShowForm(false);
      setEditingEvent(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save event');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await eventService.delete(id);
      await loadData();
      setSelectedEvent(null);
    } catch (err) {
      console.error(err);
    }
  }

  function handleEdit(event: Event) {
    setEditingEvent(event);
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
    });
    setShowForm(true);
    setSelectedEvent(null);
  }

  function resetForm() {
    setFormData({
      title: '',
      description: '',
      type: EventType.OTHER,
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      location: '',
      visibility: [EventVisibility.ALL],
    });
    setEditingEvent(null);
  }

  const typeColors: Record<EventType, string> = {
    [EventType.ACADEMIC]: 'bg-blue-100 text-blue-700 border-blue-200',
    [EventType.SPORTS]: 'bg-green-100 text-green-700 border-green-200',
    [EventType.CULTURAL]: 'bg-purple-100 text-purple-700 border-purple-200',
    [EventType.HOLIDAY]: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    [EventType.MEETING]: 'bg-gray-100 text-gray-700 border-gray-200',
    [EventType.EXAM]: 'bg-red-100 text-red-700 border-red-200',
    [EventType.OTHER]: 'bg-indigo-100 text-indigo-700 border-indigo-200',
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

  const visibilityLabels: Record<EventVisibility, string> = {
    [EventVisibility.ALL]: 'Everyone',
    [EventVisibility.PARENTS]: 'Parents',
    [EventVisibility.TEACHERS]: 'Teachers',
    [EventVisibility.STUDENTS]: 'Students',
    [EventVisibility.STAFF]: 'Staff',
  };

  const upcomingEvents = events.filter((e) => new Date(e.startDate) >= new Date());
  const displayEvents = activeTab === 'upcoming' ? upcomingEvents : events;

  // Stats
  const stats = useMemo(() => {
    const total = events.length;
    const upcoming = upcomingEvents.length;
    return { total, upcoming };
  }, [events, upcomingEvents]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
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
          <div className="flex-1">
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Events</h1>
            <p className="text-sm text-slate-500">Manage school events and activities</p>
          </div>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-primary hover:bg-primary-dark"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Events</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center">
              <CalendarCheck className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Upcoming Events</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{stats.upcoming}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
              <CalendarClock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-slate-400" />
          <span className="text-sm text-slate-600">View:</span>
          <div className="flex gap-2">
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'upcoming'
                  ? 'bg-primary text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
              onClick={() => setActiveTab('upcoming')}
            >
              Upcoming ({upcomingEvents.length})
            </button>
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
              onClick={() => setActiveTab('all')}
            >
              All Events ({events.length})
            </button>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayEvents.length === 0 ? (
          <div className="col-span-full">
            <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
              <Calendar className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 mb-4">No events found</p>
              <Button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className="bg-primary hover:bg-primary-dark"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Event
              </Button>
            </div>
          </div>
        ) : (
          displayEvents.map((event) => (
            <div
              key={event._id}
              className="bg-white rounded-xl border border-slate-200 p-4 cursor-pointer group hover:border-slate-300 hover:shadow-sm transition-all"
              onClick={() => setSelectedEvent(event)}
            >
              <div className="flex items-start justify-between mb-3">
                <span
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium border ${typeColors[event.type]}`}
                >
                  {typeLabels[event.type]}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(event.startDate).toLocaleDateString()}
                </span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-primary transition-colors">
                {event.title}
              </h3>
              <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                {event.description}
              </p>
              {event.location && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{event.location}</span>
                </div>
              )}
              <div className="flex items-center justify-end mt-3 pt-3 border-t border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEvent(event);
                    }}
                    className="px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(event);
                    }}
                    className="px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Event SlideSheet */}
      <SlideSheet
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          resetForm();
        }}
        title={editingEvent ? 'Edit Event' : 'Create New Event'}
        subtitle={editingEvent ? 'Update event details below' : 'Fill in the details to create a new event'}
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="px-6 py-2.5 rounded-lg text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="event-form"
              disabled={submitting}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark transition-colors flex items-center gap-2 ${
                submitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  {editingEvent ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </>
              )}
            </button>
          </div>
        }
      >
        <form id="event-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Section */}
          <SheetSection
            title="Basic Information"
            icon={<Info className="w-4 h-4" />}
          >
            {/* Title Input */}
            <SheetField label="Event Title" required icon={<Type className="w-4 h-4" />}>
              <input
                type="text"
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter event title..."
                required
              />
            </SheetField>

            <div className="grid grid-cols-2 gap-4">
              {/* Event Type */}
              <SheetField label="Event Type" icon={<Tag className="w-4 h-4" />}>
                <select
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as EventType })}
                >
                  {Object.entries(typeLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </SheetField>

              {/* Location */}
              <SheetField label="Location" icon={<MapPin className="w-4 h-4" />}>
                <input
                  type="text"
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Enter location..."
                />
              </SheetField>
            </div>
          </SheetSection>

          {/* Date & Time Section */}
          <SheetSection
            title="Date & Time"
            icon={<CalendarDays className="w-4 h-4" />}
          >
            <div className="grid grid-cols-2 gap-4">
              {/* Start Date */}
              <SheetField label="Start Date" required icon={<CalendarCheck className="w-4 h-4" />}>
                <input
                  type="date"
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </SheetField>

              {/* End Date */}
              <SheetField label="End Date" required icon={<CalendarClock className="w-4 h-4" />}>
                <input
                  type="date"
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </SheetField>

              {/* Start Time */}
              <SheetField label="Start Time" icon={<Clock className="w-4 h-4" />}>
                <input
                  type="time"
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </SheetField>

              {/* End Time */}
              <SheetField label="End Time" icon={<Clock className="w-4 h-4" />}>
                <input
                  type="time"
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </SheetField>
            </div>
          </SheetSection>

          {/* Description Section */}
          <SheetSection
            title="Description"
            icon={<FileText className="w-4 h-4" />}
          >
            <SheetField label="">
              <textarea
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the event in detail..."
                required
              />
            </SheetField>
          </SheetSection>

          {/* Visibility Section */}
          <SheetSection
            title="Visibility"
            icon={<Eye className="w-4 h-4" />}
          >
            <div className="flex flex-wrap gap-3">
              {Object.entries(visibilityLabels).map(([value, label]) => (
                <label
                  key={value}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg cursor-pointer transition-colors border ${
                    formData.visibility?.includes(value as EventVisibility)
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.visibility?.includes(value as EventVisibility)}
                    onChange={(e) => {
                      const current = formData.visibility || [];
                      if (e.target.checked) {
                        setFormData({ ...formData, visibility: [...current, value as EventVisibility] });
                      } else {
                        setFormData({ ...formData, visibility: current.filter((v) => v !== value) });
                      }
                    }}
                    className="sr-only"
                  />
                  <Users
                    className={`w-4 h-4 ${formData.visibility?.includes(value as EventVisibility) ? 'text-white' : 'text-slate-400'}`}
                  />
                  <span className="text-sm font-medium">{label}</span>
                  {formData.visibility?.includes(value as EventVisibility) && (
                    <CheckCircle className="w-4 h-4" />
                  )}
                </label>
              ))}
            </div>
          </SheetSection>
        </form>
      </SlideSheet>

      {/* View Event SlideSheet */}
      <SlideSheet
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent?.title || ''}
        subtitle={selectedEvent ? typeLabels[selectedEvent.type] : undefined}
        size="lg"
        footer={
          selectedEvent ? (
            <div className="flex justify-between items-center w-full">
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(selectedEvent)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark transition-colors flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(selectedEvent._id)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-5 py-2 rounded-lg text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
            </div>
          ) : undefined
        }
      >
        {selectedEvent && (
          <div className="space-y-6">
            {/* Date & Time Section */}
            <SheetSection
              title="Date & Time"
              icon={<CalendarDays className="w-4 h-4" />}
            >
              <div className="grid grid-cols-2 gap-4">
                <SheetDetailRow
                  label="Start"
                  icon={<CalendarCheck className="w-5 h-5 text-emerald-600" />}
                  iconBgColor="bg-emerald-100"
                >
                  <p className="text-sm font-semibold text-slate-900">
                    {new Date(selectedEvent.startDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                  {selectedEvent.startTime && (
                    <p className="text-xs text-slate-600 mt-0.5">at {selectedEvent.startTime}</p>
                  )}
                </SheetDetailRow>

                <SheetDetailRow
                  label="End"
                  icon={<CalendarClock className="w-5 h-5 text-amber-600" />}
                  iconBgColor="bg-amber-100"
                >
                  <p className="text-sm font-semibold text-slate-900">
                    {new Date(selectedEvent.endDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                  {selectedEvent.endTime && (
                    <p className="text-xs text-slate-600 mt-0.5">at {selectedEvent.endTime}</p>
                  )}
                </SheetDetailRow>
              </div>
            </SheetSection>

            {/* Location Section */}
            {selectedEvent.location && (
              <SheetSection
                title="Location"
                icon={<MapPin className="w-4 h-4" />}
              >
                <SheetDetailRow
                  icon={<MapPin className="w-5 h-5 text-blue-600" />}
                  iconBgColor="bg-blue-100"
                >
                  <span className="text-sm font-medium text-slate-900">{selectedEvent.location}</span>
                </SheetDetailRow>
              </SheetSection>
            )}

            {/* Visibility Section */}
            <SheetSection
              title="Visible To"
              icon={<Users className="w-4 h-4" />}
            >
              <div className="flex flex-wrap gap-2">
                {selectedEvent.visibility.map((v) => (
                  <span
                    key={v}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    <Users className="w-3 h-3" />
                    {visibilityLabels[v]}
                  </span>
                ))}
              </div>
            </SheetSection>

            {/* Description Section */}
            <SheetSection
              title="Description"
              icon={<FileText className="w-4 h-4" />}
            >
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {selectedEvent.description}
                </p>
              </div>
            </SheetSection>

            {/* Meta Info */}
            <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-200">
              <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-medium text-[10px]">
                {selectedEvent.createdBy?.firstName?.[0]}
                {selectedEvent.createdBy?.lastName?.[0]}
              </div>
              <span>
                Created by{' '}
                <span className="font-medium text-slate-700">
                  {selectedEvent.createdBy?.firstName} {selectedEvent.createdBy?.lastName}
                </span>
                {' on '}
                {new Date(selectedEvent.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        )}
      </SlideSheet>
    </section>
  );
}
