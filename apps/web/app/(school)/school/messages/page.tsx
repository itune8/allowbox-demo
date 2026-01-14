'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { Portal } from '../../../../components/portal';
import { GlassCard, AnimatedStatCard, Icon3D } from '../../../../components/ui';
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
} from 'lucide-react';

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
      setShowForm(false);
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
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full"
        />
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
      {/* Banner */}
      <AnimatePresence>
        {banner && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="glass-strong rounded-xl border border-green-200 px-4 py-3 flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-green-800 font-medium">{banner}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-strong rounded-xl border border-red-200 px-4 py-3 text-red-700 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Icon3D gradient="from-blue-500 to-indigo-500" size="lg">
            <MessageSquare className="w-6 h-6" />
          </Icon3D>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            <p className="text-sm text-gray-500">
              Send announcements and messages to parents, teachers, and students
            </p>
          </div>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button onClick={() => setShowForm(true)} className="shadow-lg shadow-indigo-500/25">
            <Plus className="w-4 h-4 mr-2" />
            New Message
          </Button>
        </motion.div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <AnimatedStatCard
          title="Sent Messages"
          value={sentMessages.length}
          icon={<Send className="w-5 h-5" />}
          gradient="from-blue-500 to-indigo-500"
          delay={0}
        />
        <AnimatedStatCard
          title="Inbox"
          value={messages.length}
          icon={<Inbox className="w-5 h-5" />}
          gradient="from-emerald-500 to-teal-500"
          delay={0.1}
        />
      </div>

      {/* Tabs */}
      <GlassCard hover={false} className="p-2">
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'sent'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('sent')}
          >
            <Send className="w-4 h-4" />
            Sent ({sentMessages.length})
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'inbox'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('inbox')}
          >
            <Inbox className="w-4 h-4" />
            Inbox ({messages.length})
          </motion.button>
        </div>
      </GlassCard>

      {/* Messages List */}
      <GlassCard hover={false} className="overflow-hidden">
        {displayMessages.length === 0 ? (
          <div className="p-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <Mail className="mx-auto w-16 h-16 text-gray-300" />
            </motion.div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No messages yet</h3>
            <p className="mt-2 text-sm text-gray-500">
              {activeTab === 'sent' ? 'Start by sending your first message.' : 'Your inbox is empty.'}
            </p>
            {activeTab === 'sent' && (
              <div className="mt-6">
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Message
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {displayMessages.map((message, index) => (
              <motion.div
                key={message._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ backgroundColor: 'rgba(249, 250, 251, 0.8)' }}
                className="p-4 cursor-pointer transition-all group"
                onClick={() => setSelectedMessage(message)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm font-semibold shadow-lg shadow-blue-500/20">
                        {message.subject?.charAt(0)?.toUpperCase() || 'M'}
                      </div>
                      <span className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {message.subject}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[message.priority]}`}>
                        {message.priority}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 ml-10">
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
                    <p className="text-sm text-gray-500 mt-1 line-clamp-1 ml-10">{message.content}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(message.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Compose Message Modal */}
      <AnimatePresence>
        {showForm && (
          <Portal>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-start justify-center overflow-y-auto pt-20 pb-20"
              onClick={() => setShowForm(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="relative glass-strong rounded-2xl shadow-2xl w-full max-w-2xl mx-4 p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-4 mb-6">
                  <Icon3D gradient="from-blue-500 to-indigo-500" size="md">
                    <Send className="w-5 h-5" />
                  </Icon3D>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Compose Message</h3>
                    <p className="text-sm text-gray-500">Send a new message or announcement</p>
                  </div>
                  <button
                    onClick={() => setShowForm(false)}
                    className="ml-auto p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Message Type
                      </label>
                      <select
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white/80 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 transition-all"
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Recipients
                      </label>
                      <select
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white/80 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 transition-all"
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
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Class
                      </label>
                      <select
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white/80 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 transition-all"
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
                    </motion.div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white/80 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 transition-all"
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject *
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white/80 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 transition-all"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Enter subject..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message *
                    </label>
                    <textarea
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white/80 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 transition-all resize-none"
                      rows={6}
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Write your message..."
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                        Cancel
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button type="submit" disabled={submitting} className="shadow-lg shadow-indigo-500/25">
                        {submitting ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                            />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>

      {/* View Message Modal */}
      <AnimatePresence>
        {selectedMessage && (
          <Portal>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-start justify-center overflow-y-auto pt-20 pb-20"
              onClick={() => setSelectedMessage(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="relative glass-strong rounded-2xl shadow-2xl w-full max-w-2xl mx-4 p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30">
                      {selectedMessage.subject?.charAt(0)?.toUpperCase() || 'M'}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {selectedMessage.subject}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full ${priorityColors[selectedMessage.priority]}`}>
                          {selectedMessage.priority}
                        </span>
                        <span className="text-xs text-gray-500 px-2.5 py-0.5 bg-gray-100 rounded-full">
                          {typeLabels[selectedMessage.type]}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(selectedMessage.createdAt).toLocaleString()}
                    </span>
                    <button
                      onClick={() => setSelectedMessage(null)}
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4 text-sm">
                  <GlassCard hover={false} className="p-4">
                    <div className="flex gap-6 text-gray-600">
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <span className="font-medium text-gray-700">From:</span>{' '}
                        {selectedMessage.senderId?.firstName} {selectedMessage.senderId?.lastName}
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 }}
                      >
                        <span className="font-medium text-gray-700">To:</span>{' '}
                        {recipientGroupLabels[selectedMessage.recipientGroup]}
                        {selectedMessage.classId && ` (${selectedMessage.classId.name})`}
                      </motion.div>
                    </div>
                  </GlassCard>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-5 border border-gray-200/50"
                  >
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {selectedMessage.content}
                    </p>
                  </motion.div>

                  {selectedMessage.readBy && selectedMessage.readBy.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.25 }}
                      className="text-xs text-gray-500 flex items-center gap-2"
                    >
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      Read by {selectedMessage.readBy.length} recipient(s)
                    </motion.div>
                  )}
                </div>

                <div className="flex justify-between gap-3 mt-6 pt-4 border-t border-gray-200">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="outline"
                      onClick={() => handleDelete(selectedMessage._id)}
                      className="text-red-600 hover:bg-red-50 border-red-200"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button variant="outline" onClick={() => setSelectedMessage(null)}>
                      Close
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
