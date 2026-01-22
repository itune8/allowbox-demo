'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@repo/ui/button';
import { GlassCard, AnimatedStatCard, Icon3D, SlideSheet } from '@/components/ui';
import {
  eventService,
  Event,
  EventType,
  EventVisibility,
  CreateEventDto,
} from '../../../../lib/services/event.service';
import { classService, Class } from '../../../../lib/services/class.service';
import { Calendar, Clock, MapPin, Sparkles, AlertCircle } from 'lucide-react';

export default function TeacherEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Form state
  const [formData, setFormData] = useState<CreateEventDto>({
    title: '',
    description: '',
    type: EventType.ACADEMIC,
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    location: '',
    visibility: [EventVisibility.PARENTS],
  });

  useEffect(() => {
    loadData();
  }, [currentMonth]);

  async function loadData() {
    try {
      setLoading(true);
      const [eventsData, classesData] = await Promise.all([
        eventService.getCalendarEvents(
          currentMonth.getFullYear(),
          currentMonth.getMonth() + 1,
          EventVisibility.TEACHERS,
        ),
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
      await eventService.create(formData);
      await loadData();
      resetForm();
      setShowForm(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
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
      visibility: [EventVisibility.PARENTS],
    });
  }

  const typeColors: Record<EventType, string> = {
    [EventType.ACADEMIC]: 'bg-blue-100 text-blue-700',
    [EventType.SPORTS]: 'bg-green-100 text-green-700',
    [EventType.CULTURAL]: 'bg-purple-100 text-purple-700',
    [EventType.HOLIDAY]: 'bg-yellow-100 text-yellow-700',
    [EventType.MEETING]: 'bg-gray-100 text-gray-700',
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

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  function previousMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  }

  function nextMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-pink-200 border-t-fuchsia-600 rounded-full mx-auto"
          />
          <div className="text-gray-500">Loading events...</div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4 sm:space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              Events
              <Icon3D bgColor="bg-gray-500" size="sm">
                <Sparkles className="w-3.5 h-3.5" />
              </Icon3D>
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              View and create class events
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={() => setShowForm(true)} className="text-xs sm:text-sm">
              + <span className="hidden sm:inline">Create </span>Event
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="ml-2 underline hover:no-underline">
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Month Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <GlassCard className="p-3 sm:p-4 bg-gray-50 border-pink-100" hover={false}>
          <div className="flex items-center justify-between">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={previousMonth}
              className="p-1.5 sm:p-2 hover:bg-white/50 rounded-lg transition-colors active:scale-95 touch-manipulation"
            >
              <svg width="18" height="18" className="sm:w-5 sm:h-5 text-fuchsia-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </motion.button>
            <motion.h2
              key={`${currentMonth.getMonth()}-${currentMonth.getFullYear()}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-fuchsia-600" />
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </motion.h2>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={nextMonth}
              className="p-1.5 sm:p-2 hover:bg-white/50 rounded-lg transition-colors active:scale-95 touch-manipulation"
            >
              <svg width="18" height="18" className="sm:w-5 sm:h-5 text-fuchsia-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </motion.button>
          </div>
        </GlassCard>
      </motion.div>

      {/* Events List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <GlassCard className="p-0 bg-white/90" hover={false}>
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-fuchsia-600" />
              Class Events
            </h3>
          </div>
          {events.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 text-center text-gray-500"
            >
              <div className="text-4xl mb-3">📅</div>
              <p>No events this month.</p>
            </motion.div>
          ) : (
            <div className="divide-y divide-gray-200">
              <AnimatePresence>
                {events.map((event, index) => (
                  <motion.div
                    key={event._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ backgroundColor: 'rgba(253, 232, 243, 0.5)' }}
                    className="p-4 cursor-pointer transition-all group"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded ${typeColors[event.type]}`}>
                            {typeLabels[event.type]}
                          </span>
                          <span className="font-medium text-gray-900">
                            {event.title}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-1">
                          {event.description}
                        </p>
                        {event.location && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-1 mt-1 text-xs text-gray-500"
                          >
                            <MapPin className="w-3 h-3" />
                            <span>{event.location}</span>
                          </motion.div>
                        )}
                      </div>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-right flex-shrink-0 ml-4"
                      >
                        <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-fuchsia-600" />
                          {new Date(event.startDate).toLocaleDateString()}
                        </div>
                        {event.startTime && (
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-1 justify-end">
                            <Clock className="w-3 h-3" />
                            {event.startTime}
                          </div>
                        )}
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* Create Event Modal */}
      <SlideSheet
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Create Class Event"
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} form="event-form">
              {submitting ? 'Creating...' : 'Create Event'}
            </Button>
          </div>
        }
      >
        <form id="event-form" onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Event title..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Event Type
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900"
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
                  <label className="block text-sm text-gray-700 mb-1">
                    Class (Optional)
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900"
                    value={formData.classIds?.[0] || ''}
                    onChange={(e) => setFormData({ ...formData, classIds: e.target.value ? [e.target.value] : [] })}
                  >
                    <option value="">All Classes</option>
                    {classes.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} ({c.grade})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Event location..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Event description..."
                  required
                />
              </div>
            </form>
      </SlideSheet>

      {/* View Event Modal */}
      <SlideSheet
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent?.title || ''}
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setSelectedEvent(null)}>
              Close
            </Button>
          </div>
        }
      >
        {selectedEvent && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <span className={`text-xs px-2 py-0.5 rounded ${typeColors[selectedEvent.type]}`}>
                {typeLabels[selectedEvent.type]}
              </span>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 text-gray-600">
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
                <div className="text-gray-600">
                  <span className="font-medium">Location:</span> {selectedEvent.location}
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {selectedEvent.description}
                </p>
              </div>

              <div className="text-xs text-gray-500 mt-4">
                Created by {selectedEvent.createdBy?.firstName} {selectedEvent.createdBy?.lastName}
              </div>
            </div>
          </>
        )}
      </SlideSheet>
    </motion.div>
  );
}
