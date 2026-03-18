'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { schoolService, type School } from '../../../lib/services/superadmin/school.service';
import {
  BarChart3,
  Users,
  Building2,
  Download,
  DollarSign,
  UserMinus,
  CheckCircle2,
} from 'lucide-react';
import { PlatformStatCard, StatusBadge, EngagementBar, CustomSelect } from '../../../components/platform';

interface ReportMetrics {
  totalSchools: number;
  totalStudents: number;
  avgStudentsPerSchool: number;
  activeUsers: number;
  monthlyRevenue: number;
  retentionRate: number;
  topPerformingSchools: { name: string; location: string; students: number; engagement: number; status: string }[];
  growthRate: number;
  churnRate: number;
  engagementRate: number;
}

export default function ReportsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [metrics, setMetrics] = useState<ReportMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [toast, setToast] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadReportsData();
  }, []);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const loadReportsData = async () => {
    try {
      setLoading(true);
      const schoolsData = await schoolService.getSchools();
      setSchools(schoolsData);
      const reportMetrics = calculateMetrics(schoolsData);
      setMetrics(reportMetrics);
    } catch (error) {
      console.error('Failed to load reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (schoolsData: School[]): ReportMetrics => {
    const totalStudents = schoolsData.reduce((sum, s) => sum + (s.studentCount || 0), 0);
    const totalTeachers = schoolsData.reduce((sum, s) => sum + (s.teacherCount || 0), 0);
    const avgStudentsPerSchool = schoolsData.length > 0 ? totalStudents / schoolsData.length : 0;
    const activeUsers = totalStudents + totalTeachers;
    const monthlyRevenue = schoolsData.reduce((sum, s) => sum + (s.mrr || 0), 0);

    const locations = ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ'];
    const statuses = ['Active', 'Active', 'Active', 'Active', 'Trial'];

    const sortedByStudents = [...schoolsData]
      .sort((a, b) => (b.studentCount || 0) - (a.studentCount || 0))
      .slice(0, 5)
      .map((s, index) => ({
        name: s.schoolName,
        location: locations[index] || 'Unknown',
        students: s.studentCount || 0,
        engagement: Math.floor(Math.random() * 20) + 78,
        status: statuses[index] || 'Active',
      }));

    return {
      totalSchools: schoolsData.length,
      totalStudents,
      avgStudentsPerSchool,
      activeUsers,
      monthlyRevenue,
      retentionRate: 94.2,
      topPerformingSchools: sortedByStudents,
      growthRate: 12,
      churnRate: 3.2,
      engagementRate: 78.4,
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const downloadReport = (format: 'pdf' | 'csv' | 'excel') => {
    setToast(`Downloading ${format.toUpperCase()} report...`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-[#824ef2] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-[9999] bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Platform Analytics</h1>
          <p className="text-slate-500 mt-1">Comprehensive overview of all schools and user engagement</p>
        </div>
        <div className="flex items-center gap-2">
          <CustomSelect
            value={timeRange}
            onChange={(v) => setTimeRange(v as any)}
            options={[
              { value: '7d', label: 'Last 7 Days' },
              { value: '30d', label: 'Last 30 Days' },
              { value: '90d', label: 'Last 90 Days' },
              { value: '1y', label: 'Last Year' },
            ]}
            className="min-w-[160px]"
          />
          <button
            onClick={() => downloadReport('pdf')}
            className="inline-flex items-center gap-2 h-10 px-4 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <PlatformStatCard
          icon={<DollarSign className="w-5 h-5" />}
          color="purple"
          label="MRR"
          value={formatCurrency(metrics?.monthlyRevenue || 0)}
          trend={{ value: '+12.5%', positive: true }}
          badge="Active"
          subtitle="Track subscription revenue trends"
          onClick={() => router.push('/platform/reports/mrr')}
        />
        <PlatformStatCard
          icon={<UserMinus className="w-5 h-5" />}
          color="red"
          label="Churn Rate"
          value={`${metrics?.churnRate || 0}%`}
          trend={{ value: '-0.8%', positive: true }}
          badge="Active"
          subtitle="Monitor customer retention"
          onClick={() => router.push('/platform/reports/churn')}
        />
        <PlatformStatCard
          icon={<BarChart3 className="w-5 h-5" />}
          color="blue"
          label="Engagement Rate"
          value={`${metrics?.engagementRate || 0}%`}
          trend={{ value: '+5.2%', positive: true }}
          badge="Active"
          subtitle="Measure platform usage"
          onClick={() => router.push('/platform/reports/engagement')}
        />
        <PlatformStatCard
          icon={<Building2 className="w-5 h-5" />}
          color="green"
          label="Total Schools"
          value={metrics?.totalSchools || 0}
          trend={{ value: `+${metrics?.growthRate || 0}%`, positive: true }}
          badge="Active"
          subtitle="Active platform schools"
          onClick={() => router.push('/platform/reports/schools')}
        />
      </div>

    </div>
  );
}
