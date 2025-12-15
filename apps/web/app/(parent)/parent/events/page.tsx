'use client';

import { useState, useEffect } from 'react';
import { Button } from '@repo/ui/button';
import {
  eventService,
  Event,
  EventType,
  EventVisibility,
} from '../../../../lib/services/event.service';

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">School Events</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Stay updated with upcoming school events and activities
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Upcoming Events Alert */}
      {upcomingEvents.length > 0 && (
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
          <h3 className="font-medium text-indigo-700 dark:text-indigo-300 mb-2">
            Upcoming This Week ({upcomingEvents.length})
          </h3>
          <div className="space-y-2">
            {upcomingEvents.slice(0, 3).map((event) => (
              <div
                key={event._id}
                className="flex items-center justify-between text-sm cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900/30 p-2 rounded"
                onClick={() => setSelectedEvent(event)}
              >
                <span className="text-gray-900 dark:text-gray-100">{event.title}</span>
                <span className="text-gray-500">
                  {new Date(event.startDate).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Month Navigation */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
        <button
          onClick={previousMonth}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Events List */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
        {events.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-3">📅</div>
            <p>No events this month.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {events.map((event) => (
              <div
                key={event._id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                onClick={() => setSelectedEvent(event)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded ${typeColors[event.type]}`}>
                        {typeLabels[event.type]}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {event.title}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                      {event.description}
                    </p>
                    {event.location && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                        <span>📍</span>
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {new Date(event.startDate).toLocaleDateString()}
                    </div>
                    {event.startTime && (
                      <div className="text-xs text-gray-500">{event.startTime}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {selectedEvent.description}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
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
