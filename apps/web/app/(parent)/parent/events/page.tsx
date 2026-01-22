'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@repo/ui/button';
import {
  eventService,
  Event,
  EventType,
  EventVisibility,
} from '../../../../lib/services/event.service';
import { GlassCard, Icon3D, SlideSheet, SheetSection, SheetDetailRow } from '@/components/ui';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  Sparkles,
  CalendarDays,
} from 'lucide-react';

export default function ParentEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    loadEvents();
  }, [currentMonth]);

  async function loadEvents() {
    try {
      setLoading(true);
      const data = await eventService.getCalendarEvents(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        EventVisibility.PARENTS,
      );
      setEvents(data);
    } catch (err) {
      setError('Failed to load events');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const typeColors: Record<EventType, string> = {
    [EventType.ACADEMIC]: 'bg-blue-500',
    [EventType.SPORTS]: 'bg-green-500',
    [EventType.CULTURAL]: 'bg-purple-500',
    [EventType.HOLIDAY]: 'bg-yellow-500',
    [EventType.MEETING]: 'bg-gray-500',
    [EventType.EXAM]: 'bg-red-500',
    [EventType.OTHER]: 'bg-indigo-500',
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

  // Get upcoming events (next 7 days)
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingEvents = events.filter((e) => {
    const startDate = new Date(e.startDate);
    return startDate >= today && startDate <= nextWeek;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-fuchsia-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-4"
      >
        <Icon3D bgColor="bg-fuchsia-500" size="lg">
          <CalendarDays className="w-6 h-6" />
        </Icon3D>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            School Events
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="w-5 h-5 text-fuchsia-500" />
            </motion.span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Stay updated with school events
          </p>
        </div>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700"
        >
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">
            Dismiss
          </button>
        </motion.div>
      )}

      {/* Upcoming Events Alert */}
      {upcomingEvents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <GlassCard className="p-4 bg-gray-50 border border-fuchsia-200">
            <div className="flex items-center gap-2 mb-3">
              <Icon3D bgColor="bg-fuchsia-500" size="sm">
                <Clock className="w-3.5 h-3.5" />
              </Icon3D>
              <h3 className="font-semibold text-fuchsia-800">
                Upcoming This Week ({upcomingEvents.length})
              </h3>
            </div>
            <div className="space-y-2">
              {upcomingEvents.slice(0, 3).map((event, index) => (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between text-sm cursor-pointer hover:bg-fuchsia-100/50 p-3 rounded-lg transition-all border border-fuchsia-100"
                  onClick={() => setSelectedEvent(event)}
                >
                  <span className="font-medium text-gray-900">{event.title}</span>
                  <span className="text-gray-600">
                    {new Date(event.startDate).toLocaleDateString()}
                  </span>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Month Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <GlassCard className="bg-white/90 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={previousMonth}
              className="p-2 hover:bg-fuchsia-50 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </motion.button>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-fuchsia-500" />
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h2>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={nextMonth}
              className="p-2 hover:bg-fuchsia-50 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </motion.button>
          </div>
        </GlassCard>
      </motion.div>

      {/* Events List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <GlassCard className="bg-white/90">
          {events.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-6xl mb-4"
              >
                <CalendarDays className="w-16 h-16 mx-auto text-gray-300" />
              </motion.div>
              <p className="text-lg font-medium">No events this month</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {events.map((event, index) => (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 hover:bg-fuchsia-50 cursor-pointer transition-all group"
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <Icon3D bgColor="bg-gray-500" size="md">
                        <CalendarDays className="w-4 h-4" />
                      </Icon3D>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-semibold text-gray-900 group-hover:text-fuchsia-700 transition-colors">
                            {event.title}
                          </span>
                          <span className={`text-xs px-2.5 py-1 rounded-lg ${typeColors[event.type]} text-white font-medium`}>
                            {typeLabels[event.type]}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {event.description}
                        </p>
                        {event.location && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-semibold text-gray-900">
                        {new Date(event.startDate).toLocaleDateString()}
                      </div>
                      {event.startTime && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <Clock className="w-3.5 h-3.5" />
                          {event.startTime}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* View Event Sheet */}
      <SlideSheet
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent?.title || ''}
        subtitle={selectedEvent ? typeLabels[selectedEvent.type] : ''}
        size="md"
        footer={
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setSelectedEvent(null)}>
              Close
            </Button>
          </div>
        }
      >
        {selectedEvent && (
          <div className="space-y-6">
            <SheetSection title="Event Details" icon={<CalendarDays className="w-4 h-4" />}>
              <div className="space-y-3">
                <SheetDetailRow
                  label="Start Date"
                  value={
                    <span>
                      {new Date(selectedEvent.startDate).toLocaleDateString()}
                      {selectedEvent.startTime && <span className="text-xs text-gray-500 ml-2">{selectedEvent.startTime}</span>}
                    </span>
                  }
                />
                <SheetDetailRow
                  label="End Date"
                  value={
                    <span>
                      {new Date(selectedEvent.endDate).toLocaleDateString()}
                      {selectedEvent.endTime && <span className="text-xs text-gray-500 ml-2">{selectedEvent.endTime}</span>}
                    </span>
                  }
                />
                {selectedEvent.location && (
                  <SheetDetailRow
                    label="Location"
                    value={selectedEvent.location}
                  />
                )}
              </div>
            </SheetSection>

            <SheetSection title="Description">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {selectedEvent.description}
                </p>
              </div>
            </SheetSection>
          </div>
        )}
      </SlideSheet>
    </div>
  );
}
