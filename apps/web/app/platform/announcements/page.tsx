'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  announcementService,
  type Announcement,
  type CreateAnnouncementDto,
  type AnnouncementTarget,
  type AnnouncementPriority,
} from '../../../lib/services/announcement.service';
import { Portal } from '../../../components/portal';
import { Bell, Plus, Trash2, Users, Clock, Eye, Send, CheckCircle, FileText, X } from 'lucide-react';
import { PlatformStatCard } from '../../../components/platform';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [form, setForm] = useState<CreateAnnouncementDto>({
    title: '',
    message: '',
    target: 'ALL',
    priority: 'NORMAL',
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

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

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!form.title || !form.message) return;
    setSubmitting(true);
    try {
      await announcementService.create(form);
      setShowModal(false);
      setForm({ title: '', message: '', target: 'ALL', priority: 'NORMAL' });
      setToast({ message: 'Announcement sent successfully', type: 'success' });
      fetchAnnouncements();
    } catch (err: any) {
      console.error('Failed to create announcement:', err);
      setToast({ message: err.response?.data?.message || 'Failed to send announcement', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await announcementService.delete(id);
      setToast({ message: 'Announcement deleted', type: 'success' });
      fetchAnnouncements();
    } catch (err: any) {
      console.error('Failed to delete:', err);
      setToast({ message: 'Failed to delete announcement', type: 'error' });
    }
  };

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setForm({ title: '', message: '', target: 'ALL', priority: 'NORMAL' });
  }, []);

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

  // Stats
  const stats = {
    total: announcements.length,
    sent: announcements.length,
    scheduled: 0,
    draft: 0,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-[#824ef2] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[10000] px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white transition-all ${
          toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Announcements</h1>
          <p className="text-slate-500 mt-1">Send messages and notifications to schools</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-colors"
          style={{ backgroundColor: '#824ef2' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#7040d9')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#824ef2')}
        >
          <Plus className="w-4 h-4" />
          New Announcement
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-sm underline">Dismiss</button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <PlatformStatCard
          icon={<Bell className="w-5 h-5" />}
          color="blue"
          label="Total Announcements"
          value={stats.total}
        />
        <PlatformStatCard
          icon={<CheckCircle className="w-5 h-5" />}
          color="green"
          label="Sent"
          value={stats.sent}
        />
        <PlatformStatCard
          icon={<Clock className="w-5 h-5" />}
          color="amber"
          label="Scheduled"
          value={stats.scheduled}
        />
        <PlatformStatCard
          icon={<FileText className="w-5 h-5" />}
          color="slate"
          label="Draft"
          value={stats.draft}
        />
      </div>

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
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Bell className="w-4 h-4 text-purple-600" />
                    </div>
                    <h3 className="font-medium text-slate-900">{announcement.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getTargetBadge(announcement.target).bg} ${getTargetBadge(announcement.target).text}`}>
                      {getTargetLabel(announcement.target)}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPriorityBadge(announcement.priority).bg} ${getPriorityBadge(announcement.priority).text}`}>
                      {announcement.priority}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span className="text-xs text-emerald-600 font-medium">Sent</span>
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm mb-3">{announcement.message}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>Sent by {getCreatedByName(announcement)}</span>
                    </div>
                    <span>&middot;</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(announcement.createdAt)}</span>
                    </div>
                    {announcement.readCount > 0 && (
                      <>
                        <span>&middot;</span>
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

      {/* Create Announcement Popup Modal */}
      {showModal && (
        <CreateAnnouncementModal
          form={form}
          setForm={setForm}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      )}
    </div>
  );
}

/* ─── Create Announcement Modal ─── */

function CreateAnnouncementModal({
  form,
  setForm,
  onClose,
  onSubmit,
  submitting,
}: {
  form: CreateAnnouncementDto;
  setForm: (form: CreateAnnouncementDto) => void;
  onClose: () => void;
  onSubmit: (e?: React.FormEvent) => void;
  submitting: boolean;
}) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <Portal>
      <div
        className="fixed inset-0 bg-slate-900/50 z-[9998] transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-6">
        <div
          className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-[520px] max-h-[92vh] sm:max-h-[85vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900">New Announcement</h2>
              <p className="text-xs text-slate-500 mt-0.5">Send a message to schools</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 -mr-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Content */}
          <form
            onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
            className="flex-1 overflow-y-auto px-6 py-5 space-y-4"
          >
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="w-full h-11 border border-slate-200 rounded-lg px-3 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2]"
                placeholder="Announcement title"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
                rows={5}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white text-slate-900 resize-y focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2]"
                placeholder="Write your announcement message..."
              />
            </div>

            {/* Send To + Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Send To <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.target}
                  onChange={(e) => setForm({ ...form, target: e.target.value as AnnouncementTarget })}
                  className="w-full h-11 border border-slate-200 rounded-lg px-3 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2]"
                >
                  <option value="ALL">All Schools</option>
                  <option value="ACTIVE">Active Schools Only</option>
                  <option value="TRIAL">Trial Schools Only</option>
                  <option value="SUSPENDED">Suspended Schools</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Priority <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value as AnnouncementPriority })}
                  className="w-full h-11 border border-slate-200 rounded-lg px-3 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2]"
                >
                  <option value="LOW">Low</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onSubmit()}
              disabled={submitting || !form.title || !form.message}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#824ef2' }}
              onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = '#7040d9'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#824ef2'; }}
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Announcement
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
