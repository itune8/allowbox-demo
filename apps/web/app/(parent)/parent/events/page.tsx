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
import { GlassCard, Icon3D } from '@/components/ui';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  X,
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
    [EventType.ACADEMIC]: 'from-blue-400 to-blue-600',
    [EventType.SPORTS]: 'from-green-400 to-green-600',
    [EventType.CULTURAL]: 'from-purple-400 to-purple-600',
    [EventType.HOLIDAY]: 'from-yellow-400 to-yellow-600',
    [EventType.MEETING]: 'from-gray-400 to-gray-600',
    [EventType.EXAM]: 'from-red-400 to-red-600',
    [EventType.OTHER]: 'from-indigo-400 to-indigo-600',
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
        <Icon3D gradient="from-fuchsia-500 to-pink-500" size="lg">
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
          <GlassCard className="p-4 bg-gradient-to-br from-fuchsia-50 to-pink-50 border border-fuchsia-200">
            <div className="flex items-center gap-2 mb-3">
              <Icon3D gradient="from-fuchsia-500 to-pink-500" size="sm">
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
                  className="p-4 hover:bg-gradient-to-r hover:from-fuchsia-50/50 hover:to-pink-50/50 cursor-pointer transition-all group"
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <Icon3D gradient={typeColors[event.type]} size="md">
                        <CalendarDays className="w-4 h-4" />
                      </Icon3D>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-semibold text-gray-900 group-hover:text-fuchsia-700 transition-colors">
                            {event.title}
                          </span>
                          <span className={`text-xs px-2.5 py-1 rounded-lg bg-gradient-to-r ${typeColors[event.type]} text-white font-medium`}>
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

      {/* View Event Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setSelectedEvent(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-gradient-to-r from-fuchsia-500 to-pink-500 p-4 sm:p-6 rounded-t-2xl">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Icon3D gradient="from-white/20 to-white/5" size="lg">
                      <CalendarDays className="w-6 h-6" />
                    </Icon3D>
                    <div className="text-white">
                      <span className={`inline-block text-xs px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-sm font-medium mb-2`}>
                        {typeLabels[selectedEvent.type]}
                      </span>
                      <h3 className="text-xl font-bold">
                        {selectedEvent.title}
                      </h3>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedEvent(null)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </motion.button>
                </div>
              </div>

              <div className="p-4 sm:p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <GlassCard className="p-4 bg-fuchsia-50/50">
                    <div className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Start
                    </div>
                    <div className="font-semibold text-gray-900">
                      {new Date(selectedEvent.startDate).toLocaleDateString()}
                      {selectedEvent.startTime && <span className="text-sm text-gray-600 ml-2">{selectedEvent.startTime}</span>}
                    </div>
                  </GlassCard>
                  <GlassCard className="p-4 bg-pink-50/50">
                    <div className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      End
                    </div>
                    <div className="font-semibold text-gray-900">
                      {new Date(selectedEvent.endDate).toLocaleDateString()}
                      {selectedEvent.endTime && <span className="text-sm text-gray-600 ml-2">{selectedEvent.endTime}</span>}
                    </div>
                  </GlassCard>
                </div>

                {selectedEvent.location && (
                  <GlassCard className="p-4 bg-white/80">
                    <div className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      Location
                    </div>
                    <div className="font-medium text-gray-900">{selectedEvent.location}</div>
                  </GlassCard>
                )}

                <GlassCard className="p-4 bg-gradient-to-br from-gray-50 to-gray-100/50">
                  <div className="text-xs text-gray-600 mb-2 font-medium">Description</div>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {selectedEvent.description}
                  </p>
                </GlassCard>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                      Close
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
