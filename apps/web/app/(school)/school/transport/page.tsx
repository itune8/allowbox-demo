'use client';

import { useState, useEffect } from 'react';
import { Button } from '@repo/ui/button';
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
  Shield,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { SlideSheet, SheetSection, SheetField, SheetDetailRow } from '@/components/ui';
import {
  transportService,
  Vehicle,
  TransportRoute,
  TransportStatistics,
  VehicleType,
  VehicleStatus,
  RouteStatus,
  RouteStop,
} from '../../../../lib/services/transport.service';

interface VehicleFormData {
  vehicleNumber: string;
  type: VehicleType;
  make: string;
  model: string;
  year: string;
  capacity: string;
  driverName: string;
  driverPhone: string;
  driverLicense: string;
  assistantName: string;
  assistantPhone: string;
  insuranceNumber: string;
  insuranceExpiry: string;
  status: VehicleStatus;
}

interface RouteFormData {
  name: string;
  description: string;
  vehicleId: string;
  startTime: string;
  endTime: string;
  monthlyFee: string;
  status: RouteStatus;
  stops: RouteStop[];
}

const defaultVehicleForm: VehicleFormData = {
  vehicleNumber: '',
  type: VehicleType.BUS,
  make: '',
  model: '',
  year: '',
  capacity: '40',
  driverName: '',
  driverPhone: '',
  driverLicense: '',
  assistantName: '',
  assistantPhone: '',
  insuranceNumber: '',
  insuranceExpiry: '',
  status: VehicleStatus.ACTIVE,
};

const defaultRouteForm: RouteFormData = {
  name: '',
  description: '',
  vehicleId: '',
  startTime: '07:00',
  endTime: '08:30',
  monthlyFee: '',
  status: RouteStatus.ACTIVE,
  stops: [{ name: '', address: '', pickupTime: '', order: 1 }],
};

export default function SchoolTransportPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [stats, setStats] = useState<TransportStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'vehicles' | 'routes'>('routes');

  // Vehicle form state
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [vehicleForm, setVehicleForm] = useState<VehicleFormData>(defaultVehicleForm);
  const [submittingVehicle, setSubmittingVehicle] = useState(false);

  // Route form state
  const [showRouteForm, setShowRouteForm] = useState(false);
  const [editingRoute, setEditingRoute] = useState<TransportRoute | null>(null);
  const [routeForm, setRouteForm] = useState<RouteFormData>(defaultRouteForm);
  const [submittingRoute, setSubmittingRoute] = useState(false);

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
    } catch (err) {
      setError('Failed to load transport data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Vehicle handlers
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
      make: vehicle.make || '',
      model: vehicle.model || '',
      year: vehicle.year?.toString() || '',
      capacity: vehicle.capacity.toString(),
      driverName: vehicle.driverName || '',
      driverPhone: vehicle.driverPhone || '',
      driverLicense: vehicle.driverLicense || '',
      assistantName: vehicle.assistantName || '',
      assistantPhone: vehicle.assistantPhone || '',
      insuranceNumber: vehicle.insuranceNumber || '',
      insuranceExpiry: (vehicle.insuranceExpiry?.split('T')[0] ?? '') || '',
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
        make: vehicleForm.make || undefined,
        model: vehicleForm.model || undefined,
        year: vehicleForm.year ? parseInt(vehicleForm.year) : undefined,
        capacity: parseInt(vehicleForm.capacity),
        driverName: vehicleForm.driverName || undefined,
        driverPhone: vehicleForm.driverPhone || undefined,
        driverLicense: vehicleForm.driverLicense || undefined,
        assistantName: vehicleForm.assistantName || undefined,
        assistantPhone: vehicleForm.assistantPhone || undefined,
        insuranceNumber: vehicleForm.insuranceNumber || undefined,
        insuranceExpiry: vehicleForm.insuranceExpiry || undefined,
        status: vehicleForm.status,
      };

      if (editingVehicle) {
        await transportService.updateVehicle(editingVehicle._id, data);
      } else {
        await transportService.createVehicle(data);
      }

      await loadData();
      setShowVehicleForm(false);
      setVehicleForm(defaultVehicleForm);
      setEditingVehicle(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save vehicle');
    } finally {
      setSubmittingVehicle(false);
    }
  }

  async function handleDeleteVehicle(id: string) {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;
    try {
      await transportService.deleteVehicle(id);
      await loadData();
    } catch (err) {
      setError('Failed to delete vehicle');
    }
  }

  // Route handlers
  function handleAddRoute() {
    setEditingRoute(null);
    setRouteForm(defaultRouteForm);
    setShowRouteForm(true);
  }

  function handleEditRoute(route: TransportRoute) {
    setEditingRoute(route);
    setRouteForm({
      name: route.name,
      description: route.description || '',
      vehicleId: route.vehicleId?._id || '',
      startTime: route.startTime || '07:00',
      endTime: route.endTime || '08:30',
      monthlyFee: route.monthlyFee?.toString() || '',
      status: route.status,
      stops: route.stops.length > 0 ? route.stops : [{ name: '', address: '', pickupTime: '', order: 1 }],
    });
    setShowRouteForm(true);
  }

  async function handleRouteSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!routeForm.name.trim()) return;

    try {
      setSubmittingRoute(true);
      const validStops = routeForm.stops.filter(s => s.name.trim());
      const data: Partial<TransportRoute> = {
        name: routeForm.name,
        description: routeForm.description || undefined,
        vehicleId: routeForm.vehicleId ? { _id: routeForm.vehicleId } as Vehicle : undefined,
        startTime: routeForm.startTime || undefined,
        endTime: routeForm.endTime || undefined,
        monthlyFee: routeForm.monthlyFee ? parseFloat(routeForm.monthlyFee) : undefined,
        status: routeForm.status,
        stops: validStops.map((s, i) => ({ ...s, order: i + 1 })),
      };

      if (editingRoute) {
        await transportService.updateRoute(editingRoute._id, data);
      } else {
        await transportService.createRoute(data);
      }

      await loadData();
      setShowRouteForm(false);
      setRouteForm(defaultRouteForm);
      setEditingRoute(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save route');
    } finally {
      setSubmittingRoute(false);
    }
  }

  async function handleDeleteRoute(id: string) {
    if (!confirm('Are you sure you want to delete this route?')) return;
    try {
      await transportService.deleteRoute(id);
      await loadData();
    } catch (err) {
      setError('Failed to delete route');
    }
  }

  function addStop() {
    setRouteForm(prev => ({
      ...prev,
      stops: [...prev.stops, { name: '', address: '', pickupTime: '', order: prev.stops.length + 1 }],
    }));
  }

  function removeStop(index: number) {
    setRouteForm(prev => ({
      ...prev,
      stops: prev.stops.filter((_, i) => i !== index),
    }));
  }

  function updateStop(index: number, field: keyof RouteStop, value: string) {
    setRouteForm(prev => ({
      ...prev,
      stops: prev.stops.map((s, i) => i === index ? { ...s, [field]: value } : s),
    }));
  }

  const statusColors: Record<VehicleStatus, string> = {
    [VehicleStatus.ACTIVE]: 'bg-emerald-100 text-emerald-700',
    [VehicleStatus.MAINTENANCE]: 'bg-amber-100 text-amber-700',
    [VehicleStatus.INACTIVE]: 'bg-slate-100 text-slate-700',
  };

  const vehicleTypeIcons: Record<VehicleType, React.ReactNode> = {
    [VehicleType.BUS]: <Bus className="w-4 h-4" />,
    [VehicleType.VAN]: <Truck className="w-4 h-4" />,
    [VehicleType.CAR]: <Car className="w-4 h-4" />,
    [VehicleType.OTHER]: <Car className="w-4 h-4" />,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-slate-600 animate-spin" />
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-slate-100">
            <Bus className="w-6 h-6 text-slate-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Transport Management</h1>
            <p className="text-sm text-slate-600 mt-1">
              Manage vehicles, routes, and student transportation
            </p>
          </div>
        </div>
        <Button onClick={activeTab === 'vehicles' ? handleAddVehicle : handleAddRoute}>
          <Plus className="w-4 h-4 mr-2" />
          {activeTab === 'vehicles' ? 'Add Vehicle' : 'Add Route'}
        </Button>
      </div>

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

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100">
                <Bus className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Vehicles</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalVehicles}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-100">
                <UserCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Active Vehicles</p>
                <p className="text-2xl font-bold text-slate-900">{stats.activeVehicles}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100">
                <Route className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Routes</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalRoutes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-100">
                <MapPin className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Active Routes</p>
                <p className="text-2xl font-bold text-slate-900">{stats.activeRoutes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-100">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Students Assigned</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalStudentsAssigned}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('routes')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'routes'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Route className="w-4 h-4 inline-block mr-2" />
          Routes ({routes.length})
        </button>
        <button
          onClick={() => setActiveTab('vehicles')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'vehicles'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Bus className="w-4 h-4 inline-block mr-2" />
          Vehicles ({vehicles.length})
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {activeTab === 'routes' ? (
          routes.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <div className="flex justify-center mb-3">
                <Route className="w-12 h-12 text-slate-400" />
              </div>
              <p>No routes configured yet.</p>
              <Button className="mt-4" onClick={handleAddRoute}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Route
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {routes.map((route) => (
                <div
                  key={route._id}
                  className="p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100">
                        <Route className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{route.name}</h3>
                        <p className="text-sm text-slate-600">{route.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right mr-4">
                        <div className="text-sm font-medium flex items-center gap-1 text-slate-900">
                          <MapPin className="w-3 h-3" />
                          {route.stops.length} stops
                        </div>
                        {route.monthlyFee && (
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            ${route.monthlyFee}/month
                          </div>
                        )}
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleEditRoute(route)}>
                        <Edit2 className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteRoute(route._id)}
                        className="text-red-600 hover:bg-red-50 hover:border-red-200"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                  {route.vehicleId && (
                    <div className="mt-2 ml-[52px] flex items-center gap-2 text-sm text-slate-600">
                      {vehicleTypeIcons[route.vehicleId.type as VehicleType] || <Bus className="w-4 h-4" />}
                      <span>{route.vehicleId.vehicleNumber}</span>
                      {route.vehicleId.driverName && (
                        <span className="text-slate-400">| Driver: {route.vehicleId.driverName}</span>
                      )}
                    </div>
                  )}
                  <div className="mt-2 ml-[52px] flex flex-wrap gap-2">
                    {route.stops.slice(0, 5).map((stop, i) => (
                      <span
                        key={i}
                        className="bg-slate-100 px-2 py-0.5 rounded text-xs flex items-center gap-1 text-slate-700"
                      >
                        <MapPin className="w-2.5 h-2.5" />
                        {stop.name}
                      </span>
                    ))}
                    {route.stops.length > 5 && (
                      <span className="text-xs text-slate-500">+{route.stops.length - 5} more</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          vehicles.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <div className="flex justify-center mb-3">
                <Bus className="w-12 h-12 text-slate-400" />
              </div>
              <p>No vehicles added yet.</p>
              <Button className="mt-4" onClick={handleAddVehicle}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Vehicle
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-left text-slate-600">
                    <th className="py-3 px-4 font-medium">Vehicle</th>
                    <th className="py-3 px-4 font-medium">Type</th>
                    <th className="py-3 px-4 font-medium">Capacity</th>
                    <th className="py-3 px-4 font-medium">Driver</th>
                    <th className="py-3 px-4 font-medium">Status</th>
                    <th className="py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vehicles.map((vehicle) => (
                    <tr
                      key={vehicle._id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100">
                            {vehicleTypeIcons[vehicle.type]}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">
                              {vehicle.vehicleNumber}
                            </div>
                            {vehicle.make && vehicle.model && (
                              <div className="text-xs text-slate-500">{vehicle.make} {vehicle.model}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1 capitalize text-slate-700">
                          {vehicle.type.toLowerCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1 text-slate-700">
                          <Users className="w-3 h-3 text-slate-400" />
                          {vehicle.capacity} seats
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-900">{vehicle.driverName || 'Not assigned'}</div>
                        {vehicle.driverPhone && (
                          <div className="text-xs text-slate-500">{vehicle.driverPhone}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[vehicle.status]}`}>
                          {vehicle.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditVehicle(vehicle)}>
                            <Edit2 className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteVehicle(vehicle._id)}
                            className="text-red-600 hover:bg-red-50 hover:border-red-200"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* Vehicle Form Sheet */}
      <SlideSheet
        isOpen={showVehicleForm}
        onClose={() => setShowVehicleForm(false)}
        title={editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
        subtitle={editingVehicle ? 'Update vehicle details' : 'Add a new vehicle to your fleet'}
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowVehicleForm(false)}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-700 border border-slate-300 bg-white hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="vehicle-form"
              disabled={submittingVehicle}
              className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {submittingVehicle ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  {editingVehicle ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
                </>
              )}
            </button>
          </div>
        }
      >
        <form id="vehicle-form" onSubmit={handleVehicleSubmit} className="space-y-6">
          {/* Vehicle Details Section */}
          <SheetSection title="Vehicle Details" icon={<Bus className="w-4 h-4" />}>
            <div className="grid grid-cols-2 gap-4">
              <SheetField label="Vehicle Number" required icon={<Bus className="w-4 h-4" />}>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                  value={vehicleForm.vehicleNumber}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleNumber: e.target.value })}
                  placeholder="e.g., BUS-001"
                  required
                />
              </SheetField>
              <SheetField label="Type" icon={<Truck className="w-4 h-4" />}>
                <select
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all appearance-none"
                  value={vehicleForm.type}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, type: e.target.value as VehicleType })}
                >
                  {Object.values(VehicleType).map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </SheetField>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <SheetField label="Make" icon={<Car className="w-4 h-4" />}>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                  value={vehicleForm.make}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, make: e.target.value })}
                  placeholder="e.g., Toyota"
                />
              </SheetField>
              <SheetField label="Model">
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                  value={vehicleForm.model}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })}
                  placeholder="e.g., Coaster"
                />
              </SheetField>
              <SheetField label="Year" icon={<Clock className="w-4 h-4" />}>
                <input
                  type="number"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                  value={vehicleForm.year}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, year: e.target.value })}
                  placeholder="2023"
                />
              </SheetField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <SheetField label="Capacity" required icon={<Users className="w-4 h-4" />}>
                <input
                  type="number"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                  value={vehicleForm.capacity}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, capacity: e.target.value })}
                  placeholder="40"
                  required
                />
              </SheetField>
              <SheetField label="Status">
                <select
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all appearance-none"
                  value={vehicleForm.status}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, status: e.target.value as VehicleStatus })}
                >
                  {Object.values(VehicleStatus).map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </SheetField>
            </div>
          </SheetSection>

          {/* Driver Information Section */}
          <SheetSection title="Driver Information" icon={<UserCheck className="w-4 h-4" />}>
            <div className="grid grid-cols-3 gap-4">
              <SheetField label="Driver Name" icon={<UserCheck className="w-4 h-4" />}>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  value={vehicleForm.driverName}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, driverName: e.target.value })}
                  placeholder="Full name"
                />
              </SheetField>
              <SheetField label="Driver Phone">
                <input
                  type="tel"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  value={vehicleForm.driverPhone}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, driverPhone: e.target.value })}
                  placeholder="Phone number"
                />
              </SheetField>
              <SheetField label="License Number">
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  value={vehicleForm.driverLicense}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, driverLicense: e.target.value })}
                  placeholder="License #"
                />
              </SheetField>
            </div>
          </SheetSection>

          {/* Insurance Section */}
          <SheetSection title="Insurance Details" icon={<Shield className="w-4 h-4" />}>
            <div className="grid grid-cols-2 gap-4">
              <SheetField label="Insurance Number" icon={<Shield className="w-4 h-4" />}>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={vehicleForm.insuranceNumber}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, insuranceNumber: e.target.value })}
                  placeholder="Policy number"
                />
              </SheetField>
              <SheetField label="Insurance Expiry" icon={<Clock className="w-4 h-4" />}>
                <input
                  type="date"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={vehicleForm.insuranceExpiry}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, insuranceExpiry: e.target.value })}
                />
              </SheetField>
            </div>
          </SheetSection>
        </form>
      </SlideSheet>

      {/* Route Form Sheet */}
      <SlideSheet
        isOpen={showRouteForm}
        onClose={() => setShowRouteForm(false)}
        title={editingRoute ? 'Edit Route' : 'Add New Route'}
        subtitle={editingRoute ? 'Update route details and stops' : 'Create a new transport route with stops'}
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowRouteForm(false)}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-700 border border-slate-300 bg-white hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="route-form"
              disabled={submittingRoute}
              className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {submittingRoute ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  {editingRoute ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {editingRoute ? 'Update Route' : 'Add Route'}
                </>
              )}
            </button>
          </div>
        }
      >
        <form id="route-form" onSubmit={handleRouteSubmit} className="space-y-6">
          {/* Route Details Section */}
          <SheetSection title="Route Details" icon={<Route className="w-4 h-4" />}>
            <div className="grid grid-cols-2 gap-4">
              <SheetField label="Route Name" required icon={<Route className="w-4 h-4" />}>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  value={routeForm.name}
                  onChange={(e) => setRouteForm({ ...routeForm, name: e.target.value })}
                  placeholder="e.g., North Route"
                  required
                />
              </SheetField>
              <SheetField label="Vehicle" icon={<Bus className="w-4 h-4" />}>
                <select
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none"
                  value={routeForm.vehicleId}
                  onChange={(e) => setRouteForm({ ...routeForm, vehicleId: e.target.value })}
                >
                  <option value="">Select vehicle</option>
                  {vehicles.filter(v => v.status === VehicleStatus.ACTIVE).map((v) => (
                    <option key={v._id} value={v._id}>{v.vehicleNumber}</option>
                  ))}
                </select>
              </SheetField>
            </div>
            <SheetField label="Description">
              <textarea
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                rows={2}
                value={routeForm.description}
                onChange={(e) => setRouteForm({ ...routeForm, description: e.target.value })}
                placeholder="Route description..."
              />
            </SheetField>
          </SheetSection>

          {/* Schedule & Fee Section */}
          <SheetSection title="Schedule & Pricing" icon={<Clock className="w-4 h-4" />}>
            <div className="grid grid-cols-3 gap-4">
              <SheetField label="Start Time" icon={<Clock className="w-4 h-4" />}>
                <input
                  type="time"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  value={routeForm.startTime}
                  onChange={(e) => setRouteForm({ ...routeForm, startTime: e.target.value })}
                />
              </SheetField>
              <SheetField label="End Time" icon={<Clock className="w-4 h-4" />}>
                <input
                  type="time"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  value={routeForm.endTime}
                  onChange={(e) => setRouteForm({ ...routeForm, endTime: e.target.value })}
                />
              </SheetField>
              <SheetField label="Monthly Fee ($)" icon={<DollarSign className="w-4 h-4" />}>
                <input
                  type="number"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  value={routeForm.monthlyFee}
                  onChange={(e) => setRouteForm({ ...routeForm, monthlyFee: e.target.value })}
                  placeholder="100"
                />
              </SheetField>
            </div>
            <SheetField label="Status">
              <select
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none"
                value={routeForm.status}
                onChange={(e) => setRouteForm({ ...routeForm, status: e.target.value as RouteStatus })}
              >
                {Object.values(RouteStatus).map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </SheetField>
          </SheetSection>

          {/* Stops Section */}
          <SheetSection
            title="Route Stops"
            icon={<MapPin className="w-4 h-4" />}
            action={
              <button
                type="button"
                onClick={addStop}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-primary-dark bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Stop
              </button>
            }
          >
            <div className="space-y-3">
              {routeForm.stops.map((stop, index) => (
                <div
                  key={index}
                  className="flex gap-3 items-start p-3 rounded-lg bg-slate-50 border border-slate-200"
                >
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                        value={stop.name}
                        onChange={(e) => updateStop(index, 'name', e.target.value)}
                        placeholder="Stop name"
                      />
                    </div>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      value={stop.address || ''}
                      onChange={(e) => updateStop(index, 'address', e.target.value)}
                      placeholder="Address"
                    />
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <input
                        type="time"
                        className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                        value={stop.pickupTime || ''}
                        onChange={(e) => updateStop(index, 'pickupTime', e.target.value)}
                      />
                    </div>
                  </div>
                  {routeForm.stops.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStop(index)}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </SheetSection>
        </form>
      </SlideSheet>
    </section>
  );
}
