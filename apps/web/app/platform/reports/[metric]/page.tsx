'use client';

import { useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Download,
  DollarSign,
  UserMinus,
  BarChart3,
  Building2,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { CustomSelect } from '../../../../components/platform';

interface MetricConfig {
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  currentValue: string;
  previousValue: string;
  change: string;
  changePositive: boolean;
  trend: string;
  trendPositive: boolean;
  chartData: number[];
  unit: string;
  prefix: string;
  suffix: string;
  breakdownData: {
    period: string;
    value: string;
    change: string;
    changePositive: boolean;
    percentChange: string;
    status: string;
  }[];
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const metricsConfig: Record<string, MetricConfig> = {
  mrr: {
    title: 'Monthly Recurring Revenue',
    description: 'Track subscription revenue trends and growth over time',
    icon: <DollarSign className="w-6 h-6" />,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    currentValue: '$127,450',
    previousValue: '$113,250',
    change: '+$14,200',
    changePositive: true,
    trend: '12.5%',
    trendPositive: true,
    chartData: [95000, 98000, 102000, 105000, 108000, 110000, 113000, 115000, 118000, 122000, 125000, 127450],
    unit: 'k',
    prefix: '$',
    suffix: '',
    breakdownData: [
      { period: 'December 2024', value: '$127,450', change: '+$950', changePositive: true, percentChange: '+0.75%', status: 'Improving' },
      { period: 'November 2024', value: '$126,500', change: '+$2,500', changePositive: true, percentChange: '+2.02%', status: 'Improving' },
      { period: 'October 2024', value: '$124,000', change: '+$2,000', changePositive: true, percentChange: '+1.64%', status: 'Improving' },
      { period: 'September 2024', value: '$122,000', change: '+$4,000', changePositive: true, percentChange: '+3.39%', status: 'Improving' },
      { period: 'August 2024', value: '$118,000', change: '+$3,000', changePositive: true, percentChange: '+2.61%', status: 'Improving' },
      { period: 'July 2024', value: '$115,000', change: '+$2,000', changePositive: true, percentChange: '+1.77%', status: 'Improving' },
      { period: 'June 2024', value: '$113,000', change: '+$3,000', changePositive: true, percentChange: '+2.73%', status: 'Improving' },
      { period: 'May 2024', value: '$110,000', change: '+$2,000', changePositive: true, percentChange: '+1.85%', status: 'Improving' },
      { period: 'April 2024', value: '$108,000', change: '+$3,000', changePositive: true, percentChange: '+2.86%', status: 'Improving' },
      { period: 'March 2024', value: '$105,000', change: '+$3,000', changePositive: true, percentChange: '+2.94%', status: 'Improving' },
      { period: 'February 2024', value: '$102,000', change: '+$4,000', changePositive: true, percentChange: '+4.08%', status: 'Improving' },
      { period: 'January 2024', value: '$98,000', change: '+$3,000', changePositive: true, percentChange: '+3.16%', status: 'Improving' },
    ],
  },
  churn: {
    title: 'Churn Rate',
    description: 'Monitor customer retention and subscription cancellations',
    icon: <UserMinus className="w-6 h-6" />,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    currentValue: '3.2%',
    previousValue: '4.0%',
    change: '-0.8%',
    changePositive: true,
    trend: '20%',
    trendPositive: false,
    chartData: [5.2, 5.0, 4.7, 4.5, 4.3, 4.1, 4.0, 3.8, 3.6, 3.5, 3.3, 3.2],
    unit: '',
    prefix: '',
    suffix: '%',
    breakdownData: [
      { period: 'December 2024', value: '3.2%', change: '-0.1%', changePositive: true, percentChange: '-3.03%', status: 'Improving' },
      { period: 'November 2024', value: '3.3%', change: '-0.1%', changePositive: true, percentChange: '-2.94%', status: 'Improving' },
      { period: 'October 2024', value: '3.5%', change: '-0.1%', changePositive: true, percentChange: '-2.78%', status: 'Improving' },
      { period: 'September 2024', value: '3.6%', change: '-0.2%', changePositive: true, percentChange: '-5.26%', status: 'Improving' },
      { period: 'August 2024', value: '3.8%', change: '-0.2%', changePositive: true, percentChange: '-5.00%', status: 'Improving' },
      { period: 'July 2024', value: '4.0%', change: '-0.1%', changePositive: true, percentChange: '-2.44%', status: 'Improving' },
      { period: 'June 2024', value: '4.1%', change: '-0.2%', changePositive: true, percentChange: '-4.65%', status: 'Improving' },
      { period: 'May 2024', value: '4.3%', change: '-0.2%', changePositive: true, percentChange: '-4.44%', status: 'Improving' },
      { period: 'April 2024', value: '4.5%', change: '-0.2%', changePositive: true, percentChange: '-4.26%', status: 'Improving' },
      { period: 'March 2024', value: '4.7%', change: '-0.3%', changePositive: true, percentChange: '-6.00%', status: 'Improving' },
      { period: 'February 2024', value: '5.0%', change: '-0.2%', changePositive: true, percentChange: '-3.85%', status: 'Improving' },
      { period: 'January 2024', value: '5.2%', change: '-0.3%', changePositive: true, percentChange: '-5.45%', status: 'Improving' },
    ],
  },
  engagement: {
    title: 'Engagement Rate',
    description: 'Measure platform usage and user interaction across all schools',
    icon: <BarChart3 className="w-6 h-6" />,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    currentValue: '78.4%',
    previousValue: '73.2%',
    change: '+5.2%',
    changePositive: true,
    trend: '7.1%',
    trendPositive: true,
    chartData: [62, 64, 66, 68, 70, 71, 73, 74, 75, 76, 77, 78.4],
    unit: '%',
    prefix: '',
    suffix: '%',
    breakdownData: [
      { period: 'December 2024', value: '78.4%', change: '+1.4%', changePositive: true, percentChange: '+1.82%', status: 'Improving' },
      { period: 'November 2024', value: '77.0%', change: '+1.0%', changePositive: true, percentChange: '+1.32%', status: 'Improving' },
      { period: 'October 2024', value: '76.0%', change: '+1.0%', changePositive: true, percentChange: '+1.33%', status: 'Improving' },
      { period: 'September 2024', value: '75.0%', change: '+1.0%', changePositive: true, percentChange: '+1.35%', status: 'Improving' },
      { period: 'August 2024', value: '74.0%', change: '+1.0%', changePositive: true, percentChange: '+1.37%', status: 'Improving' },
      { period: 'July 2024', value: '73.0%', change: '+2.0%', changePositive: true, percentChange: '+2.82%', status: 'Improving' },
      { period: 'June 2024', value: '71.0%', change: '+1.0%', changePositive: true, percentChange: '+1.43%', status: 'Improving' },
      { period: 'May 2024', value: '70.0%', change: '+2.0%', changePositive: true, percentChange: '+2.94%', status: 'Improving' },
      { period: 'April 2024', value: '68.0%', change: '+2.0%', changePositive: true, percentChange: '+3.03%', status: 'Improving' },
      { period: 'March 2024', value: '66.0%', change: '+2.0%', changePositive: true, percentChange: '+3.13%', status: 'Improving' },
      { period: 'February 2024', value: '64.0%', change: '+2.0%', changePositive: true, percentChange: '+3.23%', status: 'Improving' },
      { period: 'January 2024', value: '62.0%', change: '+1.0%', changePositive: true, percentChange: '+1.64%', status: 'Improving' },
    ],
  },
  schools: {
    title: 'Total Schools',
    description: 'Track school onboarding and platform adoption growth',
    icon: <Building2 className="w-6 h-6" />,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    currentValue: '156',
    previousValue: '139',
    change: '+17',
    changePositive: true,
    trend: '12.2%',
    trendPositive: true,
    chartData: [98, 104, 110, 115, 120, 125, 130, 135, 139, 145, 150, 156],
    unit: '',
    prefix: '',
    suffix: '',
    breakdownData: [
      { period: 'December 2024', value: '156', change: '+6', changePositive: true, percentChange: '+4.00%', status: 'Improving' },
      { period: 'November 2024', value: '150', change: '+5', changePositive: true, percentChange: '+3.45%', status: 'Improving' },
      { period: 'October 2024', value: '145', change: '+6', changePositive: true, percentChange: '+4.32%', status: 'Improving' },
      { period: 'September 2024', value: '139', change: '+4', changePositive: true, percentChange: '+2.96%', status: 'Improving' },
      { period: 'August 2024', value: '135', change: '+5', changePositive: true, percentChange: '+3.85%', status: 'Improving' },
      { period: 'July 2024', value: '130', change: '+5', changePositive: true, percentChange: '+4.00%', status: 'Improving' },
      { period: 'June 2024', value: '125', change: '+5', changePositive: true, percentChange: '+4.17%', status: 'Improving' },
      { period: 'May 2024', value: '120', change: '+5', changePositive: true, percentChange: '+4.35%', status: 'Improving' },
      { period: 'April 2024', value: '115', change: '+5', changePositive: true, percentChange: '+4.55%', status: 'Improving' },
      { period: 'March 2024', value: '110', change: '+6', changePositive: true, percentChange: '+5.77%', status: 'Improving' },
      { period: 'February 2024', value: '104', change: '+6', changePositive: true, percentChange: '+6.12%', status: 'Improving' },
      { period: 'January 2024', value: '98', change: '+4', changePositive: true, percentChange: '+4.26%', status: 'Improving' },
    ],
  },
};

function LineChart({
  data,
  isDescending,
  prefix = '',
  suffix = '',
  breakdownData,
}: {
  data: number[];
  isDescending?: boolean;
  prefix?: string;
  suffix?: string;
  breakdownData?: { period: string; value: string; change: string; changePositive: boolean; percentChange: string }[];
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const maxVal = Math.max(...data);
  const minVal = Math.min(...data);
  const range = maxVal - minVal || 1;

  const chartW = 850;
  const chartH = 300;
  const padLeft = 50;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 40;
  const plotW = chartW - padLeft - padRight;
  const plotH = chartH - padTop - padBottom;

  const points = data.map((val, i) => {
    const x = padLeft + (i / (data.length - 1)) * plotW;
    const y = padTop + plotH - ((val - minVal) / range) * plotH;
    return { x, y, val };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const lastPoint = points[points.length - 1]!;
  const firstPoint = points[0]!;
  const areaPath = `${linePath} L${lastPoint.x},${padTop + plotH} L${firstPoint.x},${padTop + plotH} Z`;

  // Y-axis labels
  const niceMin = isDescending ? 0 : Math.floor(minVal * 0.8);
  const niceMax = Math.ceil(maxVal * 1.1);
  const ySteps = 6;
  const yLabels = Array.from({ length: ySteps + 1 }, (_, i) => {
    const val = niceMin + ((niceMax - niceMin) / ySteps) * i;
    return val;
  });

  const formatYLabel = (val: number) => {
    if (val >= 1000) return `${Math.round(val / 1000)}k`;
    if (val % 1 !== 0) return val.toFixed(1);
    return val.toString();
  };

  const formatValue = (val: number) => {
    if (prefix === '$') {
      if (val >= 1000) return `$${(val / 1000).toFixed(1)}k`;
      return `$${val}`;
    }
    if (suffix === '%') return `${val % 1 !== 0 ? val.toFixed(1) : val}%`;
    return val.toString();
  };

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * chartW;

    // Find closest point
    let closest = 0;
    let minDist = Infinity;
    for (let i = 0; i < points.length; i++) {
      const dist = Math.abs(points[i]!.x - svgX);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    }
    setHoveredIndex(closest);
  }, [points]);

  const handleMouseLeave = useCallback(() => {
    setHoveredIndex(null);
  }, []);

  // Get breakdown info for hovered index (breakdown is reverse chronological)
  const getBreakdownInfo = (index: number) => {
    if (!breakdownData) return null;
    const reverseIndex = breakdownData.length - 1 - index;
    return breakdownData[reverseIndex] || null;
  };

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${chartW} ${chartH}`}
      className="w-full h-full"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Grid lines */}
      {yLabels.map((val, i) => {
        const y = padTop + plotH - ((val - niceMin) / (niceMax - niceMin)) * plotH;
        return (
          <g key={i}>
            <line x1={padLeft} y1={y} x2={chartW - padRight} y2={y} stroke="#E2E8F0" strokeWidth="0.5" />
            <text x={padLeft - 8} y={y + 4} textAnchor="end" className="text-[10px] fill-slate-400">
              {formatYLabel(val)}
            </text>
          </g>
        );
      })}

      {/* Vertical hover line */}
      {hoveredIndex !== null && (
        <line
          x1={points[hoveredIndex]!.x}
          y1={padTop}
          x2={points[hoveredIndex]!.x}
          y2={padTop + plotH}
          stroke="#824ef2"
          strokeWidth="1"
          strokeDasharray="4 4"
          opacity="0.4"
        />
      )}

      {/* Area fill */}
      <path d={areaPath} fill="url(#chartGradient)" />

      {/* Line */}
      <path d={linePath} fill="none" stroke="#824ef2" strokeWidth="2" />

      {/* Data points */}
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={hoveredIndex === i ? 6 : 4}
          fill={hoveredIndex === i ? '#824ef2' : '#824ef2'}
          stroke="white"
          strokeWidth={hoveredIndex === i ? 3 : 2}
          style={{ transition: 'r 0.15s ease, stroke-width 0.15s ease' }}
        />
      ))}

      {/* Tooltip */}
      {hoveredIndex !== null && (() => {
        const p = points[hoveredIndex]!;
        const breakdown = getBreakdownInfo(hoveredIndex);
        const tooltipW = 160;
        const tooltipH = breakdown ? 72 : 44;
        let tooltipX = p.x - tooltipW / 2;
        if (tooltipX < padLeft) tooltipX = padLeft;
        if (tooltipX + tooltipW > chartW - padRight) tooltipX = chartW - padRight - tooltipW;
        const tooltipY = p.y - tooltipH - 14;
        const clampedY = tooltipY < 2 ? p.y + 14 : tooltipY;

        return (
          <g>
            {/* Tooltip box */}
            <rect
              x={tooltipX}
              y={clampedY}
              width={tooltipW}
              height={tooltipH}
              rx="8"
              fill="#1E293B"
              opacity="0.95"
            />
            {/* Arrow */}
            <polygon
              points={`${p.x - 5},${clampedY + (tooltipY < 2 ? -6 : tooltipH)} ${p.x + 5},${clampedY + (tooltipY < 2 ? -6 : tooltipH)} ${p.x},${clampedY + (tooltipY < 2 ? -12 : tooltipH + 6)}`}
              fill="#1E293B"
              opacity="0.95"
            />
            {/* Month + Value */}
            <text x={tooltipX + 12} y={clampedY + 18} className="text-[11px] fill-slate-300 font-medium">
              {months[hoveredIndex]}
              {breakdown ? ` 2024` : ''}
            </text>
            <text x={tooltipX + tooltipW - 12} y={clampedY + 18} textAnchor="end" className="text-[12px] fill-white font-bold">
              {breakdown ? breakdown.value : formatValue(p.val)}
            </text>
            {/* Change info */}
            {breakdown && (
              <>
                <text x={tooltipX + 12} y={clampedY + 38} className="text-[10px] fill-slate-400">
                  Change
                </text>
                <text
                  x={tooltipX + tooltipW - 12}
                  y={clampedY + 38}
                  textAnchor="end"
                  className={`text-[11px] font-medium ${breakdown.changePositive ? 'fill-emerald-400' : 'fill-red-400'}`}
                >
                  {breakdown.change}
                </text>
                <text x={tooltipX + 12} y={clampedY + 56} className="text-[10px] fill-slate-400">
                  Growth
                </text>
                <text
                  x={tooltipX + tooltipW - 12}
                  y={clampedY + 56}
                  textAnchor="end"
                  className={`text-[11px] font-medium ${breakdown.changePositive ? 'fill-emerald-400' : 'fill-red-400'}`}
                >
                  {breakdown.percentChange}
                </text>
              </>
            )}
          </g>
        );
      })()}

      {/* Month labels */}
      {months.map((m, i) => {
        const x = padLeft + (i / (data.length - 1)) * plotW;
        return (
          <text
            key={m}
            x={x}
            y={chartH - 8}
            textAnchor="middle"
            className={`text-[10px] ${hoveredIndex === i ? 'fill-[#824ef2] font-bold' : 'fill-slate-500'}`}
          >
            {m}
          </text>
        );
      })}

      {/* Gradient definition */}
      <defs>
        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#824ef2" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#824ef2" stopOpacity="0.02" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function MetricDetailPage() {
  const params = useParams();
  const router = useRouter();
  const metricKey = params.metric as string;
  const [dateRange, setDateRange] = useState('30d');
  const [toast, setToast] = useState<string | null>(null);

  const config = metricsConfig[metricKey];

  if (!config) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-slate-500">Metric not found</p>
        <button
          onClick={() => router.push('/platform/reports')}
          className="text-sm text-[#824ef2] hover:underline"
        >
          Back to Reports
        </button>
      </div>
    );
  }

  const isDescending = metricKey === 'churn';

  const handleDownload = () => {
    setToast('Downloading PDF report...');
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-[9999] bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2">
          <Download className="w-4 h-4" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
        {/* Top bar: Back + Download */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/platform/reports')}
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Reports
          </button>
          <button
            onClick={handleDownload}
            style={{ backgroundColor: '#824ef2' }}
            className="inline-flex items-center gap-2 h-10 px-5 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download Report
          </button>
        </div>

        {/* Title + Icon */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{config.title}</h2>
            <p className="text-slate-500 mt-1">{config.description}</p>
          </div>
          <div className={`p-3 rounded-xl ${config.iconBg}`}>
            <span className={config.iconColor}>{config.icon}</span>
          </div>
        </div>

        {/* 4 Metric Boxes */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-5 border-r border-slate-200">
            <p className="text-xs text-slate-500 mb-1">Current Value</p>
            <p className="text-2xl font-bold text-slate-900">{config.currentValue}</p>
          </div>
          <div className="p-5 border-r border-slate-200">
            <p className="text-xs text-slate-500 mb-1">Previous Period</p>
            <p className="text-2xl font-bold text-slate-900">{config.previousValue}</p>
          </div>
          <div className="p-5 border-r border-slate-200">
            <p className="text-xs text-slate-500 mb-1">Change</p>
            <p className={`text-2xl font-bold ${config.changePositive ? 'text-emerald-600' : 'text-red-600'}`}>
              {config.change}
            </p>
          </div>
          <div className="p-5">
            <p className="text-xs text-slate-500 mb-1">Trend</p>
            <div className="flex items-center gap-1.5">
              {config.trendPositive ? (
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-600" />
              )}
              <span className={`text-2xl font-bold ${config.trendPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                {config.trend}
              </span>
            </div>
          </div>
        </div>

        {/* Date Range */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-600 font-medium">Date Range:</span>
          <CustomSelect
            value={dateRange}
            onChange={setDateRange}
            options={[
              { value: '7d', label: 'Last 7 Days' },
              { value: '30d', label: 'Last 30 Days' },
              { value: '90d', label: 'Last 90 Days' },
              { value: '1y', label: 'Last Year' },
            ]}
            compact
            className="min-w-[150px]"
          />
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200" />

        {/* Line Chart */}
        <div className="h-[320px]">
          <LineChart
            data={config.chartData}
            isDescending={isDescending}
            prefix={config.prefix}
            suffix={config.suffix}
            breakdownData={config.breakdownData}
          />
        </div>
      </div>

      {/* Detailed Breakdown Table */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-900">Detailed Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-6 py-3 text-left font-medium text-slate-500">Period</th>
                <th className="px-6 py-3 text-left font-medium text-slate-500">Value</th>
                <th className="px-6 py-3 text-left font-medium text-slate-500">Change</th>
                <th className="px-6 py-3 text-left font-medium text-slate-500">% Change</th>
                <th className="px-6 py-3 text-left font-medium text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {config.breakdownData.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3.5 text-slate-900 font-medium">{row.period}</td>
                  <td className="px-6 py-3.5 text-slate-900">{row.value}</td>
                  <td className={`px-6 py-3.5 font-medium ${row.changePositive ? 'text-emerald-600' : 'text-red-600'}`}>
                    {row.change}
                  </td>
                  <td className={`px-6 py-3.5 font-medium ${row.changePositive ? 'text-emerald-600' : 'text-red-600'}`}>
                    {row.percentChange}
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
