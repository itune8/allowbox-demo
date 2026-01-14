'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@repo/ui/button';
import {
  messageService,
  Message,
  MessagePriority,
} from '../../../../lib/services/message.service';
import { GlassCard, Icon3D } from '@/components/ui';
import {
  Mail,
  Inbox,
  X,
  Sparkles,
  User,
  Clock,
  Paperclip,
  AlertCircle,
} from 'lucide-react';

export default function ParentMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  async function loadMessages() {
    try {
      setLoading(true);
      const data = await messageService.getInbox();
      setMessages(data);
    } catch (err) {
      setError('Failed to load messages');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAsRead(id: string) {
    try {
      await messageService.markAsRead(id);
      await loadMessages();
    } catch (err) {
      console.error(err);
    }
  }

  const priorityColors: Record<MessagePriority, string> = {
    [MessagePriority.LOW]: 'from-gray-400 to-gray-500',
    [MessagePriority.NORMAL]: 'from-blue-400 to-blue-500',
    [MessagePriority.HIGH]: 'from-orange-400 to-orange-500',
    [MessagePriority.URGENT]: 'from-red-400 to-red-500',
  };

  const unreadCount = messages.filter((m) => {
    return !m.readBy || m.readBy.length === 0;
  }).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
        />
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
        className="flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-4">
          <Icon3D gradient="from-blue-500 to-indigo-500" size="lg">
            <Inbox className="w-6 h-6" />
          </Icon3D>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              Messages
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Sparkles className="w-5 h-5 text-blue-500" />
              </motion.span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Announcements and messages from school
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <GlassCard className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-2 text-sm font-semibold shadow-lg">
              {unreadCount} unread
            </GlassCard>
          </motion.div>
        )}
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
          <button onClick={() => setError(null)} className="ml-2 underline">
            Dismiss
          </button>
        </motion.div>
      )}

      {/* Messages List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <GlassCard className="bg-white/90">
          {messages.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mb-4"
              >
                <Mail className="w-16 h-16 mx-auto text-gray-300" />
              </motion.div>
              <p className="text-lg font-medium">No messages yet</p>
              <p className="text-sm mt-1">You'll receive announcements and messages from school here.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {messages.map((message, index) => {
                const isUnread = !message.readBy || message.readBy.length === 0;
                return (
                  <motion.div
                    key={message._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-3 sm:p-4 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 cursor-pointer transition-all group ${
                      isUnread ? 'bg-blue-50/30' : ''
                    }`}
                    onClick={() => {
                      setSelectedMessage(message);
                      if (isUnread) {
                        handleMarkAsRead(message._id);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <Icon3D gradient={priorityColors[message.priority]} size="md">
                          <Mail className="w-4 h-4" />
                        </Icon3D>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            {isUnread && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0"
                              />
                            )}
                            <span className={`font-medium text-gray-900 text-sm sm:text-base truncate group-hover:text-blue-700 transition-colors ${isUnread ? 'font-bold' : ''}`}>
                              {message.subject}
                            </span>
                            <span className={`text-xs px-2.5 py-1 rounded-lg bg-gradient-to-r ${priorityColors[message.priority]} text-white font-medium flex-shrink-0`}>
                              {message.priority}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 mb-1">
                            <User className="w-3.5 h-3.5" />
                            <span className="truncate">
                              {message.senderId?.firstName} {message.senderId?.lastName}
                              {message.senderId?.role && ` (${message.senderId.role})`}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-500 line-clamp-1">{message.content}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(message.createdAt).toLocaleDateString()}
                        </div>
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Paperclip className="w-3.5 h-3.5" />
                            <span>{message.attachments.length}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* View Message Modal */}
      <AnimatePresence>
        {selectedMessage && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setSelectedMessage(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-indigo-500 p-4 sm:p-6 rounded-t-2xl">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Icon3D gradient="from-white/20 to-white/5" size="lg">
                      <Mail className="w-6 h-6" />
                    </Icon3D>
                    <div className="text-white flex-1">
                      <span className={`inline-block text-xs px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-sm font-medium mb-2`}>
                        {selectedMessage.priority}
                      </span>
                      <h3 className="text-xl font-bold">
                        {selectedMessage.subject}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-blue-100 mt-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(selectedMessage.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedMessage(null)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </motion.button>
                </div>
              </div>

              <div className="p-4 sm:p-6 space-y-4">
                <GlassCard className="p-4 bg-blue-50/50">
                  <div className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    From
                  </div>
                  <div className="font-semibold text-gray-900">
                    {selectedMessage.senderId?.firstName} {selectedMessage.senderId?.lastName}
                    {selectedMessage.senderId?.role && (
                      <span className="text-sm text-gray-600 ml-2">({selectedMessage.senderId.role})</span>
                    )}
                  </div>
                </GlassCard>

                <GlassCard className="p-4 bg-gradient-to-br from-gray-50 to-gray-100/50">
                  <div className="text-xs text-gray-600 mb-2 font-medium">Message</div>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {selectedMessage.content}
                  </p>
                </GlassCard>

                {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                  <GlassCard className="p-4 bg-white/80">
                    <div className="text-xs text-gray-600 mb-2 font-medium flex items-center gap-1">
                      <Paperclip className="w-3.5 h-3.5" />
                      Attachments ({selectedMessage.attachments.length})
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedMessage.attachments.map((attachment, index) => (
                        <motion.a
                          key={index}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-white bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 px-3 py-2 rounded-lg transition-all shadow-lg"
                        >
                          <Paperclip className="w-4 h-4" />
                          {attachment.name}
                        </motion.a>
                      ))}
                    </div>
                  </GlassCard>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button variant="outline" onClick={() => setSelectedMessage(null)}>
                      Close
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
