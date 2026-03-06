'use client';

import { useState, useEffect } from 'react';
import {
  messageService,
  Message,
  MessageType,
  RecipientGroup,
  MessagePriority,
  CreateMessageDto,
} from '../../../../lib/services/message.service';
import { classService, Class } from '../../../../lib/services/class.service';
import {
  MessageSquare,
  Send,
  Inbox,
  Plus,
  X,
  Mail,
  Clock,
  Trash2,
  AlertCircle,
  Loader2,
  FileText,
  Bell,
} from 'lucide-react';
import { SchoolStatCard, SchoolStatusBadge, FormModal, ConfirmModal, useToast, Pagination } from '../../../../components/school';

export default function SchoolMessagesPage() {
  const { showToast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [sentMessages, setSentMessages] = useState<Message[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('sent');
  const [submitting, setSubmitting] = useState(false);

  // Confirm modal
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void }>({
    open: false, title: '', message: '', onConfirm: () => {},
  });

  // Form state
  const [formData, setFormData] = useState<CreateMessageDto>({
    type: MessageType.ANNOUNCEMENT,
    recipientGroup: RecipientGroup.ALL_PARENTS,
    subject: '',
    content: '',
    priority: MessagePriority.NORMAL,
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [inboxData, sentData, classesData] = await Promise.all([
        messageService.getInbox(),
        messageService.getSentMessages(),
        classService.getClasses(),
      ]);
      setMessages(inboxData);
      setSentMessages(sentData);
      setClasses(classesData);
    } catch (err) {
      setError('Failed to load messages');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.content.trim()) return;

    try {
      setSubmitting(true);
      await messageService.create(formData);
      await loadData();
      resetForm();
      setShowFormModal(false);
      showToast('success', 'Message sent successfully!');
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to send message');
    } finally {
      setSubmitting(false);
    }
  }

  function handleDelete(id: string) {
    setConfirmModal({
      open: true,
      title: 'Delete Message',
      message: 'Are you sure you want to delete this message? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await messageService.delete(id);
          await loadData();
          setSelectedMessage(null);
          setShowDetailsModal(false);
          showToast('success', 'Message deleted successfully');
        } catch (err) {
          showToast('error', 'Failed to delete message');
          console.error(err);
        }
        setConfirmModal(prev => ({ ...prev, open: false }));
      },
    });
  }

  function resetForm() {
    setFormData({
      type: MessageType.ANNOUNCEMENT,
      recipientGroup: RecipientGroup.ALL_PARENTS,
      subject: '',
      content: '',
      priority: MessagePriority.NORMAL,
    });
  }

  const recipientGroupLabels: Record<RecipientGroup, string> = {
    [RecipientGroup.ALL_PARENTS]: 'All Parents',
    [RecipientGroup.ALL_TEACHERS]: 'All Teachers',
    [RecipientGroup.ALL_STAFF]: 'All Staff',
    [RecipientGroup.ALL_STUDENTS]: 'All Students',
    [RecipientGroup.CLASS]: 'Specific Class',
    [RecipientGroup.INDIVIDUAL]: 'Individual',
  };

  const typeLabels: Record<MessageType, string> = {
    [MessageType.ANNOUNCEMENT]: 'Announcement',
    [MessageType.CLASS_MESSAGE]: 'Class Message',
    [MessageType.INDIVIDUAL]: 'Individual',
    [MessageType.GROUP]: 'Group',
  };

  const displayMessages = activeTab === 'inbox' ? messages : sentMessages;

  // Stats
  const totalMessages = messages.length + sentMessages.length;
  const sentCount = sentMessages.length;
  const drafts = 0;
  const unreadCount = messages.filter((m) => !m.readBy || m.readBy.length === 0).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#824ef2] animate-spin" />
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span className="text-red-700">{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-end">
        <button
          onClick={() => setShowFormModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#824ef2] hover:bg-[#6b3fd4] rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Message
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SchoolStatCard
          icon={<MessageSquare className="w-5 h-5" />}
          color="blue"
          label="Total Messages"
          value={totalMessages}
        />
        <SchoolStatCard
          icon={<Send className="w-5 h-5" />}
          color="green"
          label="Sent"
          value={sentCount}
        />
        <SchoolStatCard
          icon={<FileText className="w-5 h-5" />}
          color="slate"
          label="Drafts"
          value={drafts}
        />
        <SchoolStatCard
          icon={<Bell className="w-5 h-5" />}
          color="orange"
          label="Unread"
          value={unreadCount}
        />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-2">
        <div className="flex gap-2">
          <button
            className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'sent'
                ? 'bg-[#824ef2] text-white'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
            onClick={() => setActiveTab('sent')}
          >
            <Send className="w-4 h-4" />
            Sent ({sentMessages.length})
          </button>
          <button
            className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'inbox'
                ? 'bg-[#824ef2] text-white'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
            onClick={() => setActiveTab('inbox')}
          >
            <Inbox className="w-4 h-4" />
            Inbox ({messages.length})
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {displayMessages.length === 0 ? (
          <div className="p-12 text-center">
            <Mail className="mx-auto w-16 h-16 text-slate-300" />
            <h3 className="mt-4 text-lg font-medium text-slate-900">No messages yet</h3>
            <p className="mt-2 text-sm text-slate-500">
              {activeTab === 'sent' ? 'Start by sending your first message.' : 'Your inbox is empty.'}
            </p>
            {activeTab === 'sent' && (
              <div className="mt-6">
                <button
                  onClick={() => setShowFormModal(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#824ef2] hover:bg-[#6b3fd4] rounded-lg transition-colors mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  New Message
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {displayMessages.map((message) => (
              <div
                key={message._id}
                className="p-4 cursor-pointer transition-colors hover:bg-slate-50"
                onClick={() => {
                  setSelectedMessage(message);
                  setShowDetailsModal(true);
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 rounded-full bg-[#824ef2] flex items-center justify-center text-white text-sm font-semibold">
                        {message.subject?.charAt(0)?.toUpperCase() || 'M'}
                      </div>
                      <span className="font-medium text-slate-900">
                        {message.subject}
                      </span>
                      <SchoolStatusBadge value={message.priority} showDot={false} />
                    </div>
                    <div className="text-sm text-slate-600 ml-10">
                      {activeTab === 'inbox' ? (
                        <>
                          From: {message.senderId?.firstName} {message.senderId?.lastName}
                        </>
                      ) : (
                        <>
                          To: {recipientGroupLabels[message.recipientGroup]}
                          {message.classId && ` (${message.classId.name})`}
                        </>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-1 ml-10">{message.content}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(message.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Compose Message Modal */}
      <FormModal
        open={showFormModal}
        onClose={() => setShowFormModal(false)}
        title="Compose Message"
        size="lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowFormModal(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="compose-message-form"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-[#824ef2] hover:bg-[#6b3fd4] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
              ) : (
                <><Send className="w-4 h-4" /> Send Message</>
              )}
            </button>
          </>
        }
      >
        <form id="compose-message-form" onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Message Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Message Type <span className="text-red-500">*</span></label>
                <select
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] focus:outline-none transition-all"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as MessageType })}
                >
                  {Object.entries(typeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Recipients <span className="text-red-500">*</span></label>
                <select
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] focus:outline-none transition-all"
                  value={formData.recipientGroup}
                  onChange={(e) => setFormData({ ...formData, recipientGroup: e.target.value as RecipientGroup })}
                >
                  {Object.entries(recipientGroupLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            {formData.recipientGroup === RecipientGroup.CLASS && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Class <span className="text-red-500">*</span></label>
                <select
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] focus:outline-none transition-all"
                  value={formData.classId || ''}
                  onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                >
                  <option value="">Select a class</option>
                  {classes.map((c) => (
                    <option key={c._id} value={c._id}>{c.name} ({c.grade})</option>
                  ))}
                </select>
              </div>
            )}

            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Priority <span className="text-red-500">*</span></label>
              <select
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] focus:outline-none transition-all"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as MessagePriority })}
              >
                {Object.values(MessagePriority).map((priority) => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Content</h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Subject <span className="text-red-500">*</span></label>
              <input
                type="text"
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] focus:outline-none transition-all"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Enter subject..."
                required
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Message <span className="text-red-500">*</span></label>
              <textarea
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] focus:outline-none transition-all resize-none"
                rows={6}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your message..."
                required
              />
            </div>
          </div>
        </form>
      </FormModal>

      {/* View Message Modal */}
      {selectedMessage && (
        <FormModal
          open={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedMessage(null);
          }}
          title={selectedMessage.subject}
          size="md"
          footer={
            <>
              <button
                onClick={() => handleDelete(selectedMessage._id)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedMessage(null);
                }}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
            </>
          }
        >
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Message Information</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-500">From</span>
                  <span className="text-sm font-medium text-slate-900">{selectedMessage.senderId?.firstName} {selectedMessage.senderId?.lastName}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-500">To</span>
                  <span className="text-sm font-medium text-slate-900">
                    {recipientGroupLabels[selectedMessage.recipientGroup]}
                    {selectedMessage.classId && ` (${selectedMessage.classId.name})`}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-500">Sent</span>
                  <span className="text-sm font-medium text-slate-900">{new Date(selectedMessage.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-500">Priority</span>
                  <SchoolStatusBadge value={selectedMessage.priority} />
                </div>
                {selectedMessage.readBy && selectedMessage.readBy.length > 0 && (
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-sm text-slate-500">Read Status</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-sm font-medium text-slate-900">Read by {selectedMessage.readBy.length} recipient(s)</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Message Content</h3>
              <div className="bg-slate-50 rounded-lg border border-slate-200 p-5">
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {selectedMessage.content}
                </p>
              </div>
            </div>
          </div>
        </FormModal>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        open={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel="Delete"
        confirmColor="red"
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, open: false }))}
      />
    </section>
  );
}
