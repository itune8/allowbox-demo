'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@repo/ui/button';
import {
  announcementService,
  type Announcement,
  type CreateAnnouncementDto,
  type AnnouncementTarget,
  type AnnouncementPriority,
} from '../../../lib/services/announcement.service';
import { GlassCard, Icon3D } from '@/components/ui';
import {
  Megaphone,
  Bell,
  Plus,
  Trash2,
  Users,
  Clock,
  Eye,
  Send,
} from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<CreateAnnouncementDto>({
    title: '',
    message: '',
    target: 'ALL',
    priority: 'NORMAL',
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await announcementService.getAll();
      setAnnouncements(data);
    } catch (err: any) {
      console.error('Failed to fetch announcements:', err);
      setError('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await announcementService.create(form);
      setShowModal(false);
      setForm({ title: '', message: '', target: 'ALL', priority: 'NORMAL' });
      fetchAnnouncements();
    } catch (err: any) {
      console.error('Failed to create announcement:', err);
      alert(err.response?.data?.message || 'Failed to send announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await announcementService.delete(id);
      fetchAnnouncements();
    } catch (err: any) {
      console.error('Failed to delete:', err);
      alert('Failed to delete announcement');
    }
  };

  const getTargetBadge = (target: AnnouncementTarget) => {
    const badges: Record<AnnouncementTarget, string> = {
      ALL: 'bg-purple-100 text-purple-700',
      ACTIVE: 'bg-green-100 text-green-700',
      TRIAL: 'bg-blue-100 text-blue-700',
      SUSPENDED: 'bg-red-100 text-red-700',
      SPECIFIC: 'bg-gray-100 text-gray-700',
    };
    return badges[target] || badges.ALL;
  };

  const getPriorityBadge = (priority: AnnouncementPriority) => {
    const badges: Record<AnnouncementPriority, string> = {
      LOW: 'bg-gray-100 text-gray-600',
      NORMAL: 'bg-blue-100 text-blue-600',
      HIGH: 'bg-orange-100 text-orange-600',
      URGENT: 'bg-red-100 text-red-600',
    };
    return badges[priority] || badges.NORMAL;
  };

  const getTargetLabel = (target: AnnouncementTarget) => {
    const labels: Record<AnnouncementTarget, string> = {
      ALL: 'All Schools',
      ACTIVE: 'Active Only',
      TRIAL: 'Trial Only',
      SUSPENDED: 'Suspended',
      SPECIFIC: 'Specific Schools',
    };
    return labels[target];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getCreatedByName = (announcement: Announcement) => {
    if (announcement.createdByName) return announcement.createdByName;
    if (typeof announcement.createdBy === 'object' && announcement.createdBy) {
      return `${announcement.createdBy.firstName} ${announcement.createdBy.lastName}`;
    }
    return 'System';
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <Icon3D gradient="from-rose-500 to-pink-500">
            <Megaphone className="w-5 h-5" />
          </Icon3D>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Announcements</h2>
            <p className="text-gray-600 mt-1">
              Send messages and notifications to schools
            </p>
          </div>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Announcement
          </Button>
        </motion.div>
      </motion.div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 bg-red-50 text-red-700 px-4 py-3 rounded-lg"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-10 space-y-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="rounded-full h-8 w-8 border-4 border-rose-200 border-t-rose-500"
          />
          <div className="text-gray-500">Loading announcements...</div>
        </div>
      ) : announcements.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-10"
        >
          <GlassCard className="bg-white p-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <Icon3D gradient="from-rose-500 to-pink-500">
                <Bell className="w-8 h-8" />
              </Icon3D>
            </motion.div>
            <p className="text-gray-500 mt-4">
              No announcements yet. Create one to notify schools.
            </p>
          </GlassCard>
        </motion.div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {announcements.map((announcement, index) => (
            <motion.div
              key={announcement.id || announcement._id}
              variants={item}
              whileHover={{ scale: 1.01, y: -2 }}
              layout
            >
              <GlassCard className="bg-white p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center"
                      >
                        <Bell className="w-4 h-4 text-white" />
                      </motion.div>
                      <h3 className="font-semibold text-gray-900">
                        {announcement.title}
                      </h3>
                      <motion.span
                        whileHover={{ scale: 1.1 }}
                        className={`text-xs px-2 py-0.5 rounded font-medium ${getTargetBadge(announcement.target)}`}
                      >
                        {getTargetLabel(announcement.target)}
                      </motion.span>
                      <motion.span
                        whileHover={{ scale: 1.1 }}
                        className={`text-xs px-2 py-0.5 rounded font-medium ${getPriorityBadge(announcement.priority)}`}
                      >
                        {announcement.priority}
                      </motion.span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">
                      {announcement.message}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>Sent by {getCreatedByName(announcement)}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(announcement.createdAt)}</span>
                      </div>
                      {announcement.readCount > 0 && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            <span>{announcement.readCount} read</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDelete(announcement.id || announcement._id)}
                    className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <GlassCard className="bg-white p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Icon3D gradient="from-rose-500 to-pink-500">
                    <Send className="w-4 h-4" />
                  </Icon3D>
                  <h3 className="text-lg font-semibold text-gray-900">
                    New Announcement
                  </h3>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      required
                      className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      placeholder="Announcement title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      required
                      rows={4}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      placeholder="Write your announcement message..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Send To
                      </label>
                      <select
                        value={form.target}
                        onChange={(e) =>
                          setForm({ ...form, target: e.target.value as AnnouncementTarget })
                        }
                        className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      >
                        <option value="ALL">All Schools</option>
                        <option value="ACTIVE">Active Schools Only</option>
                        <option value="TRIAL">Trial Schools Only</option>
                        <option value="SUSPENDED">Suspended Schools</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority
                      </label>
                      <select
                        value={form.priority}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            priority: e.target.value as AnnouncementPriority,
                          })
                        }
                        className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      >
                        <option value="LOW">Low</option>
                        <option value="NORMAL">Normal</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => setShowModal(false)}
                      >
                        Cancel
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button type="submit" disabled={submitting}>
                        {submitting ? (
                          <div className="flex items-center gap-2">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                            />
                            Sending...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Send className="w-4 h-4" />
                            Send Announcement
                          </div>
                        )}
                      </Button>
                    </motion.div>
                  </div>
                </form>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
