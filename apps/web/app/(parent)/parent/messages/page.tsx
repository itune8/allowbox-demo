'use client';

import { useState, useEffect } from 'react';
import { Button } from '@repo/ui/button';
import {
  messageService,
  Message,
  MessagePriority,
} from '../../../../lib/services/message.service';

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
    [MessagePriority.LOW]: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    [MessagePriority.NORMAL]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    [MessagePriority.HIGH]: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    [MessagePriority.URGENT]: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  };

  const unreadCount = messages.filter((m) => {
    // Check if current user hasn't read this message
    return !m.readBy || m.readBy.length === 0;
  }).length;

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
            View announcements and messages from school
          </p>
        </div>
        {unreadCount > 0 && (
          <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 text-sm px-3 py-1 rounded-full">
            {unreadCount} unread
          </span>
        )}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Messages List */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
        {messages.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-3">📬</div>
            <p>No messages yet.</p>
            <p className="text-sm mt-1">You'll receive announcements and messages from school here.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {messages.map((message) => {
              const isUnread = !message.readBy || message.readBy.length === 0;
              return (
                <div
                  key={message._id}
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors ${
                    isUnread ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''
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
                          <span className="h-2 w-2 bg-indigo-500 rounded-full" />
                        )}
                        <span className={`font-medium text-gray-900 dark:text-gray-100 ${isUnread ? 'font-semibold' : ''}`}>
                          {message.subject}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded ${priorityColors[message.priority]}`}>
                          {message.priority}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        From: {message.senderId?.firstName} {message.senderId?.lastName}
                        {message.senderId?.role && ` (${message.senderId.role})`}
                      </div>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">{message.content}</p>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(message.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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
                </div>
              </div>
              <span className="text-sm text-gray-500">
                {new Date(selectedMessage.createdAt).toLocaleString()}
              </span>
            </div>

            <div className="space-y-4 text-sm">
              <div className="text-gray-600 dark:text-gray-300">
                <span className="font-medium">From:</span>{' '}
                {selectedMessage.senderId?.firstName} {selectedMessage.senderId?.lastName}
                {selectedMessage.senderId?.role && ` (${selectedMessage.senderId.role})`}
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {selectedMessage.content}
                </p>
              </div>

              {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                <div className="space-y-2">
                  <div className="font-medium text-gray-700 dark:text-gray-300">Attachments:</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedMessage.attachments.map((attachment, index) => (
                      <a
                        key={index}
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-indigo-600 hover:underline bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded"
                      >
                        📎 {attachment.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
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
