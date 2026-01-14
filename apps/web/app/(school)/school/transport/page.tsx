'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@repo/ui/button';
import { GlassCard, AnimatedStatCard, Icon3D } from '../../../../components/ui';
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
} from 'lucide-react';
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

  const vehicleTypeIcons: Record<VehicleType, React.ReactNode> = {
    [VehicleType.BUS]: <Bus className="w-4 h-4" />,
    [VehicleType.VAN]: <Truck className="w-4 h-4" />,
    [VehicleType.CAR]: <Car className="w-4 h-4" />,
    [VehicleType.OTHER]: <Car className="w-4 h-4" />,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="rounded-full h-8 w-8 border-b-2 border-slate-600"
        />
      </div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Icon3D gradient="from-slate-500 to-gray-600" size="lg">
            <Bus className="w-6 h-6" />
          </Icon3D>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transport Management</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage vehicles, routes, and student transportation
            </p>
          </div>
        </div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button onClick={activeTab === 'vehicles' ? handleAddVehicle : handleAddRoute}>
            <Plus className="w-4 h-4 mr-2" />
            {activeTab === 'vehicles' ? 'Add Vehicle' : 'Add Route'}
          </Button>
        </motion.div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-center justify-between"
          >
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <AnimatedStatCard
            title="Total Vehicles"
            value={stats.totalVehicles}
            icon={<Bus className="w-5 h-5 text-slate-600" />}
            iconBgColor="bg-slate-100"
            delay={0}
          />
          <AnimatedStatCard
            title="Active Vehicles"
            value={stats.activeVehicles}
            icon={<UserCheck className="w-5 h-5 text-green-600" />}
            iconBgColor="bg-green-50"
            delay={1}
          />
          <AnimatedStatCard
            title="Total Routes"
            value={stats.totalRoutes}
            icon={<Route className="w-5 h-5 text-blue-600" />}
            iconBgColor="bg-blue-50"
            delay={2}
          />
          <AnimatedStatCard
            title="Active Routes"
            value={stats.activeRoutes}
            icon={<MapPin className="w-5 h-5 text-indigo-600" />}
            iconBgColor="bg-indigo-50"
            delay={3}
          />
          <AnimatedStatCard
            title="Students Assigned"
            value={stats.totalStudentsAssigned}
            icon={<Users className="w-5 h-5 text-purple-600" />}
            iconBgColor="bg-purple-50"
            delay={4}
          />
        </div>
      )}

      <div className="flex gap-2 border-b border-gray-200">
        <motion.button
          whileHover={{ y: -1 }}
          onClick={() => setActiveTab('routes')}
          className={`px-4 py-2 font-medium transition border-b-2 -mb-px ${
            activeTab === 'routes'
              ? 'border-slate-600 text-slate-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Route className="w-4 h-4 inline-block mr-2" />
          Routes ({routes.length})
        </motion.button>
        <motion.button
          whileHover={{ y: -1 }}
          onClick={() => setActiveTab('vehicles')}
          className={`px-4 py-2 font-medium transition border-b-2 -mb-px ${
            activeTab === 'vehicles'
              ? 'border-slate-600 text-slate-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Bus className="w-4 h-4 inline-block mr-2" />
          Vehicles ({vehicles.length})
        </motion.button>
      </div>

      <GlassCard variant="default" hover={false} className="overflow-hidden">
        {activeTab === 'routes' ? (
          routes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 text-center text-gray-500"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Route className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              </motion.div>
              <p>No routes configured yet.</p>
              <Button className="mt-4" onClick={handleAddRoute}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Route
              </Button>
            </motion.div>
          ) : (
            <div className="divide-y divide-gray-100">
              {routes.map((route, index) => (
                <motion.div
                  key={route._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
                  className="p-4 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-slate-100">
                        <Route className="w-4 h-4 text-slate-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{route.name}</h3>
                        <p className="text-sm text-gray-600">{route.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right mr-4">
                        <div className="text-sm font-medium flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {route.stops.length} stops
                        </div>
                        {route.monthlyFee && (
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            ${route.monthlyFee}/month
                          </div>
                        )}
                      </div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button variant="outline" size="sm" onClick={() => handleEditRoute(route)}>
                          <Edit2 className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteRoute(route._id)} className="text-red-600 hover:bg-red-50">
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                  {route.vehicleId && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="mt-2 ml-11 flex items-center gap-2 text-sm text-gray-600"
                    >
                      {vehicleTypeIcons[route.vehicleId.type as VehicleType] || <Bus className="w-4 h-4" />}
                      <span>{route.vehicleId.vehicleNumber}</span>
                      {route.vehicleId.driverName && (
                        <span className="text-gray-400">| Driver: {route.vehicleId.driverName}</span>
                      )}
                    </motion.div>
                  )}
                  <div className="mt-2 ml-11 flex flex-wrap gap-2">
                    {route.stops.slice(0, 5).map((stop, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-gray-100 px-2 py-0.5 rounded text-xs flex items-center gap-1"
                      >
                        <MapPin className="w-2.5 h-2.5" />
                        {stop.name}
                      </motion.span>
                    ))}
                    {route.stops.length > 5 && (
                      <span className="text-xs text-gray-500">+{route.stops.length - 5} more</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )
        ) : (
          vehicles.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 text-center text-gray-500"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Bus className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              </motion.div>
              <p>No vehicles added yet.</p>
              <Button className="mt-4" onClick={handleAddVehicle}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Vehicle
              </Button>
            </motion.div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-left text-gray-500">
                    <th className="py-3 px-4">Vehicle</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Capacity</th>
                    <th className="py-3 px-4">Driver</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {vehicles.map((vehicle, index) => (
                    <motion.tr
                      key={vehicle._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
                      className="transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-slate-100">
                            {vehicleTypeIcons[vehicle.type]}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {vehicle.vehicleNumber}
                            </div>
                            {vehicle.make && vehicle.model && (
                              <div className="text-xs text-gray-500">{vehicle.make} {vehicle.model}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1 capitalize">
                          {vehicle.type.toLowerCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-gray-400" />
                          {vehicle.capacity} seats
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div>{vehicle.driverName || 'Not assigned'}</div>
                        {vehicle.driverPhone && (
                          <div className="text-xs text-gray-500">{vehicle.driverPhone}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <motion.span
                          initial={{ scale: 0.9 }}
                          animate={{ scale: 1 }}
                          className={`px-2 py-0.5 rounded text-xs ${statusColors[vehicle.status]}`}
                        >
                          {vehicle.status}
                        </motion.span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button variant="outline" size="sm" onClick={() => handleEditVehicle(vehicle)}>
                              <Edit2 className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button variant="outline" size="sm" onClick={() => handleDeleteVehicle(vehicle._id)} className="text-red-600 hover:bg-red-50">
                              <Trash2 className="w-3 h-3 mr-1" />
                              Delete
                            </Button>
                          </motion.div>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </GlassCard>

      {/* Vehicle Form Modal */}
      <AnimatePresence>
        {showVehicleForm && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowVehicleForm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl"
            >
              {/* Glass morphism container */}
              <div className="absolute inset-0 bg-white/80 backdrop-blur-xl" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-slate-100/30" />

              {/* Gradient Header */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-600 via-slate-700 to-gray-800" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="relative px-6 py-5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.2 }}
                    >
                      <Icon3D gradient="from-white to-slate-200" size="lg">
                        <Bus className="w-5 h-5 text-slate-700" />
                      </Icon3D>
                    </motion.div>
                    <div>
                      <motion.h3
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 }}
                        className="text-xl font-bold text-white"
                      >
                        {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
                      </motion.h3>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.25 }}
                        className="text-sm text-slate-300"
                      >
                        {editingVehicle ? 'Update vehicle details' : 'Add a new vehicle to your fleet'}
                      </motion.p>
                    </div>
                  </div>
                  <motion.button
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.1, rotate: 90, backgroundColor: 'rgba(255,255,255,0.2)' }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowVehicleForm(false)}
                    className="p-2 rounded-full text-white/80 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </motion.div>
              </div>

              {/* Form Content */}
              <div className="relative max-h-[calc(90vh-100px)] overflow-y-auto p-6">
                <form onSubmit={handleVehicleSubmit} className="space-y-6">
                  {/* Vehicle Details Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Icon3D gradient="from-slate-500 to-gray-600" size="sm">
                        <Bus className="w-3 h-3" />
                      </Icon3D>
                      <h4 className="font-semibold text-gray-800">Vehicle Details</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">Vehicle Number *</label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Bus className="w-4 h-4 text-gray-400 group-focus-within:text-slate-600 transition-colors" />
                          </div>
                          <input
                            type="text"
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white/50 backdrop-blur-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-slate-500 focus:border-transparent focus:bg-white transition-all shadow-sm"
                            value={vehicleForm.vehicleNumber}
                            onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleNumber: e.target.value })}
                            placeholder="e.g., BUS-001"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">Type</label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Truck className="w-4 h-4 text-gray-400 group-focus-within:text-slate-600 transition-colors" />
                          </div>
                          <select
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white/50 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-slate-500 focus:border-transparent focus:bg-white transition-all shadow-sm appearance-none"
                            value={vehicleForm.type}
                            onChange={(e) => setVehicleForm({ ...vehicleForm, type: e.target.value as VehicleType })}
                          >
                            {Object.values(VehicleType).map((type) => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Make/Model/Year Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="grid grid-cols-3 gap-4"
                  >
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700">Make</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Car className="w-4 h-4 text-gray-400 group-focus-within:text-slate-600 transition-colors" />
                        </div>
                        <input
                          type="text"
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white/50 backdrop-blur-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-slate-500 focus:border-transparent focus:bg-white transition-all shadow-sm"
                          value={vehicleForm.make}
                          onChange={(e) => setVehicleForm({ ...vehicleForm, make: e.target.value })}
                          placeholder="e.g., Toyota"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700">Model</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white/50 backdrop-blur-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-slate-500 focus:border-transparent focus:bg-white transition-all shadow-sm"
                        value={vehicleForm.model}
                        onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })}
                        placeholder="e.g., Coaster"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700">Year</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Clock className="w-4 h-4 text-gray-400 group-focus-within:text-slate-600 transition-colors" />
                        </div>
                        <input
                          type="number"
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white/50 backdrop-blur-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-slate-500 focus:border-transparent focus:bg-white transition-all shadow-sm"
                          value={vehicleForm.year}
                          onChange={(e) => setVehicleForm({ ...vehicleForm, year: e.target.value })}
                          placeholder="2023"
                        />
                      </div>
                    </div>
                  </motion.div>

                  {/* Capacity & Status */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700">Capacity *</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Users className="w-4 h-4 text-gray-400 group-focus-within:text-slate-600 transition-colors" />
                        </div>
                        <input
                          type="number"
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white/50 backdrop-blur-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-slate-500 focus:border-transparent focus:bg-white transition-all shadow-sm"
                          value={vehicleForm.capacity}
                          onChange={(e) => setVehicleForm({ ...vehicleForm, capacity: e.target.value })}
                          placeholder="40"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <select
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white/50 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-slate-500 focus:border-transparent focus:bg-white transition-all shadow-sm appearance-none"
                        value={vehicleForm.status}
                        onChange={(e) => setVehicleForm({ ...vehicleForm, status: e.target.value as VehicleStatus })}
                      >
                        {Object.values(VehicleStatus).map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                  </motion.div>

                  {/* Driver Information Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="pt-4 border-t border-gray-200/50"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Icon3D gradient="from-emerald-500 to-green-600" size="sm">
                        <UserCheck className="w-3 h-3" />
                      </Icon3D>
                      <h4 className="font-semibold text-gray-800">Driver Information</h4>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">Driver Name</label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <UserCheck className="w-4 h-4 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                          </div>
                          <input
                            type="text"
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white/50 backdrop-blur-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white transition-all shadow-sm"
                            value={vehicleForm.driverName}
                            onChange={(e) => setVehicleForm({ ...vehicleForm, driverName: e.target.value })}
                            placeholder="Full name"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">Driver Phone</label>
                        <input
                          type="tel"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white/50 backdrop-blur-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white transition-all shadow-sm"
                          value={vehicleForm.driverPhone}
                          onChange={(e) => setVehicleForm({ ...vehicleForm, driverPhone: e.target.value })}
                          placeholder="Phone number"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">License Number</label>
                        <input
                          type="text"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white/50 backdrop-blur-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white transition-all shadow-sm"
                          value={vehicleForm.driverLicense}
                          onChange={(e) => setVehicleForm({ ...vehicleForm, driverLicense: e.target.value })}
                          placeholder="License #"
                        />
                      </div>
                    </div>
                  </motion.div>

                  {/* Insurance Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="pt-4 border-t border-gray-200/50"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Icon3D gradient="from-blue-500 to-indigo-600" size="sm">
                        <Shield className="w-3 h-3" />
                      </Icon3D>
                      <h4 className="font-semibold text-gray-800">Insurance Details</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">Insurance Number</label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Shield className="w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                          </div>
                          <input
                            type="text"
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white/50 backdrop-blur-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all shadow-sm"
                            value={vehicleForm.insuranceNumber}
                            onChange={(e) => setVehicleForm({ ...vehicleForm, insuranceNumber: e.target.value })}
                            placeholder="Policy number"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">Insurance Expiry</label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Clock className="w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                          </div>
                          <input
                            type="date"
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white/50 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all shadow-sm"
                            value={vehicleForm.insuranceExpiry}
                            onChange={(e) => setVehicleForm({ ...vehicleForm, insuranceExpiry: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    className="flex justify-end gap-3 pt-6 border-t border-gray-200/50"
                  >
                    <motion.button
                      type="button"
                      onClick={() => setShowVehicleForm(false)}
                      whileHover={{ scale: 1.02, backgroundColor: 'rgba(0,0,0,0.05)' }}
                      whileTap={{ scale: 0.98 }}
                      className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-700 border border-gray-300 bg-white/50 backdrop-blur-sm hover:bg-gray-50 transition-all shadow-sm"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      disabled={submittingVehicle}
                      whileHover={{ scale: 1.02, boxShadow: '0 10px 40px -10px rgba(71, 85, 105, 0.4)' }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-lg shadow-slate-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                      {submittingVehicle ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                          />
                          Saving...
                        </>
                      ) : (
                        <>
                          {editingVehicle ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                          {editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Route Form Modal */}
      <AnimatePresence>
        {showRouteForm && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowRouteForm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl"
            >
              {/* Glass morphism container */}
              <div className="absolute inset-0 bg-white/80 backdrop-blur-xl" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-indigo-100/30" />

              {/* Gradient Header */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-slate-700" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="relative px-6 py-5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.2 }}
                    >
                      <Icon3D gradient="from-white to-indigo-200" size="lg">
                        <Route className="w-5 h-5 text-indigo-700" />
                      </Icon3D>
                    </motion.div>
                    <div>
                      <motion.h3
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 }}
                        className="text-xl font-bold text-white"
                      >
                        {editingRoute ? 'Edit Route' : 'Add New Route'}
                      </motion.h3>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.25 }}
                        className="text-sm text-indigo-200"
                      >
                        {editingRoute ? 'Update route details and stops' : 'Create a new transport route with stops'}
                      </motion.p>
                    </div>
                  </div>
                  <motion.button
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.1, rotate: 90, backgroundColor: 'rgba(255,255,255,0.2)' }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowRouteForm(false)}
                    className="p-2 rounded-full text-white/80 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </motion.div>
              </div>

              {/* Form Content */}
              <div className="relative max-h-[calc(90vh-100px)] overflow-y-auto p-6">
                <form onSubmit={handleRouteSubmit} className="space-y-6">
                  {/* Route Details Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Icon3D gradient="from-indigo-500 to-purple-600" size="sm">
                        <Route className="w-3 h-3" />
                      </Icon3D>
                      <h4 className="font-semibold text-gray-800">Route Details</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">Route Name *</label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Route className="w-4 h-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                          </div>
                          <input
                            type="text"
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white/50 backdrop-blur-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all shadow-sm"
                            value={routeForm.name}
                            onChange={(e) => setRouteForm({ ...routeForm, name: e.target.value })}
                            placeholder="e.g., North Route"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">Vehicle</label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Bus className="w-4 h-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                          </div>
                          <select
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white/50 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all shadow-sm appearance-none"
                            value={routeForm.vehicleId}
                            onChange={(e) => setRouteForm({ ...routeForm, vehicleId: e.target.value })}
                          >
                            <option value="">Select vehicle</option>
                            {vehicles.filter(v => v.status === VehicleStatus.ACTIVE).map((v) => (
                              <option key={v._id} value={v._id}>{v.vehicleNumber}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Description */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="space-y-1.5"
                  >
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white/50 backdrop-blur-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all shadow-sm resize-none"
                      rows={2}
                      value={routeForm.description}
                      onChange={(e) => setRouteForm({ ...routeForm, description: e.target.value })}
                      placeholder="Route description..."
                    />
                  </motion.div>

                  {/* Schedule & Fee Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Icon3D gradient="from-amber-500 to-orange-600" size="sm">
                        <Clock className="w-3 h-3" />
                      </Icon3D>
                      <h4 className="font-semibold text-gray-800">Schedule & Pricing</h4>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">Start Time</label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Clock className="w-4 h-4 text-gray-400 group-focus-within:text-amber-600 transition-colors" />
                          </div>
                          <input
                            type="time"
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white/50 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:bg-white transition-all shadow-sm"
                            value={routeForm.startTime}
                            onChange={(e) => setRouteForm({ ...routeForm, startTime: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">End Time</label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Clock className="w-4 h-4 text-gray-400 group-focus-within:text-amber-600 transition-colors" />
                          </div>
                          <input
                            type="time"
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white/50 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:bg-white transition-all shadow-sm"
                            value={routeForm.endTime}
                            onChange={(e) => setRouteForm({ ...routeForm, endTime: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">Monthly Fee ($)</label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <DollarSign className="w-4 h-4 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                          </div>
                          <input
                            type="number"
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white/50 backdrop-blur-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white transition-all shadow-sm"
                            value={routeForm.monthlyFee}
                            onChange={(e) => setRouteForm({ ...routeForm, monthlyFee: e.target.value })}
                            placeholder="100"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Status */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="space-y-1.5"
                  >
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white/50 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all shadow-sm appearance-none"
                      value={routeForm.status}
                      onChange={(e) => setRouteForm({ ...routeForm, status: e.target.value as RouteStatus })}
                    >
                      {Object.values(RouteStatus).map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </motion.div>

                  {/* Stops Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="pt-4 border-t border-gray-200/50"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Icon3D gradient="from-rose-500 to-pink-600" size="sm">
                          <MapPin className="w-3 h-3" />
                        </Icon3D>
                        <h4 className="font-semibold text-gray-800">Route Stops</h4>
                      </div>
                      <motion.button
                        type="button"
                        onClick={addStop}
                        whileHover={{ scale: 1.05, boxShadow: '0 4px 20px -4px rgba(99, 102, 241, 0.3)' }}
                        whileTap={{ scale: 0.95 }}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-all flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Stop
                      </motion.button>
                    </div>
                    <div className="space-y-3">
                      <AnimatePresence mode="popLayout">
                        {routeForm.stops.map((stop, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, scale: 0.95 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex gap-3 items-start p-3 rounded-xl bg-gradient-to-r from-gray-50/80 to-slate-50/80 backdrop-blur-sm border border-gray-100"
                          >
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: index * 0.05 + 0.1 }}
                              className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold shadow-md mt-0.5"
                            >
                              {index + 1}
                            </motion.div>
                            <div className="flex-1 grid grid-cols-3 gap-2">
                              <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                                  <MapPin className="w-3.5 h-3.5 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
                                </div>
                                <input
                                  type="text"
                                  className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-white/70 backdrop-blur-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-rose-500 focus:border-transparent focus:bg-white transition-all"
                                  value={stop.name}
                                  onChange={(e) => updateStop(index, 'name', e.target.value)}
                                  placeholder="Stop name"
                                />
                              </div>
                              <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white/70 backdrop-blur-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all"
                                value={stop.address || ''}
                                onChange={(e) => updateStop(index, 'address', e.target.value)}
                                placeholder="Address"
                              />
                              <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                                  <Clock className="w-3.5 h-3.5 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
                                </div>
                                <input
                                  type="time"
                                  className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-white/70 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:bg-white transition-all"
                                  value={stop.pickupTime || ''}
                                  onChange={(e) => updateStop(index, 'pickupTime', e.target.value)}
                                />
                              </div>
                            </div>
                            {routeForm.stops.length > 1 && (
                              <motion.button
                                type="button"
                                whileHover={{ scale: 1.15, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => removeStop(index)}
                                className="text-red-400 hover:text-red-600 p-1.5 rounded-full transition-all"
                              >
                                <X className="w-4 h-4" />
                              </motion.button>
                            )}
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    className="flex justify-end gap-3 pt-6 border-t border-gray-200/50"
                  >
                    <motion.button
                      type="button"
                      onClick={() => setShowRouteForm(false)}
                      whileHover={{ scale: 1.02, backgroundColor: 'rgba(0,0,0,0.05)' }}
                      whileTap={{ scale: 0.98 }}
                      className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-700 border border-gray-300 bg-white/50 backdrop-blur-sm hover:bg-gray-50 transition-all shadow-sm"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      disabled={submittingRoute}
                      whileHover={{ scale: 1.02, boxShadow: '0 10px 40px -10px rgba(99, 102, 241, 0.4)' }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                      {submittingRoute ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                          />
                          Saving...
                        </>
                      ) : (
                        <>
                          {editingRoute ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                          {editingRoute ? 'Update Route' : 'Add Route'}
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
