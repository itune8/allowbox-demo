'use client';

import { useState, useEffect } from 'react';
import { Button } from '@repo/ui/button';
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
    [VehicleStatus.ACTIVE]: 'bg-green-100 text-green-700',
    [VehicleStatus.MAINTENANCE]: 'bg-yellow-100 text-yellow-700',
    [VehicleStatus.INACTIVE]: 'bg-gray-100 text-gray-700',
  };

  const vehicleTypeIcons: Record<VehicleType, string> = {
    [VehicleType.BUS]: '🚌',
    [VehicleType.VAN]: '🚐',
    [VehicleType.CAR]: '🚗',
    [VehicleType.OTHER]: '🚙',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Transport Management</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage vehicles, routes, and student transportation
          </p>
        </div>
        <Button onClick={activeTab === 'vehicles' ? handleAddVehicle : handleAddRoute}>
          {activeTab === 'vehicles' ? '+ Add Vehicle' : '+ Add Route'}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalVehicles}</div>
            <div className="text-sm text-gray-500">Total Vehicles</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="text-2xl font-bold text-green-600">{stats.activeVehicles}</div>
            <div className="text-sm text-gray-500">Active Vehicles</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.totalRoutes}</div>
            <div className="text-sm text-gray-500">Total Routes</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="text-2xl font-bold text-indigo-600">{stats.activeRoutes}</div>
            <div className="text-sm text-gray-500">Active Routes</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.totalStudentsAssigned}</div>
            <div className="text-sm text-gray-500">Students Assigned</div>
          </div>
        </div>
      )}

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('routes')}
          className={`px-4 py-2 font-medium transition border-b-2 -mb-px ${
            activeTab === 'routes'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Routes ({routes.length})
        </button>
        <button
          onClick={() => setActiveTab('vehicles')}
          className={`px-4 py-2 font-medium transition border-b-2 -mb-px ${
            activeTab === 'vehicles'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Vehicles ({vehicles.length})
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        {activeTab === 'routes' ? (
          routes.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <div className="text-4xl mb-3">🛤️</div>
              <p>No routes configured yet.</p>
              <Button className="mt-4" onClick={handleAddRoute}>Add First Route</Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {routes.map((route) => (
                <div key={route._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{route.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{route.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right mr-4">
                        <div className="text-sm font-medium">{route.stops.length} stops</div>
                        {route.monthlyFee && (
                          <div className="text-xs text-gray-500">${route.monthlyFee}/month</div>
                        )}
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleEditRoute(route)}>Edit</Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteRoute(route._id)} className="text-red-600">Delete</Button>
                    </div>
                  </div>
                  {route.vehicleId && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                      <span>{vehicleTypeIcons[route.vehicleId.type as VehicleType] || '🚌'}</span>
                      <span>{route.vehicleId.vehicleNumber}</span>
                      {route.vehicleId.driverName && (
                        <span className="text-gray-400">• Driver: {route.vehicleId.driverName}</span>
                      )}
                    </div>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {route.stops.slice(0, 5).map((stop, i) => (
                      <span key={i} className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs">
                        {stop.name}
                      </span>
                    ))}
                    {route.stops.length > 5 && (
                      <span className="text-xs text-gray-500">+{route.stops.length - 5} more</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          vehicles.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <div className="text-4xl mb-3">🚌</div>
              <p>No vehicles added yet.</p>
              <Button className="mt-4" onClick={handleAddVehicle}>Add First Vehicle</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr className="text-left text-gray-500 dark:text-gray-400">
                    <th className="py-3 px-4">Vehicle</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Capacity</th>
                    <th className="py-3 px-4">Driver</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {vehicles.map((vehicle) => (
                    <tr key={vehicle._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {vehicle.vehicleNumber}
                        </div>
                        {vehicle.make && vehicle.model && (
                          <div className="text-xs text-gray-500">{vehicle.make} {vehicle.model}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1">
                          {vehicleTypeIcons[vehicle.type]} {vehicle.type}
                        </span>
                      </td>
                      <td className="py-3 px-4">{vehicle.capacity} seats</td>
                      <td className="py-3 px-4">
                        <div>{vehicle.driverName || 'Not assigned'}</div>
                        {vehicle.driverPhone && (
                          <div className="text-xs text-gray-500">{vehicle.driverPhone}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-xs ${statusColors[vehicle.status]}`}>
                          {vehicle.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditVehicle(vehicle)}>Edit</Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteVehicle(vehicle._id)} className="text-red-600">Delete</Button>
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

      {/* Vehicle Form Modal */}
      {showVehicleForm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={() => setShowVehicleForm(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 animate-zoom-in">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              {editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}
            </h3>
            <form onSubmit={handleVehicleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Vehicle Number *</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    value={vehicleForm.vehicleNumber}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleNumber: e.target.value })}
                    placeholder="e.g., BUS-001"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Type</label>
                  <select
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    value={vehicleForm.type}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, type: e.target.value as VehicleType })}
                  >
                    {Object.values(VehicleType).map((type) => (
                      <option key={type} value={type}>{vehicleTypeIcons[type]} {type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Make</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    value={vehicleForm.make}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, make: e.target.value })}
                    placeholder="e.g., Toyota"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Model</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    value={vehicleForm.model}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })}
                    placeholder="e.g., Coaster"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Year</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    value={vehicleForm.year}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, year: e.target.value })}
                    placeholder="2023"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Capacity *</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    value={vehicleForm.capacity}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, capacity: e.target.value })}
                    placeholder="40"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    value={vehicleForm.status}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, status: e.target.value as VehicleStatus })}
                  >
                    {Object.values(VehicleStatus).map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Driver Information</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Driver Name</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                      value={vehicleForm.driverName}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, driverName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Driver Phone</label>
                    <input
                      type="tel"
                      className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                      value={vehicleForm.driverPhone}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, driverPhone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">License Number</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                      value={vehicleForm.driverLicense}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, driverLicense: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Insurance</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Insurance Number</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                      value={vehicleForm.insuranceNumber}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, insuranceNumber: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Insurance Expiry</label>
                    <input
                      type="date"
                      className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                      value={vehicleForm.insuranceExpiry}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, insuranceExpiry: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowVehicleForm(false)}>Cancel</Button>
                <Button type="submit" disabled={submittingVehicle}>
                  {submittingVehicle ? 'Saving...' : editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Route Form Modal */}
      {showRouteForm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={() => setShowRouteForm(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 animate-zoom-in">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              {editingRoute ? 'Edit Route' : 'Add Route'}
            </h3>
            <form onSubmit={handleRouteSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Route Name *</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    value={routeForm.name}
                    onChange={(e) => setRouteForm({ ...routeForm, name: e.target.value })}
                    placeholder="e.g., North Route"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Vehicle</label>
                  <select
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    value={routeForm.vehicleId}
                    onChange={(e) => setRouteForm({ ...routeForm, vehicleId: e.target.value })}
                  >
                    <option value="">Select vehicle</option>
                    {vehicles.filter(v => v.status === VehicleStatus.ACTIVE).map((v) => (
                      <option key={v._id} value={v._id}>{vehicleTypeIcons[v.type]} {v.vehicleNumber}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  rows={2}
                  value={routeForm.description}
                  onChange={(e) => setRouteForm({ ...routeForm, description: e.target.value })}
                  placeholder="Route description..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Start Time</label>
                  <input
                    type="time"
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    value={routeForm.startTime}
                    onChange={(e) => setRouteForm({ ...routeForm, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">End Time</label>
                  <input
                    type="time"
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    value={routeForm.endTime}
                    onChange={(e) => setRouteForm({ ...routeForm, endTime: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Monthly Fee ($)</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    value={routeForm.monthlyFee}
                    onChange={(e) => setRouteForm({ ...routeForm, monthlyFee: e.target.value })}
                    placeholder="100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  value={routeForm.status}
                  onChange={(e) => setRouteForm({ ...routeForm, status: e.target.value as RouteStatus })}
                >
                  {Object.values(RouteStatus).map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Stops</h4>
                  <Button type="button" variant="outline" size="sm" onClick={addStop}>+ Add Stop</Button>
                </div>
                <div className="space-y-3">
                  {routeForm.stops.map((stop, index) => (
                    <div key={index} className="flex gap-3 items-start">
                      <span className="text-sm text-gray-500 mt-2 w-6">{index + 1}.</span>
                      <div className="flex-1 grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                          value={stop.name}
                          onChange={(e) => updateStop(index, 'name', e.target.value)}
                          placeholder="Stop name"
                        />
                        <input
                          type="text"
                          className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                          value={stop.address || ''}
                          onChange={(e) => updateStop(index, 'address', e.target.value)}
                          placeholder="Address"
                        />
                        <input
                          type="time"
                          className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                          value={stop.pickupTime || ''}
                          onChange={(e) => updateStop(index, 'pickupTime', e.target.value)}
                        />
                      </div>
                      {routeForm.stops.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeStop(index)}
                          className="text-red-500 hover:text-red-700 mt-2"
                        >
                          X
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowRouteForm(false)}>Cancel</Button>
                <Button type="submit" disabled={submittingRoute}>
                  {submittingRoute ? 'Saving...' : editingRoute ? 'Update Route' : 'Add Route'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
