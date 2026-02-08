'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@repo/ui/button';
import {
  messageService,
  Message,
  MessagePriority,
} from '../../../../lib/services/message.service';
import { GlassCard, Icon3D, SlideSheet, SheetSection, SheetDetailRow } from '@/components/ui';
import {
  Mail,
  Inbox,
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
    [MessagePriority.LOW]: 'bg-gray-400',
    [MessagePriority.NORMAL]: 'bg-blue-400',
    [MessagePriority.HIGH]: 'bg-orange-400',
    [MessagePriority.URGENT]: 'bg-red-400',
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
          <Icon3D bgColor="bg-blue-500" size="lg">
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
            <GlassCard className="bg-blue-500 text-white px-3 py-2 text-sm font-semibold shadow-lg">
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
                    className={`p-3 sm:p-4 hover:bg-blue-50 cursor-pointer transition-all group ${
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
                        <Icon3D bgColor="bg-gray-500" size="md">
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
                            <span className={`text-xs px-2.5 py-1 rounded-lg ${priorityColors[message.priority]} text-white font-medium flex-shrink-0`}>
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

      {/* View Message Sheet */}
      <SlideSheet
        isOpen={!!selectedMessage}
        onClose={() => setSelectedMessage(null)}
        title={selectedMessage?.subject || ''}
        subtitle={selectedMessage ? `${selectedMessage.priority} Priority • ${new Date(selectedMessage.createdAt).toLocaleString()}` : ''}
        size="md"
        footer={
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setSelectedMessage(null)}>
              Close
            </Button>
          </div>
        }
      >
        {selectedMessage && (
          <div className="space-y-4">
            <SheetSection title="From" icon={<User className="w-4 h-4" />}>
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="font-semibold text-gray-900">
                  {selectedMessage.senderId?.firstName} {selectedMessage.senderId?.lastName}
                  {selectedMessage.senderId?.role && (
                    <span className="text-sm text-gray-600 ml-2">({selectedMessage.senderId.role})</span>
                  )}
                </div>
              </div>
            </SheetSection>

            <SheetSection title="Message">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {selectedMessage.content}
                </p>
              </div>
            </SheetSection>

            {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
              <SheetSection title={`Attachments (${selectedMessage.attachments.length})`} icon={<Paperclip className="w-4 h-4" />}>
                <div className="flex flex-wrap gap-2">
                  {selectedMessage.attachments.map((attachment, index) => (
                    <a
                      key={index}
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-white bg-blue-500 hover:bg-blue-600 px-3 py-2 rounded-lg transition-all"
                    >
                      <Paperclip className="w-4 h-4" />
                      {attachment.name}
                    </a>
                  ))}
                </div>
              </SheetSection>
            )}
          </div>
        )}
      </SlideSheet>
    </div>
  );
}
