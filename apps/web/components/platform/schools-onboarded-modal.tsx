'use client';

import { useEffect, useCallback, useState, useMemo } from 'react';
import { Portal } from '../portal';
import { X, Search, Download, ChevronLeft, ChevronRight, Building2 } from 'lucide-react';

interface OnboardedSchool {
  name: string;
  id: string;
  onboardedDate: string;
  plan: string;
  students: number;
  teachers: number;
  engagement: number;
  status: string;
}

interface SchoolsOnboardedModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

const MOCK_SCHOOLS: OnboardedSchool[] = [
  { name: 'Greenwood High School', id: 'SCH-001', onboardedDate: '2024-01-15', plan: 'Enterprise', students: 1250, teachers: 85, engagement: 92, status: 'Active' },
  { name: 'Riverside Academy', id: 'SCH-002', onboardedDate: '2024-01-22', plan: 'Professional', students: 850, teachers: 62, engagement: 88, status: 'Active' },
  { name: 'Oakdale Elementary', id: 'SCH-003', onboardedDate: '2024-02-03', plan: 'Basic', students: 420, teachers: 35, engagement: 75, status: 'Active' },
  { name: 'Maple Valley School', id: 'SCH-004', onboardedDate: '2024-02-10', plan: 'Professional', students: 980, teachers: 72, engagement: 95, status: 'Active' },
  { name: 'Sunset International', id: 'SCH-005', onboardedDate: '2024-02-18', plan: 'Enterprise', students: 1580, teachers: 105, engagement: 90, status: 'Active' },
  { name: 'Hilltop Preparatory', id: 'SCH-006', onboardedDate: '2024-03-01', plan: 'Professional', students: 720, teachers: 55, engagement: 86, status: 'Active' },
  { name: 'Lakeside Grammar', id: 'SCH-007', onboardedDate: '2024-03-12', plan: 'Basic', students: 380, teachers: 28, engagement: 72, status: 'Active' },
  { name: 'Pinecrest Academy', id: 'SCH-008', onboardedDate: '2024-03-20', plan: 'Enterprise', students: 1100, teachers: 78, engagement: 94, status: 'Active' },
  { name: 'Valley View School', id: 'SCH-009', onboardedDate: '2024-04-05', plan: 'Professional', students: 650, teachers: 48, engagement: 81, status: 'Active' },
  { name: 'Horizon Academy', id: 'SCH-010', onboardedDate: '2024-04-15', plan: 'Basic', students: 290, teachers: 22, engagement: 69, status: 'Active' },
  { name: 'Summit Ridge School', id: 'SCH-011', onboardedDate: '2024-05-01', plan: 'Enterprise', students: 1350, teachers: 92, engagement: 91, status: 'Active' },
  { name: 'Brookfield Institute', id: 'SCH-012', onboardedDate: '2024-05-10', plan: 'Professional', students: 780, teachers: 58, engagement: 87, status: 'Active' },
];

const ITEMS_PER_PAGE = 5;

export function SchoolsOnboardedModal({ isOpen, onClose, userName }: SchoolsOnboardedModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      setSearchQuery('');
      setPlanFilter('all');
      setCurrentPage(1);
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  const filteredSchools = useMemo(() => {
    return MOCK_SCHOOLS.filter(s => {
      const matchesSearch = searchQuery === '' ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPlan = planFilter === 'all' || s.plan.toLowerCase() === planFilter.toLowerCase();
      return matchesSearch && matchesPlan;
    });
  }, [searchQuery, planFilter]);

  const totalPages = Math.ceil(filteredSchools.length / ITEMS_PER_PAGE);
  const paginatedSchools = filteredSchools.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (!isOpen) return null;

  const shortDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const getPlanBadge = (plan: string) => {
    const colors: Record<string, string> = {
      Enterprise: 'bg-purple-50 text-purple-700',
      Professional: 'bg-blue-50 text-blue-700',
      Basic: 'bg-slate-100 text-slate-700',
    };
    return colors[plan] || 'bg-slate-100 text-slate-600';
  };

  const getEngagementColor = (val: number) => {
    if (val >= 85) return 'bg-emerald-500';
    if (val >= 70) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <Portal>
      <div
        className="fixed inset-0 bg-slate-900/50 z-[9998] transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-6">
        <div
          className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-[900px] max-h-[92vh] sm:max-h-[85vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Schools Onboarded</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Complete list of all onboarded schools with engagement metrics
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 -mr-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Filters */}
          <div className="px-6 py-3 border-b border-slate-100 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[180px] max-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Search schools..."
                className="w-full h-9 pl-9 pr-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2]"
              />
            </div>
            <select
              value={planFilter}
              onChange={(e) => { setPlanFilter(e.target.value); setCurrentPage(1); }}
              className="h-9 px-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2]"
            >
              <option value="all">All Plans</option>
              <option value="enterprise">Enterprise</option>
              <option value="professional">Professional</option>
              <option value="basic">Basic</option>
            </select>
            <button className="inline-flex items-center gap-1.5 h-9 px-3 text-sm font-medium text-[#824ef2] border border-[#824ef2]/20 rounded-lg hover:bg-[#824ef2]/5 transition-colors ml-auto">
              <Download className="w-3.5 h-3.5" />
              Export Data
            </button>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="border border-slate-200 rounded-xl overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200">
                    <th className="px-3 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">School Name</th>
                    <th className="px-3 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Onboarded Date</th>
                    <th className="px-3 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Plan</th>
                    <th className="px-3 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Students</th>
                    <th className="px-3 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Teachers</th>
                    <th className="px-3 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Engagement</th>
                    <th className="px-3 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedSchools.map((school) => (
                    <tr key={school.id} className="hover:bg-slate-50/50">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="p-1 rounded-md bg-[#824ef2]/10 flex-shrink-0">
                            <Building2 className="w-3 h-3 text-[#824ef2]" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-900 text-sm truncate">{school.name}</p>
                            <p className="text-[11px] text-slate-400">ID: {school.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-slate-600 whitespace-nowrap">{shortDate(school.onboardedDate)}</td>
                      <td className="px-3 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${getPlanBadge(school.plan)}`}>
                          {school.plan}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-slate-600">{school.students.toLocaleString()}</td>
                      <td className="px-3 py-3 text-slate-600">{school.teachers}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-14 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${getEngagementColor(school.engagement)}`}
                              style={{ width: `${school.engagement}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-slate-700">{school.engagement}%</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                          {school.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
            <p className="text-sm text-slate-500">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to{' '}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredSchools.length)} of{' '}
              <span className="font-medium" style={{ color: '#824ef2' }}>{filteredSchools.length} schools</span>
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 text-sm font-medium rounded-lg transition-colors ${
                    currentPage === page
                      ? 'text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  style={currentPage === page ? { backgroundColor: '#824ef2' } : undefined}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
