'use client';

import { useState } from 'react';
import { MinimalCard } from '@repo/ui/cards';
import { Badge } from '@repo/ui/data-display';
import { MessageSquare, Send, Search } from 'lucide-react';

export default function ParentMessagesPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const messages = [
    {
      id: 1,
      from: 'Ms. Anderson',
      role: 'Math Teacher',
      subject: 'Great progress in Mathematics',
      preview: 'I wanted to let you know that Emma has been doing exceptionally well...',
      time: '2h ago',
      unread: true,
    },
    {
      id: 2,
      from: 'Mr. Peterson',
      role: 'Science Teacher',
      subject: 'Science Fair Project',
      preview: 'Regarding the upcoming science fair, Emma needs to submit her proposal...',
      time: '5h ago',
      unread: true,
    },
    {
      id: 3,
      from: 'School Admin',
      role: 'Administration',
      subject: 'Parent-Teacher Meeting Schedule',
      preview: 'The next parent-teacher meeting is scheduled for December 15th...',
      time: '1d ago',
      unread: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
          <p className="text-slate-600 mt-1">Communication with teachers and school</p>
        </div>
        <button className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors flex items-center gap-2">
          <Send className="w-4 h-4" />
          New Message
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search messages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
        />
      </div>

      <MinimalCard padding="none">
        <div className="divide-y divide-slate-100">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors ${message.unread ? 'bg-purple-50/50' : ''}`}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold flex-shrink-0">
                  {message.from[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-semibold ${message.unread ? 'text-slate-900' : 'text-slate-700'}`}>
                      {message.from}
                    </h4>
                    <span className="text-xs text-slate-500">{message.role}</span>
                    {message.unread && (
                      <Badge variant="purple" size="sm">New</Badge>
                    )}
                  </div>
                  <p className={`text-sm mb-1 ${message.unread ? 'font-medium text-slate-900' : 'text-slate-600'}`}>
                    {message.subject}
                  </p>
                  <p className="text-sm text-slate-500 truncate">{message.preview}</p>
                </div>
                <span className="text-xs text-slate-400 flex-shrink-0">{message.time}</span>
              </div>
            </div>
          ))}
        </div>
      </MinimalCard>
    </div>
  );
}
