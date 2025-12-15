'use client';

import { useState, useEffect } from 'react';
import { Button } from '@repo/ui/button';
import {
  announcementService,
  type Announcement,
  type CreateAnnouncementDto,
  type AnnouncementTarget,
  type AnnouncementPriority,
} from '../../../lib/services/announcement.service';

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
      ALL: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      TRIAL: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      SUSPENDED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      SPECIFIC: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
    };
    return badges[target] || badges.ALL;
  };

  const getPriorityBadge = (priority: AnnouncementPriority) => {
    const badges: Record<AnnouncementPriority, string> = {
      LOW: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      NORMAL: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
      HIGH: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
      URGENT: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
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
    <section className="animate-slide-in-right">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Announcements</h2>
        <Button onClick={() => setShowModal(true)}>+ New Announcement</Button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-10 space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          <div className="text-gray-500">Loading announcements...</div>
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <div className="text-4xl mb-3">📢</div>
          No announcements yet. Create one to notify schools.
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((item) => (
            <div
              key={item.id || item._id}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{item.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${getTargetBadge(item.target)}`}>
                      {getTargetLabel(item.target)}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${getPriorityBadge(item.priority)}`}>
                      {item.priority}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{item.message}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <span>Sent by {getCreatedByName(item)}</span>
                    <span>•</span>
                    <span>{formatDate(item.createdAt)}</span>
                    {item.readCount > 0 && (
                      <>
                        <span>•</span>
                        <span>{item.readCount} read</span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(item.id || item._id)}
                  className="text-gray-400 hover:text-red-500 p-1"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md animate-zoom-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">New Announcement</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  className="w-full h-10 border border-gray-200 dark:border-gray-700 rounded-lg px-3 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Announcement title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                  rows={4}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Write your announcement message..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Send To</label>
                  <select
                    value={form.target}
                    onChange={(e) => setForm({ ...form, target: e.target.value as AnnouncementTarget })}
                    className="w-full h-10 border border-gray-200 dark:border-gray-700 rounded-lg px-3 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    <option value="ALL">All Schools</option>
                    <option value="ACTIVE">Active Schools Only</option>
                    <option value="TRIAL">Trial Schools Only</option>
                    <option value="SUSPENDED">Suspended Schools</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as AnnouncementPriority })}
                    className="w-full h-10 border border-gray-200 dark:border-gray-700 rounded-lg px-3 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    <option value="LOW">Low</option>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Sending...' : 'Send Announcement'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
