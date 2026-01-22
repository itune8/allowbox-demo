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
import { SlideSheet, SheetSection, SheetField } from '../../../components/ui';
import { Megaphone, Bell, Plus, Trash2, Users, Clock, Eye, Send } from 'lucide-react';

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
    const badges: Record<AnnouncementTarget, { bg: string; text: string }> = {
      ALL: { bg: 'bg-purple-50', text: 'text-purple-700' },
      ACTIVE: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
      TRIAL: { bg: 'bg-blue-50', text: 'text-blue-700' },
      SUSPENDED: { bg: 'bg-red-50', text: 'text-red-700' },
      SPECIFIC: { bg: 'bg-slate-100', text: 'text-slate-700' },
    };
    return badges[target] || badges.ALL;
  };

  const getPriorityBadge = (priority: AnnouncementPriority) => {
    const badges: Record<AnnouncementPriority, { bg: string; text: string }> = {
      LOW: { bg: 'bg-slate-100', text: 'text-slate-600' },
      NORMAL: { bg: 'bg-blue-50', text: 'text-blue-600' },
      HIGH: { bg: 'bg-amber-50', text: 'text-amber-600' },
      URGENT: { bg: 'bg-red-50', text: 'text-red-600' },
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
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getCreatedByName = (announcement: Announcement) => {
    if (announcement.createdByName) return announcement.createdByName;
    if (typeof announcement.createdBy === 'object' && announcement.createdBy) {
      return `${announcement.createdBy.firstName} ${announcement.createdBy.lastName}`;
    }
    return 'System';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Announcements</h1>
          <p className="text-slate-500 mt-1">Send messages and notifications to schools</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Announcement
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Announcements List */}
      {announcements.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Bell className="w-12 h-12 mx-auto text-slate-300" />
          <p className="text-slate-500 mt-4">No announcements yet. Create one to notify schools.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div
              key={announcement.id || announcement._id}
              className="bg-white rounded-xl border border-slate-200 p-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Bell className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="font-medium text-slate-900">{announcement.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${getTargetBadge(announcement.target).bg} ${getTargetBadge(announcement.target).text}`}>
                      {getTargetLabel(announcement.target)}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${getPriorityBadge(announcement.priority).bg} ${getPriorityBadge(announcement.priority).text}`}>
                      {announcement.priority}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm mb-3">{announcement.message}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
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
                <button
                  onClick={() => handleDelete(announcement.id || announcement._id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Announcement SlideSheet */}
      <SlideSheet
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="New Announcement"
        subtitle="Send a message to schools"
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Send Announcement
                </span>
              )}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <SheetSection>
            <SheetField label="Title" required>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Announcement title"
              />
            </SheetField>

            <SheetField label="Message" required>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
                rows={4}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Write your announcement message..."
              />
            </SheetField>
          </SheetSection>

          <SheetSection>
            <div className="grid grid-cols-2 gap-4">
              <SheetField label="Send To" required>
                <select
                  value={form.target}
                  onChange={(e) => setForm({ ...form, target: e.target.value as AnnouncementTarget })}
                  className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="ALL">All Schools</option>
                  <option value="ACTIVE">Active Schools Only</option>
                  <option value="TRIAL">Trial Schools Only</option>
                  <option value="SUSPENDED">Suspended Schools</option>
                </select>
              </SheetField>

              <SheetField label="Priority" required>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value as AnnouncementPriority })}
                  className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="LOW">Low</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </SheetField>
            </div>
          </SheetSection>
        </form>
      </SlideSheet>
    </div>
  );
}
