'use client';

import { useState, useEffect, useMemo } from 'react';
import { SchoolStatCard, FormModal, useToast } from '../../../../components/school';
import {
  BookOpen,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  Eye,
  Paperclip,
  Calendar,
  User,
} from 'lucide-react';

// ── Types ──
interface MockChild {
  id: string;
  name: string;
  class: string;
  section: string;
}

interface MockAssignment {
  id: string;
  title: string;
  subject: string;
  description: string;
  teacher: string;
  dueDate: string;
  status: 'pending' | 'completed' | 'not_submitted' | 'overdue';
  attachments: string[];
  childId: string;
}

// ── Mock data ──
const MOCK_CHILDREN: MockChild[] = [
  { id: 'c1', name: 'Aarav Sharma', class: 'Class 10', section: 'A' },
  { id: 'c2', name: 'Meera Sharma', class: 'Class 7', section: 'B' },
];

const MOCK_ASSIGNMENTS: MockAssignment[] = [
  { id: 'a1', title: 'Quadratic Equations Practice', subject: 'Mathematics', description: 'Solve all problems from exercise 4.1 and 4.2. Show complete working for each question. Refer to solved examples in the textbook.', teacher: 'Mrs. Anita Desai', dueDate: '2025-03-15', status: 'pending', attachments: ['worksheet_quadratic.pdf'], childId: 'c1' },
  { id: 'a2', title: 'Essay on Climate Change', subject: 'English', description: 'Write a 500-word essay on the effects of climate change on coastal cities. Include references and a bibliography section.', teacher: 'Mr. Rajesh Kumar', dueDate: '2025-03-12', status: 'pending', attachments: [], childId: 'c1' },
  { id: 'a3', title: 'Newton\'s Laws Worksheet', subject: 'Physics', description: 'Complete the worksheet covering Newton\'s three laws of motion. Draw diagrams where applicable.', teacher: 'Ms. Priya Nair', dueDate: '2025-03-10', status: 'completed', attachments: ['newtons_laws.pdf', 'reference_notes.pdf'], childId: 'c1' },
  { id: 'a4', title: 'Chemical Bonding Diagram', subject: 'Chemistry', description: 'Draw and label diagrams for ionic and covalent bonding. Include at least 3 examples of each type.', teacher: 'Dr. Suresh Menon', dueDate: '2025-03-08', status: 'completed', attachments: ['bonding_template.pdf'], childId: 'c1' },
  { id: 'a5', title: 'History Chapter Summary', subject: 'History', description: 'Write a summary of Chapter 7: The French Revolution. Include key dates, events, and figures.', teacher: 'Mrs. Kavita Joshi', dueDate: '2025-03-05', status: 'not_submitted', attachments: [], childId: 'c1' },
  { id: 'a6', title: 'Algebra Basics Review', subject: 'Mathematics', description: 'Complete the review sheet for algebraic expressions and equations. All questions are mandatory.', teacher: 'Mr. Vikram Patel', dueDate: '2025-03-14', status: 'pending', attachments: ['algebra_review.pdf'], childId: 'c2' },
  { id: 'a7', title: 'Hindi Poem Recitation Prep', subject: 'Hindi', description: 'Prepare the poem "Veer Ras" for recitation. Memorize and practice with correct pronunciation.', teacher: 'Mrs. Sunita Rao', dueDate: '2025-03-02', status: 'overdue', attachments: [], childId: 'c2' },
  { id: 'a8', title: 'Science Lab Report', subject: 'Science', description: 'Write the lab report for the experiment on separation of mixtures. Include hypothesis, procedure, observations and conclusion.', teacher: 'Ms. Deepa Iyer', dueDate: '2025-03-01', status: 'not_submitted', attachments: ['lab_template.docx'], childId: 'c2' },
];

const statusColors: Record<string, string> = {
  pending: 'bg-orange-100 text-orange-700',
  completed: 'bg-green-100 text-green-700',
  not_submitted: 'bg-red-100 text-red-700',
  overdue: 'bg-red-100 text-red-700',
};

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  completed: 'Completed',
  not_submitted: 'Not Submitted',
  overdue: 'Overdue',
};

export default function ParentHomeworkPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [selectedChildId, setSelectedChildId] = useState(MOCK_CHILDREN[0]!.id);
  const [tab, setTab] = useState<'all' | 'pending' | 'completed' | 'not_submitted'>('all');
  const [assignments, setAssignments] = useState<MockAssignment[]>(MOCK_ASSIGNMENTS);
  const [selectedAssignment, setSelectedAssignment] = useState<MockAssignment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        // Service call with mock fallback
        const { homeworkService } = await import('../../../../lib/services/homework.service');
        const data = await homeworkService.getClassHomework('all');
        if (data && data.length > 0) {
          showToast('success', 'Homework loaded');
        }
      } catch {
        // Use mock data
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const childAssignments = useMemo(() =>
    assignments.filter((a) => a.childId === selectedChildId),
    [assignments, selectedChildId]
  );

  const stats = useMemo(() => ({
    total: childAssignments.length,
    pending: childAssignments.filter((a) => a.status === 'pending').length,
    completed: childAssignments.filter((a) => a.status === 'completed').length,
    overdue: childAssignments.filter((a) => a.status === 'overdue' || a.status === 'not_submitted').length,
  }), [childAssignments]);

  const filteredAssignments = useMemo(() => {
    if (tab === 'all') return childAssignments;
    if (tab === 'pending') return childAssignments.filter((a) => a.status === 'pending' || a.status === 'overdue');
    if (tab === 'completed') return childAssignments.filter((a) => a.status === 'completed');
    return childAssignments.filter((a) => a.status === 'not_submitted');
  }, [childAssignments, tab]);

  const selectedChild = MOCK_CHILDREN.find((c) => c.id === selectedChildId);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-[#824ef2] animate-spin" />
        <p className="mt-4 text-slate-500">Loading homework...</p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Homework & Assignments</h1>
            <p className="text-sm text-slate-500">Track your child&apos;s homework and assignments</p>
          </div>
        </div>
        <select
          value={selectedChildId}
          onChange={(e) => setSelectedChildId(e.target.value)}
          className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] hover:border-slate-300 transition-all cursor-pointer"
        >
          {MOCK_CHILDREN.map((child) => (
            <option key={child.id} value={child.id}>
              {child.name} — {child.class}-{child.section}
            </option>
          ))}
        </select>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SchoolStatCard icon={<BookOpen className="w-5 h-5" />} color="blue" label="Total Assignments" value={stats.total} />
        <SchoolStatCard icon={<Clock className="w-5 h-5" />} color="orange" label="Pending" value={stats.pending} />
        <SchoolStatCard icon={<CheckCircle className="w-5 h-5" />} color="green" label="Completed" value={stats.completed} />
        <SchoolStatCard icon={<AlertCircle className="w-5 h-5" />} color="red" label="Overdue" value={stats.overdue} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {([
          { key: 'all' as const, label: 'All' },
          { key: 'pending' as const, label: 'Pending' },
          { key: 'completed' as const, label: 'Completed' },
          { key: 'not_submitted' as const, label: 'Not Submitted' },
        ]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key ? 'border-[#824ef2] text-[#824ef2]' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Assignment List */}
      <div className="bg-white rounded-xl border border-slate-200">
        {filteredAssignments.length === 0 ? (
          <div className="py-16 text-center">
            <BookOpen className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">No assignments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Subject</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Title</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Due Date</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Status</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Teacher</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.map((assignment) => (
                  <tr key={assignment.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-5">
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-purple-100 text-purple-700">
                        {assignment.subject}
                      </span>
                    </td>
                    <td className="py-3 px-5 font-medium text-slate-900">{assignment.title}</td>
                    <td className="py-3 px-5 text-slate-600">
                      {new Date(assignment.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-3 px-5">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[assignment.status]}`}>
                        {statusLabels[assignment.status]}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-slate-600">{assignment.teacher}</td>
                    <td className="py-3 px-5">
                      <button
                        onClick={() => { setSelectedAssignment(assignment); setShowDetailModal(true); }}
                        className="p-1.5 text-slate-400 hover:text-[#824ef2] hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <FormModal
        open={showDetailModal && !!selectedAssignment}
        onClose={() => { setShowDetailModal(false); setSelectedAssignment(null); }}
        title={selectedAssignment?.title || ''}
        size="lg"
        footer={
          <button
            onClick={() => { setShowDetailModal(false); setSelectedAssignment(null); }}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        }
      >
        {selectedAssignment && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-purple-100 text-purple-700">
                {selectedAssignment.subject}
              </span>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[selectedAssignment.status]}`}>
                {statusLabels[selectedAssignment.status]}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <p className="text-xs text-slate-500 mb-1">Due Date</p>
                <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {new Date(selectedAssignment.dueDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <p className="text-xs text-slate-500 mb-1">Teacher</p>
                <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {selectedAssignment.teacher}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Description</h4>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{selectedAssignment.description}</p>
              </div>
            </div>

            {selectedAssignment.attachments.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-slate-600" /> Attachments
                </h4>
                <div className="space-y-2">
                  {selectedAssignment.attachments.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-slate-50 rounded-lg p-3 border border-slate-200">
                      <Paperclip className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="text-sm text-slate-700 truncate">{file}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </FormModal>
    </section>
  );
}
