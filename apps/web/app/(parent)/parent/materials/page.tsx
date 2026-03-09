'use client';

import { useState, useEffect, useMemo } from 'react';
import { SchoolStatCard, FormModal, useToast } from '../../../../components/school';
import {
  BookOpen,
  FileText,
  Video,
  Link,
  Loader2,
  Eye,
  Search,
  Download,
} from 'lucide-react';

// ── Mock data ──
interface MockChild {
  id: string;
  name: string;
  class: string;
}

interface MockMaterial {
  id: string;
  title: string;
  type: 'PDF' | 'Video' | 'Link' | 'Document';
  subject: string;
  date: string;
  size: string;
  description: string;
  downloadUrl: string;
  childId: string;
}

const MOCK_CHILDREN: MockChild[] = [
  { id: 'c1', name: 'Emma Johnson', class: 'Class 10-A' },
  { id: 'c2', name: 'Liam Johnson', class: 'Class 7-B' },
];

const MOCK_MATERIALS: MockMaterial[] = [
  { id: 'm1', title: 'Quadratic Equations Notes', type: 'PDF', subject: 'Mathematics', date: '2025-03-01', size: '2.4 MB', description: 'Comprehensive notes covering all forms of quadratic equations with solved examples and practice problems.', downloadUrl: '#', childId: 'c1' },
  { id: 'm2', title: 'Newton Laws Video Lecture', type: 'Video', subject: 'Physics', date: '2025-02-28', size: '156 MB', description: 'Video lecture explaining Newton\'s three laws of motion with real-world demonstrations and examples.', downloadUrl: '#', childId: 'c1' },
  { id: 'm3', title: 'Khan Academy — Trigonometry', type: 'Link', subject: 'Mathematics', date: '2025-02-25', size: '—', description: 'External resource link for trigonometry practice, tutorials, and interactive exercises.', downloadUrl: '#', childId: 'c1' },
  { id: 'm4', title: 'English Grammar Handbook', type: 'Document', subject: 'English', date: '2025-02-22', size: '3.1 MB', description: 'Complete grammar reference covering parts of speech, sentence structure, and common errors.', downloadUrl: '#', childId: 'c1' },
  { id: 'm5', title: 'History Chapter 5 Summary', type: 'PDF', subject: 'History', date: '2025-02-20', size: '1.8 MB', description: 'Chapter summary covering the Industrial Revolution with key dates and events.', downloadUrl: '#', childId: 'c2' },
  { id: 'm6', title: 'Science Experiment Guide', type: 'Video', subject: 'Science', date: '2025-02-18', size: '98 MB', description: 'Step-by-step video guide for the magnetism experiment due next week.', downloadUrl: '#', childId: 'c2' },
  { id: 'm7', title: 'Geography Map Resources', type: 'Link', subject: 'Geography', date: '2025-02-15', size: '—', description: 'Interactive online maps and quizzes for world geography topics.', downloadUrl: '#', childId: 'c2' },
  { id: 'm8', title: 'Hindi Literature Notes', type: 'Document', subject: 'Hindi', date: '2025-02-10', size: '1.5 MB', description: 'Detailed notes on prescribed Hindi literature chapters with question-answer format.', downloadUrl: '#', childId: 'c1' },
];

const SUBJECTS = ['Mathematics', 'Physics', 'English', 'History', 'Science', 'Geography', 'Hindi'];

const typeBadgeColors: Record<string, string> = {
  PDF: 'bg-red-100 text-red-700',
  Video: 'bg-purple-100 text-purple-700',
  Link: 'bg-blue-100 text-blue-700',
  Document: 'bg-green-100 text-green-700',
};

const typeIcons: Record<string, React.ReactNode> = {
  PDF: <FileText className="w-4 h-4 text-red-500" />,
  Video: <Video className="w-4 h-4 text-purple-500" />,
  Link: <Link className="w-4 h-4 text-blue-500" />,
  Document: <FileText className="w-4 h-4 text-green-500" />,
};

const subjectColors: Record<string, string> = {
  Mathematics: 'bg-blue-50 border-blue-200 text-blue-700',
  Physics: 'bg-purple-50 border-purple-200 text-purple-700',
  English: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  History: 'bg-amber-50 border-amber-200 text-amber-700',
  Science: 'bg-teal-50 border-teal-200 text-teal-700',
  Geography: 'bg-orange-50 border-orange-200 text-orange-700',
  Hindi: 'bg-pink-50 border-pink-200 text-pink-700',
};

export default function ParentMaterialsPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState<string>(MOCK_CHILDREN[0]!.id);
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedSubjectCard, setSelectedSubjectCard] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<MockMaterial | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const childMaterials = useMemo(() => {
    return MOCK_MATERIALS.filter((m) => m.childId === selectedChild);
  }, [selectedChild]);

  const stats = useMemo(() => ({
    total: childMaterials.length,
    documents: childMaterials.filter((m) => m.type === 'PDF' || m.type === 'Document').length,
    videos: childMaterials.filter((m) => m.type === 'Video').length,
    links: childMaterials.filter((m) => m.type === 'Link').length,
  }), [childMaterials]);

  const subjectCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    childMaterials.forEach((m) => {
      counts[m.subject] = (counts[m.subject] || 0) + 1;
    });
    return counts;
  }, [childMaterials]);

  const filtered = useMemo(() => {
    let list = childMaterials;
    const activeSubject = selectedSubjectCard || (filterSubject !== 'all' ? filterSubject : null);
    if (activeSubject) list = list.filter((m) => m.subject === activeSubject);
    if (filterType !== 'all') list = list.filter((m) => m.type === filterType);
    return list;
  }, [childMaterials, filterSubject, filterType, selectedSubjectCard]);

  function handleViewMaterial(mat: MockMaterial) {
    setSelectedMaterial(mat);
    setShowDetailModal(true);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-[#824ef2] animate-spin" />
        <p className="mt-4 text-slate-500">Loading study materials...</p>
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
            <h1 className="text-2xl font-bold text-slate-900">Study Materials</h1>
            <p className="text-sm text-slate-500">View and download learning resources shared by teachers</p>
          </div>
        </div>
      </div>

      {/* Child Selector */}
      <div>
        <select
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] cursor-pointer"
          value={selectedChild}
          onChange={(e) => {
            setSelectedChild(e.target.value);
            setSelectedSubjectCard(null);
            setFilterSubject('all');
            setFilterType('all');
          }}
        >
          {MOCK_CHILDREN.map((child) => (
            <option key={child.id} value={child.id}>
              {child.name} — {child.class}
            </option>
          ))}
        </select>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SchoolStatCard icon={<BookOpen className="w-5 h-5" />} color="blue" label="Total Materials" value={stats.total} />
        <SchoolStatCard icon={<FileText className="w-5 h-5" />} color="green" label="Documents" value={stats.documents} />
        <SchoolStatCard icon={<Video className="w-5 h-5" />} color="purple" label="Videos" value={stats.videos} />
        <SchoolStatCard icon={<Link className="w-5 h-5" />} color="amber" label="Links" value={stats.links} />
      </div>

      {/* Subject Filter - Dropdown when many subjects, pills when few */}
      {Object.keys(subjectCounts).length > 0 && Object.keys(subjectCounts).length > 5 ? (
        <div>
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Browse by Subject</h2>
          <select
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] cursor-pointer"
            value={selectedSubjectCard || 'all'}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedSubjectCard(val === 'all' ? null : val);
              setFilterSubject('all');
            }}
          >
            <option value="all">All Subjects ({childMaterials.length})</option>
            {Object.entries(subjectCounts).map(([subject, count]) => (
              <option key={subject} value={subject}>{subject} ({count})</option>
            ))}
          </select>
        </div>
      ) : Object.keys(subjectCounts).length > 0 ? (
        <div>
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Browse by Subject</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setSelectedSubjectCard(null); setFilterSubject('all'); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                !selectedSubjectCard ? 'bg-[#824ef2] text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              All ({childMaterials.length})
            </button>
            {Object.entries(subjectCounts).map(([subject, count]) => (
              <button
                key={subject}
                onClick={() => {
                  setSelectedSubjectCard(selectedSubjectCard === subject ? null : subject);
                  setFilterSubject('all');
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  selectedSubjectCard === subject
                    ? 'bg-[#824ef2] text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {subject} ({count})
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] cursor-pointer"
          value={selectedSubjectCard ? 'all' : filterSubject}
          onChange={(e) => {
            setFilterSubject(e.target.value);
            setSelectedSubjectCard(null);
          }}
        >
          <option value="all">All Subjects</option>
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] cursor-pointer"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="PDF">PDF</option>
          <option value="Video">Video</option>
          <option value="Link">Link</option>
          <option value="Document">Document</option>
        </select>
      </div>

      {/* Materials Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <BookOpen className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">No materials found</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-left text-slate-500">
                    <th className="py-3 px-4 font-medium">Title</th>
                    <th className="py-3 px-4 font-medium">Type</th>
                    <th className="py-3 px-4 font-medium">Subject</th>
                    <th className="py-3 px-4 font-medium">Date</th>
                    <th className="py-3 px-4 font-medium">Size</th>
                    <th className="py-3 px-4 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((mat) => (
                    <tr key={mat.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          {typeIcons[mat.type]}
                          <span className="font-medium text-slate-900">{mat.title}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex text-xs px-2 py-0.5 rounded-full font-medium ${typeBadgeColors[mat.type]}`}>
                          {mat.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{mat.subject}</td>
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(mat.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-3 px-4 text-slate-500">{mat.size}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleViewMaterial(mat)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#824ef2] bg-[#824ef2]/5 rounded-lg hover:bg-[#824ef2]/10 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-slate-100">
              {filtered.map((mat) => (
                <div key={mat.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="mt-0.5">{typeIcons[mat.type]}</div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{mat.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${typeBadgeColors[mat.type]}`}>
                            {mat.type}
                          </span>
                          <span className="text-xs text-slate-500">{mat.subject}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                          <span>{new Date(mat.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          <span>&bull;</span>
                          <span>{mat.size}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewMaterial(mat)}
                      className="flex-shrink-0 p-2 text-[#824ef2] bg-[#824ef2]/5 rounded-lg hover:bg-[#824ef2]/10 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Material Detail Modal */}
      <FormModal
        open={showDetailModal && !!selectedMaterial}
        onClose={() => { setShowDetailModal(false); setSelectedMaterial(null); }}
        title={selectedMaterial?.title || ''}
        size="md"
        footer={
          <>
            <button
              onClick={() => { setShowDetailModal(false); setSelectedMaterial(null); }}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                showToast('success', 'Download started');
                setShowDetailModal(false);
                setSelectedMaterial(null);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors"
            >
              <Download className="w-4 h-4" />
              {selectedMaterial?.type === 'Link' ? 'Open Link' : 'Download'}
            </button>
          </>
        }
      >
        {selectedMaterial && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${typeBadgeColors[selectedMaterial.type]}`}>
                {selectedMaterial.type}
              </span>
              <span className="text-xs text-slate-500">{selectedMaterial.subject}</span>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-sm text-slate-700">{selectedMaterial.description}</p>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span>Size: {selectedMaterial.size}</span>
              <span>
                Shared: {new Date(selectedMaterial.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
        )}
      </FormModal>
    </section>
  );
}
