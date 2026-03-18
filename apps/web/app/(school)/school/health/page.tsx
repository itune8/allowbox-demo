'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  HeartPulse,
  Plus,
  X,
  FileText,
  Phone,
  Shield,
  Activity,
  Eye,
  Edit3,
  Stethoscope,
  User,
  Ruler,
  Scale,
  ClipboardList,
  Save,
  Loader2,
  AlertCircle,
  Calendar,
  Search,
  Download,
  Thermometer,
  Clock,
  Syringe,
  Printer,
  AlertTriangle,
} from 'lucide-react';
import {
  healthRecordsService,
  HealthRecord,
  BloodGroup,
  AllergyType,
  Allergy,
  EmergencyContact,
  MedicalCondition,
  VaccinationStatus,
} from '../../../../lib/services/health-records.service';
import { userService, User as UserType } from '../../../../lib/services/user.service';
import { classService, Class } from '../../../../lib/services/class.service';
import { SchoolStatCard, SchoolStatusBadge, FormModal, ConfirmModal, useToast, Pagination, CustomSelect } from '../../../../components/school';

// ---------------------------------------------------------------------------
// Types & helpers
// ---------------------------------------------------------------------------

type TabKey = 'all' | 'clinic' | 'immunizations' | 'allergies';

interface IncidentFormData {
  studentId: string;
  classSection: string;
  height: number | '';
  weight: number | '';
  age: number | '';
  bloodGroup: BloodGroup | '';
  incidentType: string;
  dateTime: string;
  temperature: string;
  description: string;
  actionFirstAid: boolean;
  actionParentNotified: boolean;
  actionSentHome: boolean;
  actionHospitalised: boolean;
}

interface CheckupFormData {
  title: string;
  targetAudience: 'whole_school' | 'specific_classes';
  startDate: string;
  endDate: string;
  notes: string;
}

const initialIncidentForm: IncidentFormData = {
  studentId: '',
  classSection: '',
  height: '',
  weight: '',
  age: '',
  bloodGroup: '',
  incidentType: '',
  dateTime: new Date().toISOString().slice(0, 16),
  temperature: '',
  description: '',
  actionFirstAid: false,
  actionParentNotified: false,
  actionSentHome: false,
  actionHospitalised: false,
};

const initialCheckupForm: CheckupFormData = {
  title: '',
  targetAudience: 'whole_school',
  startDate: '',
  endDate: '',
  notes: '',
};

const INCIDENT_TYPES = [
  'Injury / Accident',
  'Illness',
  'Allergy Reaction',
  'Medication',
  'Other',
];

function formatDate(d: string) {
  if (!d) return '---';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function getInitials(first?: string, last?: string) {
  return `${(first || '')[0] || ''}${(last || '')[0] || ''}`.toUpperCase();
}

/** Deterministic colour for a health condition tag */
function conditionTagStyle(name: string): { bg: string; text: string } {
  const lower = name.toLowerCase();
  if (lower.includes('allergy') || lower.includes('peanut')) return { bg: 'bg-red-100', text: 'text-red-700' };
  if (lower.includes('asthma')) return { bg: 'bg-blue-100', text: 'text-blue-700' };
  if (lower.includes('diabetes')) return { bg: 'bg-purple-100', text: 'text-purple-700' };
  if (lower.includes('missing') || lower.includes('form')) return { bg: 'bg-orange-100', text: 'text-orange-700' };
  return { bg: 'bg-slate-100', text: 'text-slate-600' };
}

function getRecordStatus(r: HealthRecord): 'Active' | 'Pending Review' {
  const hasAllInfo = r.bloodGroup && r.emergencyContacts.length > 0;
  return hasAllInfo ? 'Active' : 'Pending Review';
}

const MOCK_CONDITIONS: string[] = [
  'Mild Fever',
  'Knee Injury',
  'Allergic Reaction',
  'Routine Checkup',
  'Headache',
  'Stomach Ache',
  'Asthma Attack',
  'Sprained Ankle',
  'Eye Irritation',
  'Skin Rash',
  'Cold & Cough',
  'Bruise',
];

const MOCK_STATUSES = ['Sent Home', 'First Aid Given', 'Hospitalised', 'Completed', 'Under Observation'];

function getMockCondition(id: string): { condition: string; temp: string } {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash |= 0;
  }
  const condition = MOCK_CONDITIONS[Math.abs(hash) % MOCK_CONDITIONS.length]!;
  // Generate a deterministic temperature between 97.0 and 103.0
  const tempVal = 97.0 + (Math.abs(hash >> 4) % 60) / 10;
  const temp = `Temp: ${tempVal.toFixed(1)}°F`;
  return { condition, temp };
}

function getMockIncidentStatus(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 3) - hash) + id.charCodeAt(i);
    hash |= 0;
  }
  return MOCK_STATUSES[Math.abs(hash) % MOCK_STATUSES.length]!;
}

function getConditionLabels(r: HealthRecord): string[] {
  const labels: string[] = [];
  r.allergies.forEach(a => labels.push(a.name || a.type));
  r.medicalConditions.filter(c => c.isOngoing).forEach(c => labels.push(c.name));
  if (labels.length === 0) {
    const mock = getMockCondition(r._id);
    labels.push(mock.condition);
    labels.push(mock.temp);
  } else {
    // Add temperature to real conditions too
    const mock = getMockCondition(r._id);
    labels.push(mock.temp);
  }
  return labels;
}

// ---------------------------------------------------------------------------
// SVG Charts
// ---------------------------------------------------------------------------

function IncidentTrendsChart({ records }: { records: HealthRecord[] }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  // Deterministic pseudo-data based on record count
  const base = Math.max(records.length, 1);
  const values = days.map((_, i) => {
    const seed = ((base * (i + 1) * 7) % 20) + 2;
    return seed;
  });
  const max = Math.max(...values, 1);
  const w = 400;
  const h = 180;
  const padX = 40;
  const padY = 20;
  const plotW = w - padX * 2;
  const plotH = h - padY * 2;

  const points = values.map((v, i) => ({
    x: padX + (i / (values.length - 1)) * plotW,
    y: padY + plotH - (v / max) * plotH,
  }));

  // Build smooth cubic bezier path
  const buildSmoothPath = (pts: typeof points) => {
    if (pts.length < 2) return '';
    let path = `M${pts[0]!.x.toFixed(1)},${pts[0]!.y.toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const curr = pts[i]!;
      const next = pts[i + 1]!;
      const tension = 0.3;
      const dx = next.x - curr.x;
      const cp1x = curr.x + dx * tension;
      const cp2x = next.x - dx * tension;
      path += ` C${cp1x.toFixed(1)},${curr.y.toFixed(1)} ${cp2x.toFixed(1)},${next.y.toFixed(1)} ${next.x.toFixed(1)},${next.y.toFixed(1)}`;
    }
    return path;
  };
  const linePath = buildSmoothPath(points);
  const lastPt = points[points.length - 1] ?? { x: padX + plotW, y: padY + plotH };
  const firstPt = points[0] ?? { x: padX, y: padY + plotH };
  const areaPath = `${linePath} L${lastPt.x},${padY + plotH} L${firstPt.x},${padY + plotH} Z`;

  // Normalize points to 0-100% for responsive rendering
  const pctPoints = values.map((v, i) => ({
    xPct: (i / (values.length - 1)) * 100,
    yPct: ((max - v) / max) * 100,
  }));

  // Build smooth path using percentage-based coordinates within a 0 0 100 100 viewBox
  const buildPctPath = (pts: typeof pctPoints) => {
    if (pts.length < 2) return '';
    let path = `M${pts[0]!.xPct.toFixed(2)},${pts[0]!.yPct.toFixed(2)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const curr = pts[i]!;
      const next = pts[i + 1]!;
      const tension = 0.3;
      const dx = next.xPct - curr.xPct;
      const cp1x = curr.xPct + dx * tension;
      const cp2x = next.xPct - dx * tension;
      path += ` C${cp1x.toFixed(2)},${curr.yPct.toFixed(2)} ${cp2x.toFixed(2)},${next.yPct.toFixed(2)} ${next.xPct.toFixed(2)},${next.yPct.toFixed(2)}`;
    }
    return path;
  };
  const pctLinePath = buildPctPath(pctPoints);
  const pctLastPt = pctPoints[pctPoints.length - 1] ?? { xPct: 100, yPct: 100 };
  const pctFirstPt = pctPoints[0] ?? { xPct: 0, yPct: 100 };
  const pctAreaPath = `${pctLinePath} L${pctLastPt.xPct},100 L${pctFirstPt.xPct},100 Z`;

  const gridTicks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 h-full">
      <h3 className="text-sm font-semibold text-slate-900 mb-3">Incident Trends</h3>
      <div className="flex" style={{ height: '180px' }}>
        {/* Y-axis labels */}
        <div className="flex flex-col justify-between pr-2 py-0" style={{ width: '32px' }}>
          {gridTicks.map((t, i) => (
            <span key={i} className="text-[11px] text-slate-400 text-right leading-none">
              {Math.round(max * (1 - t))}
            </span>
          ))}
        </div>
        {/* Chart area */}
        <div className="flex-1 relative">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
            {/* Grid lines */}
            {gridTicks.map((t, i) => (
              <line key={i} x1="0" y1={t * 100} x2="100" y2={t * 100} stroke="#e2e8f0" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
            ))}
            {/* Area fill */}
            <path d={pctAreaPath} fill="url(#areaGradHealth)" opacity="0.3" />
            <defs>
              <linearGradient id="areaGradHealth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#824ef2" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#824ef2" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            {/* Line */}
            <path d={pctLinePath} fill="none" stroke="#824ef2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          </svg>
          {/* Dots rendered as absolute HTML elements so they don't stretch */}
          {pctPoints.map((p, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-[#824ef2] border-2 border-white"
              style={{
                left: `${p.xPct}%`,
                top: `${p.yPct}%`,
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </div>
      </div>
      {/* X-axis labels */}
      <div className="flex justify-between mt-2" style={{ marginLeft: '32px' }}>
        {days.map((day, i) => (
          <span key={i} className="text-[11px] text-slate-400 text-center">
            {day}
          </span>
        ))}
      </div>
    </div>
  );
}

function IncidentTypesChart({ records }: { records: HealthRecord[] }) {
  // Derive counts from records
  const injuryCount = records.filter(r => r.medicalConditions.some(c => c.name?.toLowerCase().includes('injur'))).length || 2;
  const illnessCount = records.filter(r => r.medicalConditions.some(c => c.name?.toLowerCase().includes('ill') || c.name?.toLowerCase().includes('fever'))).length || 3;
  const allergyCount = records.filter(r => r.allergies.length > 0).length || 2;
  const medicationCount = records.filter(r => r.medicalConditions.some(c => c.treatment)).length || 1;
  const otherCount = Math.max(records.length - injuryCount - illnessCount - allergyCount - medicationCount, 1);

  const data = [
    { label: 'Injury', count: injuryCount, color: '#824ef2' },
    { label: 'Illness', count: illnessCount, color: '#14b8a6' },
    { label: 'Allergy', count: allergyCount, color: '#f97316' },
    { label: 'Medication', count: medicationCount, color: '#ef4444' },
    { label: 'Other', count: otherCount, color: '#94a3b8' },
  ];

  const total = data.reduce((s, d) => s + d.count, 0);
  const cx = 100;
  const cy = 100;
  const r = 70;
  const innerR = 45;

  let startAngle = -90;
  const arcs = data.map(d => {
    const angle = (d.count / total) * 360;
    const endAngle = startAngle + angle;
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const largeArc = angle > 180 ? 1 : 0;
    const path = [
      `M${cx + r * Math.cos(startRad)},${cy + r * Math.sin(startRad)}`,
      `A${r},${r} 0 ${largeArc} 1 ${cx + r * Math.cos(endRad)},${cy + r * Math.sin(endRad)}`,
      `L${cx + innerR * Math.cos(endRad)},${cy + innerR * Math.sin(endRad)}`,
      `A${innerR},${innerR} 0 ${largeArc} 0 ${cx + innerR * Math.cos(startRad)},${cy + innerR * Math.sin(startRad)}`,
      'Z',
    ].join(' ');
    startAngle = endAngle;
    return { ...d, path };
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 h-full flex flex-col">
      <h3 className="text-sm font-semibold text-slate-900 mb-4">Incident Types</h3>
      <div className="flex-1 flex items-center justify-center">
        <svg viewBox="0 0 200 200" className="w-36 h-36">
          {arcs.map((a, i) => (
            <path key={i} d={a.path} fill={a.color} />
          ))}
          <text x={cx} y={cy - 4} textAnchor="middle" fontSize="22" fontWeight="bold" fill="#1e293b">
            {total}
          </text>
          <text x={cx} y={cy + 14} textAnchor="middle" fontSize="10" fill="#94a3b8">
            Total
          </text>
        </svg>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 pt-4 border-t border-slate-100">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-xs text-slate-600">{d.label}</span>
            <span className="text-xs font-semibold text-slate-900">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export default function SchoolHealthPage() {
  const { showToast } = useToast();

  // Data state
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [students, setStudents] = useState<UserType[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCondition, setFilterCondition] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 5;

  // Table selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modals
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [showCheckupModal, setShowCheckupModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form state
  const [incidentForm, setIncidentForm] = useState<IncidentFormData>(initialIncidentForm);
  const [checkupForm, setCheckupForm] = useState<CheckupFormData>(initialCheckupForm);
  const [submitting, setSubmitting] = useState(false);

  // ---------- Data loading ----------
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [recordsData, studentsData, classesData] = await Promise.all([
        healthRecordsService.getAll(),
        userService.getStudents(),
        classService.getClasses(),
      ]);
      setRecords(recordsData);
      setStudents(studentsData);
      setClasses(classesData);
    } catch (err) {
      setError('Failed to load health records');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // ---------- Stats ----------
  const todaysVisits = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return records.filter(r => r.updatedAt?.slice(0, 10) === today).length;
  }, [records]);

  const medicalAlerts = useMemo(() => {
    return records.filter(r => r.allergies.some(a => a.severity?.toLowerCase() === 'severe') || r.medicalConditions.some(c => c.isOngoing)).length;
  }, [records]);

  const pendingForms = useMemo(() => {
    return records.filter(r => !r.bloodGroup || r.emergencyContacts.length === 0).length;
  }, [records]);

  const immunizationCompliant = useMemo(() => {
    if (records.length === 0) return 0;
    const compliant = records.filter(r => r.vaccinations.every(v => v.status === VaccinationStatus.COMPLETED)).length;
    return Math.round((compliant / records.length) * 100);
  }, [records]);

  // ---------- Filtering ----------
  const filteredRecords = useMemo(() => {
    let result = [...records];

    // Tab-based filtering
    if (activeTab === 'clinic') {
      result = result.filter(r => r.medicalConditions.length > 0);
    } else if (activeTab === 'immunizations') {
      result = result.filter(r => r.vaccinations.length > 0);
    } else if (activeTab === 'allergies') {
      result = result.filter(r => r.allergies.length > 0);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => {
        const name = `${r.studentId?.firstName} ${r.studentId?.lastName}`.toLowerCase();
        const sid = r.studentId?.studentId?.toLowerCase() || '';
        const conditions = [...r.allergies.map(a => a.name), ...r.medicalConditions.map(c => c.name)].join(' ').toLowerCase();
        return name.includes(q) || sid.includes(q) || conditions.includes(q) || r._id.toLowerCase().includes(q);
      });
    }

    // Grade filter
    if (filterGrade) {
      result = result.filter(r => {
        const student = students.find(s => (s._id || s.id) === r.studentId?._id);
        if (!student) return false;
        const classObj = typeof student.classId === 'object' ? student.classId : classes.find(c => c._id === student.classId);
        return classObj?.grade === filterGrade;
      });
    }

    // Status filter
    if (filterStatus) {
      result = result.filter(r => {
        const status = getRecordStatus(r);
        return status === filterStatus;
      });
    }

    // Condition type filter
    if (filterCondition) {
      if (filterCondition === 'allergy') {
        result = result.filter(r => r.allergies.length > 0);
      } else if (filterCondition === 'medical') {
        result = result.filter(r => r.medicalConditions.some(c => c.isOngoing));
      } else if (filterCondition === 'none') {
        result = result.filter(r => r.allergies.length === 0 && !r.medicalConditions.some(c => c.isOngoing));
      }
    }

    return result;
  }, [records, activeTab, searchQuery, filterGrade, filterStatus, filterCondition, students, classes]);

  const paginatedRecords = useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredRecords.slice(start, start + perPage);
  }, [filteredRecords, page]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [activeTab, searchQuery, filterGrade, filterStatus, filterCondition]);

  // ---------- Unique grades from classes ----------
  const uniqueGrades = useMemo(() => {
    const grades = new Set(classes.map(c => c.grade));
    return Array.from(grades).sort();
  }, [classes]);

  // ---------- Helpers for student info ----------
  function getStudentClass(record: HealthRecord): string {
    const student = students.find(s => (s._id || s.id) === record.studentId?._id);
    if (!student) return '---';
    const classObj = typeof student.classId === 'object' ? student.classId : classes.find(c => c._id === student.classId);
    const section = student.section || '';
    if (classObj) {
      return `${classObj.name}${section ? ` - ${section}` : ''}`;
    }
    return '---';
  }

  // ---------- Table checkbox helpers ----------
  function toggleSelectAll() {
    if (selectedIds.size === paginatedRecords.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedRecords.map(r => r._id)));
    }
  }

  function toggleSelectOne(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // ---------- Modal handlers ----------
  function openDetails(record: HealthRecord) {
    setSelectedRecord(record);
    setShowDetailsModal(true);
  }

  function openEditFromDetails(record: HealthRecord) {
    setSelectedRecord(null);
    setShowDetailsModal(false);
    // Pre-fill the incident form with existing data
    setIncidentForm({
      studentId: record.studentId?._id || '',
      classSection: '',
      height: record.height || '',
      weight: record.weight || '',
      age: '',
      bloodGroup: record.bloodGroup || '',
      incidentType: '',
      dateTime: new Date().toISOString().slice(0, 16),
      temperature: '',
      description: record.specialInstructions || '',
      actionFirstAid: false,
      actionParentNotified: false,
      actionSentHome: false,
      actionHospitalised: false,
    });
    setShowIncidentModal(true);
  }

  async function handleSaveIncident(e: React.FormEvent) {
    e.preventDefault();
    if (!incidentForm.studentId) {
      showToast('error', 'Please select a student');
      return;
    }

    try {
      setSubmitting(true);

      // Check if record already exists for this student
      const existingRecord = records.find(r => r.studentId._id === incidentForm.studentId);

      const payload: any = {
        studentId: incidentForm.studentId,
        bloodGroup: incidentForm.bloodGroup || undefined,
        height: incidentForm.height || undefined,
        weight: incidentForm.weight || undefined,
        specialInstructions: incidentForm.description || undefined,
      };

      if (existingRecord) {
        await healthRecordsService.update(existingRecord._id, payload);
        showToast('success', 'Health record updated successfully');
      } else {
        await healthRecordsService.create(payload);
        showToast('success', 'Incident logged successfully');
      }

      await loadData();
      setShowIncidentModal(false);
      setIncidentForm(initialIncidentForm);
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to save record');
    } finally {
      setSubmitting(false);
    }
  }

  function handleScheduleCheckup(e: React.FormEvent) {
    e.preventDefault();
    if (!checkupForm.title) {
      showToast('error', 'Please enter a program title');
      return;
    }
    // In a real app this would call an API
    showToast('success', `Health checkup "${checkupForm.title}" scheduled successfully`);
    setShowCheckupModal(false);
    setCheckupForm(initialCheckupForm);
  }

  async function handleDelete() {
    if (!deleteTargetId) return;
    try {
      await healthRecordsService.delete(deleteTargetId);
      showToast('success', 'Health record deleted');
      await loadData();
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to delete record');
    } finally {
      setShowDeleteConfirm(false);
      setDeleteTargetId(null);
    }
  }

  // ---------- Loading state ----------
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-[#824ef2] animate-spin" />
      </div>
    );
  }

  // ---------- Render ----------
  const tabs: { key: TabKey; label: string }[] = [
    { key: 'all', label: 'All Records' },
  ];

  return (
    <section className="space-y-6">
      {/* ============= ACTIONS ============= */}
      <div className="flex items-center justify-end gap-2 flex-wrap">
          <button
            onClick={() => showToast('info', 'Report export started')}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Download className="w-4 h-4" /> Export Report
          </button>
          <button
            onClick={() => { setCheckupForm(initialCheckupForm); setShowCheckupModal(true); }}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Calendar className="w-4 h-4" /> Schedule Checkup
          </button>
          <button
            onClick={() => { setIncidentForm(initialIncidentForm); setShowIncidentModal(true); }}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#824ef2] hover:bg-[#6b3fd4] rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Log Incident
          </button>
      </div>

      {/* ============= TABS (hidden when only one tab) ============= */}
      {tabs.length > 1 && (
        <div className="flex gap-1 border-b border-slate-200">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.key
                  ? 'border-[#824ef2] text-[#824ef2]'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* ============= STAT CARDS ============= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SchoolStatCard
          icon={<Activity className="w-5 h-5" />}
          color="blue"
          label="Today's Visits"
          value={todaysVisits}
          subtitle={todaysVisits > 0 ? `${todaysVisits > 1 ? '+' : ''}4% vs yesterday` : 'No visits today'}
        />
        <SchoolStatCard
          icon={<AlertCircle className="w-5 h-5" />}
          color="red"
          label="Medical Alerts"
          value={medicalAlerts}
          subtitle={medicalAlerts > 0 ? `${Math.min(medicalAlerts, 2)} severe allergies` : 'No alerts'}
        />
        <SchoolStatCard
          icon={<FileText className="w-5 h-5" />}
          color="orange"
          label="Pending Forms"
          value={pendingForms}
          subtitle={pendingForms > 0 ? 'Needs review' : 'All forms complete'}
        />
        <SchoolStatCard
          icon={<Syringe className="w-5 h-5" />}
          color="green"
          label="Immunization Status"
          value={records.length > 0 ? `${immunizationCompliant}%` : '0%'}
          subtitle="Compliant students"
        />
      </div>

      {/* ============= ERROR ALERT ============= */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="hover:bg-red-100 p-1 rounded transition-colors">
            <X className="w-4 h-4 text-red-600" />
          </button>
        </div>
      )}

      {/* ============= CHARTS ============= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4" style={{ maxHeight: '320px' }}>
        <div className="lg:col-span-8">
          <IncidentTrendsChart records={records} />
        </div>
        <div className="lg:col-span-4">
          <IncidentTypesChart records={records} />
        </div>
      </div>

      {/* ============= RECENT HEALTH RECORDS ============= */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Recent Health Records</h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search student..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] text-slate-900 transition-colors"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 ml-auto">
              <CustomSelect
                value={filterGrade}
                onChange={setFilterGrade}
                options={[{ value: '', label: 'Grade Level' }, ...uniqueGrades.map(g => ({ value: g, label: g }))]}
                size="sm"
              />
              <CustomSelect
                value={filterStatus}
                onChange={setFilterStatus}
                options={[
                  { value: '', label: 'Status' },
                  { value: 'Active', label: 'Active' },
                  { value: 'Pending Review', label: 'Pending Review' },
                ]}
                size="sm"
              />
              <CustomSelect
                value={filterCondition}
                onChange={setFilterCondition}
                options={[
                  { value: '', label: 'Condition Type' },
                  { value: 'allergy', label: 'Allergy' },
                  { value: 'medical', label: 'Medical Condition' },
                  { value: 'none', label: 'None' },
                ]}
                size="sm"
              />
            </div>
          </div>
        </div>
        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
              <HeartPulse className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-lg font-medium text-slate-600">No health records found</p>
            <p className="text-sm text-slate-400 mt-1">
              {searchQuery || filterGrade || filterStatus || filterCondition
                ? 'Try adjusting your search or filters'
                : 'Log an incident to get started'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4 w-10">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-[#824ef2] focus:ring-[#824ef2]"
                        checked={selectedIds.size === paginatedRecords.length && paginatedRecords.length > 0}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Class & Section</th>
                    <th className="py-3 px-4">Condition / Incident</th>
                    <th className="py-3 px-4">Parent Contact</th>
                    <th className="py-3 px-4">Last Updated</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedRecords.map(record => {
                    const conditionLabels = getConditionLabels(record);
                    const status = getRecordStatus(record);
                    return (
                      <tr key={record._id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            className="rounded border-slate-300 text-[#824ef2] focus:ring-[#824ef2]"
                            checked={selectedIds.has(record._id)}
                            onChange={() => toggleSelectOne(record._id)}
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-[#824ef2] rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                              {getInitials(record.studentId?.firstName, record.studentId?.lastName)}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">
                                {record.studentId?.firstName} {record.studentId?.lastName}
                              </p>
                              <p className="text-xs text-slate-400">{record.studentId?.studentId || record._id.slice(-6).toUpperCase()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{getStudentClass(record)}</td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-slate-900">
                              {conditionLabels[0] || 'None'}
                            </p>
                            {conditionLabels.length > 1 && (
                              <p className="text-xs text-slate-400">{conditionLabels.slice(1).join(', ')}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {record.emergencyContacts?.[0] ? (
                            <div>
                              <p className="font-medium text-slate-900">{record.emergencyContacts[0].name}</p>
                              <p className="text-xs text-slate-400">{record.emergencyContacts[0].phone}</p>
                            </div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-500">{formatDate(record.updatedAt)}</td>
                        <td className="py-3 px-4">
                          {(() => {
                            const incidentStatus = getMockIncidentStatus(record._id);
                            const statusStyles: Record<string, string> = {
                              'Sent Home': 'bg-amber-50 text-amber-700',
                              'First Aid Given': 'bg-emerald-50 text-emerald-700',
                              'Hospitalised': 'bg-red-50 text-red-700',
                              'Completed': 'bg-blue-50 text-blue-700',
                              'Under Observation': 'bg-purple-50 text-purple-700',
                            };
                            return (
                              <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyles[incidentStatus] || 'bg-slate-100 text-slate-600'}`}>
                                {incidentStatus}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openDetails(record)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                              title="View details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openEditFromDetails(record)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                              title="Edit record"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-4 border-t border-slate-200">
              <Pagination
                total={filteredRecords.length}
                page={page}
                perPage={perPage}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </div>

      {/* ============= VIEW DETAILS MODAL ============= */}
      {selectedRecord && (
        <FormModal
          open={showDetailsModal}
          onClose={() => { setShowDetailsModal(false); setSelectedRecord(null); }}
          title="Student Health Details"
          size="lg"
          footer={
            <>
              <button
                onClick={() => showToast('info', 'Print report feature coming soon')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Printer className="w-4 h-4" /> Print Report
              </button>
              <button
                onClick={() => selectedRecord && openEditFromDetails(selectedRecord)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#824ef2] hover:bg-[#6b3fd4] rounded-lg transition-colors"
              >
                <Edit3 className="w-4 h-4" /> Edit Record
              </button>
            </>
          }
        >
          <div className="space-y-6">
            {/* Student Header */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#824ef2] rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {getInitials(selectedRecord.studentId?.firstName, selectedRecord.studentId?.lastName)}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {selectedRecord.studentId?.firstName} {selectedRecord.studentId?.lastName}
                </h3>
                <p className="text-sm text-slate-500">
                  {selectedRecord.studentId?.studentId || 'N/A'} &middot; {getStudentClass(selectedRecord)}
                </p>
              </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <Ruler className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <p className="text-xs text-slate-500">Height</p>
                <p className="text-lg font-bold text-slate-900">{selectedRecord.height ? `${selectedRecord.height} cm` : '---'}</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-3 text-center">
                <Scale className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                <p className="text-xs text-slate-500">Weight</p>
                <p className="text-lg font-bold text-slate-900">{selectedRecord.weight ? `${selectedRecord.weight} kg` : '---'}</p>
              </div>
              <div className="bg-red-50 rounded-xl p-3 text-center">
                <HeartPulse className="w-5 h-5 text-red-600 mx-auto mb-1" />
                <p className="text-xs text-slate-500">Blood Group</p>
                <p className="text-lg font-bold text-slate-900">{selectedRecord.bloodGroup || '---'}</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-3 text-center">
                <User className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                <p className="text-xs text-slate-500">Age</p>
                <p className="text-lg font-bold text-slate-900">---</p>
              </div>
            </div>

            {/* Medical History */}
            {selectedRecord.medicalConditions.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-red-500" /> Medical History
                </h4>
                <div className="space-y-2">
                  {selectedRecord.medicalConditions.map((c, i) => (
                    <div key={i} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-800">{c.name}</span>
                        <div className="flex items-center gap-2">
                          {c.isOngoing && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">Ongoing</span>
                          )}
                          {c.treatment && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Under Treatment</span>
                          )}
                        </div>
                      </div>
                      {c.description && <p className="text-xs text-slate-500 mt-1">{c.description}</p>}
                      {c.diagnosedDate && <p className="text-xs text-slate-400 mt-1">Diagnosed: {formatDate(c.diagnosedDate)}</p>}
                      {c.treatment && <p className="text-xs text-slate-500 mt-1">Treatment: {c.treatment}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Allergies */}
            {selectedRecord.allergies.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" /> Allergies
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedRecord.allergies.map((a, i) => {
                    const style = conditionTagStyle(a.name || a.type);
                    return (
                      <span key={i} className={`px-3 py-1.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
                        {a.name || a.type}{a.severity ? ` (${a.severity})` : ''}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Chronic Conditions */}
            {selectedRecord.medicalConditions.filter(c => c.isOngoing).length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-purple-500" /> Chronic Conditions
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedRecord.medicalConditions.filter(c => c.isOngoing).map((c, i) => (
                    <span key={i} className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      {c.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Emergency Contacts */}
            {selectedRecord.emergencyContacts.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-500" /> Parent / Emergency Contact
                </h4>
                <div className="space-y-2">
                  {selectedRecord.emergencyContacts.map((c, i) => (
                    <div key={i} className="bg-emerald-50 p-3 rounded-lg border border-emerald-100 flex items-center justify-between">
                      <div>
                        <span className="font-medium text-emerald-800">{c.name}</span>
                        <span className="text-emerald-600 ml-2 text-sm">({c.relationship})</span>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-700 text-sm">
                        <Phone className="w-3.5 h-3.5" />
                        {c.phone}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Information */}
            {(selectedRecord.insuranceProvider || selectedRecord.specialInstructions) && (
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-sky-500" /> Additional Information
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {selectedRecord.specialInstructions && (
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-500">Incident Description</p>
                      <p className="text-sm font-medium text-slate-900 mt-0.5">{selectedRecord.specialInstructions}</p>
                    </div>
                  )}
                  {selectedRecord.insuranceProvider && (
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-500">Insurance</p>
                      <p className="text-sm font-medium text-slate-900 mt-0.5">{selectedRecord.insuranceProvider}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </FormModal>
      )}

      {/* ============= LOG INCIDENT MODAL ============= */}
      <FormModal
        open={showIncidentModal}
        onClose={() => { setShowIncidentModal(false); setIncidentForm(initialIncidentForm); }}
        title="Log New Incident"
        size="xl"
        footer={
          <>
            <button
              onClick={() => { setShowIncidentModal(false); setIncidentForm(initialIncidentForm); }}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={submitting}
              onClick={handleSaveIncident}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#824ef2] hover:bg-[#6b3fd4] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              ) : (
                <><Save className="w-4 h-4" /> Save Record</>
              )}
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveIncident} className="space-y-6">
          {/* Student Details Section */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Student Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Student Name <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] text-slate-900 transition-colors"
                  value={incidentForm.studentId}
                  onChange={e => setIncidentForm({ ...incidentForm, studentId: e.target.value })}
                  required
                >
                  <option value="">Search or select student...</option>
                  {students.map(s => (
                    <option key={s._id || s.id} value={s._id || s.id}>
                      {s.firstName} {s.lastName}{s.studentId ? ` (${s.studentId})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Class &amp; Section</label>
                <select
                  className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] text-slate-900 transition-colors"
                  value={incidentForm.classSection}
                  onChange={e => setIncidentForm({ ...incidentForm, classSection: e.target.value })}
                >
                  <option value="">Select class</option>
                  {classes.map(c => (
                    c.sections.map(s => (
                      <option key={`${c._id}-${s}`} value={`${c._id}-${s}`}>
                        {c.grade} - {c.name} ({s})
                      </option>
                    ))
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Blood Group</label>
                <select
                  className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] text-slate-900 transition-colors"
                  value={incidentForm.bloodGroup}
                  onChange={e => setIncidentForm({ ...incidentForm, bloodGroup: e.target.value as BloodGroup })}
                >
                  <option value="">Select</option>
                  {Object.values(BloodGroup).map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Height (cm)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] text-slate-900 transition-colors"
                  value={incidentForm.height}
                  onChange={e => setIncidentForm({ ...incidentForm, height: e.target.value ? parseFloat(e.target.value) : '' })}
                  placeholder="e.g., 150"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] text-slate-900 transition-colors"
                  value={incidentForm.weight}
                  onChange={e => setIncidentForm({ ...incidentForm, weight: e.target.value ? parseFloat(e.target.value) : '' })}
                  placeholder="e.g., 45"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
                <input
                  type="number"
                  className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] text-slate-900 transition-colors"
                  value={incidentForm.age}
                  onChange={e => setIncidentForm({ ...incidentForm, age: e.target.value ? parseInt(e.target.value) : '' })}
                  placeholder="e.g., 12"
                />
              </div>
            </div>
          </div>

          {/* Incident Information Section */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Incident Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Incident Type</label>
                <select
                  className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] text-slate-900 transition-colors"
                  value={incidentForm.incidentType}
                  onChange={e => setIncidentForm({ ...incidentForm, incidentType: e.target.value })}
                >
                  <option value="">Select type</option>
                  {INCIDENT_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date &amp; Time</label>
                <input
                  type="datetime-local"
                  className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] text-slate-900 transition-colors"
                  value={incidentForm.dateTime}
                  onChange={e => setIncidentForm({ ...incidentForm, dateTime: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Temperature</label>
                <input
                  type="text"
                  className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] text-slate-900 transition-colors"
                  value={incidentForm.temperature}
                  onChange={e => setIncidentForm({ ...incidentForm, temperature: e.target.value })}
                  placeholder="e.g., 98.6 F"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Description &amp; Symptoms</label>
                <textarea
                  className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] text-slate-900 transition-colors resize-none"
                  rows={3}
                  value={incidentForm.description}
                  onChange={e => setIncidentForm({ ...incidentForm, description: e.target.value })}
                  placeholder="Describe the incident, symptoms observed..."
                />
              </div>
            </div>
          </div>

          {/* Action Taken Section */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Action Taken</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { key: 'actionFirstAid' as const, label: 'First Aid' },
                { key: 'actionParentNotified' as const, label: 'Parent Notified' },
                { key: 'actionSentHome' as const, label: 'Sent Home' },
                { key: 'actionHospitalised' as const, label: 'Hospitalised' },
              ].map(action => (
                <label
                  key={action.key}
                  className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                    incidentForm[action.key]
                      ? 'bg-[#824ef2]/5 border-[#824ef2]/30'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-[#824ef2] focus:ring-[#824ef2]"
                    checked={incidentForm[action.key]}
                    onChange={e => setIncidentForm({ ...incidentForm, [action.key]: e.target.checked })}
                  />
                  <span className="text-sm text-slate-700">{action.label}</span>
                </label>
              ))}
            </div>
          </div>
        </form>
      </FormModal>

      {/* ============= SCHEDULE CHECKUP MODAL ============= */}
      <FormModal
        open={showCheckupModal}
        onClose={() => { setShowCheckupModal(false); setCheckupForm(initialCheckupForm); }}
        title="Schedule Health Checkup"
        size="md"
        footer={
          <>
            <button
              onClick={() => { setShowCheckupModal(false); setCheckupForm(initialCheckupForm); }}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleScheduleCheckup}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#824ef2] hover:bg-[#6b3fd4] rounded-lg transition-colors"
            >
              <Calendar className="w-4 h-4" /> Schedule
            </button>
          </>
        }
      >
        <form onSubmit={handleScheduleCheckup} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Program Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] text-slate-900 transition-colors"
              value={checkupForm.title}
              onChange={e => setCheckupForm({ ...checkupForm, title: e.target.value })}
              placeholder="e.g., Annual Health Checkup 2026"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Target Audience</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="targetAudience"
                  className="text-[#824ef2] focus:ring-[#824ef2]"
                  checked={checkupForm.targetAudience === 'whole_school'}
                  onChange={() => setCheckupForm({ ...checkupForm, targetAudience: 'whole_school' })}
                />
                <span className="text-sm text-slate-700">Whole School</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="targetAudience"
                  className="text-[#824ef2] focus:ring-[#824ef2]"
                  checked={checkupForm.targetAudience === 'specific_classes'}
                  onChange={() => setCheckupForm({ ...checkupForm, targetAudience: 'specific_classes' })}
                />
                <span className="text-sm text-slate-700">Specific Classes</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] text-slate-900 transition-colors"
                value={checkupForm.startDate}
                onChange={e => setCheckupForm({ ...checkupForm, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] text-slate-900 transition-colors"
                value={checkupForm.endDate}
                onChange={e => setCheckupForm({ ...checkupForm, endDate: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes / Instructions</label>
            <textarea
              className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] text-slate-900 transition-colors resize-none"
              rows={3}
              value={checkupForm.notes}
              onChange={e => setCheckupForm({ ...checkupForm, notes: e.target.value })}
              placeholder="Additional notes or instructions for the health checkup..."
            />
          </div>
        </form>
      </FormModal>

      {/* ============= DELETE CONFIRM MODAL ============= */}
      <ConfirmModal
        open={showDeleteConfirm}
        title="Delete Health Record"
        message="Are you sure you want to delete this health record? This action cannot be undone."
        confirmLabel="Delete"
        confirmColor="red"
        onConfirm={handleDelete}
        onCancel={() => { setShowDeleteConfirm(false); setDeleteTargetId(null); }}
      />
    </section>
  );
}
