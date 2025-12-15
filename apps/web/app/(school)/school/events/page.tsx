'use client';

import { useState, useEffect } from 'react';
import { Button } from '@repo/ui/button';
import {
  eventService,
  Event,
  EventType,
  EventVisibility,
  CreateEventDto,
} from '../../../../lib/services/event.service';
import { classService, Class } from '../../../../lib/services/class.service';

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
    [EventType.ACADEMIC]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    [EventType.SPORTS]: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    [EventType.CULTURAL]: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    [EventType.HOLIDAY]: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    [EventType.MEETING]: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    [EventType.EXAM]: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    [EventType.OTHER]: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Events</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage school events and activities
          </p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }}>+ Add Event</Button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800">
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'upcoming'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming ({upcomingEvents.length})
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'all'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('all')}
        >
          All Events ({events.length})
        </button>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayEvents.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 text-center text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-3">📅</div>
            <p>No events yet.</p>
            <p className="text-sm mt-1">Create your first event to get started.</p>
          </div>
        ) : (
          displayEvents.map((event) => (
            <div
              key={event._id}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedEvent(event)}
            >
              <div className="flex items-start justify-between mb-2">
                <span className={`text-xs px-2 py-0.5 rounded ${typeColors[event.type]}`}>
                  {typeLabels[event.type]}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(event.startDate).toLocaleDateString()}
                </span>
              </div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                {event.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {event.description}
              </p>
              {event.location && (
                <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                  <span>📍</span>
                  <span>{event.location}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Event Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={() => { setShowForm(false); resetForm(); }} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 animate-zoom-in">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              {editingEvent ? 'Edit Event' : 'Create Event'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Event title..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Event Type
                  </label>
                  <select
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as EventType })}
                  >
                    {Object.entries(typeLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Event location..."
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                  Description *
                </label>
                <textarea
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Event description..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                  Visibility
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(visibilityLabels).map(([value, label]) => (
                    <label key={value} className="flex items-center gap-1 text-sm">
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
                        className="rounded"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : editingEvent ? 'Update Event' : 'Create Event'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Event Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 animate-fade-in"
            onClick={() => setSelectedEvent(null)}
          />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 animate-zoom-in">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded ${typeColors[selectedEvent.type]}`}>
                    {typeLabels[selectedEvent.type]}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {selectedEvent.title}
                </h3>
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 text-gray-600 dark:text-gray-300">
                <div>
                  <span className="font-medium">Start:</span>{' '}
                  {new Date(selectedEvent.startDate).toLocaleDateString()}
                  {selectedEvent.startTime && ` at ${selectedEvent.startTime}`}
                </div>
                <div>
                  <span className="font-medium">End:</span>{' '}
                  {new Date(selectedEvent.endDate).toLocaleDateString()}
                  {selectedEvent.endTime && ` at ${selectedEvent.endTime}`}
                </div>
              </div>

              {selectedEvent.location && (
                <div className="text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Location:</span> {selectedEvent.location}
                </div>
              )}

              <div className="text-gray-600 dark:text-gray-300">
                <span className="font-medium">Visible to:</span>{' '}
                {selectedEvent.visibility.map((v) => visibilityLabels[v]).join(', ')}
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {selectedEvent.description}
                </p>
              </div>

              <div className="text-xs text-gray-500">
                Created by {selectedEvent.createdBy?.firstName} {selectedEvent.createdBy?.lastName}
                {' on '}
                {new Date(selectedEvent.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div className="flex justify-between gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleEdit(selectedEvent)}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDelete(selectedEvent._id)}
                  className="text-red-600"
                >
                  Delete
                </Button>
              </div>
              <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
