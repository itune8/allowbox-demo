'use client';

import { useState } from 'react';
import { useAuth } from '../../../../contexts/auth-context';
import {
  getSupportTickets,
  upsertSupportTicket,
  deleteSupportTicket,
} from '../../../../lib/data-store';
import { Button } from '@repo/ui/button';

export default function SupportPage() {
  const { user } = useAuth();
  const [tickets] = useState(() => getSupportTickets());
  const [showNew, setShowNew] = useState(false);
  const [filter, setFilter] = useState<'All' | 'Open' | 'In Progress' | 'Resolved' | 'Closed'>('All');
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Billing' as 'Billing' | 'Technical' | 'General',
  });
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const filtered = tickets.filter((t) => (filter === 'All' ? true : t.status === filter));

  const faqs = [
    { q: 'How do I pay school fees online?', a: 'Open the Fees page and click Pay Now on a pending invoice.' },
    { q: 'Can I link multiple children?', a: 'Yes, use Link New Child in the Children page.' },
    { q: 'Where can I view my receipts?', a: 'Go to Payments and use Download Receipt action.' },
    {
      q: 'How do I update my contact information?',
      a: 'Contact school administration or use the profile settings.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Support Center</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Get help with your questions and manage support tickets
        </p>
      </div>

      {/* Support Tickets */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">My Support Tickets</h3>
          <div className="flex items-center gap-2">
            <select
              className="border border-gray-300 bg-white text-gray-900 rounded-md px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
              value={filter}
              onChange={(e) =>
                setFilter(e.target.value as 'All' | 'Open' | 'In Progress' | 'Resolved' | 'Closed')
              }
            >
              {['All', 'Open', 'In Progress', 'Resolved', 'Closed'].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <Button onClick={() => setShowNew(true)}>New Ticket</Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr className="text-left text-gray-500 dark:text-gray-400">
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-500 dark:text-gray-400">
                    No tickets yet. Create one if you need assistance!
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">{t.title}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{t.category}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          t.status === 'Open'
                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                            : t.status === 'In Progress'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                            : t.status === 'Resolved'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{t.createdAt.slice(0, 10)}</td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-2 text-xs">
                        <button
                          className="text-indigo-600 dark:text-indigo-400 hover:underline"
                          onClick={() => alert(t.description)}
                        >
                          View
                        </button>
                        <button
                          className="text-red-600 dark:text-red-400 hover:underline"
                          onClick={() => {
                            if (confirm('Delete this ticket?')) deleteSupportTicket(t.id);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Frequently Asked Questions
        </h3>
        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
              onClick={() => setExpandedFAQ(expandedFAQ === idx ? null : idx)}
            >
              <div className="flex items-center justify-between">
                <div className="font-medium text-gray-900 dark:text-gray-100">{faq.q}</div>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    expandedFAQ === idx ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <div
                className={`transition-all duration-300 overflow-hidden ${
                  expandedFAQ === idx ? 'max-h-40 mt-3' : 'max-h-0'
                }`}
              >
                <div className="text-sm text-gray-600 dark:text-gray-300">{faq.a}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Need More Help?</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Our support team is available Monday-Friday, 9AM-5PM
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            support@school.com
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
            (555) 123-4567
          </div>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" onClick={() => alert('Opening live chat...')}>
              Live Chat
            </Button>
            <Button variant="outline" onClick={() => (window.location.href = 'tel:5551234567')}>
              Call Support
            </Button>
          </div>
        </div>
      </div>

      {/* New Ticket Modal */}
      {showNew && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowNew(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg w-full max-w-lg p-6 animate-zoom-in">
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Create Support Ticket</h3>
            <div className="space-y-3">
              <input
                className="w-full border border-gray-300 bg-white text-gray-900 rounded-md p-3 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <textarea
                className="w-full border border-gray-300 bg-white text-gray-900 rounded-md p-3 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                rows={4}
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <select
                className="w-full border border-gray-300 bg-white text-gray-900 rounded-md p-3 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value as 'Billing' | 'Technical' | 'General' })
                }
              >
                {['Billing', 'Technical', 'General'].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <input type="file" className="text-sm" />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNew(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const now = new Date().toISOString();
                  const cat = form.category === 'Technical' ? 'Software' : form.category === 'General' ? 'Other' : 'Billing';
                  upsertSupportTicket({
                    id: `t-${Date.now()}`,
                    title: form.title.trim() || 'Untitled',
                    description: form.description.trim(),
                    category: cat as 'Billing' | 'Software' | 'Other',
                    priority: 'Low',
                    status: 'Open',
                    createdAt: now,
                    updatedAt: now,
                    submitter: user?.email || '',
                  });
                  setShowNew(false);
                  setForm({ title: '', description: '', category: 'Billing' });
                }}
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
