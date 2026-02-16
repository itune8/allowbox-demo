'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Users,
  Clock,
  Headphones,
  Plus,
  DollarSign,
  Download,
  Check,
  MoreVertical,
  ChevronDown,
  Filter,
} from 'lucide-react';
import { schoolService, type School } from '../../../lib/services/superadmin/school.service';
import {
  PlatformStatCard,
  StatusBadge,
  SchoolDetailsModal,
  InvoiceModal,
} from '../../../components/platform';

interface DashboardMetrics {
  totalSchools: number;
  activeSchools: number;
  pendingSchools: number;
  totalUsers: number;
  openTickets: number;
  closedTickets: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [schools, setSchools] = useState<School[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [showSchoolDetails, setShowSchoolDetails] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoicePayment, setInvoicePayment] = useState<any>(null);

  // Accept/Reject state
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Active schools filter
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [showPlanDropdown, setShowPlanDropdown] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const schoolsData = await schoolService.getSchools();
      setSchools(schoolsData);

      const activeSchools = schoolsData.filter(s => s.isActive).length;
      const pendingSchools = schoolsData.filter(s => s.subscriptionStatus === 'trial' || !s.isActive).length;
      const totalUsers = schoolsData.reduce((sum, s) => sum + (s.studentCount || 0) + (s.teacherCount || 0), 0);

      setMetrics({
        totalSchools: schoolsData.length,
        activeSchools,
        pendingSchools,
        totalUsers,
        openTickets: 12,
        closedTickets: 45,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (school: School) => {
    setSelectedSchool(school);
    setShowSchoolDetails(true);
  };

  const handleOpenInvoice = (school: School, payment: any) => {
    setSelectedSchool(school);
    setInvoicePayment(payment);
    setShowInvoice(true);
  };

  const handleAccept = async (school: School) => {
    setActionLoading(school._id);
    try {
      await schoolService.updateSchool(school._id, {
        subscriptionStatus: 'active',
        isActive: true,
      });
      await loadDashboardData();
    } catch (error) {
      console.error('Failed to accept school:', error);
      alert('Failed to accept school. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (school: School) => {
    if (!confirm(`Are you sure you want to reject "${school.schoolName}"? This will suspend the school.`)) return;
    setActionLoading(school._id);
    try {
      await schoolService.updateSchool(school._id, {
        subscriptionStatus: 'suspended',
        isActive: false,
      });
      await loadDashboardData();
    } catch (error) {
      console.error('Failed to reject school:', error);
      alert('Failed to reject school. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const pendingSchoolsList = schools
    .filter(s => s.subscriptionStatus === 'trial' || !s.isActive)
    .slice(0, 5);

  const activeSchoolsList = schools
    .filter(s => s.isActive)
    .filter(s => planFilter === 'all' || s.subscriptionPlan === planFilter)
    .slice(0, 6);

  // Estimate billing based on plan
  const getBilling = (school: School) => {
    const pricePerUser = school.pricePerStudent || 4.5;
    const totalUsers = (school.studentCount || 0) + (school.teacherCount || 0);
    const monthly = Math.round(pricePerUser * totalUsers);
    return `$${monthly.toLocaleString()}/mo`;
  };

  const getTimeAgo = (dateStr?: string) => {
    if (!dateStr) return 'Recently';
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `Registered ${hours} hour${hours !== 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `Registered ${days} day${days !== 1 ? 's' : ''} ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Super Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">Manage schools, subscriptions, and platform operations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <PlatformStatCard
          icon={<Building2 className="w-5 h-5" />}
          color="blue"
          label="Total Schools"
          value={metrics?.totalSchools || 0}
          trend={{ value: '+12%', positive: true }}
        />
        <PlatformStatCard
          icon={<Users className="w-5 h-5" />}
          color="purple"
          label="Total Users"
          value={metrics?.totalUsers?.toLocaleString() || '0'}
          trend={{ value: '+8%', positive: true }}
        />
        <PlatformStatCard
          icon={<Clock className="w-5 h-5" />}
          color="orange"
          label="Pending Schools"
          value={metrics?.pendingSchools || 0}
          badge="Review"
        />
        <PlatformStatCard
          icon={<Headphones className="w-5 h-5" />}
          color="teal"
          label="Open / Closed Tickets"
          value={`${metrics?.openTickets || 0} / ${metrics?.closedTickets || 0}`}
        />
      </div>

      {/* Quick Actions + Pending School Approvals - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Quick Actions - Left Panel */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 h-full">
            <h2 className="text-lg font-semibold text-slate-900 mb-5">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/platform/schools')}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add New School
              </button>
              <button
                onClick={() => router.push('/platform/finance')}
                className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                </span>
                <span className="font-medium">View Billing</span>
              </button>
              <button
                onClick={() => {/* Export report logic */}}
                className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100">
                  <Download className="w-4 h-4 text-emerald-600" />
                </span>
                <span className="font-medium">Export Report</span>
              </button>
            </div>
          </div>
        </div>

        {/* Pending School Approvals - Right Panel */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-xl border border-slate-200 h-full flex flex-col">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Pending School Approvals</h2>
              <span className="text-sm text-purple-600 font-medium">
                {pendingSchoolsList.length} pending
              </span>
            </div>
            <div className="flex-1 divide-y divide-slate-100">
              {pendingSchoolsList.length === 0 ? (
                <div className="px-5 py-10 text-center text-slate-400">
                  <Check className="w-10 h-10 mx-auto mb-2 text-emerald-300" />
                  <p className="text-sm font-medium">All caught up! No pending approvals.</p>
                </div>
              ) : (
                pendingSchoolsList.map((school) => {
                  const isLoading = actionLoading === school._id;
                  const planName = school.subscriptionPlan
                    ? school.subscriptionPlan.charAt(0).toUpperCase() + school.subscriptionPlan.slice(1) + ' Plan'
                    : 'Basic Plan';
                  return (
                    <div
                      key={school._id}
                      className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-lg bg-purple-100 flex-shrink-0">
                          <Building2 className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 truncate">{school.schoolName}</p>
                          <p className="text-sm text-slate-500">
                            {getTimeAgo(school.createdAt)} &middot; {planName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-11 sm:ml-0">
                        <button
                          onClick={() => handleViewDetails(school)}
                          className="px-3 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleAccept(school)}
                          disabled={isLoading}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                        >
                          {isLoading ? (
                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(school)}
                          disabled={isLoading}
                          className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Active Schools Table */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Active Schools</h2>
          <div className="flex items-center gap-3">
            {/* Plan Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowPlanDropdown(!showPlanDropdown)}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                {planFilter === 'all' ? 'All Plans' : planFilter.charAt(0).toUpperCase() + planFilter.slice(1)}
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
              {showPlanDropdown && (
                <div className="absolute right-0 mt-1 w-40 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
                  {['all', 'premium', 'standard', 'enterprise', 'basic'].map((plan) => (
                    <button
                      key={plan}
                      onClick={() => { setPlanFilter(plan); setShowPlanDropdown(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors first:rounded-t-lg last:rounded-b-lg ${
                        planFilter === plan
                          ? 'bg-purple-50 text-purple-700 font-medium'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {plan === 'all' ? 'All Plans' : plan.charAt(0).toUpperCase() + plan.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="p-2 text-slate-400 hover:text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3 text-left font-semibold text-slate-600 uppercase text-xs tracking-wider">School Name</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600 uppercase text-xs tracking-wider">Plan</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600 uppercase text-xs tracking-wider">Users</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600 uppercase text-xs tracking-wider">Status</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600 uppercase text-xs tracking-wider">Billing</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600 uppercase text-xs tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeSchoolsList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                    <Building2 className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    No active schools found
                  </td>
                </tr>
              ) : (
                activeSchoolsList.map((school, index) => (
                  <tr key={school._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-purple-50">
                          <Building2 className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <span className="font-medium text-slate-900 block">{school.schoolName}</span>
                          <span className="text-xs text-slate-400">ID: SCH-{String(index + 1).padStart(3, '0')}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge value={school.subscriptionPlan} type="plan" />
                    </td>
                    <td className="px-5 py-3.5 text-slate-700">
                      {(school.studentCount || 0) + (school.teacherCount || 0)}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge value={school.subscriptionStatus} type="status" showDot />
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-900">
                      {getBilling(school)}
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => handleViewDetails(school)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* School Details Modal */}
      <SchoolDetailsModal
        isOpen={showSchoolDetails}
        onClose={() => setShowSchoolDetails(false)}
        school={selectedSchool}
        onOpenInvoice={handleOpenInvoice}
      />

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={showInvoice}
        onClose={() => setShowInvoice(false)}
        school={selectedSchool}
        payment={invoicePayment}
      />
    </div>
  );
}
