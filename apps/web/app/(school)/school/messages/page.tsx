'use client';

import { useState, useEffect } from 'react';
import { Button } from '@repo/ui/button';
import {
  messageService,
  Message,
  MessageType,
  RecipientGroup,
  MessagePriority,
  CreateMessageDto,
} from '../../../../lib/services/message.service';
import { classService, Class } from '../../../../lib/services/class.service';
import { SlideSheet, SheetSection, SheetField, SheetDetailRow } from '@/components/ui';
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
  CheckCircle,
  Loader2,
} from 'lucide-react';

export default function SchoolMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sentMessages, setSentMessages] = useState<Message[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFormSheet, setShowFormSheet] = useState(false);
  const [showDetailsSheet, setShowDetailsSheet] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('sent');
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

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
      setShowFormSheet(false);
      setBanner('Message sent successfully!');
      setTimeout(() => setBanner(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      await messageService.delete(id);
      await loadData();
      setSelectedMessage(null);
      setShowDetailsSheet(false);
      setBanner('Message deleted successfully');
      setTimeout(() => setBanner(null), 3000);
    } catch (err) {
      console.error(err);
    }
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

  const priorityColors: Record<MessagePriority, string> = {
    [MessagePriority.LOW]: 'bg-slate-100 text-slate-700',
    [MessagePriority.NORMAL]: 'bg-blue-100 text-blue-700',
    [MessagePriority.HIGH]: 'bg-amber-100 text-amber-700',
    [MessagePriority.URGENT]: 'bg-red-100 text-red-700',
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Banner */}
      {banner && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="text-emerald-800 font-medium">{banner}</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span className="text-red-700">{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center text-white">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
            <p className="text-sm text-slate-600">
              Send announcements and messages to parents, teachers, and students
            </p>
          </div>
        </div>
        <Button onClick={() => setShowFormSheet(true)} className="bg-primary hover:bg-primary-dark">
          <Plus className="w-4 h-4 mr-2" />
          New Message
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Send className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Sent Messages</p>
              <p className="text-2xl font-bold text-slate-900">{sentMessages.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Inbox className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Inbox</p>
              <p className="text-2xl font-bold text-slate-900">{messages.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-2">
        <div className="flex gap-2">
          <button
            className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'sent'
                ? 'bg-primary text-white'
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
                ? 'bg-primary text-white'
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
                <Button onClick={() => setShowFormSheet(true)} className="bg-primary hover:bg-primary-dark">
                  <Plus className="w-4 h-4 mr-2" />
                  New Message
                </Button>
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
                  setShowDetailsSheet(true);
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold">
                        {message.subject?.charAt(0)?.toUpperCase() || 'M'}
                      </div>
                      <span className="font-medium text-slate-900">
                        {message.subject}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[message.priority]}`}>
                        {message.priority}
                      </span>
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

      {/* Compose Message Sheet */}
      <SlideSheet
        isOpen={showFormSheet}
        onClose={() => setShowFormSheet(false)}
        title="Compose Message"
        subtitle="Send a new message or announcement"
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setShowFormSheet(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="compose-message-form"
              disabled={submitting}
              className="bg-primary hover:bg-primary-dark"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </div>
        }
      >
        <form id="compose-message-form" onSubmit={handleSubmit} className="space-y-6">
          <SheetSection title="Message Details">
            <div className="grid grid-cols-2 gap-4">
              <SheetField label="Message Type" required>
                <select
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as MessageType })}
                >
                  {Object.entries(typeLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </SheetField>
              <SheetField label="Recipients" required>
                <select
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  value={formData.recipientGroup}
                  onChange={(e) =>
                    setFormData({ ...formData, recipientGroup: e.target.value as RecipientGroup })
                  }
                >
                  {Object.entries(recipientGroupLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </SheetField>
            </div>

            {formData.recipientGroup === RecipientGroup.CLASS && (
              <SheetField label="Select Class" required>
                <select
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  value={formData.classId || ''}
                  onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                >
                  <option value="">Select a class</option>
                  {classes.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.grade})
                    </option>
                  ))}
                </select>
              </SheetField>
            )}

            <SheetField label="Priority" required>
              <select
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value as MessagePriority })
                }
              >
                {Object.values(MessagePriority).map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </SheetField>
          </SheetSection>

          <SheetSection title="Content">
            <SheetField label="Subject" required>
              <input
                type="text"
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Enter subject..."
                required
              />
            </SheetField>

            <SheetField label="Message" required>
              <textarea
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                rows={6}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your message..."
                required
              />
            </SheetField>
          </SheetSection>
        </form>
      </SlideSheet>

      {/* View Message Sheet */}
      {selectedMessage && (
        <SlideSheet
          isOpen={showDetailsSheet}
          onClose={() => {
            setShowDetailsSheet(false);
            setSelectedMessage(null);
          }}
          title={selectedMessage.subject}
          subtitle={`${typeLabels[selectedMessage.type]} - ${selectedMessage.priority} Priority`}
          size="md"
          footer={
            <div className="flex justify-between gap-3 w-full">
              <Button
                variant="outline"
                onClick={() => handleDelete(selectedMessage._id)}
                className="text-red-600 hover:bg-red-50 border-red-200"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
              <Button variant="outline" onClick={() => {
                setShowDetailsSheet(false);
                setSelectedMessage(null);
              }}>
                Close
              </Button>
            </div>
          }
        >
          <div className="space-y-6">
            <SheetSection title="Message Information">
              <SheetDetailRow label="From">
                {selectedMessage.senderId?.firstName} {selectedMessage.senderId?.lastName}
              </SheetDetailRow>
              <SheetDetailRow label="To">
                {recipientGroupLabels[selectedMessage.recipientGroup]}
                {selectedMessage.classId && ` (${selectedMessage.classId.name})`}
              </SheetDetailRow>
              <SheetDetailRow label="Sent">
                {new Date(selectedMessage.createdAt).toLocaleString()}
              </SheetDetailRow>
              <SheetDetailRow label="Priority">
                <span className={`text-xs px-2.5 py-0.5 rounded-full ${priorityColors[selectedMessage.priority]}`}>
                  {selectedMessage.priority}
                </span>
              </SheetDetailRow>
              {selectedMessage.readBy && selectedMessage.readBy.length > 0 && (
                <SheetDetailRow label="Read Status">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Read by {selectedMessage.readBy.length} recipient(s)</span>
                  </div>
                </SheetDetailRow>
              )}
            </SheetSection>

            <SheetSection title="Message Content">
              <div className="bg-slate-50 rounded-lg border border-slate-200 p-5">
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {selectedMessage.content}
                </p>
              </div>
            </SheetSection>
          </div>
        </SlideSheet>
      )}
    </section>
  );
}
