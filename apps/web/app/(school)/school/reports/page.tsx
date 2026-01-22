'use client';

import { useState } from 'react';
import { Button } from '@repo/ui/button';
import {
  BarChart3,
  FileText,
  Download,
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  Eye,
  CheckCircle,
} from 'lucide-react';
import { SlideSheet, SheetSection, SheetField, SheetDetailRow } from '@/components/ui';

const reports = [
  {
    id: 1,
    name: 'Fees Summary',
    icon: DollarSign,
    color: 'bg-emerald-500',
    description: 'Comprehensive overview of fee collection and outstanding payments',
    generatedBy: 'System',
    totalRecords: 1248,
    status: 'Completed',
  },
  {
    id: 2,
    name: 'Attendance Overview',
    icon: Users,
    color: 'bg-blue-500',
    description: 'Student attendance statistics and trends across all classes',
    generatedBy: 'John Doe',
    totalRecords: 856,
    status: 'Completed',
  },
  {
    id: 3,
    name: 'Students by Class',
    icon: BarChart3,
    color: 'bg-purple-500',
    description: 'Distribution of students across different classes and sections',
    generatedBy: 'Jane Smith',
    totalRecords: 542,
    status: 'Completed',
  },
];

const stats = [
  {
    title: 'Total Reports',
    value: 12,
    icon: FileText,
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },
  {
    title: 'Generated Today',
    value: 3,
    icon: Calendar,
    bgColor: 'bg-sky-50',
    iconColor: 'text-sky-600',
  },
  {
    title: 'Downloads',
    value: 48,
    icon: Download,
    bgColor: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    title: 'Trending',
    value: 5,
    icon: TrendingUp,
    bgColor: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
];

export default function ReportsPage() {
  const [showDetailsSheet, setShowDetailsSheet] = useState(false);
  const [selectedReport, setSelectedReport] = useState<typeof reports[0] | null>(null);

  const handleViewReport = (report: typeof reports[0]) => {
    setSelectedReport(report);
    setShowDetailsSheet(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsSheet(false);
    setSelectedReport(null);
  };

  const handleDownloadReport = (report: typeof reports[0]) => {
    // Handle download logic
    console.log('Downloading report:', report.name);
  };

  return (
    <section className="space-y-6">
      {/* Professional Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Reports Overview</h3>
            <p className="text-sm text-slate-600 mt-1">
              Generate, view, and export comprehensive school reports for better insights and decision-making.
            </p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-100">
            <BarChart3 className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
            <p className="text-sm text-slate-600">Generate and view school reports</p>
          </div>
        </div>
        <Button className="bg-primary hover:bg-primary-dark">
          <Download className="w-4 h-4 mr-2" />
          Export All Reports
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-2">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center flex-shrink-0`}>
                  <IconComponent className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Time Filter */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-slate-600 mr-2">Filter by period:</span>
          {['This Month', 'Last 3 Months', 'This Year'].map((period) => (
            <button
              key={period}
              className="rounded-lg px-4 py-2 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-slate-900">Report</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-900">Generated</th>
                <th className="px-6 py-4 text-right font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports.map((report, i) => {
                const IconComponent = report.icon;
                return (
                  <tr
                    key={report.name}
                    className="group cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg ${report.color} flex items-center justify-center flex-shrink-0`}
                        >
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-slate-900 font-medium group-hover:text-slate-950">
                          {report.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {new Date(Date.now() - i * 86400000).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => handleViewReport(report)}
                          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                          title="View Report"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadReport(report)}
                          className="p-2 rounded-lg hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 transition-colors"
                          title="Download Report"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Details SlideSheet */}
      <SlideSheet
        isOpen={showDetailsSheet}
        onClose={handleCloseDetails}
        title={selectedReport?.name || 'Report Details'}
        subtitle="View comprehensive report information"
        size="md"
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleCloseDetails}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                if (selectedReport) {
                  handleDownloadReport(selectedReport);
                }
              }}
              className="bg-primary hover:bg-primary-dark"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>
          </div>
        }
      >
        {selectedReport && (
          <div className="space-y-6">
            <SheetSection title="Report Information">
              <SheetDetailRow
                label="Report Name"
                value={selectedReport.name}
              />
              <SheetDetailRow
                label="Description"
                value={selectedReport.description}
              />
              <SheetDetailRow
                label="Status"
                value={
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium">
                    <CheckCircle className="w-3.5 h-3.5" />
                    {selectedReport.status}
                  </span>
                }
              />
            </SheetSection>

            <SheetSection title="Generation Details">
              <SheetDetailRow
                label="Generated By"
                value={selectedReport.generatedBy}
              />
              <SheetDetailRow
                label="Generated Date"
                value={new Date(Date.now() - reports.indexOf(selectedReport) * 86400000).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              />
              <SheetDetailRow
                label="Total Records"
                value={selectedReport.totalRecords.toLocaleString()}
              />
            </SheetSection>

            <SheetSection title="Report Preview">
              <div className="bg-slate-50 rounded-lg border border-slate-200 p-6">
                <div className="flex items-center justify-center gap-3 text-slate-500">
                  {(() => {
                    const IconComponent = selectedReport.icon;
                    return (
                      <>
                        <IconComponent className="w-8 h-8" />
                        <p className="text-sm">
                          Report preview will be displayed here
                        </p>
                      </>
                    );
                  })()}
                </div>
              </div>
            </SheetSection>
          </div>
        )}
      </SlideSheet>
    </section>
  );
}
