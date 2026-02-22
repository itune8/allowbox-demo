'use client';

import { useEffect, useCallback, useState } from 'react';
import { Portal } from '../portal';
import { X, Building2 } from 'lucide-react';

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    firstName: string;
    lastName: string;
    role: string;
    email?: string;
  } | null;
  onViewSchools?: () => void;
}

const mockOnboardedSchools = [
  { name: 'Greenwood High School', location: 'New York, NY', students: 850, payment: 'Online', engagement: 92, status: 'Active' },
  { name: 'Riverside Academy', location: 'Boston, MA', students: 620, payment: 'Cash', engagement: 88, status: 'Active' },
  { name: 'Oakmont School', location: 'Chicago, IL', students: 1120, payment: 'Online', engagement: 95, status: 'Active' },
  { name: 'Maple Leaf International', location: 'Seattle, WA', students: 740, payment: 'Online', engagement: 78, status: 'Active' },
  { name: 'Sunshine Elementary', location: 'Miami, FL', students: 480, payment: 'Cash', engagement: 91, status: 'Active' },
];

type TabId = 'performance' | 'schools';

const TABS: { id: TabId; label: string }[] = [
  { id: 'performance', label: 'Performance' },
  { id: 'schools', label: 'Onboarded Schools' },
];

export function UserDetailsModal({ isOpen, onClose, user, onViewSchools }: UserDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>('performance');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'cash' | 'online'>('all');

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
      setActiveTab('performance');
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen || !user) return null;

  const roleTitle = user.role === 'super_admin' ? 'Admin' :
    user.role === 'sales' ? 'Sales Manager' :
    user.role === 'finance' ? 'Finance Manager' :
    user.role === 'support' ? 'Support Lead' : user.role;

  // Mock metrics
  const totalSchools = Math.floor(Math.random() * 20) + 8;
  const avgEngagement = Math.floor(Math.random() * 15) + 80;
  const activeUsers = Math.floor(Math.random() * 1000) + 800;
  const retentionRate = Math.floor(Math.random() * 10) + 88;

  const filteredSchools = mockOnboardedSchools.filter(s => {
    if (paymentFilter === 'all') return true;
    return s.payment.toLowerCase() === paymentFilter;
  });

  const getEngagementColor = (val: number) => {
    if (val >= 90) return 'text-emerald-600';
    if (val >= 75) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <Portal>
      <div
        className="fixed inset-0 bg-slate-900/50 z-[9998] transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-6">
        <div
          className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-[700px] max-h-[92vh] sm:max-h-[85vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {user.firstName} {user.lastName} - Performance Details
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">{roleTitle}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 -mr-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Tabs */}
          <div className="px-6 border-b border-slate-200">
            <div className="flex gap-6">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3 pt-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-[#824ef2] text-[#824ef2]'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5">

            {/* Performance Tab */}
            {activeTab === 'performance' && (
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-3">Engagement Metrics</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-slate-900">{totalSchools}</p>
                    <p className="text-xs text-slate-500 mt-1">Total Schools</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-emerald-600">{avgEngagement}%</p>
                    <p className="text-xs text-slate-500 mt-1">Avg Engagement</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-slate-900">{activeUsers.toLocaleString()}</p>
                    <p className="text-xs text-slate-500 mt-1">Active Users</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-emerald-600">{retentionRate}%</p>
                    <p className="text-xs text-slate-500 mt-1">Retention Rate</p>
                  </div>
                </div>
              </div>
            )}

            {/* Onboarded Schools Tab */}
            {activeTab === 'schools' && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold text-slate-900">Onboarded Schools</h3>
                  <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                    {(['all', 'cash', 'online'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setPaymentFilter(filter)}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                          paymentFilter === filter
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr className="border-b border-slate-200">
                        <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">School Name</th>
                        <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Location</th>
                        <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Students</th>
                        <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Payment</th>
                        <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Engagement</th>
                        <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredSchools.map((school, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 text-slate-900 font-medium">{school.name}</td>
                          <td className="px-4 py-3 text-slate-600">{school.location}</td>
                          <td className="px-4 py-3 text-slate-600">{school.students.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-medium px-2 py-1 rounded ${
                              school.payment === 'Online'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}>
                              {school.payment}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`font-semibold ${getEngagementColor(school.engagement)}`}>
                              {school.engagement}%
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs font-medium px-2 py-1 rounded bg-emerald-50 text-emerald-700">
                              {school.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {onViewSchools && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={onViewSchools}
                      className="text-sm font-medium transition-colors"
                      style={{ color: '#824ef2' }}
                    >
                      View All Onboarded Schools
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
}
