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

export default function SchoolMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sentMessages, setSentMessages] = useState<Message[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('sent');
  const [submitting, setSubmitting] = useState(false);

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
      setShowForm(false);
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
    [MessagePriority.LOW]: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    [MessagePriority.NORMAL]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    [MessagePriority.HIGH]: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    [MessagePriority.URGENT]: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Messages</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Send announcements and messages to parents, teachers, and students
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>+ New Message</Button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800">
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'sent'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('sent')}
        >
          Sent ({sentMessages.length})
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'inbox'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('inbox')}
        >
          Inbox ({messages.length})
        </button>
      </div>

      {/* Messages List */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
        {displayMessages.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-3">💬</div>
            <p>No messages yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {displayMessages.map((message) => (
              <div
                key={message._id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                onClick={() => setSelectedMessage(message)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {message.subject}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded ${priorityColors[message.priority]}`}>
                        {message.priority}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
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
                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">{message.content}</p>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(message.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Compose Message Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={() => setShowForm(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 animate-zoom-in">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Compose Message
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Message Type
                  </label>
                  <select
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as MessageType })}
                  >
                    {Object.entries(typeLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Recipients
                  </label>
                  <select
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
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
                </div>
              </div>

              {formData.recipientGroup === RecipientGroup.CLASS && (
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Select Class
                  </label>
                  <select
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
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
                </div>
              )}

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                  Priority
                </label>
                <select
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
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
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Enter subject..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                  Message *
                </label>
                <textarea
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  rows={6}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write your message..."
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Sending...' : 'Send Message'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Message Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 animate-fade-in"
            onClick={() => setSelectedMessage(null)}
          />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 animate-zoom-in">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {selectedMessage.subject}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded ${priorityColors[selectedMessage.priority]}`}>
                    {selectedMessage.priority}
                  </span>
                  <span className="text-xs text-gray-500">
                    {typeLabels[selectedMessage.type]}
                  </span>
                </div>
              </div>
              <span className="text-sm text-gray-500">
                {new Date(selectedMessage.createdAt).toLocaleString()}
              </span>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex gap-4 text-gray-600 dark:text-gray-300">
                <div>
                  <span className="font-medium">From:</span>{' '}
                  {selectedMessage.senderId?.firstName} {selectedMessage.senderId?.lastName}
                </div>
                <div>
                  <span className="font-medium">To:</span>{' '}
                  {recipientGroupLabels[selectedMessage.recipientGroup]}
                  {selectedMessage.classId && ` (${selectedMessage.classId.name})`}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {selectedMessage.content}
                </p>
              </div>

              {selectedMessage.readBy && selectedMessage.readBy.length > 0 && (
                <div className="text-xs text-gray-500">
                  Read by {selectedMessage.readBy.length} recipient(s)
                </div>
              )}
            </div>

            <div className="flex justify-between gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={() => handleDelete(selectedMessage._id)}
                className="text-red-600"
              >
                Delete
              </Button>
              <Button variant="outline" onClick={() => setSelectedMessage(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
