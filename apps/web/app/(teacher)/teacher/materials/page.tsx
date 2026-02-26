'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { SchoolStatCard, FormModal, ConfirmModal, useToast } from '../../../../components/school';
import {
  FolderOpen,
  FileText,
  Video,
  Link,
  Loader2,
  Plus,
  MoreVertical,
  Eye,
  Trash2,
  Upload,
  Image,
} from 'lucide-react';

// ── Mock data ──
interface MockMaterial {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'link' | 'image';
  subject: string;
  class: string;
  uploadDate: string;
  size: string;
  description: string;
  url: string;
}

const MOCK_MATERIALS: MockMaterial[] = [
  { id: 'm1', title: 'Quadratic Equations Notes', type: 'pdf', subject: 'Mathematics', class: 'Class 10-A', uploadDate: '2025-03-01', size: '2.4 MB', description: 'Comprehensive notes covering all forms of quadratic equations with solved examples.', url: '#' },
  { id: 'm2', title: 'Newton Laws Video Lecture', type: 'video', subject: 'Physics', class: 'Class 8-A', uploadDate: '2025-02-28', size: '156 MB', description: 'Video lecture explaining Newton\'s three laws with real-world examples.', url: '#' },
  { id: 'm3', title: 'Khan Academy — Trigonometry', type: 'link', subject: 'Mathematics', class: 'Class 10-B', uploadDate: '2025-02-25', size: '—', description: 'External resource for trigonometry practice and tutorials.', url: '#' },
  { id: 'm4', title: 'Physics Lab Diagrams', type: 'image', subject: 'Physics', class: 'Class 10-A', uploadDate: '2025-02-20', size: '5.8 MB', description: 'Collection of lab setup diagrams for optics experiments.', url: '#' },
  { id: 'm5', title: 'Linear Equations Worksheet', type: 'pdf', subject: 'Mathematics', class: 'Class 9-B', uploadDate: '2025-02-18', size: '1.2 MB', description: 'Practice worksheet with graphing exercises.', url: '#' },
  { id: 'm6', title: 'Wave Motion Animation', type: 'video', subject: 'Physics', class: 'Class 9-A', uploadDate: '2025-02-15', size: '48 MB', description: 'Animated explanation of wave properties.', url: '#' },
  { id: 'm7', title: 'Algebra Fundamentals', type: 'pdf', subject: 'Mathematics', class: 'Class 7-C', uploadDate: '2025-02-10', size: '3.1 MB', description: 'Introduction to algebra with practice problems.', url: '#' },
  { id: 'm8', title: 'NCERT Solutions — Physics', type: 'link', subject: 'Physics', class: 'Class 10-A', uploadDate: '2025-02-05', size: '—', description: 'Online NCERT solutions for Class 10 Physics.', url: '#' },
];

const typeIcons: Record<string, React.ReactNode> = {
  pdf: <FileText className="w-5 h-5 text-red-500" />,
  video: <Video className="w-5 h-5 text-purple-500" />,
  link: <Link className="w-5 h-5 text-blue-500" />,
  image: <Image className="w-5 h-5 text-green-500" />,
};

const typeBadgeColors: Record<string, string> = {
  pdf: 'bg-red-100 text-red-700',
  video: 'bg-purple-100 text-purple-700',
  link: 'bg-blue-100 text-blue-700',
  image: 'bg-green-100 text-green-700',
};

export default function TeacherMaterialsPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState<MockMaterial[]>(MOCK_MATERIALS);
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<MockMaterial | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState({ open: false, id: '' });
  const menuRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    title: '', type: 'pdf' as MockMaterial['type'], subject: 'Mathematics', class: 'Class 10-A', description: '',
  });

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenuId(null);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const stats = useMemo(() => ({
    total: materials.length,
    documents: materials.filter((m) => m.type === 'pdf').length,
    videos: materials.filter((m) => m.type === 'video').length,
    links: materials.filter((m) => m.type === 'link').length,
  }), [materials]);

  const filtered = useMemo(() => {
    let list = materials;
    if (filterSubject !== 'all') list = list.filter((m) => m.subject === filterSubject);
    if (filterType !== 'all') list = list.filter((m) => m.type === filterType);
    return list;
  }, [materials, filterSubject, filterType]);

  function handleDelete(id: string) {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
    setConfirmModal({ open: false, id: '' });
    showToast('success', 'Material deleted');
  }

  function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title.trim()) return;
    const newMat: MockMaterial = {
      id: `m${Date.now()}`,
      title: formData.title,
      type: formData.type,
      subject: formData.subject,
      class: formData.class,
      uploadDate: new Date().toISOString().split('T')[0]!,
      size: '1.5 MB',
      description: formData.description,
      url: '#',
    };
    setMaterials((prev) => [newMat, ...prev]);
    setFormData({ title: '', type: 'pdf', subject: 'Mathematics', class: 'Class 10-A', description: '' });
    setShowForm(false);
    showToast('success', 'Material uploaded');
  }

  const inputClass = 'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] hover:border-slate-300 transition-all';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-[#824ef2] animate-spin" />
        <p className="mt-4 text-slate-500">Loading materials...</p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <FolderOpen className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Learning Materials</h1>
            <p className="text-sm text-slate-500">Upload and manage teaching resources</p>
          </div>
        </div>
        <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors">
          <Upload className="w-4 h-4" /> Upload Material
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SchoolStatCard icon={<FolderOpen className="w-5 h-5" />} color="blue" label="Total Materials" value={stats.total} />
        <SchoolStatCard icon={<FileText className="w-5 h-5" />} color="green" label="Documents" value={stats.documents} />
        <SchoolStatCard icon={<Video className="w-5 h-5" />} color="purple" label="Videos" value={stats.videos} />
        <SchoolStatCard icon={<Link className="w-5 h-5" />} color="amber" label="Links" value={stats.links} />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] cursor-pointer"
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
        >
          <option value="all">All Subjects</option>
          <option value="Mathematics">Mathematics</option>
          <option value="Physics">Physics</option>
        </select>
        <select
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] cursor-pointer"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="pdf">Documents</option>
          <option value="video">Videos</option>
          <option value="link">Links</option>
          <option value="image">Images</option>
        </select>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" ref={menuRef}>
        {filtered.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl border border-slate-200 py-16 text-center">
            <FolderOpen className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">No materials found</p>
          </div>
        ) : (
          filtered.map((mat) => (
            <div key={mat.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:border-[#824ef2]/30 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-50">
                    {typeIcons[mat.type]}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900 truncate">{mat.title}</h3>
                    <span className={`inline-flex text-[10px] px-2 py-0.5 rounded-full font-medium mt-0.5 ${typeBadgeColors[mat.type]}`}>
                      {mat.type.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <button onClick={() => setOpenMenuId(openMenuId === mat.id ? null : mat.id)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {openMenuId === mat.id && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 w-32 z-20">
                      <button onClick={() => { setSelectedMaterial(mat); setShowDetailModal(true); setOpenMenuId(null); }} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                        <Eye className="w-4 h-4" /> View
                      </button>
                      <button onClick={() => { setConfirmModal({ open: true, id: mat.id }); setOpenMenuId(null); }} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>{mat.subject}</span>
                <span>&bull;</span>
                <span>{mat.class}</span>
                <span>&bull;</span>
                <span>{mat.size}</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {new Date(mat.uploadDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Upload Modal */}
      <FormModal open={showForm} onClose={() => setShowForm(false)} title="Upload Material" size="md" footer={
        <>
          <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
          <button type="submit" form="mat-form" className="px-6 py-2 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors">Upload</button>
        </>
      }>
        <form id="mat-form" onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Title <span className="text-red-500">*</span></label>
            <input type="text" className={inputClass} value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required placeholder="Material title..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Type</label>
              <select className={`${inputClass} cursor-pointer`} value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as MockMaterial['type'] })}>
                <option value="pdf">Document (PDF)</option>
                <option value="video">Video</option>
                <option value="link">Link</option>
                <option value="image">Image</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Subject</label>
              <select className={`${inputClass} cursor-pointer`} value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })}>
                {['Mathematics', 'Physics'].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Class</label>
            <select className={`${inputClass} cursor-pointer`} value={formData.class} onChange={(e) => setFormData({ ...formData, class: e.target.value })}>
              {['Class 10-A', 'Class 10-B', 'Class 9-A', 'Class 9-B', 'Class 8-A', 'Class 7-C'].map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea className={`${inputClass} resize-none`} rows={2} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Brief description..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">File</label>
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-[#824ef2]/30 transition-colors cursor-pointer">
              <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p className="text-sm text-slate-500">Click to upload or drag and drop</p>
              <p className="text-xs text-slate-400 mt-1">PDF, Video, Image up to 100MB</p>
            </div>
          </div>
        </form>
      </FormModal>

      {/* Detail Modal */}
      <FormModal open={showDetailModal && !!selectedMaterial} onClose={() => { setShowDetailModal(false); setSelectedMaterial(null); }} title={selectedMaterial?.title || ''} size="md" footer={
        <button onClick={() => { setShowDetailModal(false); setSelectedMaterial(null); }} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Close</button>
      }>
        {selectedMaterial && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${typeBadgeColors[selectedMaterial.type]}`}>{selectedMaterial.type.toUpperCase()}</span>
              <span className="text-xs text-slate-500">{selectedMaterial.subject} &bull; {selectedMaterial.class}</span>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-sm text-slate-700">{selectedMaterial.description}</p>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span>Size: {selectedMaterial.size}</span>
              <span>Uploaded: {new Date(selectedMaterial.uploadDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
        )}
      </FormModal>

      <ConfirmModal open={confirmModal.open} title="Delete Material" message="Are you sure you want to delete this material?" confirmLabel="Delete" confirmColor="red" onConfirm={() => handleDelete(confirmModal.id)} onCancel={() => setConfirmModal({ open: false, id: '' })} />
    </section>
  );
}
