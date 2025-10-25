'use client';

import { useState } from 'react';
import { Button } from '@repo/ui/button';

type TicketCategory = 'Hardware' | 'Software' | 'Billing' | 'Access' | 'Other';
type TicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';
type SupportTicket = { id: string; title: string; category: TicketCategory; status: TicketStatus; updatedAt: string };

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: 'st-1',
      title: "Can't access class resources",
      category: 'Access',
      status: 'Open',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'st-2',
      title: 'Invoice not downloading',
      category: 'Software',
      status: 'In Progress',
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    },
  ]);
  const [ticketSearch, setTicketSearch] = useState('');
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [newTicketTitle, setNewTicketTitle] = useState('');

  return (
    <section className="animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Support Tickets</h3>
          <Button
            onClick={() => {
              setNewTicketTitle('');
              setShowNewTicket(true);
            }}
          >
            + New Ticket
          </Button>
        </div>
        <div className="relative mb-3">
          <input
            className="h-10 w-full max-w-sm border border-gray-300 rounded-lg pl-9 pr-9 text-sm focus:ring-2 focus:ring-gray-400 bg-white text-gray-900 placeholder:text-gray-400"
            placeholder="Search tickets"
            value={ticketSearch}
            onChange={(e) => setTicketSearch(e.target.value)}
          />
          <span className="absolute left-3 top-2.5 text-gray-400">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </span>
          {ticketSearch && (
            <button
              className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-300"
              onClick={() => setTicketSearch('')}
            >
              ×
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
              <tr>
                <th className="px-4 py-2 text-left">Title</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-right">Date</th>
              </tr>
            </thead>
            <tbody>
              {tickets
                .filter((t) => {
                  const q = ticketSearch.trim().toLowerCase();
                  return !q || t.title.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
                })
                .map((t, idx) => (
                  <tr
                    key={t.id}
                    className="border-t dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-all"
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    <td className="px-4 py-2 text-gray-900 dark:text-gray-100 group relative hover:before:content-['View_Ticket'] hover:before:absolute hover:before:-top-5 hover:before:left-0 hover:before:text-[10px] hover:before:text-gray-400">
                      {t.title}
                    </td>
                    <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{t.category}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`text-xs px-3 py-1 rounded-full border ${
                          t.status === 'Open'
                            ? 'bg-sky-50 text-sky-700 border-sky-200'
                            : t.status === 'In Progress'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : t.status === 'Resolved'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right text-gray-600 dark:text-gray-300">
                      {new Date(t.updatedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              {tickets.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-gray-500">
                    No tickets
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Ticket modal */}
      {showNewTicket && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={() => setShowNewTicket(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-md p-6 animate-zoom-in">
            <h3 className="text-lg font-semibold mb-3">Create Support Ticket</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Title</label>
                <input
                  value={newTicketTitle}
                  onChange={(e) => setNewTicketTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-400"
                  placeholder="e.g., Unable to access portal"
                />
              </div>
            </div>
            <div className="mt-4 text-right flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNewTicket(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const title = newTicketTitle.trim() || 'New Issue';
                  const t: SupportTicket = {
                    id: `st-${Date.now()}`,
                    title,
                    category: 'Other',
                    status: 'Open',
                    updatedAt: new Date().toISOString(),
                  };
                  setTickets((prev) => [t, ...prev]);
                  setShowNewTicket(false);
                }}
              >
                Create
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
