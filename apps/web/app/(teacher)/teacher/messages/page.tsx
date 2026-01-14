'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@repo/ui/button';
import { GlassCard, AnimatedStatCard, Icon3D, gradients } from '@/components/ui';
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
  Mail,
  Send,
  Archive,
  AlertCircle,
} from 'lucide-react';

export default function TeacherMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sentMessages, setSentMessages] = useState<Message[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('inbox');
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateMessageDto>({
    type: MessageType.CLASS_MESSAGE,
    recipientGroup: RecipientGroup.CLASS,
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
    if (formData.recipientGroup === RecipientGroup.CLASS && !formData.classId) {
      setError('Please select a class');
      return;
    }

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

  async function handleMarkAsRead(id: string) {
    try {
      await messageService.markAsRead(id);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  }

  function resetForm() {
    setFormData({
      type: MessageType.CLASS_MESSAGE,
      recipientGroup: RecipientGroup.CLASS,
      subject: '',
      content: '',
      priority: MessagePriority.NORMAL,
    });
  }

  const priorityColors: Record<MessagePriority, string> = {
    [MessagePriority.LOW]: 'bg-gray-100 text-gray-700',
    [MessagePriority.NORMAL]: 'bg-blue-100 text-blue-700',
    [MessagePriority.HIGH]: 'bg-orange-100 text-orange-700',
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

  const displayMessages = activeTab === 'inbox' ? messages : sentMessages;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full mx-auto"
          />
          <div className="text-gray-500">Loading messages...</div>
        </div>
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
      >
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
          Messages
          <Icon3D gradient={gradients.blue} size="sm">
            <Mail className="w-3.5 h-3.5" />
          </Icon3D>
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Communicate with parents
        </p>
      </motion.div>

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-start gap-2"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              {error}
              <button onClick={() => setError(null)} className="ml-2 underline">
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4"
      >
        <AnimatedStatCard
          title="Inbox"
          value={messages.length}
          icon={<Mail className="w-5 h-5 text-blue-600" />}
          iconBgColor="bg-blue-50"
          delay={0}
        />
        <AnimatedStatCard
          title="Sent Messages"
          value={sentMessages.length}
          icon={<Send className="w-5 h-5 text-indigo-600" />}
          iconBgColor="bg-indigo-50"
          delay={1}
        />
        <AnimatedStatCard
          title="Unread"
          value={messages.filter(m => !m.readBy || m.readBy.length === 0).length}
          icon={<Archive className="w-5 h-5 text-amber-600" />}
          iconBgColor="bg-amber-50"
          delay={2}
        />
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex gap-1 sm:gap-2 border-b border-gray-200">
          <button
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors touch-manipulation ${
              activeTab === 'inbox'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('inbox')}
          >
            Inbox ({messages.length})
          </button>
          <button
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors touch-manipulation ${
              activeTab === 'sent'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('sent')}
          >
            Sent ({sentMessages.length})
          </button>
        </div>
      </motion.div>

      {/* Messages List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <GlassCard className="p-0 overflow-hidden bg-white/90" hover={false}>
          {displayMessages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 text-center text-gray-500"
            >
              <div className="text-4xl mb-3">💬</div>
              <p>No messages yet.</p>
            </motion.div>
          ) : (
            <div className="divide-y divide-gray-200">
              <AnimatePresence mode="popLayout">
                {displayMessages.map((message, index) => {
                  const isUnread = activeTab === 'inbox' && (!message.readBy || message.readBy.length === 0);
                  return (
                    <motion.div
                      key={message._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ backgroundColor: 'rgba(249, 250, 251, 1)' }}
                      className={`p-4 cursor-pointer transition-colors ${
                        isUnread ? 'bg-blue-50/50' : ''
                      }`}
                      onClick={() => {
                        setSelectedMessage(message);
                        if (isUnread) {
                          handleMarkAsRead(message._id);
                        }
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {isUnread && (
                              <motion.span
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0"
                              />
                            )}
                            <span className={`font-medium text-gray-900 ${isUnread ? 'font-semibold' : ''}`}>
                              {message.subject}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded ${priorityColors[message.priority]}`}>
                              {message.priority}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
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
                        <div className="text-xs text-gray-400 flex-shrink-0 ml-2">
                          {new Date(message.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* Compose Message Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40"
              onClick={() => setShowForm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6"
            >
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Send Message to Parents
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Select Class *
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900"
                  value={formData.classId || ''}
                  onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                  required
                >
                  <option value="">Select a class</option>
                  {classes.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.grade})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900"
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
                <label className="block text-sm text-gray-700 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Enter subject..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Message *
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900"
                  rows={6}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write your message to parents..."
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Message Modal */}
      <AnimatePresence>
        {selectedMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40"
              onClick={() => setSelectedMessage(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6"
            >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedMessage.subject}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded ${priorityColors[selectedMessage.priority]}`}>
                    {selectedMessage.priority}
                  </span>
                </div>
              </div>
              <span className="text-sm text-gray-500">
                {new Date(selectedMessage.createdAt).toLocaleString()}
              </span>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex gap-4 text-gray-600">
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

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {selectedMessage.content}
                </p>
              </div>

              {selectedMessage.readBy && selectedMessage.readBy.length > 0 && (
                <div className="text-xs text-gray-500">
                  Read by {selectedMessage.readBy.length} recipient(s)
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={() => setSelectedMessage(null)}>
                Close
              </Button>
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
