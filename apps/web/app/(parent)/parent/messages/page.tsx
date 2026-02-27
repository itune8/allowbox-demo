'use client';

import { useState, useEffect, useMemo } from 'react';
import { FormModal, useToast } from '../../../../components/school';
import {
  MessageSquare,
  Loader2,
  Send,
  ArrowLeft,
  Plus,
  Search,
} from 'lucide-react';

// ── Mock data ──
interface Conversation {
  id: string;
  name: string;
  role: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar: string;
}

interface Message {
  id: string;
  sender: 'me' | 'them';
  text: string;
  time: string;
}

const MOCK_CONVERSATIONS: Conversation[] = [
  { id: 'conv1', name: 'Ms. Anderson', role: 'Teacher', lastMessage: 'Emma has been doing exceptionally well in Mathematics this term', time: '10:30 AM', unread: 2, avatar: 'MA' },
  { id: 'conv2', name: 'Mr. Peterson', role: 'Teacher', lastMessage: 'The science fair proposal is due next Friday', time: '9:15 AM', unread: 1, avatar: 'MP' },
  { id: 'conv3', name: 'School Admin', role: 'Staff', lastMessage: 'Parent-teacher meeting is scheduled for March 15th', time: 'Yesterday', unread: 0, avatar: 'SA' },
  { id: 'conv4', name: 'Mrs. Davis', role: 'Teacher', lastMessage: 'Liam did very well on his English presentation today', time: 'Yesterday', unread: 0, avatar: 'MD' },
  { id: 'conv5', name: 'Transport Office', role: 'Staff', lastMessage: 'Bus route 7 will be delayed by 10 minutes tomorrow', time: 'Mar 1', unread: 0, avatar: 'TO' },
];

const MOCK_MESSAGES: Record<string, Message[]> = {
  conv1: [
    { id: 'm1', sender: 'me', text: 'Hi Ms. Anderson, I wanted to check on Emma\'s progress in Mathematics this term.', time: '10:00 AM' },
    { id: 'm2', sender: 'them', text: 'Hello! Emma has been doing really well. She scored 92% in the last unit test and participates actively in class.', time: '10:10 AM' },
    { id: 'm3', sender: 'me', text: 'That\'s wonderful to hear! She mentioned she found quadratic equations a bit challenging.', time: '10:15 AM' },
    { id: 'm4', sender: 'them', text: 'Yes, I noticed that too. I\'ve given her some extra practice worksheets. She\'s already improving.', time: '10:20 AM' },
    { id: 'm5', sender: 'them', text: 'Emma has been doing exceptionally well in Mathematics this term. Keep encouraging her at home!', time: '10:30 AM' },
  ],
  conv2: [
    { id: 'm6', sender: 'them', text: 'Good morning! I wanted to remind you about the upcoming science fair.', time: '8:45 AM' },
    { id: 'm7', sender: 'me', text: 'Good morning Mr. Peterson! Yes, Emma is very excited about it. What does she need to prepare?', time: '9:00 AM' },
    { id: 'm8', sender: 'them', text: 'The science fair proposal is due next Friday. She should pick a topic and write a brief outline of her experiment.', time: '9:15 AM' },
  ],
  conv3: [
    { id: 'm9', sender: 'them', text: 'Dear Parents, this is a reminder that the parent-teacher meeting is scheduled for March 15th from 9 AM to 1 PM.', time: 'Yesterday' },
    { id: 'm10', sender: 'me', text: 'Thank you for the reminder. I\'ll be there. Can I also discuss Liam\'s progress with his class teacher?', time: 'Yesterday' },
    { id: 'm11', sender: 'them', text: 'Absolutely! We\'ll have individual slots available. You can sign up at the reception on the day.', time: 'Yesterday' },
  ],
};

export default function ParentMessagesPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [filter, setFilter] = useState<'all' | 'teachers' | 'staff'>('all');
  const [showNewModal, setShowNewModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (selectedConv) {
      setMessages(MOCK_MESSAGES[selectedConv] || []);
    }
  }, [selectedConv]);

  const filtered = useMemo(() => {
    let list = conversations;
    if (filter === 'teachers') list = list.filter((c) => c.role === 'Teacher');
    else if (filter === 'staff') list = list.filter((c) => c.role === 'Staff');
    if (searchQuery) list = list.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return list;
  }, [conversations, filter, searchQuery]);

  const selectedConvData = conversations.find((c) => c.id === selectedConv);

  function handleSend() {
    if (!newMessage.trim() || !selectedConv) return;
    const msg: Message = {
      id: `m${Date.now()}`,
      sender: 'me',
      text: newMessage,
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, msg]);
    setNewMessage('');
    showToast('success', 'Message sent');
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-[#824ef2] animate-spin" />
        <p className="mt-4 text-slate-500">Loading messages...</p>
      </div>
    );
  }

  return (
    <section className="flex flex-col h-[calc(100vh-100px)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
            <p className="text-sm text-slate-500">Communicate with teachers and school staff</p>
          </div>
        </div>
        <button onClick={() => setShowNewModal(true)} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors">
          <Plus className="w-4 h-4" /> New Message
        </button>
      </div>

      {/* Two-panel layout */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex-1 min-h-0">
        <div className="flex h-full">
          {/* Conversation List */}
          <div className={`w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col ${selectedConv ? 'hidden md:flex' : 'flex'}`}>
            {/* Search + Filter */}
            <div className="p-4 border-b border-slate-200 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-1.5">
                {(['all', 'teachers', 'staff'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                      filter === f ? 'bg-[#824ef2] text-white border-[#824ef2]' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {filtered.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConv(conv.id)}
                  className={`flex items-center gap-3 p-4 cursor-pointer border-b border-slate-100 transition-colors ${
                    selectedConv === conv.id ? 'bg-[#824ef2]/5' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 text-sm font-semibold text-slate-600">
                    {conv.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-900 truncate">{conv.name}</p>
                      <span className="text-xs text-slate-400 flex-shrink-0">{conv.time}</span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-xs text-slate-500 truncate">{conv.lastMessage}</p>
                      {conv.unread > 0 && (
                        <span className="ml-2 w-5 h-5 bg-[#824ef2] text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
                          {conv.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Message Thread */}
          <div className={`flex-1 flex flex-col ${selectedConv ? 'flex' : 'hidden md:flex'}`}>
            {selectedConv && selectedConvData ? (
              <>
                {/* Thread Header */}
                <div className="p-4 border-b border-slate-200 flex items-center gap-3">
                  <button
                    onClick={() => setSelectedConv(null)}
                    className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-slate-500" />
                  </button>
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600">
                    {selectedConvData.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{selectedConvData.name}</p>
                    <p className="text-xs text-slate-500">{selectedConvData.role}</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                        msg.sender === 'me'
                          ? 'bg-[#824ef2] text-white rounded-br-md'
                          : 'bg-slate-100 text-slate-900 rounded-bl-md'
                      }`}>
                        <p className="text-sm">{msg.text}</p>
                        <p className={`text-[10px] mt-1 ${msg.sender === 'me' ? 'text-white/70' : 'text-slate-400'}`}>{msg.time}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-slate-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      className="flex-1 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2]"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button
                      onClick={handleSend}
                      disabled={!newMessage.trim()}
                      className="p-2.5 bg-[#824ef2] text-white rounded-lg hover:bg-[#6b3fd4] transition-colors disabled:opacity-50"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-500 text-lg font-medium">Select a conversation</p>
                  <p className="text-sm text-slate-400 mt-1">Choose a conversation from the left to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Message Modal */}
      <FormModal open={showNewModal} onClose={() => setShowNewModal(false)} title="New Message" size="md" footer={
        <>
          <button onClick={() => setShowNewModal(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
          <button onClick={() => { setShowNewModal(false); showToast('success', 'Message sent successfully'); }} className="px-6 py-2 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors">Send</button>
        </>
      }>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">To</label>
            <select className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2]">
              <option>Select recipient...</option>
              {conversations.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.role})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Message</label>
            <textarea className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] resize-none" rows={4} placeholder="Type your message..." />
          </div>
        </div>
      </FormModal>
    </section>
  );
}
