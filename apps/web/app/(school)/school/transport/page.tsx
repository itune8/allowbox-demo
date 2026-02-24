'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Bus,
  Route,
  Users,
  Plus,
  X,
  MapPin,
  Clock,
  DollarSign,
  Truck,
  Car,
  Edit2,
  Trash2,
  UserCheck,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Phone,
  MoreVertical,
  Fuel,
  Zap,
  Search,
  UserPlus,
} from 'lucide-react';
import {
  transportService,
  Vehicle,
  TransportRoute,
  StudentTransport,
  TransportStatistics,
  VehicleType,
  VehicleStatus,
  RouteStatus,
  RouteStop,
} from '../../../../lib/services/transport.service';
import { userService, User } from '../../../../lib/services/user.service';
import { classService, Class } from '../../../../lib/services/class.service';
import { SchoolStatCard, SchoolStatusBadge, FormModal, ConfirmModal, useToast, Pagination } from '../../../../components/school';

// ============================================================
// Types & Form Defaults
// ============================================================

type TabKey = 'vehicles' | 'drivers' | 'routes' | 'students';

interface VehicleFormData {
  vehicleNumber: string;
  type: VehicleType;
  model: string;
  capacity: string;
  fuelType: 'Diesel' | 'Petrol' | 'Electric';
  status: VehicleStatus;
}

interface DriverFormData {
  driverName: string;
  driverPhone: string;
  driverLicense: string;
  vehicleId: string;
}

interface RouteFormData {
  name: string;
  startPoint: string;
  endPoint: string;
  monthlyFee: string;
  frequency: string;
  direction: 'Two Way' | 'Pickup Only' | 'Drop Only';
  startTime: string;
  endTime: string;
  status: RouteStatus;
  stops: { name: string; time: string }[];
}

interface EnrollFormData {
  studentId: string;
  studentSearch: string;
  classId: string;
  section: string;
  routeId: string;
  serviceType: 'Two Way' | 'One Way';
}

const defaultVehicleForm: VehicleFormData = {
  vehicleNumber: '',
  type: VehicleType.BUS,
  model: '',
  capacity: '40',
  fuelType: 'Diesel',
  status: VehicleStatus.ACTIVE,
};

const defaultDriverForm: DriverFormData = {
  driverName: '',
  driverPhone: '',
  driverLicense: '',
  vehicleId: '',
};

const defaultRouteForm: RouteFormData = {
  name: '',
  startPoint: '',
  endPoint: '',
  monthlyFee: '',
  frequency: 'Monthly',
  direction: 'Two Way',
  startTime: '07:00',
  endTime: '08:30',
  status: RouteStatus.ACTIVE,
  stops: [{ name: '', time: '' }],
};

const defaultEnrollForm: EnrollFormData = {
  studentId: '',
  studentSearch: '',
  classId: '',
  section: '',
  routeId: '',
  serviceType: 'Two Way',
};

// ============================================================
// Helper: extract driver info from vehicles
// ============================================================

interface DriverInfo {
  name: string;
  phone: string;
  license: string;
  vehicleId: string;
  vehicleNumber: string;
  initials: string;
}

function extractDrivers(vehicles: Vehicle[]): DriverInfo[] {
  return vehicles
    .filter((v) => v.driverName && v.driverName.trim())
    .map((v) => {
      const nameParts = (v.driverName || '').trim().split(' ');
      const initials =
        nameParts.length >= 2
          ? ((nameParts[0] ?? '').charAt(0) + (nameParts[nameParts.length - 1] ?? '').charAt(0)).toUpperCase()
          : (nameParts[0]?.substring(0, 2) || 'DR').toUpperCase();
      return {
        name: v.driverName || '',
        phone: v.driverPhone || '',
        license: v.driverLicense || '',
        vehicleId: v._id,
        vehicleNumber: v.vehicleNumber,
        initials,
      };
    });
}

// ============================================================
// Helper: parse direction from description
// ============================================================

function parseDirection(description?: string): string {
  if (!description) return 'Two Way';
  if (description.startsWith('[Two Way]')) return 'Two Way';
  if (description.startsWith('[Pickup Only]')) return 'Pickup Only';
  if (description.startsWith('[Drop Only]')) return 'Drop Only';
  return 'Two Way';
}

function stripDirectionPrefix(description?: string): string {
  if (!description) return '';
  return description
    .replace(/^\[Two Way\]\s*/, '')
    .replace(/^\[Pickup Only\]\s*/, '')
    .replace(/^\[Drop Only\]\s*/, '');
}

// ============================================================
// Helper: shift badge
// ============================================================

function getShiftBadge(startTime?: string): { label: string; bg: string; text: string } {
  if (!startTime) return { label: 'Morning Shift', bg: 'bg-emerald-100', text: 'text-emerald-700' };
  const hour = parseInt(startTime.split(':')[0] || '7', 10);
  if (hour < 12) return { label: 'Morning Shift', bg: 'bg-emerald-100', text: 'text-emerald-700' };
  return { label: 'Evening Shift', bg: 'bg-orange-100', text: 'text-orange-700' };
}

// ============================================================
// Helper: fuel type color
// ============================================================

function fuelBadge(fuelType: string): { bg: string; text: string } {
  switch (fuelType) {
    case 'Diesel':
      return { bg: 'bg-red-100', text: 'text-red-700' };
    case 'Petrol':
      return { bg: 'bg-green-100', text: 'text-green-700' };
    case 'Electric':
      return { bg: 'bg-blue-100', text: 'text-blue-700' };
    default:
      return { bg: 'bg-slate-100', text: 'text-slate-700' };
  }
}

// ============================================================
// Helper: status dot
// ============================================================

function statusDot(status: VehicleStatus): { dot: string; label: string } {
  switch (status) {
    case VehicleStatus.ACTIVE:
      return { dot: 'bg-emerald-500', label: 'Active' };
    case VehicleStatus.MAINTENANCE:
      return { dot: 'bg-orange-500', label: 'Maintenance' };
    case VehicleStatus.INACTIVE:
      return { dot: 'bg-red-500', label: 'Inactive' };
    default:
      return { dot: 'bg-slate-400', label: status };
  }
}

// ============================================================
// Input class constant
// ============================================================

const inputCls =
  'w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] focus:outline-none transition-all';
const selectCls =
  'w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] focus:outline-none transition-all appearance-none';

// ============================================================
// Component
// ============================================================

export default function SchoolTransportPage() {
  const { showToast } = useToast();

  // Data
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [stats, setStats] = useState<TransportStatistics | null>(null);
  const [studentAssignments, setStudentAssignments] = useState<StudentTransport[]>([]);
  const [allStudents, setAllStudents] = useState<User[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active tab
  const [activeTab, setActiveTab] = useState<TabKey>('vehicles');

  // Expanded route
  const [expandedRouteId, setExpandedRouteId] = useState<string | null>(null);

  // Vehicle form
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [vehicleForm, setVehicleForm] = useState<VehicleFormData>(defaultVehicleForm);
  const [submittingVehicle, setSubmittingVehicle] = useState(false);

  // Driver form
  const [showDriverForm, setShowDriverForm] = useState(false);
  const [driverForm, setDriverForm] = useState<DriverFormData>(defaultDriverForm);
  const [submittingDriver, setSubmittingDriver] = useState(false);

  // Route form
  const [showRouteForm, setShowRouteForm] = useState(false);
  const [editingRoute, setEditingRoute] = useState<TransportRoute | null>(null);
  const [routeForm, setRouteForm] = useState<RouteFormData>(defaultRouteForm);
  const [submittingRoute, setSubmittingRoute] = useState(false);

  // Enroll student form
  const [showEnrollForm, setShowEnrollForm] = useState(false);
  const [enrollForm, setEnrollForm] = useState<EnrollFormData>(defaultEnrollForm);
  const [submittingEnroll, setSubmittingEnroll] = useState(false);

  // Confirm modal
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ open: false, title: '', message: '', onConfirm: () => {} });

  // Student Transport filters
  const [studentClassFilter, setStudentClassFilter] = useState('');
  const [studentPaymentFilter, setStudentPaymentFilter] = useState('');

  // Driver card menu
  const [driverMenuOpen, setDriverMenuOpen] = useState<string | null>(null);

  // Student actions menu
  const [studentMenuOpen, setStudentMenuOpen] = useState<string | null>(null);

  // ============================================================
  // Data loading
  // ============================================================

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [vehiclesData, routesData, statsData] = await Promise.all([
        transportService.getAllVehicles(),
        transportService.getAllRoutes(),
        transportService.getStatistics(),
      ]);
      setVehicles(vehiclesData);
      setRoutes(routesData);
      setStats(statsData);

      // Load student assignments across all routes
      const allAssignments: StudentTransport[] = [];
      for (const route of routesData) {
        try {
          const assignments = await transportService.getStudentsByRoute(route._id);
          allAssignments.push(...assignments);
        } catch {
          // Route may have no assignments, skip
        }
      }
      setStudentAssignments(allAssignments);

      // Load students and classes for the enroll modal
      try {
        const [studentsData, classesData] = await Promise.all([
          userService.getStudents(),
          classService.getClasses(),
        ]);
        setAllStudents(studentsData);
        setClasses(classesData);
      } catch {
        // Non-critical
      }
    } catch (err) {
      setError('Failed to load transport data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // Derived data
  // ============================================================

  const drivers = useMemo(() => extractDrivers(vehicles), [vehicles]);

  const activeDriversCount = useMemo(
    () => vehicles.filter((v) => v.driverName && v.status === VehicleStatus.ACTIVE).length,
    [vehicles]
  );

  // ============================================================
  // Vehicle handlers
  // ============================================================

  function handleAddVehicle() {
    setEditingVehicle(null);
    setVehicleForm(defaultVehicleForm);
    setShowVehicleForm(true);
  }

  function handleEditVehicle(vehicle: Vehicle) {
    setEditingVehicle(vehicle);
    setVehicleForm({
      vehicleNumber: vehicle.vehicleNumber,
      type: vehicle.type,
      model: vehicle.vehicleModel || vehicle.model || '',
      capacity: vehicle.capacity.toString(),
      fuelType: (vehicle.make as 'Diesel' | 'Petrol' | 'Electric') || 'Diesel',
      status: vehicle.status,
    });
    setShowVehicleForm(true);
  }

  async function handleVehicleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!vehicleForm.vehicleNumber.trim() || !vehicleForm.capacity) return;

    try {
      setSubmittingVehicle(true);
      const data: Partial<Vehicle> = {
        vehicleNumber: vehicleForm.vehicleNumber,
        type: vehicleForm.type,
        make: vehicleForm.fuelType,
        vehicleModel: vehicleForm.model || undefined,
        capacity: parseInt(vehicleForm.capacity),
        status: vehicleForm.status,
      };

      if (editingVehicle) {
        await transportService.updateVehicle(editingVehicle._id, data);
        showToast('success', 'Vehicle updated successfully');
      } else {
        await transportService.createVehicle(data);
        showToast('success', 'Vehicle created successfully');
      }

      await loadData();
      setShowVehicleForm(false);
      setVehicleForm(defaultVehicleForm);
      setEditingVehicle(null);
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to save vehicle');
    } finally {
      setSubmittingVehicle(false);
    }
  }

  function handleDeleteVehicle(id: string) {
    setConfirmModal({
      open: true,
      title: 'Delete Vehicle',
      message: 'Are you sure you want to delete this vehicle? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await transportService.deleteVehicle(id);
          showToast('success', 'Vehicle deleted successfully');
          await loadData();
        } catch {
          showToast('error', 'Failed to delete vehicle');
        }
        setConfirmModal((prev) => ({ ...prev, open: false }));
      },
    });
  }

  // ============================================================
  // Driver handlers
  // ============================================================

  function handleAddDriver() {
    setDriverForm(defaultDriverForm);
    setShowDriverForm(true);
  }

  async function handleDriverSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!driverForm.driverName.trim() || !driverForm.vehicleId) return;

    try {
      setSubmittingDriver(true);
      await transportService.updateVehicle(driverForm.vehicleId, {
        driverName: driverForm.driverName,
        driverPhone: driverForm.driverPhone || undefined,
        driverLicense: driverForm.driverLicense || undefined,
      });
      showToast('success', 'Driver assigned successfully');
      await loadData();
      setShowDriverForm(false);
      setDriverForm(defaultDriverForm);
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to save driver');
    } finally {
      setSubmittingDriver(false);
    }
  }

  // ============================================================
  // Route handlers
  // ============================================================

  function handleAddRoute() {
    setEditingRoute(null);
    setRouteForm(defaultRouteForm);
    setShowRouteForm(true);
  }

  function handleEditRoute(route: TransportRoute) {
    setEditingRoute(route);
    const dir = parseDirection(route.description);
    const cleanDesc = stripDirectionPrefix(route.description);
    setRouteForm({
      name: route.name,
      startPoint: route.stops.length > 0 ? route.stops[0]!.name : '',
      endPoint: route.stops.length > 1 ? route.stops[route.stops.length - 1]!.name : 'School Campus',
      monthlyFee: route.monthlyFee?.toString() || '',
      frequency: 'Monthly',
      direction: dir as 'Two Way' | 'Pickup Only' | 'Drop Only',
      startTime: route.startTime || '07:00',
      endTime: route.endTime || '08:30',
      status: route.status,
      stops:
        route.stops.length > 0
          ? route.stops.map((s) => ({ name: s.name, time: s.pickupTime || '' }))
          : [{ name: '', time: '' }],
    });
    setShowRouteForm(true);
  }

  async function handleRouteSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!routeForm.name.trim()) return;

    try {
      setSubmittingRoute(true);
      const allStops: RouteStop[] = routeForm.stops
        .filter((s) => s.name.trim())
        .map((s, i) => ({
          name: s.name,
          pickupTime: s.time || undefined,
          order: i + 1,
        }));

      const description = `[${routeForm.direction}] ${routeForm.startPoint} to ${routeForm.endPoint}`;

      const data: any = {
        name: routeForm.name,
        description,
        startTime: routeForm.startTime || undefined,
        endTime: routeForm.endTime || undefined,
        monthlyFee: routeForm.monthlyFee ? parseFloat(routeForm.monthlyFee) : undefined,
        status: routeForm.status,
        stops: allStops,
      };

      if (editingRoute) {
        await transportService.updateRoute(editingRoute._id, data);
        showToast('success', 'Route updated successfully');
      } else {
        await transportService.createRoute(data);
        showToast('success', 'Route created successfully');
      }

      await loadData();
      setShowRouteForm(false);
      setRouteForm(defaultRouteForm);
      setEditingRoute(null);
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to save route');
    } finally {
      setSubmittingRoute(false);
    }
  }

  function handleDeleteRoute(id: string) {
    setConfirmModal({
      open: true,
      title: 'Delete Route',
      message: 'Are you sure you want to delete this route? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await transportService.deleteRoute(id);
          showToast('success', 'Route deleted successfully');
          await loadData();
        } catch {
          showToast('error', 'Failed to delete route');
        }
        setConfirmModal((prev) => ({ ...prev, open: false }));
      },
    });
  }

  function addRouteStop() {
    setRouteForm((prev) => ({
      ...prev,
      stops: [...prev.stops, { name: '', time: '' }],
    }));
  }

  function removeRouteStop(index: number) {
    setRouteForm((prev) => ({
      ...prev,
      stops: prev.stops.filter((_, i) => i !== index),
    }));
  }

  function updateRouteStop(index: number, field: 'name' | 'time', value: string) {
    setRouteForm((prev) => ({
      ...prev,
      stops: prev.stops.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    }));
  }

  // ============================================================
  // Enroll student handlers
  // ============================================================

  function handleEnrollStudent() {
    setEnrollForm(defaultEnrollForm);
    setShowEnrollForm(true);
  }

  const filteredStudentsForSearch = useMemo(() => {
    if (!enrollForm.studentSearch.trim()) return [];
    const q = enrollForm.studentSearch.toLowerCase();
    return allStudents
      .filter(
        (s) =>
          `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
          (s.studentId && s.studentId.toLowerCase().includes(q))
      )
      .slice(0, 8);
  }, [enrollForm.studentSearch, allStudents]);

  const selectedRouteForEnroll = useMemo(
    () => routes.find((r) => r._id === enrollForm.routeId),
    [enrollForm.routeId, routes]
  );

  async function handleEnrollSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!enrollForm.studentId || !enrollForm.routeId) return;

    try {
      setSubmittingEnroll(true);
      const route = routes.find((r) => r._id === enrollForm.routeId);
      const firstStop = route?.stops[0]?.name || '';
      const lastStop = route?.stops[route.stops.length - 1]?.name || 'School Campus';

      await transportService.assignStudent({
        studentId: { _id: enrollForm.studentId } as any,
        routeId: { _id: enrollForm.routeId } as any,
        pickupStop: firstStop,
        dropStop: lastStop,
      });

      showToast('success', 'Student enrolled in transport successfully');
      await loadData();
      setShowEnrollForm(false);
      setEnrollForm(defaultEnrollForm);
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to enroll student');
    } finally {
      setSubmittingEnroll(false);
    }
  }

  function handleRemoveAssignment(id: string) {
    setConfirmModal({
      open: true,
      title: 'Remove Student',
      message: 'Are you sure you want to remove this student from transport? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await transportService.removeAssignment(id);
          showToast('success', 'Student removed from transport');
          await loadData();
        } catch {
          showToast('error', 'Failed to remove student');
        }
        setConfirmModal((prev) => ({ ...prev, open: false }));
      },
    });
  }

  // ============================================================
  // Filtered student assignments
  // ============================================================

  const filteredAssignments = useMemo(() => {
    let result = studentAssignments;
    // Class filter would require matching student classId but studentTransport doesn't carry classId directly
    // Payment filter is display-only (no backend field), so we skip actual filtering
    return result;
  }, [studentAssignments, studentClassFilter, studentPaymentFilter]);

  // ============================================================
  // Loading state
  // ============================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#824ef2] animate-spin" />
      </div>
    );
  }

  // ============================================================
  // Tab definitions
  // ============================================================

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'vehicles', label: 'Vehicles' },
    { key: 'drivers', label: 'Drivers' },
    { key: 'routes', label: 'Routes & Fares' },
    { key: 'students', label: 'Student Transport' },
  ];

  // ============================================================
  // Render
  // ============================================================

  return (
    <section className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-slate-100">
            <Bus className="w-6 h-6 text-slate-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Transport Management</h1>
            <p className="text-sm text-slate-600 mt-1">Manage vehicles, routes, and student transportation</p>
          </div>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-800">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SchoolStatCard
          icon={<Bus className="w-5 h-5" />}
          color="blue"
          label="Total Vehicles"
          value={stats?.totalVehicles ?? vehicles.length}
        />
        <SchoolStatCard
          icon={<UserCheck className="w-5 h-5" />}
          color="green"
          label="Active Drivers"
          value={activeDriversCount}
        />
        <SchoolStatCard
          icon={<Route className="w-5 h-5" />}
          color="orange"
          label="Total Routes"
          value={stats?.totalRoutes ?? routes.length}
        />
        <SchoolStatCard
          icon={<Users className="w-5 h-5" />}
          color="purple"
          label="Students Using Transport"
          value={stats?.totalStudentsAssigned ?? studentAssignments.length}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? 'border-[#824ef2] text-[#824ef2]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ============================================================ */}
      {/* TAB: Vehicles */}
      {/* ============================================================ */}
      {activeTab === 'vehicles' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {/* Header row */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Vehicle Fleet</h2>
            <button
              onClick={handleAddVehicle}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#824ef2] hover:bg-[#6b3fd4] rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Vehicle
            </button>
          </div>

          {vehicles.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <div className="flex justify-center mb-3">
                <Bus className="w-12 h-12 text-slate-300" />
              </div>
              <p className="font-medium">No vehicles added yet</p>
              <p className="text-sm mt-1">Add your first vehicle to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-left">
                    <th className="py-3 px-6 font-medium text-xs uppercase tracking-wider text-slate-500">Vehicle Name</th>
                    <th className="py-3 px-6 font-medium text-xs uppercase tracking-wider text-slate-500">Reg Number</th>
                    <th className="py-3 px-6 font-medium text-xs uppercase tracking-wider text-slate-500">Model</th>
                    <th className="py-3 px-6 font-medium text-xs uppercase tracking-wider text-slate-500">Capacity</th>
                    <th className="py-3 px-6 font-medium text-xs uppercase tracking-wider text-slate-500">Fuel Type</th>
                    <th className="py-3 px-6 font-medium text-xs uppercase tracking-wider text-slate-500">Status</th>
                    <th className="py-3 px-6 font-medium text-xs uppercase tracking-wider text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vehicles.map((vehicle) => {
                    const fuel = vehicle.make || 'Diesel';
                    const fuelColors = fuelBadge(fuel);
                    const st = statusDot(vehicle.status);
                    return (
                      <tr key={vehicle._id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-6">
                          <span className="font-medium text-slate-900">{vehicle.vehicleNumber}</span>
                        </td>
                        <td className="py-3.5 px-6 text-slate-600">{vehicle.vehicleNumber}</td>
                        <td className="py-3.5 px-6 text-slate-600">{vehicle.vehicleModel || vehicle.model || '-'}</td>
                        <td className="py-3.5 px-6 text-slate-600">{vehicle.capacity} Seats</td>
                        <td className="py-3.5 px-6">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${fuelColors.bg} ${fuelColors.text}`}>
                            {fuel}
                          </span>
                        </td>
                        <td className="py-3.5 px-6">
                          <span className="inline-flex items-center gap-1.5 text-sm">
                            <span className={`w-2 h-2 rounded-full ${st.dot}`} />
                            <span className="text-slate-700">{st.label}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditVehicle(vehicle)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-[#824ef2] hover:bg-purple-50 transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteVehicle(vehicle._id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB: Drivers */}
      {/* ============================================================ */}
      {activeTab === 'drivers' && (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Driver Management</h2>
              <p className="text-sm text-slate-500 mt-0.5">Manage driver profiles and assignments</p>
            </div>
            <button
              onClick={handleAddDriver}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#824ef2] hover:bg-[#6b3fd4] rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Driver
            </button>
          </div>

          {drivers.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
              <div className="flex justify-center mb-3">
                <UserCheck className="w-12 h-12 text-slate-300" />
              </div>
              <p className="font-medium">No drivers assigned yet</p>
              <p className="text-sm mt-1">Assign a driver to a vehicle to see them here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {drivers.map((driver) => (
                <div
                  key={driver.vehicleId}
                  className="bg-white rounded-xl border border-slate-200 p-5 relative"
                >
                  {/* Top row: avatar + name + menu */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-[#824ef2] flex items-center justify-center text-white text-sm font-bold">
                        {driver.initials}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{driver.name}</h3>
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {driver.phone || 'No phone'}
                        </p>
                      </div>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => setDriverMenuOpen(driverMenuOpen === driver.vehicleId ? null : driver.vehicleId)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {driverMenuOpen === driver.vehicleId && (
                        <div className="absolute right-0 top-8 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-10 min-w-[140px]">
                          <button
                            onClick={() => {
                              setDriverMenuOpen(null);
                              // Edit: open driver form pre-filled
                              setDriverForm({
                                driverName: driver.name,
                                driverPhone: driver.phone,
                                driverLicense: driver.license,
                                vehicleId: driver.vehicleId,
                              });
                              setShowDriverForm(true);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            Edit Driver
                          </button>
                          <button
                            onClick={() => {
                              setDriverMenuOpen(null);
                              // Remove driver from vehicle
                              setConfirmModal({
                                open: true,
                                title: 'Remove Driver',
                                message: `Remove ${driver.name} from ${driver.vehicleNumber}?`,
                                onConfirm: async () => {
                                  try {
                                    await transportService.updateVehicle(driver.vehicleId, {
                                      driverName: '',
                                      driverPhone: '',
                                      driverLicense: '',
                                    });
                                    showToast('success', 'Driver removed');
                                    await loadData();
                                  } catch {
                                    showToast('error', 'Failed to remove driver');
                                  }
                                  setConfirmModal((prev) => ({ ...prev, open: false }));
                                },
                              });
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            Remove Driver
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info rows */}
                  <div className="space-y-2.5 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">License No:</span>
                      <span className="font-medium text-slate-900">{driver.license || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Assigned Bus:</span>
                      <span className="font-medium text-slate-900">{driver.vehicleNumber}</span>
                    </div>
                  </div>

                  {/* View Profile button */}
                  <button className="w-full py-2 text-sm font-medium text-[#824ef2] border border-[#824ef2] rounded-lg hover:bg-purple-50 transition-colors">
                    View Profile
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB: Routes & Fares */}
      {/* ============================================================ */}
      {activeTab === 'routes' && (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Route Planner</h2>
              <p className="text-sm text-slate-500 mt-0.5">Configure transport routes and stops</p>
            </div>
            <button
              onClick={handleAddRoute}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#824ef2] hover:bg-[#6b3fd4] rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create New Route
            </button>
          </div>

          {routes.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
              <div className="flex justify-center mb-3">
                <Route className="w-12 h-12 text-slate-300" />
              </div>
              <p className="font-medium">No routes configured yet</p>
              <p className="text-sm mt-1">Create your first route to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {routes.map((route) => {
                const shift = getShiftBadge(route.startTime);
                const direction = parseDirection(route.description);
                const cleanDesc = stripDirectionPrefix(route.description);
                const firstStop = route.stops.length > 0 ? route.stops[0]!.name : 'Start';
                const lastStop = route.stops.length > 1 ? route.stops[route.stops.length - 1]!.name : 'School Campus';
                const isExpanded = expandedRouteId === route._id;

                return (
                  <div
                    key={route._id}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden"
                  >
                    {/* Route header row */}
                    <div className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-slate-900">{route.name}</h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${shift.bg} ${shift.text}`}>
                              {shift.label}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500 mt-1">
                            {firstStop} &rarr; {lastStop}
                          </p>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="text-sm font-medium text-slate-500">FARE</div>
                            <div className="text-lg font-bold text-slate-900">
                              ${route.monthlyFee || 0}/month
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-slate-500">STOPS</div>
                            <div className="text-lg font-bold text-slate-900">{route.stops.length}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditRoute(route)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-[#824ef2] hover:bg-purple-50 transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteRoute(route._id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setExpandedRouteId(isExpanded ? null : route._id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded: timeline visualization */}
                    {isExpanded && route.stops.length > 0 && (
                      <div className="px-6 py-5 bg-slate-50 border-t border-slate-200">
                        <div className="relative flex items-start justify-between">
                          {/* Connecting line */}
                          <div className="absolute top-3 left-4 right-4 h-0.5 bg-slate-300" />

                          {route.stops.map((stop, idx) => {
                            const isFirst = idx === 0;
                            const isLast = idx === route.stops.length - 1;
                            return (
                              <div
                                key={idx}
                                className="relative flex flex-col items-center text-center z-10"
                                style={{ flex: 1 }}
                              >
                                <div
                                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                    isFirst || isLast
                                      ? 'bg-[#824ef2] border-[#824ef2]'
                                      : 'bg-white border-slate-300'
                                  }`}
                                >
                                  {(isFirst || isLast) && (
                                    <div className="w-2 h-2 rounded-full bg-white" />
                                  )}
                                </div>
                                <p className={`text-xs mt-2 font-medium ${isFirst || isLast ? 'text-[#824ef2]' : 'text-slate-600'}`}>
                                  {isLast ? 'School' : stop.name}
                                </p>
                                {stop.pickupTime && (
                                  <p className="text-[11px] text-slate-400 mt-0.5">{stop.pickupTime}</p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB: Student Transport */}
      {/* ============================================================ */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-wrap gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Student Transport Management</h2>
            <div className="flex items-center gap-3 flex-wrap">
              <select
                value={studentClassFilter}
                onChange={(e) => setStudentClassFilter(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] focus:outline-none"
              >
                <option value="">All Classes</option>
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
              <select
                value={studentPaymentFilter}
                onChange={(e) => setStudentPaymentFilter(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] focus:outline-none"
              >
                <option value="">Payment Status: All</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>
              <button
                onClick={handleEnrollStudent}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#824ef2] hover:bg-[#6b3fd4] rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Enroll Student
              </button>
            </div>
          </div>

          {filteredAssignments.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <div className="flex justify-center mb-3">
                <Users className="w-12 h-12 text-slate-300" />
              </div>
              <p className="font-medium">No students enrolled in transport</p>
              <p className="text-sm mt-1">Enroll students to manage their transportation.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-left">
                    <th className="py-3 px-6 font-medium text-xs uppercase tracking-wider text-slate-500">Student Info</th>
                    <th className="py-3 px-6 font-medium text-xs uppercase tracking-wider text-slate-500">Class & Section</th>
                    <th className="py-3 px-6 font-medium text-xs uppercase tracking-wider text-slate-500">Parent Contact</th>
                    <th className="py-3 px-6 font-medium text-xs uppercase tracking-wider text-slate-500">Route Info</th>
                    <th className="py-3 px-6 font-medium text-xs uppercase tracking-wider text-slate-500">Payment Status</th>
                    <th className="py-3 px-6 font-medium text-xs uppercase tracking-wider text-slate-500">Fare</th>
                    <th className="py-3 px-6 font-medium text-xs uppercase tracking-wider text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAssignments.map((assignment) => {
                    const student = assignment.studentId;
                    const routeInfo = assignment.routeId;
                    const dir = parseDirection(routeInfo?.description);
                    const fullName = `${student?.firstName || ''} ${student?.lastName || ''}`.trim();
                    const initials = fullName
                      ? fullName.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2)
                      : 'ST';
                    // Payment status: since backend doesn't track it, use a pseudo status
                    const paymentStatus = assignment.startDate ? 'paid' : 'pending';
                    const fee = routeInfo?.monthlyFee || 0;

                    return (
                      <tr key={assignment._id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#824ef2]/10 flex items-center justify-center text-[#824ef2] text-xs font-bold">
                              {initials}
                            </div>
                            <div>
                              <div className="font-medium text-slate-900">{fullName || 'Unknown'}</div>
                              <div className="text-xs text-slate-500">{student?.studentId || '-'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-6 text-slate-600">-</td>
                        <td className="py-3.5 px-6">
                          <div className="text-slate-900">{assignment.emergencyContact || '-'}</div>
                          {assignment.emergencyPhone && (
                            <div className="text-xs text-slate-500">{assignment.emergencyPhone}</div>
                          )}
                        </td>
                        <td className="py-3.5 px-6">
                          <div className="font-medium text-slate-900">{routeInfo?.name || '-'}</div>
                          <div className="text-xs text-slate-500">{dir}</div>
                        </td>
                        <td className="py-3.5 px-6">
                          <SchoolStatusBadge value={paymentStatus} />
                        </td>
                        <td className="py-3.5 px-6 font-medium text-slate-900">${fee.toFixed(2)}</td>
                        <td className="py-3.5 px-6">
                          <div className="relative">
                            <button
                              onClick={() => setStudentMenuOpen(studentMenuOpen === assignment._id ? null : assignment._id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            {studentMenuOpen === assignment._id && (
                              <div className="absolute right-0 top-8 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-10 min-w-[140px]">
                                <button
                                  onClick={() => {
                                    setStudentMenuOpen(null);
                                    handleRemoveAssignment(assignment._id);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                  Remove
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* Modal: Add / Edit Vehicle */}
      {/* ============================================================ */}
      <FormModal
        open={showVehicleForm}
        onClose={() => setShowVehicleForm(false)}
        title={editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
        size="lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowVehicleForm(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="vehicle-form"
              disabled={submittingVehicle}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-[#824ef2] hover:bg-[#6b3fd4] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submittingVehicle ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                'Save Vehicle'
              )}
            </button>
          </>
        }
      >
        <form id="vehicle-form" onSubmit={handleVehicleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Vehicle Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={inputCls}
                value={vehicleForm.vehicleNumber}
                onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleNumber: e.target.value })}
                placeholder="e.g., School Bus Alpha"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Reg. Number</label>
              <input
                type="text"
                className={inputCls}
                value={vehicleForm.vehicleNumber}
                onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleNumber: e.target.value })}
                placeholder="e.g., KA-01-AB-1234"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Model</label>
              <input
                type="text"
                className={inputCls}
                value={vehicleForm.model}
                onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })}
                placeholder="e.g., Toyota Coaster"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Seating Capacity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                className={inputCls}
                value={vehicleForm.capacity}
                onChange={(e) => setVehicleForm({ ...vehicleForm, capacity: e.target.value })}
                placeholder="40"
                required
              />
            </div>
          </div>

          {/* Fuel Type cards */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Fuel Type</label>
            <div className="grid grid-cols-3 gap-3">
              {(['Diesel', 'Petrol', 'Electric'] as const).map((ft) => {
                const selected = vehicleForm.fuelType === ft;
                return (
                  <button
                    key={ft}
                    type="button"
                    onClick={() => setVehicleForm({ ...vehicleForm, fuelType: ft })}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      selected
                        ? 'border-[#824ef2] bg-purple-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    {ft === 'Diesel' && <Fuel className={`w-5 h-5 ${selected ? 'text-[#824ef2]' : 'text-slate-400'}`} />}
                    {ft === 'Petrol' && <Fuel className={`w-5 h-5 ${selected ? 'text-[#824ef2]' : 'text-slate-400'}`} />}
                    {ft === 'Electric' && <Zap className={`w-5 h-5 ${selected ? 'text-[#824ef2]' : 'text-slate-400'}`} />}
                    <span className={`text-sm font-medium ${selected ? 'text-[#824ef2]' : 'text-slate-600'}`}>{ft}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select
              className={selectCls}
              value={vehicleForm.status}
              onChange={(e) => setVehicleForm({ ...vehicleForm, status: e.target.value as VehicleStatus })}
            >
              {Object.values(VehicleStatus).map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0) + status.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
        </form>
      </FormModal>

      {/* ============================================================ */}
      {/* Modal: Add Driver */}
      {/* ============================================================ */}
      <FormModal
        open={showDriverForm}
        onClose={() => setShowDriverForm(false)}
        title="Add New Driver"
        size="md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowDriverForm(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="driver-form"
              disabled={submittingDriver}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-[#824ef2] hover:bg-[#6b3fd4] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submittingDriver ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                'Save Driver'
              )}
            </button>
          </>
        }
      >
        <form id="driver-form" onSubmit={handleDriverSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Driver Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={inputCls}
              value={driverForm.driverName}
              onChange={(e) => setDriverForm({ ...driverForm, driverName: e.target.value })}
              placeholder="Full name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">License Number</label>
            <input
              type="text"
              className={inputCls}
              value={driverForm.driverLicense}
              onChange={(e) => setDriverForm({ ...driverForm, driverLicense: e.target.value })}
              placeholder="e.g., DL-12345678"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
            <input
              type="tel"
              className={inputCls}
              value={driverForm.driverPhone}
              onChange={(e) => setDriverForm({ ...driverForm, driverPhone: e.target.value })}
              placeholder="Phone number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Assigned Bus <span className="text-red-500">*</span>
            </label>
            <select
              className={selectCls}
              value={driverForm.vehicleId}
              onChange={(e) => setDriverForm({ ...driverForm, vehicleId: e.target.value })}
              required
            >
              <option value="">Select a vehicle</option>
              {vehicles.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.vehicleNumber} {(v.vehicleModel || v.model) ? `(${v.vehicleModel || v.model})` : ''}
                </option>
              ))}
            </select>
          </div>
        </form>
      </FormModal>

      {/* ============================================================ */}
      {/* Modal: Create / Edit Route */}
      {/* ============================================================ */}
      <FormModal
        open={showRouteForm}
        onClose={() => setShowRouteForm(false)}
        title={editingRoute ? 'Edit Route' : 'Create New Route'}
        size="xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowRouteForm(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="route-form"
              disabled={submittingRoute}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-[#824ef2] hover:bg-[#6b3fd4] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submittingRoute ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : editingRoute ? (
                'Save Route'
              ) : (
                'Create Route'
              )}
            </button>
          </>
        }
      >
        <form id="route-form" onSubmit={handleRouteSubmit} className="space-y-5">
          {/* Route name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Route Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={inputCls}
              value={routeForm.name}
              onChange={(e) => setRouteForm({ ...routeForm, name: e.target.value })}
              placeholder="e.g., North City Route"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Start Point</label>
              <input
                type="text"
                className={inputCls}
                value={routeForm.startPoint}
                onChange={(e) => setRouteForm({ ...routeForm, startPoint: e.target.value })}
                placeholder="e.g., Green Valley"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">End Point</label>
              <input
                type="text"
                className={inputCls}
                value={routeForm.endPoint}
                onChange={(e) => setRouteForm({ ...routeForm, endPoint: e.target.value })}
                placeholder="e.g., School Campus"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fare Amount ($)</label>
              <input
                type="number"
                className={inputCls}
                value={routeForm.monthlyFee}
                onChange={(e) => setRouteForm({ ...routeForm, monthlyFee: e.target.value })}
                placeholder="150"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Frequency</label>
              <select
                className={selectCls}
                value={routeForm.frequency}
                onChange={(e) => setRouteForm({ ...routeForm, frequency: e.target.value })}
              >
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
              <input
                type="time"
                className={inputCls}
                value={routeForm.startTime}
                onChange={(e) => setRouteForm({ ...routeForm, startTime: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
              <input
                type="time"
                className={inputCls}
                value={routeForm.endTime}
                onChange={(e) => setRouteForm({ ...routeForm, endTime: e.target.value })}
              />
            </div>
          </div>

          {/* Direction */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Direction</label>
            <div className="flex gap-3">
              {(['Two Way', 'Pickup Only', 'Drop Only'] as const).map((dir) => {
                const selected = routeForm.direction === dir;
                return (
                  <button
                    key={dir}
                    type="button"
                    onClick={() => setRouteForm({ ...routeForm, direction: dir })}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium border-2 transition-all ${
                      selected
                        ? 'border-[#824ef2] bg-purple-50 text-[#824ef2]'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {dir}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stops Configuration */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Stops Configuration</label>
            <div className="space-y-3">
              {routeForm.stops.map((stop, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#824ef2] text-white text-xs font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    className={`flex-1 ${inputCls}`}
                    value={stop.name}
                    onChange={(e) => updateRouteStop(index, 'name', e.target.value)}
                    placeholder="Stop name"
                  />
                  <input
                    type="time"
                    className={`w-36 ${inputCls}`}
                    value={stop.time}
                    onChange={(e) => updateRouteStop(index, 'time', e.target.value)}
                  />
                  {routeForm.stops.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRouteStop(index)}
                      className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addRouteStop}
              className="mt-3 text-sm font-medium text-[#824ef2] hover:text-[#6b3fd4] transition-colors flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add another stop
            </button>
          </div>
        </form>
      </FormModal>

      {/* ============================================================ */}
      {/* Modal: Enroll Student to Transport */}
      {/* ============================================================ */}
      <FormModal
        open={showEnrollForm}
        onClose={() => setShowEnrollForm(false)}
        title="Enroll Student to Transport"
        size="lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowEnrollForm(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="enroll-form"
              disabled={submittingEnroll}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-[#824ef2] hover:bg-[#6b3fd4] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submittingEnroll ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Enrolling...
                </>
              ) : (
                'Enroll Student'
              )}
            </button>
          </>
        }
      >
        <form id="enroll-form" onSubmit={handleEnrollSubmit} className="space-y-5">
          {/* Student Name search */}
          <div className="relative">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Student Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                className={`${inputCls} pl-10`}
                value={enrollForm.studentSearch}
                onChange={(e) => {
                  setEnrollForm({ ...enrollForm, studentSearch: e.target.value, studentId: '' });
                }}
                placeholder="Search student by name or ID..."
              />
            </div>
            {enrollForm.studentSearch && !enrollForm.studentId && filteredStudentsForSearch.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
                {filteredStudentsForSearch.map((s) => (
                  <button
                    key={s._id || s.id}
                    type="button"
                    onClick={() =>
                      setEnrollForm({
                        ...enrollForm,
                        studentId: s._id || s.id,
                        studentSearch: `${s.firstName} ${s.lastName}`,
                      })
                    }
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 border-b border-slate-100 last:border-0"
                  >
                    <span className="font-medium text-slate-900">
                      {s.firstName} {s.lastName}
                    </span>
                    {s.studentId && <span className="ml-2 text-slate-400">({s.studentId})</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Class & Section */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
              <select
                className={selectCls}
                value={enrollForm.classId}
                onChange={(e) => setEnrollForm({ ...enrollForm, classId: e.target.value, section: '' })}
              >
                <option value="">Select class</option>
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Section</label>
              <select
                className={selectCls}
                value={enrollForm.section}
                onChange={(e) => setEnrollForm({ ...enrollForm, section: e.target.value })}
              >
                <option value="">Select section</option>
                {classes
                  .find((c) => c._id === enrollForm.classId)
                  ?.sections.map((sec) => (
                    <option key={sec} value={sec}>{sec}</option>
                  ))}
              </select>
            </div>
          </div>

          {/* Route */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Select Route <span className="text-red-500">*</span>
            </label>
            <select
              className={selectCls}
              value={enrollForm.routeId}
              onChange={(e) => setEnrollForm({ ...enrollForm, routeId: e.target.value })}
              required
            >
              <option value="">Select a route</option>
              {routes.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name} {r.description ? `- ${stripDirectionPrefix(r.description)}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Service Type */}
          {selectedRouteForEnroll && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Service Type</label>
              <div className="grid grid-cols-2 gap-3">
                {(['Two Way', 'One Way'] as const).map((st) => {
                  const selected = enrollForm.serviceType === st;
                  const fee = selectedRouteForEnroll.monthlyFee || 0;
                  const price = st === 'Two Way' ? fee : Math.round(fee * 0.67);
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setEnrollForm({ ...enrollForm, serviceType: st })}
                      className={`py-3 px-4 rounded-lg border-2 text-left transition-all ${
                        selected
                          ? 'border-[#824ef2] bg-purple-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className={`text-sm font-medium ${selected ? 'text-[#824ef2]' : 'text-slate-700'}`}>{st}</div>
                      <div className={`text-lg font-bold mt-0.5 ${selected ? 'text-[#824ef2]' : 'text-slate-900'}`}>
                        ${price}/month
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </form>
      </FormModal>

      {/* ============================================================ */}
      {/* Confirm Modal */}
      {/* ============================================================ */}
      <ConfirmModal
        open={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel="Delete"
        confirmColor="red"
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, open: false }))}
      />
    </section>
  );
}
