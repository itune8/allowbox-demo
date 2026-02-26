'use client';

import { useState, useEffect, useMemo } from 'react';
import { dailyDiaryService } from '../../../../lib/services/daily-diary.service';
import { SchoolStatCard, FormModal, ConfirmModal, useToast } from '../../../../components/school';
import {
  BookOpenCheck,
  Calendar,
  FileText,
  Loader2,
  Plus,
  Eye,
  Trash2,
} from 'lucide-react';

// ── Mock data ──
interface MockDiary {
  id: string;
  class: string;
  date: string;
  topicsCovered: string;
  homeworkGiven: string;
  notes: string;
}

const MOCK_ENTRIES: MockDiary[] = [
  { id: 'd1', class: 'Class 10-A', date: '2025-03-03', topicsCovered: 'Quadratic Equations — Nature of Roots', homeworkGiven: 'Exercise 4.3, Q1-Q10', notes: 'Students grasped the discriminant concept well' },
  { id: 'd2', class: 'Class 9-B', date: '2025-03-03', topicsCovered: 'Linear Equations in Two Variables', homeworkGiven: 'Worksheet 5 — Graphing practice', notes: 'Need more practice on graphing' },
  { id: 'd3', class: 'Class 8-A', date: '2025-03-03', topicsCovered: 'Newton\'s Second Law of Motion', homeworkGiven: 'Read chapter 9, answer Q1-Q5', notes: 'Lab experiment completed successfully' },
  { id: 'd4', class: 'Class 10-B', date: '2025-03-03', topicsCovered: 'Trigonometric Identities', homeworkGiven: 'Exercise 8.2, all problems', notes: '' },
  { id: 'd5', class: 'Class 7-C', date: '2025-03-02', topicsCovered: 'Integers — Addition and Subtraction', homeworkGiven: 'Practice sheet 3', notes: 'Some students struggling with negative numbers' },
];

const MOCK_WEEKLY_COUNT = 18;
const MOCK_TOTAL_COUNT = 86;

export default function TeacherDiaryPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<MockDiary[]>(MOCK_ENTRIES);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0] || '');
  const [showForm, setShowForm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<MockDiary | null>(null);
  const [confirmModal, setConfirmModal] = useState({ open: false, id: '' });

  const [formData, setFormData] = useState({
    class: 'Class 10-A',
    date: new Date().toISOString().split('T')[0] || '',
    topicsCovered: '',
    homeworkGiven: '',
    notes: '',
  });

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const todayEntries = useMemo(() => entries.filter((e) => e.date === selectedDate), [entries, selectedDate]);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.topicsCovered.trim()) return;
    const newEntry: MockDiary = {
      id: `d${Date.now()}`,
      class: formData.class,
      date: formData.date,
      topicsCovered: formData.topicsCovered,
      homeworkGiven: formData.homeworkGiven,
      notes: formData.notes,
    };
    setEntries((prev) => [newEntry, ...prev]);
    setFormData({ class: 'Class 10-A', date: new Date().toISOString().split('T')[0]!, topicsCovered: '', homeworkGiven: '', notes: '' });
    setShowForm(false);
    showToast('success', 'Diary entry added');
  }

  function handleDelete(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setConfirmModal({ open: false, id: '' });
    showToast('success', 'Entry deleted');
  }

  const inputClass = 'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] hover:border-slate-300 transition-all';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-[#824ef2] animate-spin" />
        <p className="mt-4 text-slate-500">Loading diary...</p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <BookOpenCheck className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Daily Diary</h1>
            <p className="text-sm text-slate-500">Record daily class activities and homework</p>
          </div>
        </div>
        <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors">
          <Plus className="w-4 h-4" /> Add Entry
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SchoolStatCard icon={<BookOpenCheck className="w-5 h-5" />} color="blue" label="Today's Entries" value={todayEntries.length} />
        <SchoolStatCard icon={<Calendar className="w-5 h-5" />} color="green" label="This Week" value={MOCK_WEEKLY_COUNT} />
        <SchoolStatCard icon={<FileText className="w-5 h-5" />} color="purple" label="Total Entries" value={MOCK_TOTAL_COUNT} />
      </div>

      {/* Date Selector */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-slate-700">Date:</label>
          <input
            type="date"
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2]"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <span className="text-sm text-slate-500">{todayEntries.length} entries</span>
        </div>
      </div>

      {/* Entries */}
      <div className="space-y-4">
        {todayEntries.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
            <BookOpenCheck className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 mb-4">No entries for this date</p>
            <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors">
              <Plus className="w-4 h-4" /> Add Entry
            </button>
          </div>
        ) : (
          todayEntries.map((entry) => (
            <div key={entry.id} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{entry.class}</h3>
                  <p className="text-xs text-slate-500">{new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setSelectedEntry(entry); setShowDetailModal(true); }} className="p-1.5 text-slate-400 hover:text-[#824ef2] hover:bg-slate-100 rounded-lg transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button onClick={() => setConfirmModal({ open: true, id: entry.id })} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-0.5">Topics Covered</p>
                  <p className="text-sm text-slate-700">{entry.topicsCovered}</p>
                </div>
                {entry.homeworkGiven && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-0.5">Homework Given</p>
                    <p className="text-sm text-slate-700">{entry.homeworkGiven}</p>
                  </div>
                )}
                {entry.notes && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-0.5">Notes</p>
                    <p className="text-sm text-slate-600 italic">{entry.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      <FormModal open={showForm} onClose={() => setShowForm(false)} title="Add Diary Entry" size="md" footer={
        <>
          <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
          <button type="submit" form="diary-form" className="px-6 py-2 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors">Save Entry</button>
        </>
      }>
        <form id="diary-form" onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Class</label>
              <select className={`${inputClass} cursor-pointer`} value={formData.class} onChange={(e) => setFormData({ ...formData, class: e.target.value })}>
                {['Class 10-A', 'Class 10-B', 'Class 9-A', 'Class 9-B', 'Class 8-A', 'Class 7-C'].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Date</label>
              <input type="date" className={inputClass} value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Topics Covered <span className="text-red-500">*</span></label>
            <textarea className={`${inputClass} resize-none`} rows={2} value={formData.topicsCovered} onChange={(e) => setFormData({ ...formData, topicsCovered: e.target.value })} required placeholder="What was covered today..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Homework Given</label>
            <textarea className={`${inputClass} resize-none`} rows={2} value={formData.homeworkGiven} onChange={(e) => setFormData({ ...formData, homeworkGiven: e.target.value })} placeholder="Homework assigned..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
            <textarea className={`${inputClass} resize-none`} rows={2} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Additional observations..." />
          </div>
        </form>
      </FormModal>

      {/* Detail Modal */}
      <FormModal open={showDetailModal && !!selectedEntry} onClose={() => { setShowDetailModal(false); setSelectedEntry(null); }} title={`Diary — ${selectedEntry?.class || ''}`} size="md" footer={
        <button onClick={() => { setShowDetailModal(false); setSelectedEntry(null); }} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Close</button>
      }>
        {selectedEntry && (
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <p className="text-xs text-slate-500 mb-1">Date</p>
              <p className="text-sm font-semibold text-slate-900">{new Date(selectedEntry.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Topics Covered</h4>
              <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3 border border-slate-200">{selectedEntry.topicsCovered}</p>
            </div>
            {selectedEntry.homeworkGiven && (
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-2">Homework Given</h4>
                <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3 border border-slate-200">{selectedEntry.homeworkGiven}</p>
              </div>
            )}
            {selectedEntry.notes && (
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-2">Notes</h4>
                <p className="text-sm text-slate-600 italic">{selectedEntry.notes}</p>
              </div>
            )}
          </div>
        )}
      </FormModal>

      <ConfirmModal open={confirmModal.open} title="Delete Entry" message="Are you sure you want to delete this diary entry?" confirmLabel="Delete" confirmColor="red" onConfirm={() => handleDelete(confirmModal.id)} onCancel={() => setConfirmModal({ open: false, id: '' })} />
    </section>
  );
}
