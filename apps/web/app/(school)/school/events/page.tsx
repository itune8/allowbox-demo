'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@repo/ui/button';
import {
  eventService,
  Event,
  EventType,
  EventVisibility,
  CreateEventDto,
} from '../../../../lib/services/event.service';
import { classService, Class } from '../../../../lib/services/class.service';
import { GlassCard, AnimatedStatCard, Icon3D } from '../../../../components/ui';
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
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react';

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
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-3 border-fuchsia-500 border-t-transparent rounded-full"
        />
        <p className="mt-4 text-gray-500">Loading events...</p>
      </div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-strong rounded-xl border border-red-200 px-4 py-3 text-red-700"
          >
            {error}
            <button onClick={() => setError(null)} className="ml-2 underline hover:no-underline">
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Icon3D gradient="from-fuchsia-500 to-pink-500" size="lg">
            <Calendar className="w-6 h-6" />
          </Icon3D>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Events</h1>
            <p className="text-sm text-gray-500">Manage school events and activities</p>
          </div>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button onClick={() => { resetForm(); setShowForm(true); }} className="shadow-lg shadow-fuchsia-500/25">
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        </motion.div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
        <AnimatedStatCard
          title="Total Events"
          value={stats.total}
          icon={<CalendarCheck className="w-5 h-5 text-fuchsia-600" />}
          iconBgColor="bg-fuchsia-50"
          delay={0}
        />
        <AnimatedStatCard
          title="Upcoming Events"
          value={stats.upcoming}
          icon={<CalendarClock className="w-5 h-5 text-violet-600" />}
          iconBgColor="bg-violet-50"
          delay={1}
        />
      </div>

      {/* Tabs */}
      <GlassCard hover={false} className="p-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-600">View:</span>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'upcoming'
                  ? 'bg-fuchsia-100 text-fuchsia-700 border border-fuchsia-200'
                  : 'bg-white/60 text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('upcoming')}
            >
              Upcoming ({upcomingEvents.length})
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'all'
                  ? 'bg-fuchsia-100 text-fuchsia-700 border border-fuchsia-200'
                  : 'bg-white/60 text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('all')}
            >
              All Events ({events.length})
            </motion.button>
          </div>
        </div>
      </GlassCard>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayEvents.length === 0 ? (
          <div className="col-span-full">
            <GlassCard hover={false} className="py-16 text-center text-gray-500 space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <Calendar className="w-16 h-16 mx-auto text-gray-300" />
              </motion.div>
              <p>No events found</p>
              <Button onClick={() => { resetForm(); setShowForm(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Event
              </Button>
            </GlassCard>
          </div>
        ) : (
          displayEvents.map((event, index) => (
            <motion.div
              key={event._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <GlassCard
                hover={true}
                className="p-4 cursor-pointer group"
                onClick={() => setSelectedEvent(event)}
              >
                <div className="flex items-start justify-between mb-3">
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    className={`text-xs px-2.5 py-1 rounded-lg font-medium border ${typeColors[event.type]}`}
                  >
                    {typeLabels[event.type]}
                  </motion.span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(event.startDate).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-fuchsia-600 transition-colors">
                  {event.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {event.description}
                </p>
                {event.location && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{event.location}</span>
                  </div>
                )}
                <div className="flex items-center justify-end mt-3 pt-3 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => { e.stopPropagation(); setSelectedEvent(event); }}
                      className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => { e.stopPropagation(); handleEdit(event); }}
                      className="px-3 py-1.5 text-xs font-medium bg-fuchsia-100 text-fuchsia-700 rounded-lg hover:bg-fuchsia-200 transition-colors flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit
                    </motion.button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))
        )}
      </div>

      {/* Create/Edit Event Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={() => { setShowForm(false); resetForm(); }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.3)',
              }}
            >
              {/* Gradient Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative bg-gradient-to-r from-fuchsia-500 via-purple-500 to-pink-500 px-6 py-5"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
                <div className="absolute -bottom-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                <div className="relative flex items-center gap-4">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                    className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg"
                    style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.3)' }}
                  >
                    {editingEvent ? (
                      <Edit className="w-6 h-6 text-white" />
                    ) : (
                      <Sparkles className="w-6 h-6 text-white" />
                    )}
                  </motion.div>
                  <div>
                    <motion.h3
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 }}
                      className="text-xl font-bold text-white"
                    >
                      {editingEvent ? 'Edit Event' : 'Create New Event'}
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-sm text-white/80"
                    >
                      {editingEvent ? 'Update event details below' : 'Fill in the details to create a new event'}
                    </motion.p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => { setShowForm(false); resetForm(); }}
                  className="absolute top-4 right-4 p-2 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-all backdrop-blur-sm"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </motion.div>

              {/* Form Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Icon3D gradient="from-blue-500 to-cyan-500" size="sm">
                        <Info className="w-3.5 h-3.5" />
                      </Icon3D>
                      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Basic Information</h4>
                    </div>
                    <div
                      className="p-4 rounded-2xl space-y-4"
                      style={{
                        background: 'linear-gradient(135deg, rgba(249,250,251,0.8) 0%, rgba(243,244,246,0.6) 100%)',
                        border: '1px solid rgba(229,231,235,0.5)',
                      }}
                    >
                      {/* Title Input */}
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                          <Type className="w-4 h-4 text-fuchsia-500" />
                          Event Title <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            className="w-full border-0 rounded-xl pl-11 pr-4 py-3 text-sm transition-all duration-200 focus:ring-2 focus:ring-fuchsia-500/50"
                            style={{
                              background: 'rgba(255,255,255,0.9)',
                              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.05)',
                            }}
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Enter event title..."
                            required
                          />
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Event Type */}
                        <div>
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <Tag className="w-4 h-4 text-purple-500" />
                            Event Type
                          </label>
                          <div className="relative">
                            <select
                              className="w-full border-0 rounded-xl pl-11 pr-4 py-3 text-sm appearance-none cursor-pointer transition-all duration-200 focus:ring-2 focus:ring-fuchsia-500/50"
                              style={{
                                background: 'rgba(255,255,255,0.9)',
                                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.05)',
                              }}
                              value={formData.type}
                              onChange={(e) => setFormData({ ...formData, type: e.target.value as EventType })}
                            >
                              {Object.entries(typeLabels).map(([value, label]) => (
                                <option key={value} value={value}>
                                  {label}
                                </option>
                              ))}
                            </select>
                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          </div>
                        </div>

                        {/* Location */}
                        <div>
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <MapPin className="w-4 h-4 text-emerald-500" />
                            Location
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              className="w-full border-0 rounded-xl pl-11 pr-4 py-3 text-sm transition-all duration-200 focus:ring-2 focus:ring-fuchsia-500/50"
                              style={{
                                background: 'rgba(255,255,255,0.9)',
                                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.05)',
                              }}
                              value={formData.location}
                              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                              placeholder="Enter location..."
                            />
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Date & Time Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Icon3D gradient="from-violet-500 to-purple-500" size="sm">
                        <CalendarDays className="w-3.5 h-3.5" />
                      </Icon3D>
                      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Date & Time</h4>
                    </div>
                    <div
                      className="p-4 rounded-2xl"
                      style={{
                        background: 'linear-gradient(135deg, rgba(249,250,251,0.8) 0%, rgba(243,244,246,0.6) 100%)',
                        border: '1px solid rgba(229,231,235,0.5)',
                      }}
                    >
                      <div className="grid grid-cols-2 gap-4">
                        {/* Start Date */}
                        <div>
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <CalendarCheck className="w-4 h-4 text-green-500" />
                            Start Date <span className="text-red-400">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="date"
                              className="w-full border-0 rounded-xl pl-11 pr-4 py-3 text-sm transition-all duration-200 focus:ring-2 focus:ring-fuchsia-500/50"
                              style={{
                                background: 'rgba(255,255,255,0.9)',
                                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.05)',
                              }}
                              value={formData.startDate}
                              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                              required
                            />
                            <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          </div>
                        </div>

                        {/* End Date */}
                        <div>
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <CalendarClock className="w-4 h-4 text-orange-500" />
                            End Date <span className="text-red-400">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="date"
                              className="w-full border-0 rounded-xl pl-11 pr-4 py-3 text-sm transition-all duration-200 focus:ring-2 focus:ring-fuchsia-500/50"
                              style={{
                                background: 'rgba(255,255,255,0.9)',
                                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.05)',
                              }}
                              value={formData.endDate}
                              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                              required
                            />
                            <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          </div>
                        </div>

                        {/* Start Time */}
                        <div>
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <Clock className="w-4 h-4 text-blue-500" />
                            Start Time
                          </label>
                          <div className="relative">
                            <input
                              type="time"
                              className="w-full border-0 rounded-xl pl-11 pr-4 py-3 text-sm transition-all duration-200 focus:ring-2 focus:ring-fuchsia-500/50"
                              style={{
                                background: 'rgba(255,255,255,0.9)',
                                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.05)',
                              }}
                              value={formData.startTime}
                              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                            />
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          </div>
                        </div>

                        {/* End Time */}
                        <div>
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <Clock className="w-4 h-4 text-indigo-500" />
                            End Time
                          </label>
                          <div className="relative">
                            <input
                              type="time"
                              className="w-full border-0 rounded-xl pl-11 pr-4 py-3 text-sm transition-all duration-200 focus:ring-2 focus:ring-fuchsia-500/50"
                              style={{
                                background: 'rgba(255,255,255,0.9)',
                                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.05)',
                              }}
                              value={formData.endTime}
                              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                            />
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Description Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Icon3D gradient="from-amber-500 to-orange-500" size="sm">
                        <FileText className="w-3.5 h-3.5" />
                      </Icon3D>
                      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Description</h4>
                    </div>
                    <div
                      className="p-4 rounded-2xl"
                      style={{
                        background: 'linear-gradient(135deg, rgba(249,250,251,0.8) 0%, rgba(243,244,246,0.6) 100%)',
                        border: '1px solid rgba(229,231,235,0.5)',
                      }}
                    >
                      <div className="relative">
                        <textarea
                          className="w-full border-0 rounded-xl pl-11 pr-4 py-3 text-sm transition-all duration-200 focus:ring-2 focus:ring-fuchsia-500/50 resize-none"
                          style={{
                            background: 'rgba(255,255,255,0.9)',
                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.05)',
                          }}
                          rows={4}
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Describe the event in detail..."
                          required
                        />
                        <FileText className="absolute left-4 top-4 w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </motion.div>

                  {/* Visibility Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Icon3D gradient="from-emerald-500 to-teal-500" size="sm">
                        <Eye className="w-3.5 h-3.5" />
                      </Icon3D>
                      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Visibility</h4>
                    </div>
                    <div
                      className="p-4 rounded-2xl"
                      style={{
                        background: 'linear-gradient(135deg, rgba(249,250,251,0.8) 0%, rgba(243,244,246,0.6) 100%)',
                        border: '1px solid rgba(229,231,235,0.5)',
                      }}
                    >
                      <div className="flex flex-wrap gap-3">
                        {Object.entries(visibilityLabels).map(([value, label]) => (
                          <motion.label
                            key={value}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-200 ${
                              formData.visibility?.includes(value as EventVisibility)
                                ? 'bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white shadow-lg shadow-fuchsia-500/25'
                                : 'bg-white/90 text-gray-700 hover:bg-white border border-gray-200'
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
                            <Users className={`w-4 h-4 ${formData.visibility?.includes(value as EventVisibility) ? 'text-white' : 'text-gray-400'}`} />
                            <span className="text-sm font-medium">{label}</span>
                            {formData.visibility?.includes(value as EventVisibility) && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="ml-1"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </motion.div>
                            )}
                          </motion.label>
                        ))}
                      </div>
                    </div>
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    className="flex justify-end gap-3 pt-4 border-t border-gray-200/50"
                  >
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setShowForm(false); resetForm(); }}
                      className="px-6 py-2.5 rounded-xl text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-100"
                      style={{
                        background: 'rgba(255,255,255,0.9)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        border: '1px solid rgba(229,231,235,0.5)',
                      }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      disabled={submitting}
                      whileHover={{ scale: submitting ? 1 : 1.02, y: submitting ? 0 : -2 }}
                      whileTap={{ scale: submitting ? 1 : 0.98 }}
                      className={`px-6 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-200 flex items-center gap-2 ${
                        submitting ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                      style={{
                        background: 'linear-gradient(135deg, #d946ef 0%, #a855f7 100%)',
                        boxShadow: '0 4px 14px rgba(217, 70, 239, 0.4)',
                      }}
                    >
                      {submitting ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                          />
                          Saving...
                        </>
                      ) : (
                        <>
                          {editingEvent ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                          {editingEvent ? 'Update Event' : 'Create Event'}
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Event Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={() => setSelectedEvent(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.3)',
              }}
            >
              {/* Gradient Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 px-6 py-5"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
                <div className="absolute -bottom-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                <div className="relative flex items-center gap-4">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                    className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg"
                    style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.3)' }}
                  >
                    <Calendar className="w-6 h-6 text-white" />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 }}
                      className="flex items-center gap-2 mb-1"
                    >
                      <span
                        className={`text-xs px-2.5 py-1 rounded-lg font-medium border backdrop-blur-sm ${typeColors[selectedEvent.type]}`}
                      >
                        {typeLabels[selectedEvent.type]}
                      </span>
                    </motion.div>
                    <motion.h3
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-xl font-bold text-white truncate"
                    >
                      {selectedEvent.title}
                    </motion.h3>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedEvent(null)}
                  className="absolute top-4 right-4 p-2 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-all backdrop-blur-sm"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </motion.div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6 space-y-5">
                {/* Date & Time Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Icon3D gradient="from-violet-500 to-purple-500" size="sm">
                      <CalendarDays className="w-3.5 h-3.5" />
                    </Icon3D>
                    <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Date & Time</h4>
                  </div>
                  <div
                    className="p-4 rounded-2xl grid grid-cols-2 gap-4"
                    style={{
                      background: 'linear-gradient(135deg, rgba(249,250,251,0.8) 0%, rgba(243,244,246,0.6) 100%)',
                      border: '1px solid rgba(229,231,235,0.5)',
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-md">
                        <CalendarCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Start</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {new Date(selectedEvent.startDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        {selectedEvent.startTime && (
                          <p className="text-xs text-gray-600 mt-0.5">at {selectedEvent.startTime}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-md">
                        <CalendarClock className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">End</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {new Date(selectedEvent.endDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        {selectedEvent.endTime && (
                          <p className="text-xs text-gray-600 mt-0.5">at {selectedEvent.endTime}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Location Section */}
                {selectedEvent.location && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Icon3D gradient="from-emerald-500 to-teal-500" size="sm">
                        <MapPin className="w-3.5 h-3.5" />
                      </Icon3D>
                      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Location</h4>
                    </div>
                    <div
                      className="p-4 rounded-2xl flex items-center gap-3"
                      style={{
                        background: 'linear-gradient(135deg, rgba(249,250,251,0.8) 0%, rgba(243,244,246,0.6) 100%)',
                        border: '1px solid rgba(229,231,235,0.5)',
                      }}
                    >
                      <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{selectedEvent.location}</span>
                    </div>
                  </motion.div>
                )}

                {/* Visibility Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Icon3D gradient="from-blue-500 to-cyan-500" size="sm">
                      <Users className="w-3.5 h-3.5" />
                    </Icon3D>
                    <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Visible To</h4>
                  </div>
                  <div
                    className="p-4 rounded-2xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(249,250,251,0.8) 0%, rgba(243,244,246,0.6) 100%)',
                      border: '1px solid rgba(229,231,235,0.5)',
                    }}
                  >
                    <div className="flex flex-wrap gap-2">
                      {selectedEvent.visibility.map((v, index) => (
                        <motion.span
                          key={v}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.4 + index * 0.05 }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-700 border border-blue-200/50"
                        >
                          <Users className="w-3 h-3" />
                          {visibilityLabels[v]}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Description Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Icon3D gradient="from-amber-500 to-orange-500" size="sm">
                      <FileText className="w-3.5 h-3.5" />
                    </Icon3D>
                    <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Description</h4>
                  </div>
                  <div
                    className="p-4 rounded-2xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(249,250,251,0.8) 0%, rgba(243,244,246,0.6) 100%)',
                      border: '1px solid rgba(229,231,235,0.5)',
                    }}
                  >
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {selectedEvent.description}
                    </p>
                  </div>
                </motion.div>

                {/* Meta Info */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 }}
                  className="flex items-center gap-2 text-xs text-gray-500 pt-2"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-600 font-medium text-[10px]">
                    {selectedEvent.createdBy?.firstName?.[0]}{selectedEvent.createdBy?.lastName?.[0]}
                  </div>
                  <span>
                    Created by <span className="font-medium text-gray-700">{selectedEvent.createdBy?.firstName} {selectedEvent.createdBy?.lastName}</span>
                    {' on '}
                    {new Date(selectedEvent.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </motion.div>
              </div>

              {/* Action Footer */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="px-6 py-4 border-t border-gray-200/50 flex justify-between items-center"
                style={{
                  background: 'linear-gradient(to top, rgba(249,250,251,0.9), rgba(255,255,255,0.5))',
                }}
              >
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleEdit(selectedEvent)}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-all duration-200 flex items-center gap-2"
                    style={{
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                      boxShadow: '0 4px 14px rgba(139, 92, 246, 0.3)',
                    }}
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDelete(selectedEvent._id)}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-all duration-200 flex items-center gap-2"
                    style={{
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)',
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </motion.button>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedEvent(null)}
                  className="px-5 py-2 rounded-xl text-sm font-medium text-gray-700 transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.9)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    border: '1px solid rgba(229,231,235,0.5)',
                  }}
                >
                  Close
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
